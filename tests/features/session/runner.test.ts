import { scheduleFirstReview, isDue, DAY_MS, type ReviewState } from '@/engine/spaced'
import type { LearnerProgress } from '@/engine/session'
import { recordAnswer, sessionReward } from '@/features/session/runner'

const T0 = 1_000_000_000_000
const TARGET = 3

const empty = (): LearnerProgress => ({ mastery: {}, reviews: {} })

describe('recordAnswer — notion en découverte', () => {
  it('crée une entrée de maîtrise à la première réponse', () => {
    const out = recordAnswer(empty(), 'nombres-jusqu-20', 'discovery', true, T0, TARGET)
    expect(out.progress.mastery['nombres-jusqu-20']).toEqual({
      tier: 1,
      score: 10,
      streak: 1,
      errStreak: 0,
    })
    expect(out.acquiredNow).toBe(false)
    expect(out.progress.reviews['nombres-jusqu-20']).toBeUndefined()
  })

  it('ne mute pas la progression passée en entrée (fonction pure)', () => {
    const progress = empty()
    recordAnswer(progress, 'nombres-jusqu-20', 'discovery', true, T0, TARGET)
    expect(progress.mastery).toEqual({})
  })

  it('remonte les changements de palier pour le feedback', () => {
    let progress = empty()
    for (let i = 0; i < 3; i++) {
      progress = recordAnswer(progress, 'addition-jusqu-20', 'current', true, T0, TARGET).progress
    }
    const out = recordAnswer(progress, 'addition-jusqu-20', 'current', true, T0, TARGET)
    expect(out.masteryChange.leveledUp).toBe(true)
    expect(out.progress.mastery['addition-jusqu-20'].tier).toBe(2)
  })
})

describe('recordAnswer — acquisition et planification de rappel', () => {
  it('planifie un premier rappel J+2 quand la notion devient acquise', () => {
    const progress: LearnerProgress = {
      mastery: { 'nombres-jusqu-20': { tier: 3, score: 70, streak: 0, errStreak: 0 } },
      reviews: {},
    }
    const out = recordAnswer(progress, 'nombres-jusqu-20', 'current', true, T0, TARGET)
    expect(out.acquiredNow).toBe(true)
    const review = out.progress.reviews['nombres-jusqu-20']
    expect(review).toBeDefined()
    expect(review.nextReview).toBe(T0 + 2 * DAY_MS)
  })

  it('ne re-planifie pas un rappel pour une notion déjà en révision', () => {
    const existing = scheduleFirstReview(T0)
    const progress: LearnerProgress = {
      mastery: { 'nombres-jusqu-20': { tier: 3, score: 90, streak: 0, errStreak: 0 } },
      reviews: { 'nombres-jusqu-20': existing },
    }
    const out = recordAnswer(progress, 'nombres-jusqu-20', 'current', true, T0 + 5 * DAY_MS, TARGET)
    // Le rappel reste tel quel (pas ré-initialisé à J+2 depuis « maintenant »).
    expect(out.progress.reviews['nombres-jusqu-20']).toEqual(existing)
  })
})

describe('recordAnswer — rôle rappel (Leitner)', () => {
  const base = (): LearnerProgress => ({
    mastery: { 'nombres-jusqu-20': { tier: 3, score: 90, streak: 0, errStreak: 0 } },
    reviews: { 'nombres-jusqu-20': { box: 0, lastReviewed: T0, nextReview: T0 } },
  })

  it('avance la boîte Leitner sur une bonne réponse en rappel', () => {
    const out = recordAnswer(base(), 'nombres-jusqu-20', 'review', true, T0 + 2 * DAY_MS, TARGET)
    expect(out.progress.reviews['nombres-jusqu-20'].box).toBe(1)
  })

  it('renvoie à la première boîte et fait baisser la maîtrise sur une erreur en rappel', () => {
    const before = base()
    const out = recordAnswer(before, 'nombres-jusqu-20', 'review', false, T0 + 2 * DAY_MS, TARGET)
    expect(out.progress.reviews['nombres-jusqu-20'].box).toBe(0)
    expect(out.progress.mastery['nombres-jusqu-20'].score).toBeLessThan(
      before.mastery['nombres-jusqu-20'].score,
    )
    // La prochaine échéance repart de J+2.
    const r = out.progress.reviews['nombres-jusqu-20']
    expect(isDue(r, T0 + 2 * DAY_MS + DAY_MS)).toBe(false)
  })
})

describe('sessionReward — étoiles et grains de riz', () => {
  it('accorde 3 étoiles pour un sans-faute (ou presque)', () => {
    expect(sessionReward(9, 10).stars).toBe(3)
    expect(sessionReward(10, 10).stars).toBe(3)
  })

  it('accorde 2 étoiles pour une réussite moyenne', () => {
    expect(sessionReward(7, 10).stars).toBe(2)
  })

  it('accorde 1 étoile (jamais 0) même en cas de difficulté', () => {
    expect(sessionReward(2, 10).stars).toBe(1)
    expect(sessionReward(0, 10).stars).toBe(1)
  })

  it('donne des grains de riz proportionnels aux bonnes réponses', () => {
    expect(sessionReward(0, 10).coins).toBe(0)
    expect(sessionReward(5, 10).coins).toBeGreaterThan(0)
    expect(sessionReward(10, 10).coins).toBeGreaterThan(sessionReward(5, 10).coins)
  })

  it('gère une session vide sans planter', () => {
    expect(sessionReward(0, 0).stars).toBe(1)
    expect(sessionReward(0, 0).coins).toBe(0)
  })
})

// Garde-fou de typage : ReviewState reste bien la forme attendue.
const _r: ReviewState = scheduleFirstReview(0)
void _r
