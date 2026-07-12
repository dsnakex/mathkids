import { z } from 'zod'

// Schémas de validation du contenu pédagogique (voir modèle de données,
// docs/ARCHITECTURE.md §3). Le contenu est de la DONNÉE (JSON), pas du code :
// ces schémas garantissent qu'un fichier de curriculum est bien formé avant
// d'être consommé par le moteur.

export const LEVEL_IDS = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'] as const
export type LevelId = (typeof LEVEL_IDS)[number]

// Les 7 types d'exercices générables (docs/SPECIFICATIONS.md §4).
export const GENERATOR_TYPES = [
  'qcm', // choix multiple
  'input', // saisie numérique
  'dragdrop', // glisser-déposer
  'truefalse', // vrai / faux
  'gap', // complète le trou (ex. 7 + _ = 12)
  'visual', // manipulation visuelle (compter, horloge, droite graduée…)
  'problem', // problème énoncé
] as const

// Un gabarit paramétré. `params` reste volontairement libre pour l'instant :
// chaque générateur (Phase 3) validera/consommera ses propres paramètres.
export const generatorSpecSchema = z.object({
  type: z.enum(GENERATOR_TYPES),
  params: z.record(z.string(), z.unknown()).default({}),
})

// Un palier de difficulté (1 à 5) d'une notion.
export const tierSchema = z.object({
  level: z.number().int().min(1).max(5),
  generators: z.array(generatorSpecSchema).min(1),
  problems: z.array(z.string()).optional(), // réfs vers la banque de problèmes
})

export const notionSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    prerequisites: z.array(z.string()).default([]),
    lesson: z.string().min(1), // réf vers une leçon (contenu en Phase 5)
    tiers: z.array(tierSchema).length(5),
  })
  .superRefine((notion, ctx) => {
    // Les 5 paliers doivent couvrir exactement les niveaux 1 à 5.
    const levels = notion.tiers.map((t) => t.level).sort((a, b) => a - b)
    const expected = [1, 2, 3, 4, 5]
    if (levels.join(',') !== expected.join(',')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Les paliers de « ${notion.id} » doivent être exactement 1..5 (reçu : ${levels.join(', ')})`,
        path: ['tiers'],
      })
    }
  })

export const domainSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  notions: z.array(notionSchema).min(1),
})

export const curriculumSchema = z.object({
  id: z.enum(LEVEL_IDS),
  name: z.string().min(1),
  domains: z.array(domainSchema).min(1),
})

export type GeneratorType = (typeof GENERATOR_TYPES)[number]
export type GeneratorSpec = z.infer<typeof generatorSpecSchema>
export type Tier = z.infer<typeof tierSchema>
export type Notion = z.infer<typeof notionSchema>
export type Domain = z.infer<typeof domainSchema>
export type Curriculum = z.infer<typeof curriculumSchema>
