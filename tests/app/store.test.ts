import { useAppStore, SESSION_LENGTH } from '@/app/store'
import { db } from '@/db/db'
import { createProfile, getProfile } from '@/db/profiles'
import { loadLearnerProgress } from '@/db/progress'

beforeEach(async () => {
  await db.profiles.clear()
  await db.progress.clear()
  useAppStore.setState({
    screen: 'profiles',
    profiles: [],
    profileId: null,
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
