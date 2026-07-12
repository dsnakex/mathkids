// Révision espacée à la Leitner (SPECIFICATIONS §5).
//
// Quand une notion est acquise, elle revient en rappel à J+2, puis J+7, puis
// J+30. Une bonne réponse en rappel fait avancer d'une boîte (intervalle plus
// long) ; une erreur renvoie à la première boîte (et la maîtrise redescend via
// le moteur adaptatif, géré séparément).
//
// Fonctions pures : l'instant courant `now` (ms epoch) est TOUJOURS passé en
// paramètre — jamais `Date.now()` en interne — pour rester déterministe et
// testable, et pour que le moteur reste sans effet de bord.

/** Intervalles des boîtes de Leitner, en jours. */
export const REVIEW_INTERVALS_DAYS = [2, 7, 30] as const

export const DAY_MS = 86_400_000

/** État de rappel d'une notion acquise. */
export interface ReviewState {
  box: number // index dans REVIEW_INTERVALS_DAYS (0..2)
  lastReviewed: number // dernier passage en rappel (ms epoch)
  nextReview: number // prochaine échéance (ms epoch)
}

const LAST_BOX = REVIEW_INTERVALS_DAYS.length - 1

function schedule(box: number, now: number): ReviewState {
  return {
    box,
    lastReviewed: now,
    nextReview: now + REVIEW_INTERVALS_DAYS[box] * DAY_MS,
  }
}

/** Planifie le tout premier rappel (première boîte, J+2) au moment de l'acquisition. */
export function scheduleFirstReview(now: number): ReviewState {
  return schedule(0, now)
}

/**
 * Applique le résultat d'un rappel : bonne réponse → boîte suivante (plafonnée),
 * erreur → retour à la première boîte.
 */
export function applyReview(state: ReviewState, correct: boolean, now: number): ReviewState {
  const box = correct ? Math.min(state.box + 1, LAST_BOX) : 0
  return schedule(box, now)
}

/** Vrai si la notion est due (échéance atteinte). */
export function isDue(state: ReviewState, now: number): boolean {
  return now >= state.nextReview
}

/** Ids des notions dues à l'instant `now`, parmi une table id → état de rappel. */
export function dueNotions(reviews: Record<string, ReviewState>, now: number): string[] {
  return Object.entries(reviews)
    .filter(([, state]) => isDue(state, now))
    .map(([notionId]) => notionId)
}
