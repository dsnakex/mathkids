import { z } from 'zod'
import { LEVEL_IDS } from '@/content/schema'

// Schéma d'un problème rédigé (banque par niveau). Le contenu est de la DONNÉE ;
// le moteur (src/engine/generators/problem.ts) tire les variables, calcule les
// dérivées, vérifie les contraintes et substitue les placeholders.

export const PROBLEM_STRUCTURES = [
  'ajout',
  'retrait',
  'reunion',
  'complement',
  'transformation',
  'comparaison',
  'multiplication',
  'division',
  'deux-etapes',
  'proportionnalite',
  'fraction',
  'mesure',
  'pourcentage',
] as const

const varSpecSchema = z.object({
  min: z.number().int(),
  max: z.number().int(),
  step: z.number().int().positive().optional(),
})

export const problemSchema = z.object({
  id: z.string().min(1),
  structure: z.enum(PROBLEM_STRUCTURES),
  etapes: z.number().int().min(1).max(3),
  tier: z.number().int().min(1).max(5),
  template: z.string().min(1),
  vars: z.record(z.string(), varSpecSchema).default({}),
  derived: z.record(z.string(), z.string()).default({}),
  constraints: z.array(z.string()).default([]),
  answer: z.string().min(1),
  unit: z.string().optional(),
  answerFormat: z.enum(['int', 'euros']).default('int'),
  hints: z.array(z.string()).min(1),
  explanation: z.string().min(1),
})

export const problemsFileSchema = z.object({
  level: z.enum(LEVEL_IDS),
  problems: z.array(problemSchema).min(1),
})

export type ProblemStructure = (typeof PROBLEM_STRUCTURES)[number]
export type ProblemSpec = z.infer<typeof problemSchema>
