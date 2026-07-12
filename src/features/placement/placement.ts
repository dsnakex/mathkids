// « Mission découverte » : positionnement initial (SPECIFICATIONS §5). Un court
// quiz (8-12 questions) évalue le niveau choisi et pré-remplit la maîtrise :
// les notions réussies sont marquées acquises, ce qui débloque d'emblée les
// étapes correspondantes sur la carte. Aucune étoile en jeu.
//
// Logique pure (moteur), testée sans React. Limite connue : le rappel des
// notions du niveau PRÉCÉDENT n'est pas encore géré (les sessions portent sur un
// seul curriculum) — évolution future quand les sessions seront inter-niveaux.

import { allNotions } from '@/content/graph'
import type { Curriculum, GeneratorSpec, Notion } from '@/content/schema'
import { MASTERY_ACQUIRED, type MasteryState } from '@/engine/adaptive'
import { canGenerate, generateExercise, type Exercise } from '@/engine/generators'
import { pick, type Rng } from '@/engine/generators/rng'
import type { LearnerProgress } from '@/engine/session'
import { isNotionGeneratable } from '@/engine/session'

export const PLACEMENT_MAX = 12
export const DEFAULT_TARGET_TIER = 3

export interface PlacementQuestion {
  notionId: string
  exercise: Exercise
}

export interface PlacementAnswer {
  notionId: string
  correct: boolean // premier essai
}

// Choisit un gabarit jouable au palier le plus proche du milieu (3) — un niveau
// « moyen » qui distingue bien ce que l'enfant maîtrise déjà.
function assessmentSpec(notion: Notion, rng: Rng): GeneratorSpec | null {
  const tiers = notion.tiers.filter((t) => t.generators.some(canGenerate))
  if (tiers.length === 0) return null
  const tier = tiers.reduce((best, t) =>
    Math.abs(t.level - 3) < Math.abs(best.level - 3) ? t : best,
  )
  return pick(rng, tier.generators.filter(canGenerate))
}

/** Construit le quiz de positionnement : une question par notion jouable (≤ 12). */
export function buildPlacementQuiz(curriculum: Curriculum, rng: Rng): PlacementQuestion[] {
  const notions = allNotions(curriculum).filter(isNotionGeneratable).slice(0, PLACEMENT_MAX)
  const quiz: PlacementQuestion[] = []
  for (const notion of notions) {
    const spec = assessmentSpec(notion, rng)
    if (spec) quiz.push({ notionId: notion.id, exercise: generateExercise(spec, rng) })
  }
  return quiz
}

/**
 * Traduit les résultats du quiz en progression initiale : chaque notion réussie
 * est marquée acquise (palier cible, maîtrise au seuil) ; les autres restent à
 * découvrir normalement.
 */
export function applyPlacement(
  answers: PlacementAnswer[],
  targetTier: number = DEFAULT_TARGET_TIER,
): LearnerProgress {
  const mastery: Record<string, MasteryState> = {}
  for (const answer of answers) {
    if (answer.correct) {
      mastery[answer.notionId] = { tier: targetTier, score: MASTERY_ACQUIRED, streak: 0, errStreak: 0 }
    }
  }
  return { mastery, reviews: {} }
}
