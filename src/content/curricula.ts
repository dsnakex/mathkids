import cpData from './curriculum/cp.json'
import { curriculumSchema, type Curriculum, type LevelId } from './schema'

// Charge et VALIDE le curriculum au chargement du module (fail-fast) : si un
// fichier de contenu est mal formé, l'erreur est levée immédiatement plutôt
// qu'au milieu d'une session enfant.
export const cp: Curriculum = curriculumSchema.parse(cpData)

// Les autres niveaux (ce1 → cm2) seront ajoutés en Phase 7.
export const CURRICULA = { cp } satisfies Partial<Record<LevelId, Curriculum>>
