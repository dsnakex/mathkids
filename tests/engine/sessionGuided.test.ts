import { cp } from '@/content/curricula'
import { mulberry32 } from '@/engine/generators/rng'
import { composeSession, type LearnerProgress } from '@/engine/session'
import { scheduleFirstReview, DAY_MS } from '@/engine/spaced'
import type { MasteryState } from '@/engine/adaptive'

// Notion acquise + son rappel dû → un vivier « rappel » non vide ; comme
// « nombres-jusqu-20 » est acquise, ses dépendantes deviennent des découvertes.
const acquise: MasteryState = { tier: 3, score: 90, streak: 0, errStreak: 0 }

function progressReviewAndDiscovery(): LearnerProgress {
  return {
    mastery: { 'nombres-jusqu-20': acquise },
    reviews: { 'nombres-jusqu-20': scheduleFirstReview(0) },
  }
}

describe('composeSession — parcours guidé vs libre (chantier A)', () => {
  const now = 10 * DAY_MS // rappel J+2 de « nombres-jusqu-20 » largement dû

  it('mode libre : peut injecter une découverte (comportement historique)', () => {
    const session = composeSession(cp, progressReviewAndDiscovery(), {
      now,
      rng: mulberry32(1),
      total: 10,
      currentNotionId: 'addition-jusqu-20',
      mode: 'free',
    })
    expect(session.some((s) => s.role === 'discovery')).toBe(true)
  })

  it('mode guidé : aucune découverte-surprise, mais les rappels d\'acquises restent', () => {
    const session = composeSession(cp, progressReviewAndDiscovery(), {
      now,
      rng: mulberry32(1),
      total: 10,
      currentNotionId: 'addition-jusqu-20',
      mode: 'guided',
    })
    expect(session.some((s) => s.role === 'discovery')).toBe(false)
    expect(session.some((s) => s.role === 'review')).toBe(true)
    expect(session.some((s) => s.role === 'current')).toBe(true)
    // Toutes les notions jouées sont soit la notion en cours, soit une acquise en rappel.
    const played = new Set(session.map((s) => s.notionId))
    expect(played).toContain('addition-jusqu-20')
    expect(played).toContain('nombres-jusqu-20')
  })

  it('mode par défaut = libre (composeSession sans `mode`) : inchangé', () => {
    const opts = {
      now,
      rng: mulberry32(3),
      total: 10,
      currentNotionId: 'addition-jusqu-20',
    } as const
    const implicit = composeSession(cp, progressReviewAndDiscovery(), opts)
    const explicit = composeSession(cp, progressReviewAndDiscovery(), { ...opts, mode: 'free' })
    expect(implicit.map((s) => s.role)).toEqual(explicit.map((s) => s.role))
  })
})
