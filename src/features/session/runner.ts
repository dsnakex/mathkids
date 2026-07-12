// Orchestration d'une session, côté logique pure (sans React ni IndexedDB).
//
// Ce module fait le pont entre les événements de la session (l'enfant répond)
// et le moteur (src/engine) : mise à jour de la maîtrise, planification de la
// révision espacée à l'acquisition, progression Leitner pour les rappels.
// Tout est pur → testé unitairement ; la persistance (Dexie) et l'UI branchent
// leurs effets autour.

import { applyAnswer, initialMastery, isNotionAcquired, type AdaptiveResult } from '@/engine/adaptive'
import { applyReview, scheduleFirstReview } from '@/engine/spaced'
import type { LearnerProgress, SessionRole } from '@/engine/session'

export interface AnswerOutcome {
  progress: LearnerProgress
  masteryChange: AdaptiveResult // montée / descente de palier pour le feedback
  acquiredNow: boolean // la notion vient de passer « acquise » à cette réponse
}

/**
 * Enregistre une réponse dans la progression et renvoie la nouvelle
 * progression (immuable) ainsi que les changements utiles au feedback.
 */
export function recordAnswer(
  progress: LearnerProgress,
  notionId: string,
  role: SessionRole,
  correct: boolean,
  now: number,
  targetTier: number,
): AnswerOutcome {
  const prevMastery = progress.mastery[notionId] ?? initialMastery()
  const wasAcquired = isNotionAcquired(prevMastery, targetTier)

  const masteryChange = applyAnswer(prevMastery, correct)
  const newMastery = masteryChange.state
  const nowAcquired = isNotionAcquired(newMastery, targetTier)

  const mastery = { ...progress.mastery, [notionId]: newMastery }
  const reviews = { ...progress.reviews }

  if (role === 'review' && reviews[notionId]) {
    // Rappel : la boîte de Leitner avance (bonne) ou repart à zéro (erreur).
    reviews[notionId] = applyReview(reviews[notionId], correct, now)
  } else if (!wasAcquired && nowAcquired && !reviews[notionId]) {
    // La notion vient d'être acquise : on programme son premier rappel (J+2).
    reviews[notionId] = scheduleFirstReview(now)
  }

  return {
    progress: { mastery, reviews },
    masteryChange,
    acquiredNow: !wasAcquired && nowAcquired,
  }
}

export interface SessionReward {
  stars: number // 1 à 3, jamais 0 (pas de sanction visible)
  coins: number // grains de riz dorés
}

/** Bilan d'une série : étoiles selon la réussite, grains de riz par bonne réponse. */
export function sessionReward(correct: number, total: number): SessionReward {
  const ratio = total > 0 ? correct / total : 0
  const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1
  return { stars, coins: correct * 2 }
}
