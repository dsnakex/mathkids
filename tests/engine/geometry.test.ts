import type { GeneratorSpec } from '@/content/schema'
import { mulberry32 } from '@/engine/generators/rng'
import { generateExercise, canGenerate } from '@/engine/generators'

const ints = (s: string): number[] => [...s.matchAll(/\d+/g)].map((m) => Number(m[0]))

function checkInput(spec: GeneratorSpec, expected: (dims: number[]) => number) {
  for (let seed = 0; seed < 40; seed++) {
    const ex = generateExercise(spec, mulberry32(seed))
    if (ex.type !== 'input') throw new Error('attendu input')
    expect(ex.answer).toBe(expected(ints(ex.prompt)))
    expect(Number.isInteger(ex.answer)).toBe(true)
  }
}

describe('générateurs périmètre', () => {
  it('carré : 4 × côté', () => {
    checkInput({ type: 'input', params: { skill: 'perimetre-carre', max: 12 } }, ([s]) => 4 * s)
  })
  it('rectangle : 2 × (L + l)', () => {
    checkInput({ type: 'input', params: { skill: 'perimetre-rectangle', max: 12 } }, ([l, w]) => 2 * (l + w))
  })
})

describe('générateurs aire', () => {
  it('carré : côté²', () => {
    checkInput({ type: 'input', params: { skill: 'aire-carre', max: 12 } }, ([s]) => s * s)
  })
  it('rectangle : L × l', () => {
    checkInput({ type: 'input', params: { skill: 'aire-rectangle', max: 12 } }, ([l, w]) => l * w)
  })
  it('triangle (QCM) : (base × hauteur) / 2, une seule bonne réponse', () => {
    const spec: GeneratorSpec = { type: 'qcm', params: { skill: 'aire-triangle', max: 12 } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'qcm') throw new Error('attendu qcm')
      const [b, h] = ints(ex.prompt)
      expect(Number(ex.choices[ex.correctIndex])).toBe((b * h) / 2)
      expect(new Set(ex.choices).size).toBe(ex.choices.length)
    }
  })
})

describe('générateur volume', () => {
  it('pavé : L × l × h', () => {
    checkInput({ type: 'input', params: { skill: 'volume-pave', max: 6 } }, ([l, w, h]) => l * w * h)
  })
})

describe('support des gabarits géométrie/mesure', () => {
  it('canGenerate vrai', () => {
    for (const skill of [
      'perimetre-carre',
      'perimetre-rectangle',
      'aire-carre',
      'aire-rectangle',
      'aire-triangle',
      'volume-pave',
    ]) {
      expect(canGenerate({ type: 'input', params: { skill, max: 10 } }), skill).toBe(true)
    }
  })
})
