// Générateurs d'horloge (CE1 demi-heures, CE2 quarts et 5 min).
// Deux sens : lire (QCM en toutes lettres) et régler (placer les aiguilles).

import { randInt, pick, shuffle, type Rng } from './rng'
import { timePhrase, minutesForPalier } from './time'
import type { ClocksetExercise, QcmExercise } from './types'

type Params = Record<string, unknown>
const numParam = (p: Params, k: string): number | undefined =>
  typeof p[k] === 'number' ? (p[k] as number) : undefined

/**
 * Trois distracteurs plausibles et distincts, exploitant les erreurs classiques :
 * heure suivante/précédente, confusion quart/demie, lecture de la grande aiguille
 * comme l'heure. Jamais la bonne réponse.
 */
export function timeDistractors(hours: number, minutes: number, rng: Rng): string[] {
  const correct = timePhrase(hours, minutes)
  const next = (hours % 12) + 1
  const prev = ((hours + 10) % 12) + 1
  const bigNumber = minutes === 0 ? 12 : minutes / 5 // chiffre pointé par la grande aiguille

  const candidates = [
    timePhrase(next, minutes), // confusion « heure suivante »
    timePhrase(prev, minutes),
    timePhrase(next, 30),
    ...[0, 15, 30, 45].filter((q) => q !== minutes).map((q) => timePhrase(hours, q)), // quart/demie
    timePhrase(bigNumber, 0), // aiguilles inversées (grande aiguille lue comme l'heure)
  ]

  const pool: string[] = []
  for (const phrase of shuffle(rng, candidates)) {
    if (phrase !== correct && !pool.includes(phrase)) pool.push(phrase)
    if (pool.length === 3) break
  }
  // Repli déterministe si trop peu de candidats distincts.
  for (let k = 2; pool.length < 3; k++) {
    const phrase = timePhrase(((hours + k - 1) % 12) + 1, minutes)
    if (phrase !== correct && !pool.includes(phrase)) pool.push(phrase)
  }
  return pool
}

/** Lire l'heure : l'horloge affiche (h, m), 4 lectures en toutes lettres. */
export function genClockRead(params: Params, rng: Rng): QcmExercise {
  const palier = numParam(params, 'palier') ?? 2
  const hours = randInt(rng, 1, 12)
  const minutes = pick(rng, minutesForPalier(palier))
  const correct = timePhrase(hours, minutes)
  const choices = shuffle(rng, [correct, ...timeDistractors(hours, minutes, rng)])
  return {
    type: 'qcm',
    prompt: 'Quelle heure est-il ?',
    choices,
    correctIndex: choices.indexOf(correct),
    visual: { kind: 'clock', hours, minutes },
  }
}

/** Régler l'horloge : l'enfant place les aiguilles sur l'heure demandée. */
export function genClockSet(params: Params, rng: Rng): ClocksetExercise {
  const palier = numParam(params, 'palier') ?? 2
  const hours = randInt(rng, 1, 12)
  const minutes = pick(rng, minutesForPalier(palier))
  return {
    type: 'clockset',
    prompt: `Mets l'horloge sur ${timePhrase(hours, minutes)}.`,
    hours,
    minutes,
  }
}
