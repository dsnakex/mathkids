import ce1Data from '@/content/curriculum/ce1.json'
import { curriculumSchema } from '@/content/schema'
import { ce1 } from '@/content/curricula'
import {
  allNotions,
  danglingPrerequisites,
  duplicateNotionIds,
  findPrerequisiteCycle,
} from '@/content/graph'
import { isNotionGeneratable } from '@/engine/session'
import { canGenerate, generateExercise } from '@/engine/generators'
import { mulberry32 } from '@/engine/generators/rng'

describe('Curriculum CE1', () => {
  it('est conforme au schéma de contenu', () => {
    expect(() => curriculumSchema.parse(ce1Data)).not.toThrow()
  })

  it('porte l\'identifiant de niveau « ce1 »', () => {
    expect(ce1.id).toBe('ce1')
  })

  it('couvre les 5 domaines du programme', () => {
    expect(ce1.domains.map((d) => d.id)).toEqual([
      'nombres',
      'calcul',
      'problemes',
      'grandeurs-mesures',
      'geometrie',
    ])
  })

  it('donne à chaque notion 5 paliers (1 à 5) avec au moins un générateur', () => {
    for (const notion of allNotions(ce1)) {
      expect(notion.tiers.map((t) => t.level).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
      for (const tier of notion.tiers) {
        expect(tier.generators.length, `${notion.id} p${tier.level}`).toBeGreaterThan(0)
      }
    }
  })

  it('n\'a ni doublon, ni prérequis pendant, ni cycle', () => {
    expect(duplicateNotionIds(ce1)).toEqual([])
    expect(danglingPrerequisites(ce1)).toEqual([])
    expect(findPrerequisiteCycle(ce1)).toBeNull()
  })

  it('rend jouable le cœur nombres + calcul (dont la multiplication)', () => {
    const shouldPlay = [
      'nombres-jusqu-1000',
      'comparaison-jusqu-1000',
      'fractions-partage',
      'addition-posee',
      'soustraction-posee',
      'sens-multiplication',
      'tables-multiplication',
      'calcul-mental',
    ]
    for (const id of shouldPlay) {
      const notion = allNotions(ce1).find((n) => n.id === id)
      expect(notion && isNotionGeneratable(notion), id).toBe(true)
    }
  })

  it('produit un exercice valide pour chaque gabarit jouable (une seule bonne réponse)', () => {
    const specs = allNotions(ce1)
      .flatMap((n) => n.tiers.flatMap((t) => t.generators))
      .filter(canGenerate)
    expect(specs.length).toBeGreaterThan(0)
    for (const spec of specs) {
      for (let seed = 0; seed < 10; seed++) {
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
