import type { GeneratorSpec } from '@/content/schema'
import { mulberry32 } from '@/engine/generators/rng'
import { generateExercise, canGenerate } from '@/engine/generators'

function ints(s: string): number[] {
  return [...s.matchAll(/\d+/g)].map((m) => Number(m[0]))
}

describe('générateur multiplication (tables)', () => {
  it('saisie : la réponse est le vrai produit, dans les tables demandées', () => {
    const spec: GeneratorSpec = { type: 'input', params: { op: '×', tables: [2, 3, 4, 5] } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'input') throw new Error('attendu input')
      const [a, b] = ints(ex.prompt)
      expect([2, 3, 4, 5]).toContain(a)
      expect(b).toBeGreaterThanOrEqual(1)
      expect(b).toBeLessThanOrEqual(10)
      expect(ex.answer).toBe(a * b)
    }
  })

  it('QCM : une seule bonne réponse égale au produit', () => {
    const spec: GeneratorSpec = { type: 'qcm', params: { op: '×', tables: [2, 3, 4, 5] } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'qcm') throw new Error('attendu qcm')
      const [a, b] = ints(ex.prompt)
      expect(Number(ex.choices[ex.correctIndex])).toBe(a * b)
      expect(new Set(ex.choices).size).toBe(ex.choices.length)
    }
  })

  it('trou : l\'égalité multiplicative est vraie', () => {
    const spec: GeneratorSpec = { type: 'gap', params: { op: '×', table: 3 } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'gap') throw new Error('attendu gap')
      const [x, y, z] = ints(ex.prompt.replace('?', String(ex.answer)))
      expect(x * y).toBe(z)
    }
  })
})

describe('générateur quart (fraction-partage)', () => {
  it('saisie : réponse = n / 4, avec n multiple de 4', () => {
    const spec: GeneratorSpec = { type: 'input', params: { skill: 'quart', max: 40 } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'input') throw new Error('attendu input')
      const [n] = ints(ex.prompt)
      expect(n % 4).toBe(0)
      expect(ex.answer).toBe(n / 4)
    }
  })

  it('QCM : une seule bonne réponse', () => {
    const spec: GeneratorSpec = { type: 'qcm', params: { skill: 'quart', max: 40 } }
    const ex = generateExercise(spec, mulberry32(1))
    if (ex.type !== 'qcm') throw new Error('attendu qcm')
    const [n] = ints(ex.prompt)
    expect(Number(ex.choices[ex.correctIndex])).toBe(n / 4)
  })
})

describe('support des nouveaux gabarits', () => {
  it('canGenerate vrai pour multiplication et quart', () => {
    expect(canGenerate({ type: 'input', params: { op: '×', tables: [2, 3, 4, 5] } })).toBe(true)
    expect(canGenerate({ type: 'qcm', params: { op: '×', table: 5 } })).toBe(true)
    expect(canGenerate({ type: 'gap', params: { op: '×', table: 2 } })).toBe(true)
    expect(canGenerate({ type: 'input', params: { skill: 'quart', max: 20 } })).toBe(true)
  })
})
