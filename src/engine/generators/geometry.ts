// Générateurs de géométrie plane : reconnaître une figure, compter ses côtés,
// juger ses propriétés (angle droit), et reconnaître des droites
// perpendiculaires / parallèles. Les exercices s'appuient sur un indice visuel
// (figure ou droites) rendu en SVG.

import { randInt, pick, shuffle, buildNumericChoices, type Rng } from './rng'
import type { QcmExercise, TrueFalseExercise } from './types'

export interface Shape2D {
  id: string
  name: string // avec article : « un carré »
  sides: number
  rightAngle: boolean // possède au moins un angle droit
}

export const SHAPES_2D: Shape2D[] = [
  { id: 'carre', name: 'un carré', sides: 4, rightAngle: true },
  { id: 'rectangle', name: 'un rectangle', sides: 4, rightAngle: true },
  { id: 'triangle', name: 'un triangle', sides: 3, rightAngle: false },
  { id: 'triangle-rectangle', name: 'un triangle rectangle', sides: 3, rightAngle: true },
  { id: 'cercle', name: 'un cercle', sides: 0, rightAngle: false },
]

type Params = Record<string, unknown>
const strList = (p: Params, k: string): string[] | undefined => {
  const v = p[k]
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : undefined
}

// Choix de chaînes : correct + (n-1) distracteurs distincts, mélangés.
function stringChoices(rng: Rng, correct: string, others: string[], n: number) {
  const distractors = shuffle(
    rng,
    others.filter((o) => o !== correct),
  ).slice(0, n - 1)
  const choices = shuffle(rng, [correct, ...distractors])
  return { choices, correctIndex: choices.indexOf(correct) }
}

// Sélection des figures autorisées (paramétrable par le contenu).
function shapePool(params: Params): Shape2D[] {
  const ids = strList(params, 'shapes')
  const pool = ids ? SHAPES_2D.filter((s) => ids.includes(s.id)) : SHAPES_2D
  return pool.length >= 2 ? pool : SHAPES_2D
}

/** Reconnaître une figure : on l'affiche, l'enfant choisit son nom. */
export function genReconnaitreForme(params: Params, rng: Rng): QcmExercise {
  const pool = shapePool(params)
  const target = pick(rng, pool)
  const { choices, correctIndex } = stringChoices(
    rng,
    target.name,
    SHAPES_2D.map((s) => s.name),
    Math.min(4, SHAPES_2D.length),
  )
  return {
    type: 'qcm',
    prompt: 'Quelle est cette figure ?',
    choices,
    correctIndex,
    visual: { kind: 'shape', shape: target.id },
  }
}

/** Compter les côtés d'une figure affichée. */
export function genCompterCotes(params: Params, rng: Rng): QcmExercise {
  void params
  const target = pick(
    rng,
    SHAPES_2D.filter((s) => s.sides > 0),
  )
  const { choices, correctIndex } = buildNumericChoices(
    rng,
    target.sides,
    [target.sides + 1, target.sides - 1, target.sides + 2, 0],
    4,
  )
  return {
    type: 'qcm',
    prompt: 'Combien de côtés a cette figure ?',
    choices: choices.map(String),
    correctIndex,
    visual: { kind: 'shape', shape: target.id },
  }
}

/** Vrai/Faux sur les propriétés d'une figure (nombre de côtés). */
export function genProprietesForme(params: Params, rng: Rng): TrueFalseExercise {
  const target = pick(rng, shapePool(params))
  const claimed = rng() < 0.5 ? target.sides : target.sides + pick(rng, [1, -1, 2])
  return {
    type: 'truefalse',
    prompt: `Cette figure a ${claimed} côtés.`,
    answer: claimed === target.sides,
    visual: { kind: 'shape', shape: target.id },
  }
}

/** Vrai/Faux : la figure affichée possède-t-elle un angle droit ? */
export function genAngleDroit(params: Params, rng: Rng): TrueFalseExercise {
  const target = pick(rng, shapePool(params))
  return {
    type: 'truefalse',
    prompt: 'Cette figure a un angle droit.',
    answer: target.rightAngle,
    visual: { kind: 'shape', shape: target.id },
  }
}

/** Vrai/Faux sur le cercle : rayon et diamètre. */
export function genRayonDiametre(_params: Params, rng: Rng): TrueFalseExercise {
  const rayon = randInt(rng, 2, 9)
  const claimed = rng() < 0.5 ? rayon * 2 : rayon * 2 + pick(rng, [1, -1, 2])
  return {
    type: 'truefalse',
    prompt: `Si le rayon mesure ${rayon} cm, alors le diamètre mesure ${claimed} cm.`,
    answer: claimed === rayon * 2,
  }
}

// --- Droites : perpendiculaires / parallèles ---------------------------------

type Relation = 'perpendiculaires' | 'paralleles' | 'secantes'
const RELATION_NAME: Record<Relation, string> = {
  perpendiculaires: 'perpendiculaires',
  paralleles: 'parallèles',
  secantes: 'sécantes',
}

/** Reconnaître la relation entre deux droites affichées (QCM). */
export function genReconnaitreDroites(_params: Params, rng: Rng): QcmExercise {
  const relation = pick<Relation>(rng, ['perpendiculaires', 'paralleles', 'secantes'])
  const { choices, correctIndex } = stringChoices(
    rng,
    RELATION_NAME[relation],
    Object.values(RELATION_NAME),
    3,
  )
  return {
    type: 'qcm',
    prompt: 'Comment sont ces deux droites ?',
    choices,
    correctIndex,
    visual: { kind: 'lines', relation },
  }
}

/** Vrai/Faux : ces deux droites sont-elles parallèles ? */
export function genParalleles(_params: Params, rng: Rng): TrueFalseExercise {
  const relation = pick<Relation>(rng, ['perpendiculaires', 'paralleles', 'secantes'])
  return {
    type: 'truefalse',
    prompt: 'Ces deux droites sont parallèles.',
    answer: relation === 'paralleles',
    visual: { kind: 'lines', relation },
  }
}
