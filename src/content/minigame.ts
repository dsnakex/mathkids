// Banque du mini-jeu de calcul mental (SPECIFICATIONS §7) : des gabarits QCM
// rapides par niveau, validés au chargement comme le reste du contenu
// (fail-fast si le JSON est mal formé).

import { z } from 'zod'
import minigameData from './minigame.json'
import { generatorSpecSchema, LEVEL_IDS, type GeneratorSpec, type LevelId } from './schema'

const minigameFileSchema = z.record(z.enum(LEVEL_IDS), z.array(generatorSpecSchema).min(1))

const BANK = minigameFileSchema.parse(minigameData)

/** Gabarits de calcul mental du niveau (liste brute, telle que déclarée). */
export function minigameSpecsFor(level: LevelId): GeneratorSpec[] {
  return BANK[level] ?? []
}
