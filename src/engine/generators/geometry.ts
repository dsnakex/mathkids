// Générateurs de géométrie plane : reconnaître une figure, compter ses côtés,
// juger ses propriétés (angle droit), et reconnaître des droites
// perpendiculaires / parallèles. Les exercices s'appuient sur un indice visuel
// (figure ou droites) rendu en SVG.

import { randInt, pick, sample, shuffle, buildNumericChoices, type Rng } from './rng'
import type { Exercise, InputExercise, QcmExercise, SymmetryExercise, TrueFalseExercise } from './types'

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

// --- Symétrie axiale (compléter le miroir) -----------------------------------

/** Compléter une figure pour qu'elle soit symétrique par rapport à l'axe vertical central. */
export function genSymmetry(params: Params, rng: Rng): SymmetryExercise {
  const cols = 6
  const rows = 5
  const half = cols / 2 // colonnes 0..2 (gauche), 3..5 (droite)
  const cellsCount = typeof params.cells === 'number' ? (params.cells as number) : 3

  // Cellules possibles de la moitié gauche.
  const leftCells: number[] = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < half; c++) leftCells.push(r * cols + c)

  const given = sample(rng, leftCells, Math.min(cellsCount, leftCells.length))
  const target = given.map((cell) => {
    const r = Math.floor(cell / cols)
    const c = cell % cols
    return r * cols + (cols - 1 - c) // colonne miroir
  })
  return {
    type: 'symmetry',
    prompt: "Complète la figure pour qu'elle soit symétrique.",
    cols,
    rows,
    given,
    target,
  }
}

// --- Solides -----------------------------------------------------------------

export interface Solid3D {
  id: string
  name: string
  faces: number // faces planes (cube/pavé = 6 ; boule/cylindre : on ne compte pas)
  emoji: string
}

export const SOLIDS_3D: Solid3D[] = [
  { id: 'cube', name: 'un cube', faces: 6, emoji: '🧊' },
  { id: 'pave', name: 'un pavé', faces: 6, emoji: '📦' },
  { id: 'boule', name: 'une boule', faces: 0, emoji: '⚽' },
  { id: 'cylindre', name: 'un cylindre', faces: 0, emoji: '🥫' },
]

/** Reconnaître un solide affiché. */
export function genReconnaitreSolide(_params: Params, rng: Rng): QcmExercise {
  const target = pick(rng, SOLIDS_3D)
  const { choices, correctIndex } = stringChoices(
    rng,
    target.name,
    SOLIDS_3D.map((s) => s.name),
    Math.min(4, SOLIDS_3D.length),
  )
  return {
    type: 'qcm',
    prompt: 'Quel est ce solide ?',
    choices,
    correctIndex,
    visual: { kind: 'solid', solid: target.id },
  }
}

/** Solide ou figure plane ? (on affiche l'un ou l'autre). */
export function genSolideVsForme(_params: Params, rng: Rng): QcmExercise {
  const isSolid = rng() < 0.5
  const visual: QcmExercise['visual'] = isSolid
    ? { kind: 'solid', solid: pick(rng, SOLIDS_3D).id }
    : { kind: 'shape', shape: pick(rng, SHAPES_2D).id }
  const correct = isSolid ? 'un solide' : 'une figure plane'
  const choices = shuffle(rng, ['un solide', 'une figure plane'])
  return {
    type: 'qcm',
    prompt: 'Est-ce un solide ou une figure plane ?',
    choices,
    correctIndex: choices.indexOf(correct),
    visual,
  }
}

/** Vrai/Faux : le cube a 6 faces. */
export function genFacesCube(_params: Params, rng: Rng): TrueFalseExercise {
  const claimed = rng() < 0.5 ? 6 : pick(rng, [4, 5, 8])
  return {
    type: 'truefalse',
    prompt: `Le cube a ${claimed} faces.`,
    answer: claimed === 6,
    visual: { kind: 'solid', solid: 'cube' },
  }
}

