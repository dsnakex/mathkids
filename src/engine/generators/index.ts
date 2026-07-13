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

import { LEVEL_IDS, type GeneratorSpec, type LevelId } from '@/content/schema'
import { enLettres } from './frenchNumbers'
import { generateProblem, pickProblem } from './problem'
import { genClockRead, genClockSet } from './clock'
import { genMoneyCount, genMoneyConvert, genMoneyChange, genMoneyCompose } from './money'
import { mulberry32, randInt, pick, sample, shuffle, buildNumericChoices, type Rng } from './rng'
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

// `k` entiers distincts dans [lo, hi] sans matérialiser toute la plage (utile
// pour les grands nombres : jusqu'au million au CM1).
function distinctInts(rng: Rng, lo: number, hi: number, k: number): number[] {
  const span = hi - lo + 1
  if (span <= 1000) return sample(rng, rangeInclusive(lo, hi), Math.min(k, span))
  const seen = new Set<number>()
  while (seen.size < Math.min(k, span)) seen.add(randInt(rng, lo, hi))
  return [...seen]
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
// Multiplication (op ×, tables) et quart (fraction-partage) — ajouts CE1.
// ---------------------------------------------------------------------------

function numArray(p: Params, k: string): number[] | undefined {
  const v = p[k]
  return Array.isArray(v) ? v.filter((x): x is number => typeof x === 'number') : undefined
}

function buildProduct(params: Params, rng: Rng): Equation {
  const table = num(params, 'table')
  const tables = numArray(params, 'tables')
  const bmax = num(params, 'bmax') ?? 10
  const a =
    table !== undefined ? table : tables && tables.length > 0 ? pick(rng, tables) : randInt(rng, 2, 9)
  const b = randInt(rng, 1, bmax)
  return { a, b, c: a * b }
}

function genMultInput(params: Params, rng: Rng): InputExercise {
  const { a, b, c } = buildProduct(params, rng)
  return { type: 'input', prompt: `Combien font ${a} × ${b} ?`, answer: c }
}

function genMultQcm(params: Params, rng: Rng): QcmExercise {
  const { a, b, c } = buildProduct(params, rng)
  const pool = [c + a, c - a, c + b, c - b, (a + 1) * b, a * (b + 1), c + 1, c - 1]
  const { choices, correctIndex } = buildNumericChoices(rng, c, pool, 4)
  return { type: 'qcm', prompt: `Combien font ${a} × ${b} ?`, choices: choices.map(String), correctIndex }
}

function genMultGap(params: Params, rng: Rng): GapExercise {
  const { a, b, c } = buildProduct(params, rng)
  const blankLeft = rng() < 0.5
  const prompt = blankLeft ? `? × ${b} = ${c}` : `${a} × ? = ${c}`
  return { type: 'gap', prompt, answer: blankLeft ? a : b }
}

function genQuart(kind: 'input' | 'qcm', params: Params, rng: Rng): Exercise {
  const max = num(params, 'max') ?? 40
  const quart = randInt(rng, 1, Math.floor(max / 4))
  const n = quart * 4 // seulement des nombres divisibles par 4
  const prompt = `Quel est le quart de ${n} ?`
  if (kind === 'input') return { type: 'input', prompt, answer: quart }
  const pool = [n / 2, quart + 1, quart - 1, quart + 2, n]
  const { choices, correctIndex } = buildNumericChoices(rng, quart, pool, 4)
  return { type: 'qcm', prompt, choices: choices.map(String), correctIndex }
}

// Division exacte (partage) — ajout CE2. On garantit un quotient entier.
function buildQuotient(params: Params, rng: Rng): Equation {
  const divisor = num(params, 'divisor')
  const divisors = numArray(params, 'divisors')
  const bmax = num(params, 'bmax') ?? 10
  const b =
    divisor !== undefined
      ? divisor
      : divisors && divisors.length > 0
        ? pick(rng, divisors)
        : randInt(rng, 2, 9)
  const c = randInt(rng, 1, bmax)
  return { a: b * c, b, c }
}

function genDivInput(params: Params, rng: Rng): InputExercise {
  const { a, b, c } = buildQuotient(params, rng)
  return { type: 'input', prompt: `Combien font ${a} ÷ ${b} ?`, answer: c }
}

function genDivQcm(params: Params, rng: Rng): QcmExercise {
  const { a, b, c } = buildQuotient(params, rng)
  const pool = [c + 1, c - 1, c + 2, c - 2, b, a, c + b]
  const { choices, correctIndex } = buildNumericChoices(rng, c, pool, 4)
  return { type: 'qcm', prompt: `Combien font ${a} ÷ ${b} ?`, choices: choices.map(String), correctIndex }
}

function genDivGap(params: Params, rng: Rng): GapExercise {
  const { a, b, c } = buildQuotient(params, rng)
  const blankLeft = rng() < 0.5
  const prompt = blankLeft ? `? ÷ ${b} = ${c}` : `${a} ÷ ? = ${c}`
  return { type: 'gap', prompt, answer: blankLeft ? a : b }
}

// Fraction générique d'une quantité (num/den de n) — ajout CE2 (1/3, 3/4…).
function genFraction(kind: 'input' | 'qcm', params: Params, rng: Rng): Exercise {
  const numerator = num(params, 'num') ?? 1
  const den = num(params, 'den') ?? 2
  const max = num(params, 'max') ?? 40
  const parts = randInt(rng, 1, Math.floor(max / den))
  const n = parts * den // n divisible par le dénominateur
  const answer = parts * numerator // (n / den) × num
  const prompt = `Combien font ${numerator}/${den} de ${n} ?`
  if (kind === 'input') return { type: 'input', prompt, answer }
  const pool = [n / den, n, answer + 1, answer - 1, answer + numerator]
  const { choices, correctIndex } = buildNumericChoices(rng, answer, pool, 4)
  return { type: 'qcm', prompt, choices: choices.map(String), correctIndex }
}

// ---------------------------------------------------------------------------
// CM1 : décimaux (QCM), pourcentages, égalités à trous, probabilités, multiples.
// ---------------------------------------------------------------------------

// Décimaux manipulés en DIXIÈMES (entiers) pour éviter les erreurs de virgule
// flottante ; affichés avec la virgule française.
const formatDec = (tenths: number): string => `${Math.floor(tenths / 10)},${tenths % 10}`

function genDecimalCompare(params: Params, rng: Rng): QcmExercise {
  const max = num(params, 'max') ?? 10
  const values = sample(rng, rangeInclusive(1, max * 10), 4) // dixièmes distincts
  const correct = Math.max(...values)
  return {
    type: 'qcm',
    prompt: 'Quel nombre décimal est le plus grand ?',
    choices: values.map(formatDec),
    correctIndex: values.indexOf(correct),
  }
}

function genDecimalAdd(params: Params, rng: Rng): QcmExercise {
  const max = num(params, 'max') ?? 10
  const t1 = randInt(rng, 1, max * 10)
  const t2 = randInt(rng, 1, max * 10)
  const sum = t1 + t2
  const pool = [sum + 1, sum - 1, sum + 10, sum - 10, t1, t2]
  const { choices, correctIndex } = buildNumericChoices(rng, sum, pool, 4)
  return {
    type: 'qcm',
    prompt: `Combien font ${formatDec(t1)} + ${formatDec(t2)} ?`,
    choices: choices.map(formatDec),
    correctIndex,
  }
}

function genPourcentage(kind: 'input' | 'qcm', params: Params, rng: Rng): Exercise {
  const pct = num(params, 'pct') ?? 50
  const max = num(params, 'max') ?? 100
  const step = pct === 25 ? 4 : pct === 50 ? 2 : 1 // n divisible → réponse entière
  const n = randInt(rng, 1, Math.floor(max / step)) * step
  const answer = (n * pct) / 100
  const prompt = `Combien font ${pct}% de ${n} ?`
  if (kind === 'input') return { type: 'input', prompt, answer }
  const pool = [n, answer + 1, answer - 1, answer + 2, answer * 2].filter((v) => Number.isInteger(v))
  const { choices, correctIndex } = buildNumericChoices(rng, answer, pool, 4)
  return { type: 'qcm', prompt, choices: choices.map(String), correctIndex }
}

function genEgalite(params: Params, rng: Rng): GapExercise {
  const max = num(params, 'max') ?? 20
  const a = randInt(rng, 1, max)
  const b = randInt(rng, 1, max)
  const sum = a + b
  const d = randInt(rng, 0, sum) // opérande connue à droite
  return { type: 'gap', prompt: `${a} + ${b} = ? + ${d}`, answer: sum - d }
}

const PROBA_LABELS = ['certain', 'possible', 'impossible']

function genProbaVocab(_params: Params, rng: Rng): QcmExercise {
  // Scénarios sur un dé à 6 faces, à réponse connue.
  const scenarios: Array<{ prompt: string; correct: string }> = [
    { prompt: `Avec un dé à 6 faces, obtenir un ${randInt(rng, 1, 6)} :`, correct: 'possible' },
    { prompt: `Avec un dé à 6 faces, obtenir un ${randInt(rng, 7, 9)} :`, correct: 'impossible' },
    { prompt: 'Avec un dé à 6 faces, obtenir un nombre entre 1 et 6 :', correct: 'certain' },
    { prompt: 'Avec un dé à 6 faces, obtenir un nombre plus grand que 6 :', correct: 'impossible' },
  ]
  const scenario = pick(rng, scenarios)
  const choices = shuffle(rng, PROBA_LABELS)
  return {
    type: 'qcm',
    prompt: scenario.prompt,
    choices,
    correctIndex: choices.indexOf(scenario.correct),
  }
}

function genMultiple(params: Params, rng: Rng): TrueFalseExercise {
  const base = num(params, 'base') ?? pick(rng, [2, 3, 4, 5])
  const k = randInt(rng, 1, 10)
  const showTrue = rng() < 0.5
  const n = showTrue ? base * k : base * k + randInt(rng, 1, base - 1)
  return { type: 'truefalse', prompt: `${n} est un multiple de ${base}.`, answer: n % base === 0 }
}

// CM2 : priorités opératoires (× avant +) et quantification de probabilités.
function genPriorite(kind: 'input' | 'qcm', params: Params, rng: Rng): Exercise {
  const max = num(params, 'max') ?? 10
  const a = randInt(rng, 1, max)
  const b = randInt(rng, 2, 9)
  const c = randInt(rng, 2, 9)
  const answer = a + b * c
  const prompt = `Combien font ${a} + ${b} × ${c} ?`
  if (kind === 'input') return { type: 'input', prompt, answer }
  const pool = [(a + b) * c, a + b + c, a * b + c, answer + 1, answer - 1, b * c]
  const { choices, correctIndex } = buildNumericChoices(rng, answer, pool, 4)
  return { type: 'qcm', prompt, choices: choices.map(String), correctIndex }
}

function genProbaCount(_params: Params, rng: Rng): InputExercise {
  const k = randInt(rng, 1, 5)
  return {
    type: 'input',
    prompt: `Avec un dé à 6 faces, combien de faces montrent un nombre plus grand que ${k} ?`,
    answer: 6 - k,
  }
}

// Périmètres, aires et volumes (CE2 → CM2). Arithmétique simple, réponse entière.
const GEOMETRY_SKILLS = new Set([
  'perimetre-carre',
  'perimetre-rectangle',
  'aire-carre',
  'aire-rectangle',
  'aire-triangle',
  'volume-pave',
])

function genGeometry(kind: 'input' | 'qcm', skill: string, params: Params, rng: Rng): Exercise {
  const max = num(params, 'max') ?? 12
  let prompt: string
  let answer: number
  let pool: number[]
  switch (skill) {
    case 'perimetre-carre': {
      const s = randInt(rng, 2, max)
      answer = 4 * s
      prompt = `Quel est le périmètre d'un carré de côté ${s} cm ?`
      pool = [s * s, 2 * s, 3 * s, answer + 1, answer - 1]
      break
    }
    case 'perimetre-rectangle': {
      const l = randInt(rng, 2, max)
      const w = randInt(rng, 1, l)
      answer = 2 * (l + w)
      prompt = `Quel est le périmètre d'un rectangle de ${l} cm sur ${w} cm ?`
      pool = [l * w, l + w, 2 * l + w, answer + 1, answer - 1]
      break
    }
    case 'aire-carre': {
      const s = randInt(rng, 2, max)
      answer = s * s
      prompt = `Quelle est l'aire d'un carré de côté ${s} cm ?`
      pool = [4 * s, 2 * s, answer + 1, answer - 1, answer + s]
      break
    }
    case 'aire-rectangle': {
      const l = randInt(rng, 2, max)
      const w = randInt(rng, 1, l)
      answer = l * w
      prompt = `Quelle est l'aire d'un rectangle de ${l} cm sur ${w} cm ?`
      pool = [2 * (l + w), l + w, answer + 1, answer - 1, answer + w]
      break
    }
    case 'aire-triangle': {
      const b = randInt(rng, 2, max)
      const h = 2 * randInt(rng, 1, Math.max(1, Math.floor(max / 2))) // hauteur paire → aire entière
      answer = (b * h) / 2
      prompt = `Quelle est l'aire d'un triangle de base ${b} cm et de hauteur ${h} cm ?`
      pool = [b * h, b + h, answer + 1, answer - 1, answer + b]
      break
    }
    default: {
      // volume-pave
      const l = randInt(rng, 1, max)
      const w = randInt(rng, 1, max)
      const h = randInt(rng, 1, max)
      answer = l * w * h
      prompt = `Quel est le volume d'un pavé de ${l} × ${w} × ${h} cm ?`
      pool = [l + w + h, l * w, answer + 1, answer - 1, l * h]
    }
  }
  if (kind === 'input') return { type: 'input', prompt, answer }
  const { choices, correctIndex } = buildNumericChoices(rng, answer, pool, 4)
  return { type: 'qcm', prompt, choices: choices.map(String), correctIndex }
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
  const nums = distinctInts(rng, 0, max, nChoices)
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
    prompt: 'Combien vois-tu de boules de riz ?',
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
    visual: { kind: 'clock', hours: hour, minutes: 0 },
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
    case 'lire-horloge': {
      // Heures entières (CP) ; les demies/quarts passent par clock-read/clock-set.
      const precision = str(params, 'precision')
      if (precision === undefined || precision === 'heure') return genClock(params, rng)
      break
    }
    case 'clock-set':
      return genClockSet(params, rng)
    case 'money-compose':
      return genMoneyCompose(params, rng)
  }
  throw new UnsupportedSpecError('visual', params)
}

