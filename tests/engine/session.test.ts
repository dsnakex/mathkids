import { cp } from '@/content/curricula'
import { allNotions } from '@/content/graph'
import { mulberry32 } from '@/engine/generators/rng'
import { isAnswerCorrect } from '@/engine/generators/types'
import { initialMastery, type MasteryState } from '@/engine/adaptive'
import { scheduleFirstReview, DAY_MS, type ReviewState } from '@/engine/spaced'
import {
  allocateSlots,
  composeSession,
  currentNotion,
  discoveryNotions,
  reviewNotions,
  isNotionGeneratable,
  DEFAULT_TARGET_TIER,
  type LearnerProgress,
} from '@/engine/session'

const T0 = 1_000_000_000_000

// --- Répartition 60 / 25 / 15 -------------------------------------------------

describe('composition de session — répartition des créneaux', () => {
  const has = { current: true, review: true, discovery: true }

  it('répartit 10 exercices en ~60 / 25 / 15', () => {
    const a = allocateSlots(10, has)
    expect(a.current + a.review + a.discovery).toBe(10)
    expect(a.current).toBe(6)
    expect(a.review).toBe(3)
    expect(a.discovery).toBe(1)
  })

  it('répartit 20 exercices exactement en 12 / 5 / 3', () => {
    expect(allocateSlots(20, has)).toEqual({ current: 12, review: 5, discovery: 3 })
  })

  it('réaffecte à « en cours » les créneaux de rappel s\'il n\'y a rien à réviser', () => {
    const a = allocateSlots(10, { current: true, review: false, discovery: true })
    expect(a).toEqual({ current: 9, review: 0, discovery: 1 })
  })

  it('réaffecte à « en cours » les créneaux de découverte s\'il n\'y a rien à découvrir', () => {
    const a = allocateSlots(10, { current: true, review: true, discovery: false })
    expect(a).toEqual({ current: 7, review: 3, discovery: 0 })
  })

  it('met tout sur « en cours » si c\'est le seul vivier', () => {
    expect(allocateSlots(10, { current: true, review: false, discovery: false })).toEqual({
      current: 10,
      review: 0,
      discovery: 0,
    })
  })
})

// --- Scénario réaliste --------------------------------------------------------

// Un apprenant : « addition jusqu'à 20 » en cours, « nombres jusqu'à 20 »
// acquise (et due en rappel). Les découvertes doivent être des notions dont
// tous les prérequis sont acquis.
function scenario(): LearnerProgress {
  const enCours: MasteryState = { tier: 2, score: 30, streak: 1, errStreak: 0 }
  const acquise: MasteryState = { tier: 3, score: 90, streak: 0, errStreak: 0 }
  return {
    mastery: {
      'addition-jusqu-20': enCours,
      'nombres-jusqu-20': acquise,
    },
    reviews: {
      'nombres-jusqu-20': scheduleFirstReview(T0),
    },
  }
}

describe('composition de session — sélection des viviers', () => {
  const progress = scenario()
  const now = T0 + 2 * DAY_MS // « nombres-jusqu-20 » devient dû

  it('choisit comme notion « en cours » une notion démarrée mais non acquise', () => {
    const n = currentNotion(cp, progress, DEFAULT_TARGET_TIER)
    expect(n?.id).toBe('addition-jusqu-20')
  })

  it('ne propose en découverte que des notions non démarrées aux prérequis acquis', () => {
    const ids = discoveryNotions(cp, progress, DEFAULT_TARGET_TIER).map((n) => n.id)
    // « doubles-moities » dépend de « addition-jusqu-20 » (non acquise) : exclue.
    expect(ids).not.toContain('doubles-moities')
    // « nombres-jusqu-20 » est déjà démarrée : exclue.
    expect(ids).not.toContain('nombres-jusqu-20')
    // « complements-a-10 » dépend de « nombres-jusqu-20 » (acquise) : incluse.
    expect(ids).toContain('complements-a-10')
  })

  it('ne propose en rappel que les notions dues', () => {
    expect(reviewNotions(cp, progress, now).map((n) => n.id)).toEqual(['nombres-jusqu-20'])
    // Avant l'échéance : aucun rappel.
    expect(reviewNotions(cp, progress, T0).map((n) => n.id)).toEqual([])
  })
})

