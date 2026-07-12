import {
  scheduleFirstReview,
  applyReview,
  isDue,
  dueNotions,
  REVIEW_INTERVALS_DAYS,
  DAY_MS,
  type ReviewState,
} from '@/engine/spaced'

const T0 = 1_000_000_000_000 // instant de référence arbitraire (ms)
const days = (n: number): number => n * DAY_MS

describe('révision espacée (Leitner) — intervalles', () => {
  it('utilise les intervalles J+2, J+7, J+30', () => {
    expect(REVIEW_INTERVALS_DAYS).toEqual([2, 7, 30])
  })
})

describe('révision espacée — première planification', () => {
  it('planifie le premier rappel à J+2', () => {
    const s = scheduleFirstReview(T0)
    expect(s.box).toBe(0)
    expect(s.nextReview).toBe(T0 + days(2))
  })

  it('n\'est pas dû avant l\'échéance, dû à partir de l\'échéance', () => {
    const s = scheduleFirstReview(T0)
    expect(isDue(s, T0 + days(1))).toBe(false)
    expect(isDue(s, T0 + days(2))).toBe(true)
    expect(isDue(s, T0 + days(3))).toBe(true)
  })
})

describe('révision espacée — progression dans les boîtes', () => {
  it('une bonne réponse fait avancer d\'une boîte (J+2 → J+7 → J+30)', () => {
    let s = scheduleFirstReview(T0)
    s = applyReview(s, true, T0 + days(2))
    expect(s.box).toBe(1)
    expect(s.nextReview).toBe(T0 + days(2) + days(7))

    s = applyReview(s, true, s.nextReview)
    expect(s.box).toBe(2)
    expect(s.nextReview).toBe(T0 + days(2) + days(7) + days(30))
  })

  it('reste dans la dernière boîte après une bonne réponse (intervalle J+30)', () => {
    let s: ReviewState = { box: 2, lastReviewed: T0, nextReview: T0 }
    s = applyReview(s, true, T0)
    expect(s.box).toBe(2)
    expect(s.nextReview).toBe(T0 + days(30))
  })

  it('une erreur en rappel renvoie à la première boîte (J+2)', () => {
    let s: ReviewState = { box: 2, lastReviewed: T0, nextReview: T0 }
    s = applyReview(s, false, T0)
    expect(s.box).toBe(0)
    expect(s.nextReview).toBe(T0 + days(2))
  })
})

describe('révision espacée — sélection des notions dues', () => {
  it('ne renvoie que les notions dont l\'échéance est atteinte', () => {
    const reviews: Record<string, ReviewState> = {
      'addition-jusqu-20': scheduleFirstReview(T0), // dû à J+2
      'complements-a-10': { box: 1, lastReviewed: T0, nextReview: T0 + days(100) }, // pas dû
    }
    const due = dueNotions(reviews, T0 + days(2))
    expect(due).toEqual(['addition-jusqu-20'])
  })
})
