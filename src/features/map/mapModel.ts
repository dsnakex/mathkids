// Modèle (pur) de la carte du monde : transforme la progression en une liste
// d'« étapes » (une par notion jouable), chacune avec son état de déblocage et
// ses étoiles. La carte de l'île CP « avance » à mesure que l'enfant acquiert
// les notions (leurs dépendantes se débloquent).

import { allNotions } from '@/content/graph'
import type { Curriculum, Notion } from '@/content/schema'
import { isNotionAcquired, type MasteryState } from '@/engine/adaptive'
import { DEFAULT_TARGET_TIER, isNotionGeneratable, type LearnerProgress } from '@/engine/session'

export { DEFAULT_TARGET_TIER }

export type StepState =
  | 'done' // notion acquise
  | 'current' // commencée, pas encore acquise
  | 'available' // prérequis acquis, prête à démarrer
  | 'locked' // prérequis non acquis (endormie)

export interface MapStep {
  notion: Notion
  state: StepState
  stars: number // 0..3, pour l'affichage sur la carte
  mastery?: MasteryState
}

/** Étoiles affichées sous une étape selon la maîtrise. */
function starsFor(state: StepState, mastery?: MasteryState): number {
  if (state === 'done') return 3
  if (!mastery) return 0
  return mastery.score >= 70 ? 2 : 1
}

/** Les étapes de la carte, dans l'ordre du curriculum (prérequis avant dépendantes). */
export function mapSteps(
  curriculum: Curriculum,
  progress: LearnerProgress,
  targetTier: number = DEFAULT_TARGET_TIER,
): MapStep[] {
  const acquired = (id: string): boolean => {
    const m = progress.mastery[id]
    return m ? isNotionAcquired(m, targetTier) : false
  }

  const steps: MapStep[] = []
  for (const notion of allNotions(curriculum)) {
    if (!isNotionGeneratable(notion)) continue // on ne montre que le jouable
    const mastery = progress.mastery[notion.id]

    let state: StepState
    if (mastery && isNotionAcquired(mastery, targetTier)) state = 'done'
    else if (mastery) state = 'current'
    else if (notion.prerequisites.every(acquired)) state = 'available'
    else state = 'locked'

    steps.push({ notion, state, stars: starsFor(state, mastery), mastery })
  }
  return steps
}
