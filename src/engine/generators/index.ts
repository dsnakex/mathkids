// Générateurs d'exercices, pilotés par les GeneratorSpec du contenu (JSON).
//
// Règle d'or (CLAUDE.md / ARCHITECTURE §7) : chaque exercice produit possède
// EXACTEMENT une bonne réponse et, pour les QCM, des distracteurs plausibles
// mais faux. Les générateurs sont des fonctions pures de (spec, rng) — aucune
// dépendance React, entièrement testables.
//
// Phase 3 couvre les quatre types demandés — qcm, input (saisie numérique),
// truefalse (vrai/faux) et gap (complète le trou) — pour les familles
// numériques du CP (nombres et calcul). Les gabarits non encore implémentés
// (visual, dragdrop, problem, géométrie/mesures « contenu ») lèvent
// UnsupportedSpecError ; `canGenerate` permet de les filtrer sans planter.

import type { GeneratorSpec } from '@/content/schema'
import { enLettres } from './frenchNumbers'
import { mulberry32, randInt, pick, sample, buildNumericChoices, type Rng } from './rng'
import type {
  Exercise,
  GapExercise,
  InputExercise,
  OrderExercise,
  QcmExercise,
  TrueFalseExercise,
} from './types'

export type { Exercise } from './types'
export { isAnswerCorrect } from './types'

/** Levée quand aucun générateur ne sait produire le gabarit demandé. */
export class UnsupportedSpecError extends Error {
  constructor(type: string, params: unknown) {
    super(`Gabarit non supporté en Phase 3 : ${type} ${JSON.stringify(params)}`)
    this.name = 'UnsupportedSpecError'
  }
}

type Params = Record<string, unknown>

// --- Lecteurs de paramètres typés (params vient d'un JSON validé, typé unknown).
const num = (p: Params, k: string): number | undefined =>
  typeof p[k] === 'number' ? (p[k] as number) : undefined
const str = (p: Params, k: string): string | undefined =>
  typeof p[k] === 'string' ? (p[k] as string) : undefined
const bool = (p: Params, k: string): boolean | undefined =>
  typeof p[k] === 'boolean' ? (p[k] as boolean) : undefined

const rangeInclusive = (lo: number, hi: number): number[] => {
  const out: number[] = []
  for (let i = lo; i <= hi; i++) out.push(i)
  return out
}

// Inverse dizaines/unités (23 → 32) : distracteur typique de lecture de nombre.
const reverseDigits = (n: number): number | undefined =>
  n < 10 ? undefined : (n % 10) * 10 + Math.floor(n / 10)

// ---------------------------------------------------------------------------
// Arithmétique (+ / −) — partagée par input, qcm et gap.
// ---------------------------------------------------------------------------

interface Equation {
  a: number
  b: number
  c: number // a op b = c
}

// Construit une égalité valide respectant les contraintes du gabarit :
// `max`, `retenue` (retenue/emprunt sur les unités), `kind: dizaines-entieres`
// (opérandes multiples de 10) et `cible` (somme imposée, pour les compléments).
function buildEquation(op: '+' | '-', params: Params, rng: Rng): Equation {
  const cible = num(params, 'cible')
  const retenue = bool(params, 'retenue')
  const step = str(params, 'kind') === 'dizaines-entieres' ? 10 : 1
  const max = cible ?? num(params, 'max') ?? 20

  for (let attempt = 0; attempt < 500; attempt++) {
    if (op === '+') {
      let a: number
      let b: number
      if (cible !== undefined) {
        a = randInt(rng, 0, Math.floor(cible / step)) * step
        b = cible - a
      } else {
        const hi = Math.floor(max / step)
        a = randInt(rng, 0, hi) * step
        b = randInt(rng, 0, hi) * step
      }
      const c = a + b
      if (c > max || b < 0) continue
      if (retenue === true && (a % 10) + (b % 10) < 10) continue
      if (retenue === false && (a % 10) + (b % 10) >= 10) continue
      return { a, b, c }
    } else {
      const hi = Math.floor(max / step)
      const a = randInt(rng, 0, hi) * step
      const b = randInt(rng, 0, Math.floor(a / step)) * step
      if (retenue === true && a % 10 >= b % 10) continue
      if (retenue === false && a % 10 < b % 10) continue
      return { a, b, c: a - b }
    }
  }
  // Repli déterministe (quasi inatteignable : 500 tirages) respectant la
  // contrainte de retenue la plus stricte.
  if (op === '+') return retenue === true ? { a: 6, b: 6, c: 12 } : { a: 0, b: 0, c: 0 }
  return retenue === true ? { a: 12, b: 5, c: 7 } : { a: 0, b: 0, c: 0 }
}

