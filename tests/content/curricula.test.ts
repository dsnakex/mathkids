import { CURRICULA } from '@/content/curricula'
import { getLesson } from '@/content/lessons'
import {
  allNotions,
  danglingPrerequisites,
  duplicateNotionIds,
  findPrerequisiteCycle,
} from '@/content/graph'
import { isNotionGeneratable } from '@/engine/session'
import { canGenerate, generateExercise } from '@/engine/generators'
import { mulberry32 } from '@/engine/generators/rng'

// Invariants valables pour CHAQUE niveau (CP → CM2 à mesure qu'ils arrivent).
describe.each(Object.entries(CURRICULA))('curriculum %s', (_level, curriculum) => {
  it('graphe de prérequis sain (pas de doublon, pendant ni cycle)', () => {
    expect(duplicateNotionIds(curriculum)).toEqual([])
    expect(danglingPrerequisites(curriculum)).toEqual([])
    expect(findPrerequisiteCycle(curriculum)).toBeNull()
  })

  it('5 paliers par notion et une leçon pour chacune', () => {
    for (const notion of allNotions(curriculum)) {
      expect(notion.tiers.map((t) => t.level).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
      expect(getLesson(notion.lesson), `leçon ${notion.id}`).toBeDefined()
    }
  })

  it('possède un cœur jouable (≥ 6 notions générables)', () => {
    const playable = allNotions(curriculum).filter(isNotionGeneratable)
    expect(playable.length).toBeGreaterThanOrEqual(6)
  })

  it('chaque gabarit jouable produit un exercice valide (une seule bonne réponse)', () => {
    const specs = allNotions(curriculum)
      .flatMap((n) => n.tiers.flatMap((t) => t.generators))
      .filter(canGenerate)
    for (const spec of specs) {
      for (let seed = 0; seed < 8; seed++) {
        const ex = generateExercise(spec, mulberry32(seed))
        expect(ex.prompt.length).toBeGreaterThan(0)
        if (ex.type === 'qcm') {
          expect(new Set(ex.choices).size).toBe(ex.choices.length)
          expect(ex.correctIndex).toBeGreaterThanOrEqual(0)
          expect(ex.correctIndex).toBeLessThan(ex.choices.length)
        } else if (ex.type === 'order') {
          expect(ex.answer).toEqual([...ex.values].sort((a, b) => a - b))
        }
      }
    }
  })
})
