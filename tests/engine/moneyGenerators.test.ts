import type { GeneratorSpec } from '@/content/schema'
import { mulberry32 } from '@/engine/generators/rng'
import { generateExercise, canGenerate } from '@/engine/generators'
import { formatEuros, parseEuros } from '@/engine/generators/money'

describe('money-count — compter une somme (QCM)', () => {
  it('les pièces posées totalisent le bon montant, une seule bonne réponse', () => {
    for (const palier of [2, 3]) {
      const spec: GeneratorSpec = { type: 'qcm', params: { skill: 'money-count', palier } }
      for (let seed = 0; seed < 40; seed++) {
        const ex = generateExercise(spec, mulberry32(seed))
        if (ex.type !== 'qcm' || ex.visual?.kind !== 'coins') throw new Error('attendu qcm+coins')
        const total = ex.visual.units.reduce((a, b) => a + b, 0)
        expect(parseEuros(ex.choices[ex.correctIndex])).toBe(total)
        expect(new Set(ex.choices).size).toBe(ex.choices.length)
      }
    }
  })
})

describe('money-convert — POINT CRITIQUE : saisie « 3,5 » = « 3,50 »', () => {
  const spec: GeneratorSpec = { type: 'input', params: { skill: 'money-convert' } }

  it('la réponse en centimes correspond à l\'énoncé « X € et Y c »', () => {
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'moneyinput') throw new Error('attendu moneyinput')
      const [euros, cts] = [...ex.prompt.matchAll(/(\d+)/g)].map((m) => Number(m[0]))
      expect(ex.cents).toBe(euros * 100 + cts)
    }
  })

  it('« 3,5 » et « 3,50 » sont acceptés pour 3,50 € mais pas pour 3,05 €', () => {
    // Correction : on grade via parseEuros (voir ExerciseView).
    expect(parseEuros('3,5')).toBe(350)
    expect(parseEuros('3,50')).toBe(350)
    expect(parseEuros('3,5')).not.toBe(parseEuros('3,05'))
  })
})

describe('money-compose / money-change', () => {
  it('compose : cible positive, énoncé formaté', () => {
    const spec: GeneratorSpec = { type: 'visual', params: { kind: 'money-compose', palier: 3 } }
    for (let seed = 0; seed < 30; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'moneycompose') throw new Error('attendu moneycompose')
      expect(ex.cents).toBeGreaterThan(0)
      expect(ex.prompt).toContain(formatEuros(ex.cents))
    }
  })

  it('rendre la monnaie : rendu = donné − prix, strictement positif', () => {
    const spec: GeneratorSpec = { type: 'input', params: { skill: 'money-change' } }
    for (let seed = 0; seed < 30; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'moneyinput') throw new Error('attendu moneyinput')
      const nums = [...ex.prompt.matchAll(/(\d+)(?:,(\d+))?\s*€/g)].map(
        (m) => Number(m[1]) * 100 + (m[2] ? Number(m[2].padEnd(2, '0')) : 0),
      )
      const [price, paid] = nums
      expect(ex.cents).toBe(paid - price)
      expect(ex.cents).toBeGreaterThan(0)
    }
  })
})

describe('support monnaie', () => {
  it('canGenerate vrai', () => {
    expect(canGenerate({ type: 'qcm', params: { skill: 'money-count', palier: 2 } })).toBe(true)
    expect(canGenerate({ type: 'input', params: { skill: 'money-convert' } })).toBe(true)
    expect(canGenerate({ type: 'input', params: { skill: 'money-change' } })).toBe(true)
    expect(canGenerate({ type: 'visual', params: { kind: 'money-compose', palier: 3 } })).toBe(true)
  })
})
