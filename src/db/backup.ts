// Export / import de la progression d'un profil (accès DB). Le format et la
// validation vivent dans features/parent/backup ; ici on lit/écrit la base.

import { buildBackup, type ProfileBackup } from '@/features/parent/backup'
import { db, type ProfileRecord } from './db'
import { genId } from './profiles'

/** Construit la sauvegarde complète d'un profil (profil + progression). */
export async function exportProfile(profileId: string): Promise<ProfileBackup | null> {
  const profile = await db.profiles.get(profileId)
  if (!profile) return null
  const progress = await db.progress.where('profileId').equals(profileId).toArray()
  return buildBackup(profile, progress)
}

/**
 * Restaure une sauvegarde déjà validée SANS jamais écraser un profil existant.
 * Si l'identifiant est déjà pris (réimport sur le même appareil), on crée un
 * NOUVEAU profil (nouvel identifiant) et on y rattache la progression ; sur un
 * appareil vierge, l'identifiant d'origine est conservé (vraie restauration).
 * Renvoie l'identifiant réellement utilisé.
 */
export async function importProfile(backup: ProfileBackup): Promise<string> {
  const source = backup.profile as ProfileRecord
  return db.transaction('rw', db.profiles, db.progress, async () => {
    const exists = await db.profiles.get(source.id)
    const id = exists ? genId() : source.id
    await db.profiles.add({ ...source, id })
    await db.progress.bulkPut(backup.progress.map((r) => ({ ...r, profileId: id })))
    return id
  })
}