function genArithmeticInput(op: '+' | '-', params: Params, rng: Rng): InputExercise {
  const { a, b, c } = buildEquation(op, params, rng)
  return { type: 'input', prompt: `Combien font ${a} ${op} ${b} ?`, answer: c }
}

function genArithmeticQcm(op: '+' | '-', params: Params, rng: Rng): QcmExercise {
  const { a, b, c } = buildEquation(op, params, rng)
  const wrongOp = op === '+' ? Math.abs(a - b) : a + b
  const pool = [c + 1, c - 1, c + 2, c - 2, c + 10, c - 10, wrongOp, a, b]
  const { choices, correctIndex } = buildNumericChoices(rng, c, pool, 4)
  return {
    type: 'qcm',
    prompt: `Combien font ${a} ${op} ${b} ?`,
    choices: choices.map(String),
    correctIndex,
  }
}

function genArithmeticGap(op: '+' | '-', params: Params, rng: Rng): GapExercise {
  const { a, b, c } = buildEquation(op, params, rng)
  const blankLeft = rng() < 0.5
  const prompt = blankLeft ? `? ${op} ${b} = ${c}` : `${a} ${op} ? = ${c}`
  return { type: 'gap', prompt, answer: blankLeft ? a : b }
}

// ---------------------------------------------------------------------------
// Compléments à une cible (skill: complement) — input, qcm, truefalse.
// ---------------------------------------------------------------------------

function complementParts(params: Params, rng: Rng): { a: number; answer: number; cible: number } {
  const cible = num(params, 'cible') ?? 10
  const maxA = Math.min(num(params, 'max') ?? cible, cible)
  const a = randInt(rng, 0, maxA)
  return { a, answer: cible - a, cible }
}

function genComplementInput(params: Params, rng: Rng): InputExercise {
  const { a, answer, cible } = complementParts(params, rng)
  return { type: 'input', prompt: `${a} + ? = ${cible}`, answer }
}

function genComplementQcm(params: Params, rng: Rng): QcmExercise {
  const { a, answer, cible } = complementParts(params, rng)
  const pool = [a, cible, answer + 1, answer - 1, answer + 2, answer - 2]
  const { choices, correctIndex } = buildNumericChoices(rng, answer, pool, 4)
  return {
    type: 'qcm',
    prompt: `${a} + ? = ${cible}`,
    choices: choices.map(String),
    correctIndex,
  }
}

// Décale une valeur d'un petit écart, en restant ≥ 0 et différente d'elle-même.
function nearbyWrong(rng: Rng, value: number): number {
  const deltas = [1, 2, -1, -2].filter((d) => value + d >= 0 && d !== 0)
  return value + pick(rng, deltas)
}

function genComplementTrueFalse(params: Params, rng: Rng): TrueFalseExercise {
  const { a, answer, cible } = complementParts(params, rng)
  const b = rng() < 0.5 ? answer : nearbyWrong(rng, answer)
  return { type: 'truefalse', prompt: `${a} + ${b} = ${cible}`, answer: a + b === cible }
}

// ---------------------------------------------------------------------------
// Doubles et moitiés (skill: double / moitie / double-moitie).
// ---------------------------------------------------------------------------

