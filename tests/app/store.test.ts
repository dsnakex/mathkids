import { useAppStore, SESSION_LENGTH } from '@/app/store'
import { db } from '@/db/db'
import { createProfile, getProfile } from '@/db/profiles'
import { loadLearnerProgress, saveLearnerProgress } from '@/db/progress'
import { initialMastery, type MasteryState } from '@/engine/adaptive'
import { scheduleFirstReview } from '@/engine/spaced'
import { saveLearningSettings } from '@/app/learningMode'

beforeEach(async () => {
  await db.profiles.clear()
  await db.progress.clear()
  // Par défaut, on fige l'EXPLORATION LIBRE : ces tests vérifient la mécanique de
  // composition historique. Les tests du parcours guidé réactivent le mode.
  saveLearningSettings({ guidedPath: false })
  useAppStore.setState({
    screen: 'profiles',
    profiles: [],
    profileId: null,
    pendingNotionId: null,
    session: [],
    index: 0,
    correctCount: 0,
    progress: { mastery: {}, reviews: {} },
    reward: null,
  })
})

describe('store — orchestration d\'une session', () => {
  it('compose une session complète pour un profil neuf', async () => {
    const p = await createProfile({ name: 'Léa', character: 'maki', level: 'cp' })
    await useAppStore.getState().startSession(p.id)
    const st = useAppStore.getState()
    expect(st.screen).toBe('session')
    expect(st.session).toHaveLength(SESSION_LENGTH)
  })

  it('déroule la séance, calcule les récompenses et persiste la progression', async () => {
    const p = await createProfile({ name: 'Léa', character: 'maki', level: 'cp' })
    await useAppStore.getState().startSession(p.id)

    for (let i = 0; i < SESSION_LENGTH; i++) {
      await useAppStore.getState().answerCurrent(true) // tout juste
    }

    const st = useAppStore.getState()
    expect(st.screen).toBe('end')
    expect(st.correctCount).toBe(SESSION_LENGTH)
    expect(st.reward?.stars).toBe(3) // sans-faute
    expect(st.reward?.coins).toBeGreaterThan(0)

    // Récompenses créditées au profil et progression sauvegardée (offline).
    const after = await getProfile(p.id)
    expect(after?.coins).toBe(st.reward?.coins)
    expect(after?.stars).toBe(3)
    const saved = await loadLearnerProgress(p.id)
    expect(Object.keys(saved.mastery).length).toBeGreaterThan(0)
  })

  it('accorde moins d\'étoiles quand l\'enfant se trompe souvent', async () => {
    const p = await createProfile({ name: 'Tom', character: 'temaki', level: 'cp' })
    await useAppStore.getState().startSession(p.id)
    for (let i = 0; i < SESSION_LENGTH; i++) {
      await useAppStore.getState().answerCurrent(false) // tout faux
    }
    const st = useAppStore.getState()
    expect(st.screen).toBe('end')
    expect(st.reward?.stars).toBe(1) // jamais 0
    expect(st.reward?.coins).toBe(0)
  })

  it('quitter en cours de séance sauvegarde les réponses déjà données', async () => {
    const p = await createProfile({ name: 'Léa', character: 'maki', level: 'cp' })
    await useAppStore.getState().startSession(p.id)
    // On répond à quelques questions puis on quitte.
    await useAppStore.getState().answerCurrent(true)
    await useAppStore.getState().answerCurrent(true)
    await useAppStore.getState().quitSession()

    expect(useAppStore.getState().screen).toBe('map')
    const saved = await loadLearnerProgress(p.id)
    expect(Object.keys(saved.mastery).length).toBeGreaterThan(0) // la progression est gardée
  })

  it('quitter en cours crédite les récompenses des exercices déjà répondus (sans pénalité)', async () => {
    const p = await createProfile({ name: 'Léa', character: 'maki', level: 'cp' })
    await useAppStore.getState().startSession(p.id)
    // 2 bonnes réponses puis pause avant la fin de la série.
    await useAppStore.getState().answerCurrent(true)
    await useAppStore.getState().answerCurrent(true)
    await useAppStore.getState().quitSession()

    const after = await getProfile(p.id)
    expect(after?.coins).toBe(4) // 2 bonnes réponses × 2 croquettes, rien perdu à la pause
    expect(after?.stars).toBe(3) // 2/2 = sans-faute sur la portion jouée, pas de pénalité
  })

  it('quitter sans avoir répondu ne crédite aucune récompense', async () => {
    const p = await createProfile({ name: 'Tom', character: 'temaki', level: 'cp' })
    await useAppStore.getState().startSession(p.id)
    await useAppStore.getState().quitSession()

    const after = await getProfile(p.id)
    expect(after?.coins ?? 0).toBe(0)
    expect(after?.stars ?? 0).toBe(0)
  })

  it('reprend la progression sauvegardée à la session suivante (persistance)', async () => {
    const p = await createProfile({ name: 'Léa', character: 'maki', level: 'cp' })
    await useAppStore.getState().startSession(p.id)
    for (let i = 0; i < SESSION_LENGTH; i++) {
      await useAppStore.getState().answerCurrent(true)
    }
    // Nouvelle session : la progression est rechargée depuis la base.
    await useAppStore.getState().replay()
    const st = useAppStore.getState()
    expect(st.screen).toBe('session')
    expect(Object.keys(st.progress.mastery).length).toBeGreaterThan(0)
  })
})

