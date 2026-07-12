import type { GeneratorSpec } from '@/content/schema'
import { mulberry32 } from '@/engine/generators/rng'
import { generateExercise, canGenerate } from '@/engine/generators'

const ints = (s: string): number[] => [...s.matchAll(/\d+/g)].map((m) => Number(m[0]))

describe('générateur priorités opératoires', () => {
  it('saisie : la multiplication passe avant l\'addition', () => {
    const spec: GeneratorSpec = { type: 'input', params: { skill: 'priorite', max: 10 } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'input') throw new Error('attendu input')
      const [a, b, c] = ints(ex.prompt)
      expect(ex.answer).toBe(a + b * c)
    }
  })

  it('QCM : une seule bonne réponse (respecte la priorité)', () => {
    const spec: GeneratorSpec = { type: 'qcm', params: { skill: 'priorite', max: 10 } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'qcm') throw new Error('attendu qcm')
      const [a, b, c] = ints(ex.prompt)
      expect(Number(ex.choices[ex.correctIndex])).toBe(a + b * c)
      expect(new Set(ex.choices).size).toBe(ex.choices.length)
    }
  })
})

describe('générateur probabilités (quantifier)', () => {
  it('saisie : compte les faces favorables d\'un dé', () => {
    const spec: GeneratorSpec = { type: 'input', params: { skill: 'proba-compter' } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'input') throw new Error('attendu input')
      const [faces, k] = ints(ex.prompt)
      expect(faces).toBe(6)
      expect(ex.answer).toBe(6 - k)
      expect(ex.answer).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('support des gabarits CM2', () => {
  it('canGenerate vrai', () => {
    expect(canGenerate({ type: 'input', params: { skill: 'priorite', max: 10 } })).toBe(true)
    expect(canGenerate({ type: 'qcm', params: { skill: 'priorite', max: 10 } })).toBe(true)
    expect(canGenerate({ type: 'input', params: { skill: 'proba-compter' } })).toBe(true)
  })
})
