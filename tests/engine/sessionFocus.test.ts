import { cp } from '@/content/curricula'
import { mulberry32 } from '@/engine/generators/rng'
import { composeSession, type LearnerProgress } from '@/engine/session'

// Depuis la carte, l'enfant choisit une notion : la session doit se centrer sur
// CETTE notion, même si elle n'a jamais été commencée.
describe('composeSession — notion imposée (choix depuis la carte)', () => {
  const now = 1_000_000_000_000

  it('centre la session « en cours » sur la notion demandée', () => {
    const progress: LearnerProgress = { mastery: {}, reviews: {} }
    const session = composeSession(cp, progress, {
      now,
      rng: mulberry32(1),
      total: 10,
      currentNotionId: 'addition-jusqu-20',
    })
    const current = session.filter((s) => s.role === 'current')
    expect(current.length).toBeGreaterThan(0)
    expect(current.every((s) => s.notionId === 'addition-jusqu-20')).toBe(true)
  })

  it('ignore une notion imposée non jouable et retombe sur le choix automatique', () => {
    const progress: LearnerProgress = { mastery: {}, reviews: {} }
    const session = composeSession(cp, progress, {
      now,
      rng: mulberry32(2),
      total: 6,
      currentNotionId: 'formes-planes', // non jouable (géométrie « contenu »)
    })
    // Pas de plantage, une session est tout de même composée.
    expect(session.length).toBe(6)
    expect(session.every((s) => s.notionId !== 'formes-planes')).toBe(true)
  })
})
