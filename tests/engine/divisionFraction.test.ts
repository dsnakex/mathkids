import type { GeneratorSpec } from '@/content/schema'
import { mulberry32 } from '@/engine/generators/rng'
import { generateExercise, canGenerate } from '@/engine/generators'

const ints = (s: string): number[] => [...s.matchAll(/\d+/g)].map((m) => Number(m[0]))

describe('générateur division (partage exact)', () => {
  it('saisie : quotient exact, division qui tombe juste', () => {
    const spec: GeneratorSpec = { type: 'input', params: { op: '÷', divisors: [2, 3, 4, 5] } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'input') throw new Error('attendu input')
      const [a, b] = ints(ex.prompt)
      expect([2, 3, 4, 5]).toContain(b)
      expect(a % b).toBe(0)
      expect(ex.answer).toBe(a / b)
    }
  })

  it('QCM : une seule bonne réponse égale au quotient', () => {
    const spec: GeneratorSpec = { type: 'qcm', params: { op: '÷', divisors: [2, 3, 4, 5] } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'qcm') throw new Error('attendu qcm')
      const [a, b] = ints(ex.prompt)
      expect(Number(ex.choices[ex.correctIndex])).toBe(a / b)
      expect(new Set(ex.choices).size).toBe(ex.choices.length)
    }
  })

  it('trou : l\'égalité de division est vraie', () => {
    const spec: GeneratorSpec = { type: 'gap', params: { op: '÷', divisor: 4 } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'gap') throw new Error('attendu gap')
      const [x, y, z] = ints(ex.prompt.replace('?', String(ex.answer)))
      expect(x / y).toBe(z)
    }
  })
})

describe('générateur fraction générique (num/den d\'une quantité)', () => {
  it('tiers : réponse = n / 3, avec n multiple de 3', () => {
    const spec: GeneratorSpec = { type: 'input', params: { skill: 'fraction', num: 1, den: 3, max: 30 } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'input') throw new Error('attendu input')
      const [num, den, n] = ints(ex.prompt)
      expect(num).toBe(1)
      expect(den).toBe(3)
      expect(n % 3).toBe(0)
      expect(ex.answer).toBe(n / 3)
    }
  })

  it('trois quarts : réponse = n × 3 / 4', () => {
    const spec: GeneratorSpec = { type: 'qcm', params: { skill: 'fraction', num: 3, den: 4, max: 40 } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'qcm') throw new Error('attendu qcm')
      const nums = ints(ex.prompt)
      const n = nums[nums.length - 1] // la quantité est le dernier nombre de l'énoncé
      expect(n % 4).toBe(0)
      expect(Number(ex.choices[ex.correctIndex])).toBe((n * 3) / 4)
    }
  })
})

describe('support division et fraction', () => {
  it('canGenerate vrai', () => {
    expect(canGenerate({ type: 'input', params: { op: '÷', divisors: [2, 5] } })).toBe(true)
    expect(canGenerate({ type: 'gap', params: { op: '÷', divisor: 3 } })).toBe(true)
    expect(canGenerate({ type: 'input', params: { skill: 'fraction', num: 1, den: 3, max: 30 } })).toBe(true)
  })
})
