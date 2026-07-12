import { cp } from '@/content/curricula'
import { allNotions } from '@/content/graph'
import type { GeneratorSpec } from '@/content/schema'
import { mulberry32 } from '@/engine/generators/rng'
import {
  canGenerate,
  generateExercise,
  UnsupportedSpecError,
} from '@/engine/generators'
import { enLettres } from '@/engine/generators/frenchNumbers'
import type { Exercise } from '@/engine/generators/types'

// Tous les gabarits (GeneratorSpec) présents dans le curriculum CP.
const ALL_SPECS: GeneratorSpec[] = allNotions(cp).flatMap((n) =>
  n.tiers.flatMap((t) => t.generators),
)
const SUPPORTED_SPECS = ALL_SPECS.filter((s) => canGenerate(s))

// Extrait tous les entiers d'un énoncé, dans l'ordre.
function ints(prompt: string): number[] {
  return [...prompt.matchAll(/\d+/g)].map((m) => Number(m[0]))
}

describe('générateurs — invariants structurels (tout le curriculum CP)', () => {
  it('couvre les types de gabarits attendus (les 4 de base + ordre)', () => {
    // Les gabarits « visual » (compter, droite graduée, horloge) produisent des
    // exercices de type « qcm » ; « dragdrop ranger » produit des « order ».
    const types = new Set(SUPPORTED_SPECS.map((s) => s.type))
    expect(types).toEqual(new Set(['qcm', 'input', 'truefalse', 'gap', 'visual', 'dragdrop']))
    const exTypes = new Set(SUPPORTED_SPECS.map((s) => generateExercise(s, mulberry32(1)).type))
    expect(exTypes).toEqual(new Set(['qcm', 'input', 'truefalse', 'gap', 'order']))
  })

  it('génère, pour CHAQUE gabarit supporté et 30 tirages, un exercice valide', () => {
    for (const spec of SUPPORTED_SPECS) {
      for (let seed = 0; seed < 30; seed++) {
        const ex = generateExercise(spec, mulberry32(seed))
        // Le type d'exercice dérive du gabarit (visual → qcm, dragdrop → order).
        expect(ex.prompt.length, `énoncé vide pour ${JSON.stringify(spec)}`).toBeGreaterThan(0)
        assertExactlyOneAnswer(ex, spec)
      }
    }
  })

  it('est déterministe : même gabarit + même graine ⇒ exercice identique', () => {
    for (const spec of SUPPORTED_SPECS) {
      const a = generateExercise(spec, mulberry32(99))
      const b = generateExercise(spec, mulberry32(99))
      expect(a).toEqual(b)
    }
  })
})

function assertExactlyOneAnswer(ex: Exercise, spec: GeneratorSpec): void {
  const label = JSON.stringify(spec)
  if (ex.type === 'qcm') {
    expect(ex.choices.length, `nb choix ${label}`).toBeGreaterThanOrEqual(2)
    expect(ex.choices.length, `nb choix ${label}`).toBeLessThanOrEqual(4)
    // Distracteurs tous distincts.
    expect(new Set(ex.choices).size, `choix distincts ${label}`).toBe(ex.choices.length)
    // Exactement une bonne réponse : un seul index correct valide.
    expect(ex.correctIndex).toBeGreaterThanOrEqual(0)
    expect(ex.correctIndex).toBeLessThan(ex.choices.length)
  } else if (ex.type === 'truefalse') {
    expect(typeof ex.answer).toBe('boolean')
  } else if (ex.type === 'order') {
    // ranger : réponse = tri croissant des valeurs proposées (distinctes).
    expect(ex.values.length, `nb valeurs ${label}`).toBeGreaterThanOrEqual(2)
    expect(new Set(ex.values).size).toBe(ex.values.length)
    expect(ex.answer).toEqual([...ex.values].sort((a, b) => a - b))
  } else {
    // input / gap : réponse entière (les nombres CP sont positifs).
    expect(Number.isInteger(ex.answer), `réponse entière ${label}`).toBe(true)
    expect(ex.answer).toBeGreaterThanOrEqual(0)
  }
}

