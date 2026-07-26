// Mode de parcours (chantier A), réglé dans l'espace parent : « Parcours guidé »
// (défaut, surtout CP-CE1) ou « Exploration libre ». Réglage d'APPAREIL
// (localStorage), comme les réglages d'affichage — il suit la tablette, pas
// l'enfant. Le moteur (src/engine/session.ts) reçoit ce mode à la composition.

import type { PathMode } from '@/engine/session'

export interface LearningSettings {
  guidedPath: boolean // true = parcours guidé (défaut), false = exploration libre
}

const STORAGE_KEY = 'mathkids-learning'

export const DEFAULT_LEARNING: LearningSettings = { guidedPath: true }

/** Charge le réglage (valeurs sûres si le stockage est vide ou corrompu). */
export function loadLearningSettings(storage: Pick<Storage, 'getItem'> = localStorage): LearningSettings {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_LEARNING }
    const parsed = JSON.parse(raw) as Partial<LearningSettings>
    return { guidedPath: parsed.guidedPath !== false } // absent ou true ⇒ guidé
  } catch {
    return { ...DEFAULT_LEARNING }
  }
}

export function saveLearningSettings(
  settings: LearningSettings,
  storage: Pick<Storage, 'setItem'> = localStorage,
): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

/** Traduit le réglage en mode moteur. */
export function pathMode(settings: LearningSettings): PathMode {
  return settings.guidedPath ? 'guided' : 'free'
}