// ---------------------------------------------------------------------------
// Glisser-déposer (type dragdrop) — ranger des nombres dans l'ordre croissant.
// ---------------------------------------------------------------------------

function genOrder(params: Params, rng: Rng): OrderExercise {
  const max = num(params, 'max') ?? 20
  const count = Math.min(4, max + 1)
  const values = distinctInts(rng, 0, max, count)
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
  if (op === '×') return genMultInput(params, rng)
  if (op === '÷') return genDivInput(params, rng)
  const skill = str(params, 'skill')
  if (skill && GEOMETRY_SKILLS.has(skill)) return genGeometry('input', skill, params, rng)
  switch (skill) {
    case 'complement':
      return genComplementInput(params, rng)
    case 'double':
      return genDouble('input', params, rng)
    case 'moitie':
      return genMoitie('input', params, rng)
    case 'quart':
      return genQuart('input', params, rng)
    case 'fraction':
      return genFraction('input', params, rng)
    case 'money-convert':
      return genMoneyConvert(params, rng)
    case 'money-change':
      return genMoneyChange(params, rng)
    case 'pourcentage':
      return genPourcentage('input', params, rng)
    case 'priorite':
      return genPriorite('input', params, rng)
    case 'proba-compter':
      return genProbaCount(params, rng)
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
  if (op === '×') return genMultQcm(params, rng)
  if (op === '÷') return genDivQcm(params, rng)
  const skill = str(params, 'skill')
  if (skill && GEOMETRY_SKILLS.has(skill)) return genGeometry('qcm', skill, params, rng)
  switch (skill) {
    case 'plus-grand':
      return genPlusGrand(params, rng)
    case 'complement':
      return genComplementQcm(params, rng)
    case 'double':
      return genDouble('qcm', params, rng)
    case 'moitie':
      return genMoitie('qcm', params, rng)
    case 'quart':
      return genQuart('qcm', params, rng)
    case 'fraction':
      return genFraction('qcm', params, rng)
    case 'pourcentage':
      return genPourcentage('qcm', params, rng)
    case 'priorite':
      return genPriorite('qcm', params, rng)
    case 'decimal-compare':
      return genDecimalCompare(params, rng)
    case 'decimal-add':
      return genDecimalAdd(params, rng)
    case 'proba-vocab':
      return genProbaVocab(params, rng)
    case 'money-count':
      return genMoneyCount(params, rng)
    case 'clock-read':
      return genClockRead(params, rng)
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
  if (op === '×') return genMultGap(params, rng)
  if (op === '÷') return genDivGap(params, rng)
  const skill = str(params, 'skill')
  if (skill === 'decomposition') return genDecomposition(params, rng)
  if (skill === 'egalite') return genEgalite(params, rng)
  throw new UnsupportedSpecError('gap', params)
}

function genProblem(params: Params, rng: Rng): Exercise {
  const level = str(params, 'level')
  const structure = str(params, 'structure') ?? ''
  const etapes = num(params, 'etapes') ?? 1
  if (!level || !(LEVEL_IDS as readonly string[]).includes(level)) {
    throw new UnsupportedSpecError('problem', params)
  }
  const problem = pickProblem(level as LevelId, structure, etapes, rng)
  if (!problem) throw new UnsupportedSpecError('problem', params)
  return generateProblem(problem, rng)
}

function genTrueFalse(params: Params, rng: Rng): Exercise {
  switch (str(params, 'skill')) {
    case 'comparer':
      return genComparer(params, rng)
    case 'complement':
      return genComplementTrueFalse(params, rng)
    case 'double-moitie':
      return genDoubleMoitieTrueFalse(params, rng)
    case 'multiple':
      return genMultiple(params, rng)
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
    case 'problem':
      return genProblem(spec.params, rng)
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