describe('générateurs — correction mathématique par famille', () => {
  it('addition / soustraction (input) : la réponse est le vrai résultat', () => {
    const specs: GeneratorSpec[] = [
      { type: 'input', params: { op: '+', max: 20, manquant: 'resultat' } },
      { type: 'input', params: { op: '-', max: 20, manquant: 'resultat' } },
      { type: 'input', params: { op: '+', max: 100, retenue: true, manquant: 'resultat' } },
      { type: 'input', params: { op: '-', max: 100, retenue: true, manquant: 'resultat' } },
    ]
    for (const spec of specs) {
      for (let seed = 0; seed < 40; seed++) {
        const ex = generateExercise(spec, mulberry32(seed))
        if (ex.type !== 'input') throw new Error('type attendu input')
        const [a, b] = ints(ex.prompt)
        const op = spec.params.op as string
        const attendu = op === '+' ? a + b : a - b
        expect(ex.answer).toBe(attendu)
        expect(ex.answer).toBeGreaterThanOrEqual(0)
        const max = spec.params.max as number
        expect(ex.answer).toBeLessThanOrEqual(max)
      }
    }
  })

  it('addition avec retenue : la somme des unités dépasse 10', () => {
    const spec: GeneratorSpec = {
      type: 'input',
      params: { op: '+', max: 100, retenue: true, manquant: 'resultat' },
    }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      const [a, b] = ints(ex.prompt)
      expect((a % 10) + (b % 10)).toBeGreaterThanOrEqual(10)
    }
  })

  it('addition sans retenue : aucune retenue sur les unités', () => {
    const spec: GeneratorSpec = {
      type: 'input',
      params: { op: '+', max: 100, retenue: false, manquant: 'resultat' },
    }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      const [a, b] = ints(ex.prompt)
      expect((a % 10) + (b % 10)).toBeLessThan(10)
    }
  })

  it('complète-le-trou (opérande manquante) : l\'égalité est vraie', () => {
    const specs: GeneratorSpec[] = [
      { type: 'gap', params: { op: '+', max: 20, manquant: 'operande' } },
      { type: 'gap', params: { op: '-', max: 20, manquant: 'operande' } },
      { type: 'gap', params: { op: '+', manquant: 'operande', cible: 10 } },
    ]
    for (const spec of specs) {
      for (let seed = 0; seed < 40; seed++) {
        const ex = generateExercise(spec, mulberry32(seed))
        if (ex.type !== 'gap') throw new Error('type attendu gap')
        // Reconstitue l'égalité en remplaçant « ? » par la réponse.
        const resolu = ex.prompt.replace('?', String(ex.answer))
        const [x, y, z] = ints(resolu)
        const op = spec.params.op as string
        expect(op === '+' ? x + y : x - y).toBe(z)
      }
    }
  })

  it('compléments (input) : réponse = cible − nombre affiché', () => {
    const spec: GeneratorSpec = {
      type: 'input',
      params: { skill: 'complement', cible: 10 },
    }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      const [a, cible] = ints(ex.prompt)
      expect(ex.type).toBe('input')
      expect(cible).toBe(10)
      if (ex.type === 'input') expect(a + ex.answer).toBe(cible)
    }
  })

  it('doubles et moitiés (input) : réponse arithmétiquement correcte', () => {
    const dbl: GeneratorSpec = { type: 'input', params: { skill: 'double', max: 10 } }
    const moi: GeneratorSpec = { type: 'input', params: { skill: 'moitie', max: 20 } }
    for (let seed = 0; seed < 40; seed++) {
      const d = generateExercise(dbl, mulberry32(seed))
      const [nd] = ints(d.prompt)
      if (d.type === 'input') expect(d.answer).toBe(nd * 2)

      const m = generateExercise(moi, mulberry32(seed))
      const [nm] = ints(m.prompt)
      expect(nm % 2).toBe(0) // on ne propose que des nombres pairs
      if (m.type === 'input') expect(m.answer).toBe(nm / 2)
    }
  })

  it('« le plus grand » (qcm) : la bonne réponse est le maximum des choix', () => {
    const spec: GeneratorSpec = { type: 'qcm', params: { skill: 'plus-grand', max: 20 } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'qcm') throw new Error('type attendu qcm')
      const nums = ex.choices.map(Number)
      expect(Number(ex.choices[ex.correctIndex])).toBe(Math.max(...nums))
    }
  })

  it('lire-nombre (qcm) : la bonne proposition correspond aux lettres de l\'énoncé', () => {
    const spec: GeneratorSpec = { type: 'qcm', params: { skill: 'lire-nombre', max: 69 } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'qcm') throw new Error('type attendu qcm')
      const bon = Number(ex.choices[ex.correctIndex])
      expect(ex.prompt).toContain(enLettres(bon))
      // Toutes les propositions sont des entiers distincts.
      expect(new Set(ex.choices).size).toBe(ex.choices.length)
    }
  })

  it('écrire-nombre (input) : la réponse correspond aux lettres de l\'énoncé', () => {
    const spec: GeneratorSpec = { type: 'input', params: { skill: 'ecrire-nombre', max: 100 } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'input') throw new Error('type attendu input')
      expect(ex.prompt).toContain(enLettres(ex.answer))
    }
  })

  it('comparer (vrai/faux) : la valeur de vérité colle à l\'énoncé', () => {
    const spec: GeneratorSpec = { type: 'truefalse', params: { skill: 'comparer', max: 100 } }
    let vrais = 0
    let faux = 0
    for (let seed = 0; seed < 60; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'truefalse') throw new Error('type attendu truefalse')
      const [x, y] = ints(ex.prompt)
      expect(ex.answer).toBe(x > y)
      ex.answer ? vrais++ : faux++
    }
    // L'énoncé n'est pas toujours vrai ni toujours faux.
    expect(vrais).toBeGreaterThan(0)
    expect(faux).toBeGreaterThan(0)
  })

  it('compléments (vrai/faux) : mélange d\'énoncés vrais et faux, correctement étiquetés', () => {
    const spec: GeneratorSpec = { type: 'truefalse', params: { skill: 'complement', cible: 10 } }
    let vrais = 0
    let faux = 0
    for (let seed = 0; seed < 60; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'truefalse') throw new Error('type attendu truefalse')
      const [a, b, cible] = ints(ex.prompt)
      expect(ex.answer).toBe(a + b === cible)
      ex.answer ? vrais++ : faux++
    }
    expect(vrais).toBeGreaterThan(0)
    expect(faux).toBeGreaterThan(0)
  })
})

