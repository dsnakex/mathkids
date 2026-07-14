import type { GeneratorSpec } from '@/content/schema'
import { mulberry32 } from '@/engine/generators/rng'
import { generateExercise, canGenerate } from '@/engine/generators'
import { SHAPES_2D, SOLIDS_3D } from '@/engine/generators/geometry'

const shape = (id: string) => SHAPES_2D.find((s) => s.id === id)!
const solid = (id: string) => SOLIDS_3D.find((s) => s.id === id)!

describe('géométrie — reconnaître une figure', () => {
  it('la bonne réponse est le nom de la figure affichée', () => {
    const spec: GeneratorSpec = { type: 'qcm', params: { skill: 'reconnaitre-forme' } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'qcm' || ex.visual?.kind !== 'shape') throw new Error('attendu qcm+shape')
      expect(ex.choices[ex.correctIndex]).toBe(shape(ex.visual.shape).name)
      expect(new Set(ex.choices).size).toBe(ex.choices.length)
    }
  })
})

describe('géométrie — compter les côtés', () => {
  it('la bonne réponse est le nombre de côtés de la figure', () => {
    const spec: GeneratorSpec = { type: 'qcm', params: { skill: 'compter-cotes' } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'qcm' || ex.visual?.kind !== 'shape') throw new Error('attendu qcm+shape')
      expect(Number(ex.choices[ex.correctIndex])).toBe(shape(ex.visual.shape).sides)
    }
  })
})

describe('géométrie — angle droit (vrai/faux avec figure)', () => {
  it('la valeur de vérité colle à la figure affichée', () => {
    const spec: GeneratorSpec = { type: 'truefalse', params: { skill: 'angle-droit' } }
    let vrais = 0
    let faux = 0
    for (let seed = 0; seed < 60; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'truefalse' || ex.visual?.kind !== 'shape') throw new Error('attendu tf+shape')
      expect(ex.answer).toBe(shape(ex.visual.shape).rightAngle)
      ex.answer ? vrais++ : faux++
    }
    expect(vrais).toBeGreaterThan(0)
    expect(faux).toBeGreaterThan(0)
  })
})

describe('géométrie — solides', () => {
  it('reconnaître : la bonne réponse est le nom du solide affiché', () => {
    const spec: GeneratorSpec = { type: 'qcm', params: { skill: 'reconnaitre-solide' } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'qcm' || ex.visual?.kind !== 'solid') throw new Error('attendu qcm+solid')
      expect(ex.choices[ex.correctIndex]).toBe(solid(ex.visual.solid).name)
    }
  })
  it('compter les faces : cube/pavé = 6', () => {
    const spec: GeneratorSpec = { type: 'qcm', params: { skill: 'compter-faces' } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'qcm' || ex.visual?.kind !== 'solid') throw new Error('attendu qcm+solid')
      expect(Number(ex.choices[ex.correctIndex])).toBe(solid(ex.visual.solid).faces)
    }
  })
  it('solide ou figure plane : la bonne réponse colle à ce qui est affiché', () => {
    const spec: GeneratorSpec = { type: 'qcm', params: { skill: 'solide-vs-forme' } }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'qcm') throw new Error('attendu qcm')
      const expected = ex.visual?.kind === 'solid' ? 'un solide' : 'une figure plane'
      expect(ex.choices[ex.correctIndex]).toBe(expected)
    }
  })
})

describe('géométrie — droites', () => {
  it('reconnaître : la bonne réponse correspond à la relation affichée', () => {
    const spec: GeneratorSpec = { type: 'qcm', params: { skill: 'reconnaitre-perpendiculaires' } }
    const map: Record<string, string> = {
      perpendiculaires: 'perpendiculaires',
      paralleles: 'parallèles',
      secantes: 'sécantes',
    }
    for (let seed = 0; seed < 40; seed++) {
      const ex = generateExercise(spec, mulberry32(seed))
      if (ex.type !== 'qcm' || ex.visual?.kind !== 'lines') throw new Error('attendu qcm+lines')
      expect(ex.choices[ex.correctIndex]).toBe(map[ex.visual.relation])
    }
  })
})

describe('géométrie — support', () => {
  it('canGenerate vrai pour les QCM géométrie', () => {
    for (const skill of [
      'reconnaitre-forme',
      'reconnaitre-cercle',
      'reconnaitre-triangle',
      'compter-cotes',
      'reconnaitre-perpendiculaires',
    ]) {
      expect(canGenerate({ type: 'qcm', params: { skill } }), skill).toBe(true)
    }
  })
  it('canGenerate vrai pour les Vrai/Faux géométrie', () => {
    for (const skill of [
      'proprietes-forme',
      'proprietes-carre-rectangle',
      'proprietes-quadrilatere',
      'angle-droit',
      'reconnaitre-angle-droit',
      'rayon-diametre',
      'paralleles',
    ]) {
      expect(canGenerate({ type: 'truefalse', params: { skill } }), skill).toBe(true)
    }
  })
})