describe('store — parcours guidé (leçon garantie, chantier A)', () => {
  async function setupProfile() {
    const p = await createProfile({ name: 'Léa', character: 'maki', level: 'cp' })
    await useAppStore.getState().refreshProfiles()
    useAppStore.getState().selectProfile(p.id)
    return p
  }

  it('montre la leçon avant la 1re pratique, même si la maîtrise existe (notion pré-remplie)', async () => {
    saveLearningSettings({ guidedPath: true })
    const p = await setupProfile()
    // Simule une notion pré-remplie par la mission : maîtrise présente, leçon jamais vue.
    await saveLearnerProgress(p.id, { mastery: { 'nombres-jusqu-20': initialMastery() }, reviews: {} })

    await useAppStore.getState().selectStep('nombres-jusqu-20')
    const st = useAppStore.getState()
    expect(st.screen).toBe('lesson')
    expect(st.pendingNotionId).toBe('nombres-jusqu-20')
  })

  it('« J\'ai compris » mémorise la leçon vue et lance la session ; re-sélection = session directe', async () => {
    saveLearningSettings({ guidedPath: true })
    const p = await setupProfile()

    await useAppStore.getState().selectStep('nombres-jusqu-20') // 1re fois → leçon
    expect(useAppStore.getState().screen).toBe('lesson')

    await useAppStore.getState().lessonDone() // leçon vue → session
    expect(useAppStore.getState().screen).toBe('session')
    const after = await getProfile(p.id)
    expect(after?.lessonsSeen).toContain('nombres-jusqu-20')

    // Retour carte puis re-sélection : la leçon n'est plus imposée.
    await useAppStore.getState().goMap()
    await useAppStore.getState().selectStep('nombres-jusqu-20')
    expect(useAppStore.getState().screen).toBe('session')
  })

  it('la séance guidée ne contient aucune découverte-surprise', async () => {
    saveLearningSettings({ guidedPath: true })
    await setupProfile()
    await useAppStore.getState().selectStep('nombres-jusqu-20')
    await useAppStore.getState().lessonDone()
    const { session } = useAppStore.getState()
    expect(session.length).toBeGreaterThan(0)
    expect(session.every((s) => s.role !== 'discovery')).toBe(true)
  })
})

describe('store — mode révision (chantier F)', () => {
  const acquise: MasteryState = { tier: 3, score: 90, streak: 0, errStreak: 0 }

  async function setupProfile() {
    const p = await createProfile({ name: 'Léa', character: 'maki', level: 'cp' })
    await useAppStore.getState().refreshProfiles()
    useAppStore.getState().selectProfile(p.id)
    return p
  }

  it('« Révision » lance une séance 100 % rappels (acquises + fragiles)', async () => {
    const p = await setupProfile()
    await saveLearnerProgress(p.id, {
      mastery: { 'nombres-jusqu-20': acquise, 'addition-jusqu-20': initialMastery() },
      reviews: { 'nombres-jusqu-20': scheduleFirstReview(0) },
    })

    await useAppStore.getState().startReviewSession(p.id)
    const st = useAppStore.getState()
    expect(st.screen).toBe('session')
    expect(st.session.length).toBeGreaterThan(0)
    expect(st.session.every((s) => s.role === 'review')).toBe(true)
  })

  it('sans rien à réviser, « Révision » reste sur la carte', async () => {
    const p = await setupProfile()
    await useAppStore.getState().startReviewSession(p.id)
    expect(useAppStore.getState().screen).toBe('map')
  })

  it('enregistre la date de dernière activité en fin de séance (détection d\'absence)', async () => {
    const p = await createProfile({ name: 'Tom', character: 'temaki', level: 'cp' })
    const before = await getProfile(p.id)
    expect(before?.lastActiveAt).toBeUndefined()

    await useAppStore.getState().startSession(p.id)
    for (let i = 0; i < SESSION_LENGTH; i++) {
      await useAppStore.getState().answerCurrent(true)
    }
    const after = await getProfile(p.id)
    expect(typeof after?.lastActiveAt).toBe('number')
    expect(after?.lastActiveAt).toBeGreaterThan(0)
  })
})
