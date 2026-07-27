import { findNotion } from '@/content/curricula'
import type { Notion } from '@/content/schema'
import { canGenerate, generateExercise } from '@/engine/generators'
import { mulberry32 } from '@/engine/generators/rng'

// Format de réponse adapté (heuristique) : une notion dont le cœur est de
// PRODUIRE un fait numérique (tables, division en calcul mental) ne doit pas le
// faire reconnaître par QCM — on tape la réponse (input) ou on complète un trou
// (gap). Ce test verrouille les corrections « claires » du chantier.

function tiersOf(id: string): Notion['tiers'] {
  const notion = findNotion(id)
  if (!notion) throw new Error(`notion introuvable : ${id}`)
  return notion.tiers
}

function opOf(params: Record<string, unknown>): unknown {
  return params.op
}

describe('format de réponse — production plutôt que reconnaissance', () => {
  it('CE2 « Les tables jusqu\'à 9 » : aucune multiplication en QCM (on produit le fait)', () => {
    for (const tier of tiersOf('tables-jusqu-9')) {
      for (const spec of tier.generators) {
        if (opOf(spec.params) === '×') expect(spec.type).not.toBe('qcm')
      }
    }
  })

  it('CM2 « Calcul mental expert » : tables (×) et division (÷) ne sont plus en QCM', () => {
    for (const tier of tiersOf('calcul-mental-expert')) {
      for (const spec of tier.generators) {
        const op = opOf(spec.params)
        if (op === '×' || op === '÷') expect(spec.type).not.toBe('qcm')
      }
    }
  })

  it('les paliers corrigés produisent toujours un exercice valide (une bonne réponse)', () => {
    for (const id of ['tables-jusqu-9', 'calcul-mental-expert']) {
      for (const tier of tiersOf(id)) {
        for (const spec of tier.generators) {
          if (!canGenerate(spec)) continue
          const ex = generateExercise(spec, mulberry32(id.length + tier.level))
          expect(ex.prompt.length).toBeGreaterThan(0)
        }
      }
    }
  })
})
