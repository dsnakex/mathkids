// Point d'entrée du moteur (TypeScript pur, sans dépendance React).
// Regroupe les briques de la Phase 3 pour la couche UI (Phase 4).

export { generateExercise, canGenerate, UnsupportedSpecError } from './generators'
export * from './generators/types'
export { mulberry32, randInt, pick, sample, shuffle, buildNumericChoices, type Rng } from './generators/rng'
export { enLettres } from './generators/frenchNumbers'
export * from './adaptive'
export * from './spaced'
export * from './session'