/** Compter les faces d'un solide (cube/pavé). */
export function genCompterFaces(_params: Params, rng: Rng): QcmExercise {
  const target = pick(
    rng,
    SOLIDS_3D.filter((s) => s.faces > 0),
  )
  const { choices, correctIndex } = buildNumericChoices(rng, target.faces, [4, 5, 8, 12], 4)
  return {
    type: 'qcm',
    prompt: 'Combien de faces a ce solide ?',
    choices: choices.map(String),
    correctIndex,
    visual: { kind: 'solid', solid: target.id },
  }
}

// --- Longueurs et repérage ---------------------------------------------------

const num = (p: Params, k: string): number | undefined =>
  typeof p[k] === 'number' ? (p[k] as number) : undefined

/** Comparer des traits : lequel est le plus long ? (choix = étiquettes A, B, C). */
export function genComparerLongueur(_params: Params, rng: Rng): QcmExercise {
  const lengths = sample(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 3)
  const labels = ['A', 'B', 'C']
  const longest = labels[lengths.indexOf(Math.max(...lengths))]
  return {
    type: 'qcm',
    prompt: 'Quel trait est le plus long ?',
    choices: labels,
    correctIndex: labels.indexOf(longest),
    visual: { kind: 'bars', lengths },
  }
}

/** Mesurer un trait posé sur une règle graduée (en cm). */
export function genMesurerCm(kind: 'input' | 'qcm', params: Params, rng: Rng): Exercise {
  const max = num(params, 'max') ?? 15
  const cm = randInt(rng, 1, max)
  const prompt = 'Combien mesure ce trait ? (en cm)'
  const visual = { kind: 'ruler' as const, cm, max }
  if (kind === 'input') return { type: 'input', prompt, answer: cm } as InputExercise
  const { choices, correctIndex } = buildNumericChoices(rng, cm, [cm + 1, cm - 1, cm + 2, cm - 2], 4)
  return { type: 'qcm', prompt, choices: choices.map(String), correctIndex, visual }
}

/** Convertir mètres ↔ centimètres. */
export function genConvertirMCm(kind: 'input' | 'qcm', _params: Params, rng: Rng): Exercise {
  const meters = randInt(rng, 1, 9)
  const prompt = `${meters} m = ? cm`
  const answer = meters * 100
  if (kind === 'input') return { type: 'input', prompt, answer } as InputExercise
  const { choices, correctIndex } = buildNumericChoices(
    rng,
    answer,
    [meters * 10, answer + 100, answer - 100, meters],
    4,
  )
  return { type: 'qcm', prompt, choices: choices.map(String), correctIndex }
}

/** Repérage spatial : où est l'objet par rapport au repère ? */
const POSITION_LABEL: Record<'gauche' | 'droite' | 'dessus' | 'dessous', string> = {
  gauche: 'à gauche',
  droite: 'à droite',
  dessus: 'au-dessus',
  dessous: 'en-dessous',
}
export function genPositions(_params: Params, rng: Rng): QcmExercise {
  const where = pick(rng, ['gauche', 'droite', 'dessus', 'dessous'] as const)
  const correct = POSITION_LABEL[where]
  const choices = shuffle(rng, Object.values(POSITION_LABEL))
  return {
    type: 'qcm',
    prompt: 'Où est le poisson par rapport à la boîte ?',
    choices,
    correctIndex: choices.indexOf(correct),
    visual: { kind: 'position', where },
  }
}

/** Quadrillage : repérer la case marquée (colonne lettre + ligne numéro). */
export function genRepererCase(params: Params, rng: Rng): QcmExercise {
  const cols = num(params, 'cols') ?? 4
  const rows = num(params, 'rows') ?? 4
  const letters = 'ABCDEF'
  const col = randInt(rng, 0, cols - 1)
  const row = randInt(rng, 0, rows - 1)
  const label = (c: number, r: number) => `${letters[c]}${r + 1}`
  const correct = label(col, row)

  const others = new Set<string>()
  while (others.size < 3) {
    const c = randInt(rng, 0, cols - 1)
    const r = randInt(rng, 0, rows - 1)
    if (label(c, r) !== correct) others.add(label(c, r))
  }
  const choices = shuffle(rng, [correct, ...others])
  return {
    type: 'qcm',
    prompt: 'Dans quelle case est le poisson ?',
    choices,
    correctIndex: choices.indexOf(correct),
    visual: { kind: 'grid', cols, rows, col, row },
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
