import { cp } from '@/content/curricula'
import { mulberry32 } from '@/engine/generators/rng'
import {
  composeReviewSession,
  reviewPool,
  isReturningFromAbsence,
  overdueReviewCount,
  ABSENCE_THRESHOLD_DAYS,
  type LearnerProgress,
} from '@/engine/session'
import { scheduleFirstReview, DAY_MS } from '@/engine/spaced'
import type { MasteryState } from '@/engine/adaptive'

const acquise = (score: number): MasteryState => ({ tier: 3, score, streak: 0, errStreak: 0 })
const fragile = (score: number): MasteryState => ({ tier: 1, score, streak: 0, errStreak: 0 })

const NOW = 100 * DAY_MS

// Deux acquises (retards différents) + une fragile → le pool doit être trié par
// retard décroissant puis par score croissant (les plus faibles ensuite).
function progressMix(): LearnerProgress {
  return {
    mastery: {
      'nombres-jusqu-20': acquise(90), // acquise, très en retard
      'comparaison-jusqu-20': acquise(80), // acquise, peu en retard
      'addition-jusqu-20': fragile(30), // fragile (démarrée, non acquise)
    },
    reviews: {
      'nombres-jusqu-20': scheduleFirstReview(0), // échéance J+2 → très dépassée à NOW
      'comparaison-jusqu-20': scheduleFirstReview(NOW - 3 * DAY_MS), // échéance ~ NOW-1j
    },
  }
}

describe('reviewPool — périmètre et priorité (chantier F)', () => {
  it('inclut acquises (en révision) + fragiles, triées par retard puis faiblesse', () => {
    const pool = reviewPool(cp, progressMix(), NOW).map((n) => n.id)
    expect(pool).toEqual(['nombres-jusqu-20', 'comparaison-jusqu-20', 'addition-jusqu-20'])
  })

  it('vide quand il n\'y a rien à réviser', () => {
    expect(reviewPool(cp, { mastery: {}, reviews: {} }, NOW)).toEqual([])
  })
})

describe('composeReviewSession — séance 100 % rappels', () => {
  it('ne contient que des rappels, sur les notions du pool', () => {
    const session = composeReviewSession(cp, progressMix(), {
      now: NOW,
      rng: mulberry32(1),
      total: 6,
    })
    expect(session).toHaveLength(6)
    expect(session.every((s) => s.role === 'review')).toBe(true)
    const pool = new Set(reviewPool(cp, progressMix(), NOW).map((n) => n.id))
    expect(session.every((s) => pool.has(s.notionId))).toBe(true)
  })

  it('couvre d\'abord les notions les plus prioritaires si le pool dépasse la taille', () => {
    const session = composeReviewSession(cp, progressMix(), {
      now: NOW,
      rng: mulberry32(2),
      total: 2, // pool = 3 → on couvre les 2 plus prioritaires
    })
    const played = new Set(session.map((s) => s.notionId))
    expect(played).toEqual(new Set(['nombres-jusqu-20', 'comparaison-jusqu-20']))
  })

  it('renvoie une séance vide s\'il n\'y a rien à réviser', () => {
    const session = composeReviewSession(cp, { mastery: {}, reviews: {} }, {
      now: NOW,
      rng: mulberry32(3),
      total: 10,
    })
    expect(session).toEqual([])
  })
})

describe('isReturningFromAbsence — retour après une longue coupure', () => {
  it('faux pour un nouveau profil (aucune activité connue)', () => {
    expect(isReturningFromAbsence(undefined, NOW)).toBe(false)
  })

  it('vrai au-delà du seuil (~14 jours), faux en deçà', () => {
    const seuil = ABSENCE_THRESHOLD_DAYS * DAY_MS
    expect(isReturningFromAbsence(NOW - seuil, NOW)).toBe(true)
    expect(isReturningFromAbsence(NOW - seuil - DAY_MS, NOW)).toBe(true)
    expect(isReturningFromAbsence(NOW - 5 * DAY_MS, NOW)).toBe(false)
  })
})

describe('overdueReviewCount — rattrapage', () => {
  it('compte les rappels dont l\'échéance est dépassée (> 0 ⇒ rattrapage)', () => {
    // À NOW, seule « nombres-jusqu-20 » (J+2) est dépassée ; « comparaison » ~ NOW-1j l\'est aussi.
    expect(overdueReviewCount(progressMix(), NOW)).toBe(2)
    // Bien avant toute échéance : rien de dû.
    expect(overdueReviewCount(progressMix(), DAY_MS)).toBe(0)
  })
})