describe('générateurs — gabarits non supportés', () => {
  it('canGenerate est faux pour les gabarits encore non implémentés', () => {
    expect(canGenerate({ type: 'problem', params: { structure: 'ajout', max: 10 } })).toBe(false)
    expect(canGenerate({ type: 'visual', params: { kind: 'grouper-dizaines', max: 29 } })).toBe(false)
    expect(canGenerate({ type: 'dragdrop', params: { kind: 'payer-somme', max: 20 } })).toBe(false)
  })

  it('canGenerate est faux pour un skill non implémenté', () => {
    expect(canGenerate({ type: 'qcm', params: { skill: 'reconnaitre-forme' } })).toBe(false)
  })

  it('generateExercise lève UnsupportedSpecError sur un gabarit non supporté', () => {
    expect(() => generateExercise({ type: 'visual', params: {} }, mulberry32(1))).toThrow(
      UnsupportedSpecError,
    )
  })

  it('canGenerate ⟺ generateExercise réussit (cohérence)', () => {
    for (const spec of ALL_SPECS) {
      if (canGenerate(spec)) {
        expect(() => generateExercise(spec, mulberry32(0))).not.toThrow()
      } else {
        expect(() => generateExercise(spec, mulberry32(0))).toThrow(UnsupportedSpecError)
      }
    }
  })
})
