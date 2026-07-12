// Sauvegarde / restauration de la progression d'un profil au format JSON
// (SPECIFICATIONS §5 : export/import manuel, transfert entre appareils). Le
// schéma valide un fichier importé avant de l'écrire en base.

import { z } from 'zod'
import type { ProfileRecord, ProgressRecord } from '@/db/db'

export const BACKUP_VERSION = 1

const masterySchema = z.object({
  tier: z.number(),
  score: z.number(),
  streak: z.number(),
  errStreak: z.number(),
})

const reviewSchema = z.object({
  box: z.number(),
  lastReviewed: z.number(),
  nextReview: z.number(),
})

const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  character: z.string(),
  level: z.string(),
  coins: z.number(),
  stars: z.number(),
  createdAt: z.number(),
  badges: z.array(z.string()).optional(),
  owned: z.array(z.string()).optional(),
  playDays: z.array(z.string()).optional(),
  sessions: z.number().optional(),
  totalSeconds: z.number().optional(),
})

const progressSchema = z.object({
  profileId: z.string(),
  notionId: z.string(),
  mastery: masterySchema,
  review: reviewSchema.optional(),
  updatedAt: z.number(),
})

export const backupSchema = z.object({
  version: z.number(),
  profile: profileSchema,
  progress: z.array(progressSchema),
})

export type ProfileBackup = z.infer<typeof backupSchema>

/** Construit l'objet de sauvegarde (versionné) d'un profil et de sa progression. */
export function buildBackup(profile: ProfileRecord, progress: ProgressRecord[]): ProfileBackup {
  return { version: BACKUP_VERSION, profile, progress }
}

/** Valide un contenu importé (JSON déjà parsé) ; lève une erreur s'il est invalide. */
export function parseBackup(data: unknown): ProfileBackup {
  return backupSchema.parse(data)
}