function genDouble(kind: 'input' | 'qcm', params: Params, rng: Rng): Exercise {
  const max = num(params, 'max') ?? 10
  const n = randInt(rng, 1, max)
  const answer = 2 * n
  const prompt = `Quel est le double de ${n} ?`
  if (kind === 'input') return { type: 'input', prompt, answer }
  const pool = [n, answer + 1, answer - 1, answer + 2, answer - 2]
  const { choices, correctIndex } = buildNumericChoices(rng, answer, pool, 4)
  return { type: 'qcm', prompt, choices: choices.map(String), correctIndex }
}

function genMoitie(kind: 'input' | 'qcm', params: Params, rng: Rng): Exercise {
  const max = num(params, 'max') ?? 20
  const answer = randInt(rng, 1, Math.floor(max / 2))
  const n = answer * 2 // on ne propose que des nombres pairs
  const prompt = `Quelle est la moitié de ${n} ?`
  if (kind === 'input') return { type: 'input', prompt, answer }
  const pool = [n, answer + 1, answer - 1, answer + 2, answer - 2]
  const { choices, correctIndex } = buildNumericChoices(rng, answer, pool, 4)
  return { type: 'qcm', prompt, choices: choices.map(String), correctIndex }
}

function genDoubleMoitieTrueFalse(params: Params, rng: Rng): TrueFalseExercise {
  const max = num(params, 'max') ?? 20
  if (rng() < 0.5) {
    const n = randInt(rng, 1, Math.floor(max / 2))
    const correct = 2 * n
    const m = rng() < 0.5 ? correct : nearbyWrong(rng, correct)
    return { type: 'truefalse', prompt: `Le double de ${n} est ${m}.`, answer: m === correct }
  }
  const correct = randInt(rng, 1, Math.floor(max / 2))
  const n = correct * 2
  const m = rng() < 0.5 ? correct : nearbyWrong(rng, correct)
  return { type: 'truefalse', prompt: `La moitié de ${n} est ${m}.`, answer: m === correct }
}

// ---------------------------------------------------------------------------
// Nombres : comparaison, lecture/écriture, dizaines/unités.
// ---------------------------------------------------------------------------

function genPlusGrand(params: Params, rng: Rng): QcmExercise {
  const max = num(params, 'max') ?? 20
  const nChoices = Math.min(4, max + 1)
  const nums = sample(rng, rangeInclusive(0, max), nChoices)
  const correct = Math.max(...nums) // unique car les tirages sont distincts
  return {
    type: 'qcm',
    prompt: 'Quel est le plus grand nombre ?',
    choices: nums.map(String),
    correctIndex: nums.indexOf(correct),
  }
}

function genComparer(params: Params, rng: Rng): TrueFalseExercise {
  const max = num(params, 'max') ?? 20
  const x = randInt(rng, 0, max)
  let y = randInt(rng, 0, max)
  if (x === y) y = x === max ? Math.max(0, x - 1) : x + 1 // garde x ≠ y
  return { type: 'truefalse', prompt: `${x} est plus grand que ${y}.`, answer: x > y }
}

function genLireNombre(params: Params, rng: Rng): QcmExercise {
  const max = num(params, 'max') ?? 20
  const n = randInt(rng, 0, max)
  const pool = [reverseDigits(n), n + 1, n - 1, n + 10, n - 10, n % 10, Math.floor(n / 10)].filter(
    (v): v is number => v !== undefined,
  )
  const { choices, correctIndex } = buildNumericChoices(rng, n, pool, 4)
  return {
    type: 'qcm',
    prompt: `Quel nombre s'écrit « ${enLettres(n)} » ?`,
    choices: choices.map(String),
    correctIndex,
  }
}

function genEcrireNombre(params: Params, rng: Rng): InputExercise {
  const max = num(params, 'max') ?? 20
  const n = randInt(rng, 0, max)
  return { type: 'input', prompt: `Écris en chiffres : « ${enLettres(n)} »`, answer: n }
}

