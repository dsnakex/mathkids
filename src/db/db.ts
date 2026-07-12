// Schéma de persistance locale (IndexedDB via Dexie). Tout vit sur l'appareil,
// hors ligne, sans compte ni serveur (RGPD par conception — voir SPECIFICATIONS).
//
// Règle d'architecture : l'accès à IndexedDB passe UNIQUEMENT par src/db.
// Les composants n'importent jamais Dexie directement.

import Dexie, { type Table } from 'dexie'
import type { NekoVariant } from '@/components/NekoSushi'
import type { LevelId } from '@/content/schema'
import type { MasteryState } from '@/engine/adaptive'
import type { ReviewState } from '@/engine/spaced'

/** Un profil enfant (fratrie : plusieurs profils sur un même appareil). */
export interface ProfileRecord {
  id: string
  name: string
  character: NekoVariant // avatar chat-sushi
  level: LevelId
  coins: number // grains de riz dorés
  stars: number // étoiles cumulées
  createdAt: number
  // Champs de gamification (Phase 5). Optionnels : les anciens profils valent [].
  badges?: string[] // badges obtenus (ids)
  owned?: string[] // articles de la boutique possédés (ids)
  playDays?: string[] // jours de jeu distincts (clé « AAAA-MM-JJ »), pour l'assiduité
  // Suivi pour le tableau parent (Phase 6).
  sessions?: number // nombre de séances terminées
  totalSeconds?: number // temps total passé, en secondes
}

/** Progression d'une notion pour un profil (maîtrise + rappel espacé éventuel). */
export interface ProgressRecord {
  profileId: string
  notionId: string
  mastery: MasteryState
  review?: ReviewState
  updatedAt: number
}

class MathKidsDB extends Dexie {
  profiles!: Table<ProfileRecord, string>
  progress!: Table<ProgressRecord, [string, string]>

  constructor() {
    super('mathkids')
    this.version(1).stores({
      profiles: 'id, createdAt',
      progress: '[profileId+notionId], profileId',
    })
  }
}

export const db = new MathKidsDB()
