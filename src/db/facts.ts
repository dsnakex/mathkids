// Persistance du suivi « fait par fait » du calcul mental (chantier G), par
// profil. Les états vivent dans `ProfileRecord.factStates` (une entrée par clé de
// fait, ex. « ×:7:8 »). Accès IndexedDB centralisé ici (jamais de Dexie direct
// dans les composants).

import { getProfile, updateProfile } from './profiles'
import type { FactState } from '@/engine/facts'

/** Charge les états de faits d'un profil (objet vide si aucun). */
export async function loadFactStates(profileId: string): Promise<Record<string, FactState>> {
  const profile = await getProfile(profileId)
  return profile?.factStates ?? {}
}

/** Écrit les états de faits d'un profil (remplace l'ensemble). */
export async function saveFactStates(
  profileId: string,
  factStates: Record<string, FactState>,
): Promise<void> {
  await updateProfile(profileId, { factStates })
}
