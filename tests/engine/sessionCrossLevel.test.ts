import { ce1 } from '@/content/curricula'
import { mulberry32 } from '@/engine/generators/rng'
import { composeSession, reviewNotions, type LearnerProgress } from '@/engine/session'

// Rappels inter-niveaux : la mission découverte range les notions fragiles du
// NIVEAU PRÉCÉDENT dans les rappels ; la session doit les faire remonter même
// si elles n'appartiennent pas au curriculum courant.
describe('composeSession — rappels inter-niveaux', () => {
  const now = 1_700_000_000_000
  const dueNow = { box: 0, lastReviewed: now - 1000, nextReview: now - 1 }

  it('fait remonter en rappel une notion CP due pour un profil CE1', () => {
    const progress: LearnerProgress = {
      mastery: {
        // notion CE1 en cours (pour un vivier « current » réaliste)
        'nombres-jusqu-1000': { tier: 1, score: 30, streak: 0, errStreak: 0 },
        // notion CP fragile détectée par la mission
        'addition-jusqu-20': { tier: 1, score: 30, streak: 0, errStreak: 0 },
      },
      reviews: { 'addition-jusqu-20': dueNow }, // id CP, absent du curriculum CE1
    }

    const reviews = reviewNotions(ce1, progress, now)
    expect(reviews.map((n) => n.id)).toContain('addition-jusqu-20')

    const session = composeSession(ce1, progress, { now, rng: mulberry32(1), total: 10 })
    const review = session.filter((s) => s.role === 'review')
    expect(review.length).toBeGreaterThan(0)
    expect(review.every((s) => s.notionId === 'addition-jusqu-20')).toBe(true)
  })

  it('ignore un rappel dont la notion n\'existe dans aucun niveau', () => {
    const progress: LearnerProgress = {
      mastery: {},
      reviews: { 'notion-fantome': dueNow },
    }
    expect(reviewNotions(ce1, progress, now)).toEqual([])
    // Et la session se compose sans planter.
    const session = composeSession(ce1, progress, { now, rng: mulberry32(2), total: 6 })
    expect(session.every((s) => s.notionId !== 'notion-fantome')).toBe(true)
  })
})
