// Moteur adaptatif (ARCHITECTURE §4, SPECIFICATIONS §5).
//
// Chaque notion a un état de maîtrise par profil : un palier (1..5) et un score
// (0..100). Montée d'un palier après 4 bonnes réponses consécutives, descente
// après 2 erreurs consécutives (avec proposition de revoir la leçon). Une
// notion est « acquise » quand la maîtrise atteint le seuil au palier cible.
//
// Fonctions pures, sans dépendance UI ni stockage : l'état entre et sort, la
// persistance (IndexedDB) est gérée ailleurs (src/db, Phase 4).

/** État de maîtrise d'une notion pour un profil. */
export interface MasteryState {
  tier: number // palier courant, 1..5
  score: number // score de maîtrise, 0..100
  streak: number // bonnes réponses consécutives au palier courant
  errStreak: number // erreurs consécutives
}

export const MIN_TIER = 1
export const MAX_TIER = 5
/** Gain de maîtrise par bonne réponse. */
export const MASTERY_GAIN = 10
/** Perte de maîtrise par erreur. */
export const MASTERY_PENALTY = 10
/** Bonnes réponses consécutives déclenchant une montée de palier. */
export const PROMOTE_STREAK = 4
/** Erreurs consécutives déclenchant une descente de palier. */
export const DEMOTE_ERRORS = 2
/** Seuil de maîtrise pour considérer une notion acquise. */
export const MASTERY_ACQUIRED = 80

/** État de départ d'une notion jamais travaillée. */
export function initialMastery(): MasteryState {
  return { tier: MIN_TIER, score: 0, streak: 0, errStreak: 0 }
}

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v))

/** Résultat d'une réponse : nouvel état + changements de palier survenus. */
export interface AdaptiveResult {
  state: MasteryState
  leveledUp: boolean
  leveledDown: boolean // implique « proposer la leçon »
}

/**
 * Applique une réponse (correcte ou non) à l'état de maîtrise d'une notion.
 * Pure : renvoie un nouvel état sans muter l'entrée.
 */
export function applyAnswer(prev: MasteryState, correct: boolean): AdaptiveResult {
  if (correct) {
    const streak = prev.streak + 1
    const score = clamp(prev.score + MASTERY_GAIN, 0, 100)
    if (streak >= PROMOTE_STREAK && prev.tier < MAX_TIER) {
      return {
        state: { tier: prev.tier + 1, score, streak: 0, errStreak: 0 },
        leveledUp: true,
        leveledDown: false,
      }
    }
    return {
      state: { tier: prev.tier, score, streak, errStreak: 0 },
      leveledUp: false,
      leveledDown: false,
    }
  }

  const errStreak = prev.errStreak + 1
  const score = clamp(prev.score - MASTERY_PENALTY, 0, 100)
  if (errStreak >= DEMOTE_ERRORS && prev.tier > MIN_TIER) {
    return {
      state: { tier: prev.tier - 1, score, streak: 0, errStreak: 0 },
      leveledUp: false,
      leveledDown: true,
    }
  }
  return {
    state: { tier: prev.tier, score, streak: 0, errStreak },
    leveledUp: false,
    leveledDown: false,
  }
}

/**
 * Une notion est acquise quand sa maîtrise atteint le seuil ET que l'enfant a
 * atteint le palier cible du niveau scolaire.
 */
export function isNotionAcquired(state: MasteryState, targetTier: number): boolean {
  return state.score >= MASTERY_ACQUIRED && state.tier >= targetTier
}
