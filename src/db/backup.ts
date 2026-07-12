// Export / import de la progression d'un profil (accès DB). Le format et la
// validation vivent dans features/parent/backup ; ici on lit/écrit la base.

import { buildBackup, type ProfileBackup } from '@/features/parent/backup'
import { db, type ProfileRecord } from './db'

/** Construit la sauvegarde complète d'un profil (profil + progression). */
export async function exportProfile(profileId: string): Promise<ProfileBackup | null> {
  const profile = await db.profiles.get(profileId)
  if (!profile) return null
  const progress = await db.progress.where('profileId').equals(profileId).toArray()
  return buildBackup(profile, progress)
}

/** Restaure une sauvegarde (déjà validée) : écrase le profil et sa progression. */
export async function importProfile(backup: ProfileBackup): Promise<string> {
  const profile = backup.profile as ProfileRecord
  await db.transaction('rw', db.profiles, db.progress, async () => {
    await db.profiles.put(profile)
    await db.progress.where('profileId').equals(profile.id).delete()
    await db.progress.bulkPut(backup.progress)
  })
  return profile.id
}