describe('composition de session — assemblage complet', () => {
  const progress = scenario()
  const now = T0 + 2 * DAY_MS

  it('produit le bon nombre d\'exercices, correctement étiquetés et valides', () => {
    const session = composeSession(cp, progress, { total: 10, now, rng: mulberry32(1) })
    expect(session).toHaveLength(10)

    const byRole = {
      current: session.filter((s) => s.role === 'current'),
      review: session.filter((s) => s.role === 'review'),
      discovery: session.filter((s) => s.role === 'discovery'),
    }
    expect(byRole.current).toHaveLength(6)
    expect(byRole.review).toHaveLength(3)
    expect(byRole.discovery).toHaveLength(1)

    // Rôles branchés sur les bonnes notions.
    expect(byRole.current.every((s) => s.notionId === 'addition-jusqu-20')).toBe(true)
    expect(byRole.review.every((s) => s.notionId === 'nombres-jusqu-20')).toBe(true)
    const discoverables = new Set(discoveryNotions(cp, progress, DEFAULT_TARGET_TIER).map((n) => n.id))
    expect(byRole.discovery.every((s) => discoverables.has(s.notionId))).toBe(true)

    // Chaque exercice est bien formé : palier valide + une bonne réponse jouable.
    for (const item of session) {
      expect(item.tier).toBeGreaterThanOrEqual(1)
      expect(item.tier).toBeLessThanOrEqual(5)
      const ex = item.exercise
      if (ex.type === 'qcm') {
        expect(isAnswerCorrect(ex, ex.correctIndex)).toBe(true)
      } else if (ex.type === 'truefalse') {
        expect(isAnswerCorrect(ex, ex.answer)).toBe(true)
      } else if (ex.type === 'clockset') {
        expect(isAnswerCorrect(ex, [ex.hours, ex.minutes])).toBe(true)
      } else if (ex.type === 'moneyinput' || ex.type === 'moneycompose') {
        expect(isAnswerCorrect(ex, ex.cents)).toBe(true)
      } else if (ex.type === 'decimalinput') {
        expect(isAnswerCorrect(ex, ex.value)).toBe(true)
      } else {
        expect(isAnswerCorrect(ex, ex.answer)).toBe(true)
      }
    }
  })

  it('est déterministe pour une même graine', () => {
    const s1 = composeSession(cp, progress, { total: 10, now, rng: mulberry32(7) })
    const s2 = composeSession(cp, progress, { total: 10, now, rng: mulberry32(7) })
    expect(s1).toEqual(s2)
  })

  it('sans rien à réviser ni découvrir, remplit la session avec la notion en cours', () => {
    // On démarre TOUTES les notions jouables sans prérequis : plus aucune
    // découverte possible (les dépendantes exigent que leurs prérequis soient
    // acquis). La notion « en cours » retenue est la première du curriculum,
    // « nombres-jusqu-20 ». (Robuste à l'ajout de nouvelles notions sans prérequis.)
    const mastery: LearnerProgress['mastery'] = {}
    for (const n of allNotions(cp)) {
      if (isNotionGeneratable(n) && n.prerequisites.length === 0) mastery[n.id] = initialMastery()
    }
    const solo: LearnerProgress = { mastery, reviews: {} }
    expect(discoveryNotions(cp, solo, DEFAULT_TARGET_TIER)).toHaveLength(0)
    const session = composeSession(cp, solo, { total: 8, now: T0, rng: mulberry32(3) })
    expect(session).toHaveLength(8)
    expect(session.every((s) => s.role === 'current')).toBe(true)
    expect(session.every((s) => s.notionId === 'nombres-jusqu-20')).toBe(true)
  })

  it('démarre par une découverte quand aucune notion n\'a encore été travaillée', () => {
    const vierge: LearnerProgress = { mastery: {}, reviews: {} }
    const session = composeSession(cp, vierge, { total: 6, now: T0, rng: mulberry32(2) })
    expect(session).toHaveLength(6)
    // Tout doit provenir d'une notion sans prérequis (frontière de départ).
    const startNotions = new Set(
      discoveryNotions(cp, vierge, DEFAULT_TARGET_TIER).map((n) => n.id),
    )
    expect(session.every((s) => startNotions.has(s.notionId))).toBe(true)
  })
})

// Garde-fou : un ReviewState non utilisé n'est pas exporté par erreur.
const _typecheck: ReviewState = scheduleFirstReview(0)
void _typecheck
