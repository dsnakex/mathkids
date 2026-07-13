import { CURRICULA } from '@/content/curricula'
import { allNotions } from '@/content/graph'
import type { LevelId } from '@/content/schema'
import { canGenerate, generateExercise } from '@/engine/generators'
import { hasExactProblem } from '@/engine/generators/problem'
import { mulberry32 } from '@/engine/generators/rng'

const problemSpecs = Object.values(CURRICULA)
  .flatMap((c) => allNotions(c).flatMap((n) => n.tiers.flatMap((t) => t.generators)))
  .filter((s) => s.type === 'problem')

describe('branchement des GeneratorSpec « problem » sur la banque', () => {
  it('il existe des specs problem à brancher', () => {
    expect(problemSpecs.length).toBeGreaterThan(20)
  })

  it('chaque spec problem est jouable et produit un énoncé complet', () => {
    for (const spec of problemSpecs) {
      const info = JSON.stringify(spec.params)
      expect(canGenerate(spec), info).toBe(true)
      const ex = generateExercise(spec, mulberry32(7))
      expect(ex.type, info).toBe('problem')
      if (ex.type === 'problem') {
        expect(ex.prompt.length).toBeGreaterThan(0)
        expect(ex.hints.length).toBeGreaterThanOrEqual(2)
        expect(ex.prompt.includes('{')).toBe(false)
      }
    }
  })

  it('signale les specs sans correspondance EXACTE (repli par classe d\'étapes)', () => {
    const inexact = problemSpecs
      .filter(
        (s) =>
          !hasExactProblem(
            s.params.level as LevelId,
            String(s.params.structure),
            Number(s.params.etapes),
          ),
      )
      .map((s) => `${s.params.level}/${s.params.structure}/${s.params.etapes}`)
      .sort()
    // Gabarits sans structure identique dans la banque : ils tombent sur un repli
    // (même classe d'étapes) et restent jouables (test précédent). Liste figée
    // pour repérer toute régression de couverture du contenu.
    expect(inexact).toEqual([
      'ce1/ajout/1',
      'ce1/comparaison/2',
      'ce1/retrait/1',
      'ce1/reunion/2',
      'ce2/multiplication/2',
    ])
  })
})
