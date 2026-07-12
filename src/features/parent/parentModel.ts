// Calculs (purs) du tableau de bord parent (SPECIFICATIONS §8, handoff écran 7)
// et porte d'accès « adulte ». Aucune donnée n'est envoyée en ligne : tout est
// calculé localement à partir de la progression.

import { allNotions } from '@/content/graph'
import type { Curriculum } from '@/content/schema'
import { isNotionAcquired } from '@/engine/adaptive'
import { isNotionGeneratable, type LearnerProgress } from '@/engine/session'
import { randInt, type Rng } from '@/engine/generators/rng'

export const DEFAULT_TARGET_TIER = 3

/** Seuil de maîtrise en dessous duquel une notion commencée est « en difficulté ». */
const DIFFICULTY_THRESHOLD = 50

export interface DomainMastery {
  id: string
  name: string
  percent: number // 0..100, moyenne de maîtrise sur les notions jouables du domaine
}

/** Maîtrise moyenne par domaine (sur les notions jouables ; non commencé = 0 %). */
export function domainMastery(curriculum: Curriculum, progress: LearnerProgress): DomainMastery[] {
  return curriculum.domains.map((domain) => {
    const playable = domain.notions.filter(isNotionGeneratable)
    const total = playable.reduce((sum, n) => sum + (progress.mastery[n.id]?.score ?? 0), 0)
    const percent = playable.length > 0 ? Math.round(total / playable.length) : 0
    return { id: domain.id, name: domain.name, percent }
  })
}

export interface DifficultyNotion {
  id: string
  name: string
}

/** Notions commencées, non acquises et à faible maîtrise — « le chef propose de revoir ». */
export function notionsInDifficulty(
  curriculum: Curriculum,
  progress: LearnerProgress,
  targetTier: number = DEFAULT_TARGET_TIER,
): DifficultyNotion[] {
  return allNotions(curriculum)
    .filter((n) => {
      const m = progress.mastery[n.id]
      return m !== undefined && !isNotionAcquired(m, targetTier) && m.score < DIFFICULTY_THRESHOLD
    })
    .map((n) => ({ id: n.id, name: n.name }))
}

/** Durée lisible : « 42 min » ou « 1 h 05 ». */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60)
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const mm = minutes % 60
  return `${h} h ${String(mm).padStart(2, '0')}`
}

export interface GateQuestion {
  question: string
  answer: number
}

/**
 * Porte d'accès « adulte » : une multiplication hors de portée d'un jeune enfant
 * (pas de code à mémoriser). Pratique et sans stockage.
 */
export function generateGateQuestion(rng: Rng): GateQuestion {
  const a = randInt(rng, 3, 9)
  const b = randInt(rng, 3, 9)
  return { question: `Combien font ${a} × ${b} ?`, answer: a * b }
}