function genRecomposer(params: Params, rng: Rng): InputExercise {
  const max = num(params, 'max') ?? 99
  const t = randInt(rng, 1, Math.floor(max / 10))
  const u = randInt(rng, 0, 9)
  const n = t * 10 + u
  return {
    type: 'input',
    prompt: `Quel nombre vaut ${t} dizaine(s) et ${u} unité(s) ?`,
    answer: n,
  }
}

function genDizainesUnites(params: Params, rng: Rng): QcmExercise {
  const max = num(params, 'max') ?? 59
  const n = randInt(rng, 10, max)
  const correct = Math.floor(n / 10)
  const pool = [n % 10, n, correct + 1, correct - 1, correct + 2]
  const { choices, correctIndex } = buildNumericChoices(rng, correct, pool, 4)
  return {
    type: 'qcm',
    prompt: `Combien de dizaines dans ${n} ?`,
    choices: choices.map(String),
    correctIndex,
  }
}

function genDecomposition(params: Params, rng: Rng): GapExercise {
  const max = num(params, 'max') ?? 99
  const t = randInt(rng, 1, Math.floor(max / 10))
  const u = randInt(rng, 1, 9) // unité non nulle pour un trou intéressant
  const n = t * 10 + u
  return { type: 'gap', prompt: `${n} = ${t * 10} + ?`, answer: u }
}

// ---------------------------------------------------------------------------
// Manipulations visuelles (type visual) — QCM assorti d'un indice visuel.
// ---------------------------------------------------------------------------

function genCount(params: Params, rng: Rng): QcmExercise {
  const max = num(params, 'max') ?? 10
  const objects = randInt(rng, 1, max)
  const pool = [objects + 1, objects - 1, objects + 2, objects - 2, max]
  const { choices, correctIndex } = buildNumericChoices(rng, objects, pool, 4)
  return {
    type: 'qcm',
    prompt: 'Combien vois-tu de sushis ?',
    choices: choices.map(String),
    correctIndex,
    visual: { kind: 'count', objects },
  }
}

function genNumberline(params: Params, rng: Rng): QcmExercise {
  const max = num(params, 'max') ?? 20
  const step = num(params, 'pas') ?? 1
  const marker = randInt(rng, 0, Math.floor(max / step)) * step
  const pool = [marker + step, marker - step, marker + 2 * step, marker - 2 * step, marker + 1]
  const { choices, correctIndex } = buildNumericChoices(rng, marker, pool, 4)
  return {
    type: 'qcm',
    prompt: 'Quel nombre montre la flèche ?',
    choices: choices.map(String),
    correctIndex,
    visual: { kind: 'numberline', max, step, marker },
  }
}

function genClock(params: Params, rng: Rng): QcmExercise {
  void params // seule l'heure entière est gérée au CP
  const hour = randInt(rng, 1, 12)
  const distractors = sample(
    rng,
    rangeInclusive(1, 12).filter((h) => h !== hour),
    3,
  )
  const nums = shuffleValid([hour, ...distractors], rng)
  return {
    type: 'qcm',
    prompt: 'Quelle heure est-il ?',
    choices: nums.map(String),
    correctIndex: nums.indexOf(hour),
    visual: { kind: 'clock', hour },
  }
}

