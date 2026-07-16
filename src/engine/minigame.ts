// Mini-jeu de calcul mental (SPECIFICATIONS §7) : une « course contre la montre
// douce ». Deux modes : ZEN (par défaut, sans chrono — obligatoire au CP-CE1)
// et CHRONO (optionnel, dès le CE2 : une minute, jauge discrète, jamais de
// pénalité). Le moteur ne gère PAS le temps (UI) : il fournit des questions
// QCM rapides tirées de la banque par niveau (src/content/minigame.json).

import { minigameSpecsFor } from '@/content/minigame'
import type { GeneratorSpec, LevelId } from '@/content/schema'
import { canGenerate, generateExercise } from './generators'
import type { QcmExercise } from './generators/types'
import { pick, type Rng } from './generators/rng'

/** Nombre de questions du mode zen. */
export const MINIGAME_ZEN_QUESTIONS = 10
/** Durée du mode chrono (course douce), en secondes. */
export const MINIGAME_CHRONO_SECONDS = 60
/** Niveaux où le chrono peut être PROPOSÉ (jamais au CP-CE1, règle produit). */
export const MINIGAME_CHRONO_LEVELS: readonly LevelId[] = ['ce2', 'cm1', 'cm2']

/** Gabarits jouables du niveau (filtrés par canGenerate). */
export function minigameSpecs(level: LevelId): GeneratorSpec[] {
  return minigameSpecsFor(level).filter(canGenerate)
}

/** Vrai si le mode chrono peut être proposé à ce niveau. */
export function chronoAllowed(level: LevelId): boolean {
  return MINIGAME_CHRONO_LEVELS.includes(level)
}

/**
 * Tire la prochaine question (toujours un QCM : on répond d'un tap).
 * Lève si le niveau n'a aucun gabarit jouable — la banque garantit l'inverse.
 */
export function nextMinigameQuestion(level: LevelId, rng: Rng): QcmExercise {
  const specs = minigameSpecs(level)
  if (specs.length === 0) throw new Error(`Aucun gabarit de calcul mental pour « ${level} »`)
  for (let attempt = 0; attempt < 10; attempt++) {
    const ex = generateExercise(pick(rng, specs), rng)
    if (ex.type === 'qcm') return ex
  }
  throw new Error(`La banque de calcul mental de « ${level} » ne produit pas de QCM`)
}
