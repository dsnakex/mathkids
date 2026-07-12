import type { GeneratorSpec } from '@/content/schema'
import { mulberry32 } from '@/engine/generators/rng'
import { generateExercise, canGenerate } from '@/engine/generators'

const ints = (s: string): number[] => [...s.matchAll(/\d+/g)].map((m) => Number(m[0]))
const tenths = (dec: string): number => Math.round(Number(dec.replace(',', '.')) * 10)

describe('générateurs décimaux (QCM)', () => {
  it('comparer : la bonne réponse est le plus grand décimal', () => {
    const spec: GeneratorSpec = { type: 'qcm', params: { skill: 'decimal-compare', max: 10 } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'qcm') throw new Error('attendu qcm')
      const values = ex.choices.map(tenths)
      expect(tenths(ex.choices[ex.correctIndex])).toBe(Math.max(...values))
      expect(new Set(ex.choices).size).toBe(ex.choices.length)
    }
  })

  it('additionner : la bonne réponse est la somme des deux décimaux', () => {
    const spec: GeneratorSpec = { type: 'qcm', params: { skill: 'decimal-add', max: 10 } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'qcm') throw new Error('attendu qcm')
      const operands = [...ex.prompt.matchAll(/\d+,\d+/g)].map((m) => tenths(m[0]))
      expect(tenths(ex.choices[ex.correctIndex])).toBe(operands[0] + operands[1])
    }
  })
})

describe('générateur pourcentage', () => {
  it('saisie : réponse = pct % de n', () => {
    for (const pct of [25, 50, 100]) {
      const spec: GeneratorSpec = { type: 'input', params: { skill: 'pourcentage', pct, max: 80 } }
      for (let seed = 0; seed < 20; seed++) {
        const ex = generateExercise(spec, mulberry32(seed))
        if (ex.type !== 'input') throw new Error('attendu input')
        const [p, n] = ints(ex.prompt)
        expect(p).toBe(pct)
        expect(ex.answer).toBe((n * pct) / 100)
        expect(Number.isInteger(ex.answer)).toBe(true)
      }
    }
  })
})

describe('générateur égalité à trous (équivalence)', () => {
  it('l\'égalité est vraie une fois le trou complété', () => {
    const spec: GeneratorSpec = { type: 'gap', params: { skill: 'egalite', max: 20 } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'gap') throw new Error('attendu gap')
      const [a, b, x, d] = ints(ex.prompt.replace('?', String(ex.answer)))
      expect(a + b).toBe(x + d)
      expect(ex.answer).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('générateur probabilités (vocabulaire)', () => {
  it('propose certain / possible / impossible avec la bonne réponse', () => {
    const spec: GeneratorSpec = { type: 'qcm', params: { skill: 'proba-vocab' } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'qcm') throw new Error('attendu qcm')
      expect(new Set(ex.choices)).toEqual(new Set(['certain', 'possible', 'impossible']))
      expect(ex.correctIndex).toBeGreaterThanOrEqual(0)
      expect(ex.correctIndex).toBeLessThan(3)
    }
  })
})

describe('générateur multiples (vrai/faux)', () => {
  it('la valeur de vérité colle à la divisibilité', () => {
    const spec: GeneratorSpec = { type: 'truefalse', params: { skill: 'multiple', base: 3 } }
    let vrais = 0
    let faux = 0
    for (let seed = 0; seed < 60; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'truefalse') throw new Error('attendu truefalse')
      const [n, base] = ints(ex.prompt)
      expect(ex.answer).toBe(n % base === 0)
      ex.answer ? vrais++ : faux++
    }
    expect(vrais).toBeGreaterThan(0)
    expect(faux).toBeGreaterThan(0)
  })
})

describe('support des gabarits CM1', () => {
  it('canGenerate vrai', () => {
    expect(canGenerate({ type: 'qcm', params: { skill: 'decimal-compare', max: 10 } })).toBe(true)
    expect(canGenerate({ type: 'qcm', params: { skill: 'decimal-add', max: 10 } })).toBe(true)
    expect(canGenerate({ type: 'input', params: { skill: 'pourcentage', pct: 50, max: 80 } })).toBe(true)
    expect(canGenerate({ type: 'gap', params: { skill: 'egalite', max: 20 } })).toBe(true)
    expect(canGenerate({ type: 'qcm', params: { skill: 'proba-vocab' } })).toBe(true)
    expect(canGenerate({ type: 'truefalse', params: { skill: 'multiple', base: 3 } })).toBe(true)
  })
})