// Petit mélange dédié (les heures ne doivent pas passer par les valeurs de repli).
function shuffleValid(values: number[], rng: Rng): number[] {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randInt(rng, 0, i)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function genVisual(params: Params, rng: Rng): Exercise {
  switch (str(params, 'kind')) {
    case 'compter':
      return genCount(params, rng)
    case 'lire-graduation':
      return genNumberline(params, rng)
    case 'lire-horloge':
      return genClock(params, rng)
  }
  throw new UnsupportedSpecError('visual', params)
}

// ---------------------------------------------------------------------------
// Glisser-déposer (type dragdrop) — ranger des nombres dans l'ordre croissant.
// ---------------------------------------------------------------------------

function genOrder(params: Params, rng: Rng): OrderExercise {
  const max = num(params, 'max') ?? 20
  const count = Math.min(4, max + 1)
  const values = sample(rng, rangeInclusive(0, max), count)
  return {
    type: 'order',
    prompt: 'Range du plus petit au plus grand.',
    values,
    answer: [...values].sort((a, b) => a - b),
  }
}

function genDragdrop(params: Params, rng: Rng): Exercise {
  const kind = str(params, 'kind')
  if (kind === 'ranger' || kind === 'ranger-croissant') return genOrder(params, rng)
  throw new UnsupportedSpecError('dragdrop', params)
}

// ---------------------------------------------------------------------------
// Dispatch par type puis par famille (op / skill).
// ---------------------------------------------------------------------------

function genInput(params: Params, rng: Rng): Exercise {
  const op = str(params, 'op')
  if (op === '+' || op === '-') return genArithmeticInput(op, params, rng)
  switch (str(params, 'skill')) {
    case 'complement':
      return genComplementInput(params, rng)
    case 'double':
      return genDouble('input', params, rng)
    case 'moitie':
      return genMoitie('input', params, rng)
    case 'ecrire-nombre':
      return genEcrireNombre(params, rng)
    case 'recomposer':
      return genRecomposer(params, rng)
  }
  throw new UnsupportedSpecError('input', params)
}

function genQcm(params: Params, rng: Rng): Exercise {
  const op = str(params, 'op')
  if (op === '+' || op === '-') return genArithmeticQcm(op, params, rng)
  switch (str(params, 'skill')) {
    case 'plus-grand':
      return genPlusGrand(params, rng)
    case 'complement':
      return genComplementQcm(params, rng)
    case 'double':
      return genDouble('qcm', params, rng)
    case 'moitie':
      return genMoitie('qcm', params, rng)
    case 'lire-nombre':
      return genLireNombre(params, rng)
    case 'dizaines-unites':
      return genDizainesUnites(params, rng)
  }
  throw new UnsupportedSpecError('qcm', params)
}

function genGap(params: Params, rng: Rng): Exercise {
  const op = str(params, 'op')
  if (op === '+' || op === '-') return genArithmeticGap(op, params, rng)
  if (str(params, 'skill') === 'decomposition') return genDecomposition(params, rng)
  throw new UnsupportedSpecError('gap', params)
}

function genTrueFalse(params: Params, rng: Rng): Exercise {
  switch (str(params, 'skill')) {
    case 'comparer':
      return genComparer(params, rng)
    case 'complement':
      return genComplementTrueFalse(params, rng)
    case 'double-moitie':
      return genDoubleMoitieTrueFalse(params, rng)
  }
  throw new UnsupportedSpecError('truefalse', params)
}

/** Produit un exercice à partir d'un gabarit et d'une source d'aléa injectée. */
export function generateExercise(spec: GeneratorSpec, rng: Rng): Exercise {
  switch (spec.type) {
    case 'input':
      return genInput(spec.params, rng)
    case 'qcm':
      return genQcm(spec.params, rng)
    case 'gap':
      return genGap(spec.params, rng)
    case 'truefalse':
      return genTrueFalse(spec.params, rng)
    case 'visual':
      return genVisual(spec.params, rng)
    case 'dragdrop':
      return genDragdrop(spec.params, rng)
    default:
      throw new UnsupportedSpecError(spec.type, spec.params)
  }
}

/** Vrai si un générateur sait produire ce gabarit (sinon il faut le filtrer). */
export function canGenerate(spec: GeneratorSpec): boolean {
  try {
    generateExercise(spec, mulberry32(0))
    return true
  } catch (err) {
    if (err instanceof UnsupportedSpecError) return false
    throw err
  }
}
