// Chargement / sauvegarde de la progression d'un profil, sous la forme
// consommée par le moteur (LearnerProgress : maîtrise + rappels par notion).

import { initialMastery, type MasteryState } from '@/engine/adaptive'
import type { LearnerProgress } from '@/engine/session'
import type { ReviewState } from '@/engine/spaced'
import { db, type ProgressRecord } from './db'

/** Reconstruit la progression du moteur depuis les enregistrements stockés. */
export async function loadLearnerProgress(profileId: string): Promise<LearnerProgress> {
  const records = await db.progress.where('profileId').equals(profileId).toArray()
  const mastery: Record<string, MasteryState> = {}
  const reviews: Record<string, ReviewState> = {}
  for (const r of records) {
    mastery[r.notionId] = r.mastery
    if (r.review) reviews[r.notionId] = r.review
  }
  return { mastery, reviews }
}

/** Écrit la progression du moteur (une ligne par notion touchée). */
export async function saveLearnerProgress(
  profileId: string,
  progress: LearnerProgress,
  now: number = Date.now(),
): Promise<void> {
  const notionIds = new Set([
    ...Object.keys(progress.mastery),
    ...Object.keys(progress.reviews),
  ])
  const records: ProgressRecord[] = [...notionIds].map((notionId) => ({
    profileId,
    notionId,
    mastery: progress.mastery[notionId] ?? initialMastery(),
    review: progress.reviews[notionId],
    updatedAt: now,
  }))
  await db.progress.bulkPut(records)
}
