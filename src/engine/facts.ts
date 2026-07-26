// Suivi « fait par fait » du calcul mental (chantier G). Un FAIT est un petit
// calcul atomique (ex. 7 × 8). On mémorise, PAR PROFIL, une mini-boîte de Leitner
// AU NIVEAU DU FAIT (pas de la notion) : un fait raté ou lent revient plus
// souvent, y compris lors des sessions suivantes. Module pur (sans React ni DB) :
// l'aléa est injecté, la persistance vit dans src/db.

import { buildNumericChoices, type Rng } from './generators/rng'
import type { QcmExercise } from './generators/types'
import type { LevelId } from '@/content/schema'

export type FactOp = '×' | '÷' | '+' | '-'

/** Un fait de calcul mental : `a op b` (ex. { op: '×', a: 7, b: 8 }). */
export interface Fact {
  op: FactOp
  a: number
  b: number
}

/** Boîte maximale (fait bien maîtrisé). Boîte 0 = neuf ou raté (prioritaire). */
export const FACT_MAX_BOX = 4

/** État d'un fait pour un profil (mini-Leitner + petit historique). */
export interface FactState {
  box: number // 0..FACT_MAX_BOX (plus bas = plus prioritaire)
  correct: number // nombre de bonnes réponses cumulées
  wrong: number // nombre d'erreurs cumulées
}

export function initialFactState(): FactState {
  return { box: 0, correct: 0, wrong: 0 }
}

// Les opérations commutatives partagent une identité (7 × 8 ≡ 8 × 7).
const COMMUTATIVE: readonly FactOp[] = ['×', '+']

/** Identité STABLE d'un fait (canonicalise les commutatifs) : clé de stockage. */
export function factKey(fact: Fact): string {
  const [x, y] = COMMUTATIVE.includes(fact.op)
    ? [Math.min(fact.a, fact.b), Math.max(fact.a, fact.b)]
    : [fact.a, fact.b]
  return `${fact.op}:${x}:${y}`
}

/** Résultat correct d'un fait. */
export function factAnswer(fact: Fact): number {
  switch (fact.op) {
    case '×':
      return fact.a * fact.b
    case '÷':
      return fact.a / fact.b
    case '+':
      return fact.a + fact.b
    case '-':
      return fact.a - fact.b
  }
}

/**
 * Met à jour l'état d'un fait après une réponse :
 *  • bonne réponse → boîte suivante (plafonnée) ;
 *  • ratée → retour boîte 0 (le fait remonte en priorité) ;
 *  • bonne mais LENTE → reste dans sa boîte (ni progrès ni sanction).
 * Jamais de pénalité visible : on ne fait que réordonner les révisions.
 */
export function applyFactResult(
  state: FactState | undefined,
  correct: boolean,
  slow = false,
): FactState {
  const s = state ?? initialFactState()
  if (!correct) return { box: 0, correct: s.correct, wrong: s.wrong + 1 }
  if (slow) return { box: s.box, correct: s.correct + 1, wrong: s.wrong }
  return { box: Math.min(s.box + 1, FACT_MAX_BOX), correct: s.correct + 1, wrong: s.wrong }
}

const boxOf = (states: Record<string, FactState>, key: string): number => states[key]?.box ?? 0

/**
 * Faits triés par priorité de révision : les plus faibles d'abord (boîte basse),
 * puis les plus souvent ratés. Ordre stable (tableau « mes tables », tests).
 */
export function factsByPriority(facts: Fact[], states: Record<string, FactState>): Fact[] {
  return [...facts].sort((a, b) => {
    const ka = factKey(a)
    const kb = factKey(b)
    const boxDiff = boxOf(states, ka) - boxOf(states, kb)
    if (boxDiff !== 0) return boxDiff
    return (states[kb]?.wrong ?? 0) - (states[ka]?.wrong ?? 0)
  })
}

/**
 * Choisit le prochain fait à proposer : tirage PONDÉRÉ favorisant les faits
 * faibles (poids = FACT_MAX_BOX + 1 − boîte). Les faits ratés reviennent donc
 * plus souvent, sans jamais exclure les autres.
 */
export function nextFact(facts: Fact[], states: Record<string, FactState>, rng: Rng): Fact {
  if (facts.length === 0) throw new Error('nextFact : aucun fait fourni')
  const weights = facts.map((f) => FACT_MAX_BOX + 1 - boxOf(states, factKey(f)))
  const total = weights.reduce((sum, w) => sum + w, 0)
  let r = rng() * total
  for (let i = 0; i < facts.length; i++) {
    r -= weights[i]
    if (r < 0) return facts[i]
  }
  return facts[facts.length - 1]
}

/** Une question QCM ciblée sur un fait : exactement UNE bonne réponse + distracteurs. */
export function factQuestion(fact: Fact, rng: Rng): QcmExercise {
  const answer = factAnswer(fact)
  const { a, b, op } = fact
  // Distracteurs plausibles : voisins de table et petits écarts (jamais la bonne réponse).
  const pool =
    op === '×' || op === '÷'
      ? [answer + a, answer - a, answer + b, answer - b, answer + 1, answer - 1, answer + 2, answer - 2]
      : [answer + 1, answer - 1, answer + 2, answer - 2, answer + 10, answer - 10]
  const { choices, correctIndex } = buildNumericChoices(rng, answer, pool, 4)
  return {
    type: 'qcm',
    prompt: `Combien font ${a} ${op} ${b} ?`,
    choices: choices.map(String),
    correctIndex,
  }
}

// --- Tables de multiplication (la « vedette » du chantier) --------------------

/** Tables de multiplication proposées à l'entraînement selon le niveau. */
export function tablesForLevel(level: LevelId): number[] {
  switch (level) {
    case 'ce1':
      return [2, 3, 4, 5]
    case 'ce2':
    case 'cm1':
    case 'cm2':
      return [2, 3, 4, 5, 6, 7, 8, 9]
    default:
      return [] // CP : pas encore de tables
  }
}

/** Tous les faits d'une table de multiplication (× 1 à × bmax). */
export function multiplicationFacts(table: number, bmax = 10): Fact[] {
  return Array.from({ length: bmax }, (_, i) => ({ op: '×' as const, a: table, b: i + 1 }))
}

/** Statut d'une table pour le tableau « mes tables ». */
export type TableStatus = 'new' | 'learning' | 'mastered'

/** Boîte à partir de laquelle un fait est considéré « su ». */
export const FACT_MASTERED_BOX = 2

/**
 * Statut d'une table : « mastered » si tous ses faits sont bien avancés,
 * « new » si aucun n'a jamais été travaillé, « learning » sinon (à retravailler).
 */
export function tableStatus(
  table: number,
  states: Record<string, FactState>,
  bmax = 10,
): TableStatus {
  const facts = multiplicationFacts(table, bmax)
  const touched = facts.some((f) => factKey(f) in states)
  if (!touched) return 'new'
  return facts.every((f) => boxOf(states, factKey(f)) >= FACT_MASTERED_BOX) ? 'mastered' : 'learning'
}
