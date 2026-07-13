// Chargement et validation de la banque de problèmes (fail-fast au démarrage).

import type { LevelId } from '@/content/schema'
import { problemsFileSchema, type ProblemSpec } from './schema'
import cp from './cp.json'
import ce1 from './ce1.json'
import ce2 from './ce2.json'
import cm1 from './cm1.json'
import cm2 from './cm2.json'

const BANK: Record<LevelId, ProblemSpec[]> = {
  cp: problemsFileSchema.parse(cp).problems,
  ce1: problemsFileSchema.parse(ce1).problems,
  ce2: problemsFileSchema.parse(ce2).problems,
  cm1: problemsFileSchema.parse(cm1).problems,
  cm2: problemsFileSchema.parse(cm2).problems,
}

/** Tous les problèmes d'un niveau. */
export function problemsForLevel(level: LevelId): ProblemSpec[] {
  return BANK[level] ?? []
}

/** Tous les problèmes, tous niveaux (utile aux tests). */
export function allProblems(): Array<{ level: LevelId; problem: ProblemSpec }> {
  return (Object.keys(BANK) as LevelId[]).flatMap((level) =>
    BANK[level].map((problem) => ({ level, problem })),
  )
}

export type { ProblemSpec } from './schema'
