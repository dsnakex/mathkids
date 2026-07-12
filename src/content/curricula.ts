import cpData from './curriculum/cp.json'
import ce1Data from './curriculum/ce1.json'
import { curriculumSchema, type Curriculum, type LevelId } from './schema'

// Charge et VALIDE chaque curriculum au chargement du module (fail-fast) : si un
// fichier de contenu est mal formé, l'erreur est levée immédiatement plutôt
// qu'au milieu d'une session enfant.
export const cp: Curriculum = curriculumSchema.parse(cpData)
export const ce1: Curriculum = curriculumSchema.parse(ce1Data)

// Les niveaux CE2 → CM2 seront ajoutés en poursuivant la Phase 7.
export const CURRICULA = { cp, ce1 } satisfies Partial<Record<LevelId, Curriculum>>
