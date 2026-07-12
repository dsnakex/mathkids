import { cp, ce1 } from '@/content/curricula'
import { allNotions } from '@/content/graph'
import { isNotionGeneratable } from '@/engine/session'
import { isNotionAcquired } from '@/engine/adaptive'
import { mulberry32 } from '@/engine/generators/rng'
import {
  buildPlacementQuiz,
  applyPlacement,
  PLACEMENT_MAX,
  DEFAULT_TARGET_TIER,
} from '@/features/placement/placement'

function playableCount(curriculum: typeof cp): number {
  return allNotions(curriculum).filter(isNotionGeneratable).length
}

describe('placement — construction du quiz', () => {
  it('propose une question par notion jouable, plafonnée à PLACEMENT_MAX', () => {
    const quiz = buildPlacementQuiz(cp, mulberry32(1))
    expect(quiz.length).toBe(Math.min(PLACEMENT_MAX, playableCount(cp)))
    expect(quiz.length).toBeGreaterThanOrEqual(8)
  })

  it('chaque question porte sur une notion jouable et un exercice valide', () => {
    const quiz = buildPlacementQuiz(ce1, mulberry32(2))
    const playableIds = new Set(allNotions(ce1).filter(isNotionGeneratable).map((n) => n.id))
    for (const q of quiz) {
      expect(playableIds.has(q.notionId)).toBe(true)
      expect(q.exercise.prompt.length).toBeGreaterThan(0)
      if (q.exercise.type === 'qcm') {
        expect(q.exercise.correctIndex).toBeGreaterThanOrEqual(0)
        expect(q.exercise.correctIndex).toBeLessThan(q.exercise.choices.length)
      }
    }
  })

  it('est déterministe pour une graine donnée', () => {
    expect(buildPlacementQuiz(cp, mulberry32(5))).toEqual(buildPlacementQuiz(cp, mulberry32(5)))
  })
})

describe('placement — application des résultats', () => {
  it('marque acquises les notions réussies, ignore les échouées', () => {
    const progress = applyPlacement([
      { notionId: 'nombres-jusqu-20', correct: true },
      { notionId: 'addition-jusqu-20', correct: false },
    ])
    expect(progress.mastery['nombres-jusqu-20']).toBeDefined()
    expect(isNotionAcquired(progress.mastery['nombres-jusqu-20'], DEFAULT_TARGET_TIER)).toBe(true)
    expect(progress.mastery['addition-jusqu-20']).toBeUndefined()
  })

  it('ne crée aucun rappel et reste vide si tout est raté', () => {
    const progress = applyPlacement([{ notionId: 'nombres-jusqu-20', correct: false }])
    expect(progress.mastery).toEqual({})
    expect(progress.reviews).toEqual({})
  })
})
