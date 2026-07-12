// Accès aux profils (création, liste, récompenses, suppression).

import type { NekoVariant } from '@/components/NekoSushi'
import type { LevelId } from '@/content/schema'
import { db, type ProfileRecord } from './db'

export interface NewProfile {
  name: string
  character: NekoVariant
  level: LevelId
}

// Identifiant unique et stable (crypto si dispo, sinon repli suffisant en local).
function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `p-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

/** Tous les profils, du plus ancien au plus récent. */
export function listProfiles(): Promise<ProfileRecord[]> {
  return db.profiles.orderBy('createdAt').toArray()
}

export function getProfile(id: string): Promise<ProfileRecord | undefined> {
  return db.profiles.get(id)
}

/** Crée un profil (riz et étoiles à zéro) et renvoie l'enregistrement complet. */
export async function createProfile(input: NewProfile, now: number = Date.now()): Promise<ProfileRecord> {
  const record: ProfileRecord = {
    id: genId(),
    name: input.name.trim(),
    character: input.character,
    level: input.level,
    coins: 0,
    stars: 0,
    createdAt: now,
  }
  await db.profiles.add(record)
  return record
}

/** Ajoute des grains de riz et des étoiles au solde d'un profil. */
export async function addRewards(id: string, coins: number, stars: number): Promise<void> {
  await db.profiles
    .where('id')
    .equals(id)
    .modify((p) => {
      p.coins += coins
      p.stars += stars
    })
}

/** Met à jour partiellement un profil (récompenses, badges, achats…). */
export async function updateProfile(id: string, patch: Partial<ProfileRecord>): Promise<void> {
  await db.profiles.update(id, patch)
}

/** Supprime un profil et toute sa progression (transaction atomique). */
export async function deleteProfile(id: string): Promise<void> {
  await db.transaction('rw', db.profiles, db.progress, async () => {
    await db.progress.where('profileId').equals(id).delete()
    await db.profiles.delete(id)
  })
}
