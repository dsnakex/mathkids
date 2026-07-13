import type { GeneratorSpec } from '@/content/schema'
import { mulberry32 } from '@/engine/generators/rng'
import { generateExercise, canGenerate } from '@/engine/generators'
import { parseDecimal } from '@/engine/generators/decimal'

const operands = (prompt: string, decimals: number): number[] =>
  [...prompt.matchAll(/\d+(?:,\d+)?/g)].map((m) => parseDecimal(m[0], decimals) ?? NaN)

describe('saisie décimale — addition', () => {
  it('la réponse (dixièmes) est la somme des opérandes de l\'énoncé', () => {
    const spec: GeneratorSpec = { type: 'input', params: { skill: 'decimal-add-input', max: 10, decimals: 1 } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'decimalinput') throw new Error('attendu decimalinput')
      const [a, b] = operands(ex.prompt, ex.decimals)
      expect(ex.decimals).toBe(1)
      expect(ex.value).toBe(a + b)
      expect(Number.isInteger(ex.value)).toBe(true)
    }
  })
})

describe('saisie décimale — soustraction', () => {
  it('réponse = a − b ≥ 0', () => {
    const spec: GeneratorSpec = { type: 'input', params: { skill: 'decimal-sub-input', max: 10, decimals: 1 } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'decimalinput') throw new Error('attendu decimalinput')
      const [a, b] = operands(ex.prompt, ex.decimals)
      expect(ex.value).toBe(a - b)
      expect(ex.value).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('saisie décimale — centièmes et support', () => {
  it('gère les centièmes (decimals: 2)', () => {
    const spec: GeneratorSpec = { type: 'input', params: { skill: 'decimal-add-input', max: 5, decimals: 2 } }
    const ex = generateExercise(spec, mulberry32(4))
    if (ex.type !== 'decimalinput') throw new Error('attendu decimalinput')
    const [a, b] = operands(ex.prompt, 2)
    expect(ex.value).toBe(a + b)
  })

  it('canGenerate vrai', () => {
    expect(canGenerate({ type: 'input', params: { skill: 'decimal-add-input', max: 10, decimals: 1 } })).toBe(true)
    expect(canGenerate({ type: 'input', params: { skill: 'decimal-sub-input', max: 10, decimals: 1 } })).toBe(true)
  })
})
