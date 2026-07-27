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

describe('format de réponse — cas ambigus validés (calcul mental, opérations, décimaux)', () => {
  it('calcul mental (CE2, CM1) : ×, ÷ et moitié ne sont plus en QCM (le complément d\'ouverture reste)', () => {
    for (const id of ['calcul-mental-ce2', 'calcul-mental-cm1']) {
      for (const tier of tiersOf(id)) {
        for (const spec of tier.generators) {
          const op = opOf(spec.params)
          if (op === '×' || op === '÷' || spec.params.skill === 'moitie') {
            expect(spec.type).not.toBe('qcm')
          }
        }
      }
    }
  })

  it('CM1 « opérations posées » : aucune opération en QCM', () => {
    for (const tier of tiersOf('operations-posees')) {
      for (const spec of tier.generators) {
        if (opOf(spec.params) !== undefined) expect(spec.type).not.toBe('qcm')
      }
    }
  })

  it('décimaux : l\'ADDITION décimale passe en saisie, la COMPARAISON (conceptuelle) reste en QCM', () => {
    for (const id of ['nombres-decimaux', 'calcul-decimaux', 'decimaux-millieme']) {
      const specs = tiersOf(id).flatMap((t) => t.generators)
      // Plus aucune addition décimale en QCM (on tape la réponse au pavé virgule).
      for (const spec of specs) {
        if (spec.params.skill === 'decimal-add') expect(spec.type).not.toBe('qcm')
      }
      // La comparaison décimale, elle, reste en QCM là où elle existe (concept préservé).
      for (const spec of specs) {
        if (spec.params.skill === 'decimal-compare') expect(spec.type).toBe('qcm')
      }
    }
  })

  it('les paliers corrigés produisent toujours un exercice valide', () => {
    const ids = [
      'calcul-mental-ce2',
      'calcul-mental-cm1',
      'operations-posees',
      'nombres-decimaux',
      'calcul-decimaux',
      'decimaux-millieme',
    ]
    for (const id of ids) {
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
