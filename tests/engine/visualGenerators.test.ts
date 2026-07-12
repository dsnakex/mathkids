import type { GeneratorSpec } from '@/content/schema'
import { mulberry32 } from '@/engine/generators/rng'
import { generateExercise, canGenerate } from '@/engine/generators'

describe('générateurs visuels — compter (visual)', () => {
  const spec: GeneratorSpec = { type: 'visual', params: { kind: 'compter', max: 10 } }
  it('produit un QCM avec un indice « compter » cohérent', () => {
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'qcm' || ex.visual?.kind !== 'count') throw new Error('attendu qcm+count')
      // La bonne réponse est le nombre d'objets affichés.
      expect(Number(ex.choices[ex.correctIndex])).toBe(ex.visual.objects)
      expect(ex.visual.objects).toBeGreaterThanOrEqual(1)
      expect(ex.visual.objects).toBeLessThanOrEqual(10)
      expect(new Set(ex.choices).size).toBe(ex.choices.length)
    }
  })
})

describe('générateurs visuels — lire-graduation (droite graduée)', () => {
  const spec: GeneratorSpec = { type: 'visual', params: { kind: 'lire-graduation', max: 20, pas: 1 } }
  it('place un repère sur la droite ; la bonne réponse est sa valeur', () => {
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'qcm' || ex.visual?.kind !== 'numberline') throw new Error('attendu numberline')
      const { max, step, marker } = ex.visual
      expect(marker).toBeGreaterThanOrEqual(0)
      expect(marker).toBeLessThanOrEqual(max)
      expect(marker % step).toBe(0)
      expect(Number(ex.choices[ex.correctIndex])).toBe(marker)
    }
  })
})

describe('générateurs visuels — lire-horloge', () => {
  const spec: GeneratorSpec = { type: 'visual', params: { kind: 'lire-horloge', precision: 'heure' } }
  it('affiche une heure entière ; la bonne réponse est cette heure', () => {
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'qcm' || ex.visual?.kind !== 'clock') throw new Error('attendu clock')
      expect(ex.visual.hour).toBeGreaterThanOrEqual(1)
      expect(ex.visual.hour).toBeLessThanOrEqual(12)
      expect(Number(ex.choices[ex.correctIndex])).toBe(ex.visual.hour)
    }
  })
})

describe('générateurs — ranger (glisser-déposer → ordre croissant)', () => {
  const spec: GeneratorSpec = { type: 'dragdrop', params: { kind: 'ranger', max: 20 } }
  it('propose des nombres distincts ; la réponse est leur tri croissant', () => {
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'order') throw new Error('attendu order')
      expect(ex.values.length).toBeGreaterThanOrEqual(3)
      expect(new Set(ex.values).size).toBe(ex.values.length) // distincts
      const sorted = [...ex.values].sort((a, b) => a - b)
      expect(ex.answer).toEqual(sorted)
      // La réponse est bien une permutation des valeurs proposées.
      expect([...ex.answer].sort((a, b) => a - b)).toEqual(sorted)
    }
  })
})

describe('générateurs visuels — support et déterminisme', () => {
  it('déclare supportés les nouveaux gabarits', () => {
    expect(canGenerate({ type: 'visual', params: { kind: 'compter', max: 5 } })).toBe(true)
    expect(canGenerate({ type: 'visual', params: { kind: 'lire-graduation', max: 20, pas: 1 } })).toBe(true)
    expect(canGenerate({ type: 'visual', params: { kind: 'lire-horloge', precision: 'heure' } })).toBe(true)
    expect(canGenerate({ type: 'dragdrop', params: { kind: 'ranger', max: 20 } })).toBe(true)
    expect(canGenerate({ type: 'dragdrop', params: { kind: 'ranger-croissant', max: 20 } })).toBe(true)
  })

  it('laisse non supportés les gabarits visuels non implémentés', () => {
    expect(canGenerate({ type: 'visual', params: { kind: 'grouper-dizaines', max: 29 } })).toBe(false)
    expect(canGenerate({ type: 'dragdrop', params: { kind: 'payer-somme', max: 20 } })).toBe(false)
  })

  it('est déterministe', () => {
    const spec: GeneratorSpec = { type: 'dragdrop', params: { kind: 'ranger', max: 20 } }
    expect(generateExercise(spec, mulberry32(5))).toEqual(generateExercise(spec, mulberry32(5)))
  })
})
