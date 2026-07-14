// Mission découverte — positionnement initial (SPECIFICATIONS §5).
//
// Au premier lancement, le chef propose une mission optionnelle : 8 à 12
// questions adaptatives pour situer l'enfant, sans aucune étoile perdue.
//   • On « grimpe » dans les notions du niveau choisi (une question par notion,
//     au palier cible) ;
//   • sur DEUX erreurs consécutives, on « descend » d'un cran vers les notions
//     du niveau précédent pour trouver le plancher (verif SPEC : « propose du
//     CE2 puis descend au CE1 en cas d'erreurs ») ;
//   • un enfant à l'aise s'arrête vite (dès 8 questions sans erreur récente),
//     un enfant en difficulté va jusqu'à 12.
//
// À la fin, on pré-remplit les scores de maîtrise : notion réussie → acquise
// (étape débloquée), notion ratée → fragile (à travailler). Les notions ratées
// du niveau précédent rejoignent les rappels.
//
// Moteur PUR : aucune dépendance React ni stockage. La source d'aléa `rng` et
// l'instant `now` sont injectés. La session est une machine à états linéaire :
// on l'avance une réponse à la fois, on ne rejoue pas un état passé.

import { curriculumFor } from '@/content/curricula'
import { allNotions } from '@/content/graph'
import { LEVEL_IDS, type LevelId, type Notion } from '@/content/schema'
import { initialMastery, MASTERY_ACQUIRED, type MasteryState } from './adaptive'
import { DEFAULT_TARGET_TIER, isNotionGeneratable, type LearnerProgress } from './session'
import { canGenerate, generateExercise, type Exercise } from './generators'
import { pick, type Rng } from './generators/rng'
import { scheduleFirstReview, type ReviewState } from './spaced'

/** Nombre minimal / maximal de questions de la mission. */
export const MISSION_MIN_QUESTIONS = 8
export const MISSION_MAX_QUESTIONS = 12
/** Erreurs consécutives déclenchant la descente d'un niveau. */
export const MISSION_DESCEND_ERRORS = 2
/** Score de maîtrise attribué à une notion ratée (fragile, à travailler). */
export const MISSION_FRAGILE_SCORE = 30

/** Une question de la mission : la notion sondée, son niveau et son palier. */
export interface MissionProbe {
  level: LevelId
  notionId: string
  tier: number
}

/** L'exercice courant à présenter, avec la sonde qui l'a produit. */
export interface MissionItem {
  probe: MissionProbe
  exercise: Exercise
}

interface MissionAnswer {
  probe: MissionProbe
  correct: boolean
}

/** État de la mission (machine à états, avancée une réponse à la fois). */
export interface MissionSession {
  level: LevelId
  rng: Rng
  climb: string[] // notions restantes du niveau choisi (file)
  floor: string[] // notions restantes du niveau précédent (file, vide au CP)
  floorLevel: LevelId | null
  phase: 'climb' | 'floor'
  errStreak: number
  answers: MissionAnswer[]
  current: MissionItem | null // question en attente ; null = mission terminée
}

/** Résultat de la mission, à fusionner dans la progression du profil. */
export interface MissionOutcome {
  mastery: Record<string, MasteryState>
  reviews: Record<string, ReviewState>
  asked: number
  correct: number
}

/** Niveau scolaire précédent (null pour le CP). */
export function priorLevel(level: LevelId): LevelId | null {
  const i = LEVEL_IDS.indexOf(level)
  return i > 0 ? LEVEL_IDS[i - 1] : null
}

/** Notions jouables d'un niveau, dans l'ordre du curriculum. */
function playableNotions(level: LevelId): Notion[] {
  return allNotions(curriculumFor(level)).filter(isNotionGeneratable)
}

// Palier jouable le plus proche du palier cible (égalité → palier inférieur),
// et un exercice tiré de ce palier.
function probeGeneration(notion: Notion, rng: Rng): { tier: number; exercise: Exercise } {
  const levels = notion.tiers
    .filter((t) => t.generators.some(canGenerate))
    .map((t) => t.level)
    .sort((a, b) => a - b)
  const tier = levels.includes(DEFAULT_TARGET_TIER)
    ? DEFAULT_TARGET_TIER
    : levels.reduce((best, l) =>
        Math.abs(l - DEFAULT_TARGET_TIER) < Math.abs(best - DEFAULT_TARGET_TIER) ? l : best,
      )
  const tierObj = notion.tiers.find((t) => t.level === tier)
  const specs = tierObj ? tierObj.generators.filter(canGenerate) : []
  const spec = specs.length === 1 ? specs[0] : pick(rng, specs)
  return { tier, exercise: generateExercise(spec, rng) }
}

// Choisit la prochaine sonde selon la phase et les conditions d'arrêt, ou null
// si la mission est terminée. Consomme la file de la phase courante.
function nextProbe(session: MissionSession): MissionProbe | null {
  const asked = session.answers.length
  if (asked >= MISSION_MAX_QUESTIONS) return null
  // Placement confiant : au moins le minimum de questions, sans erreur récente,
  // toujours en train de grimper → inutile de continuer à sonder.
  if (asked >= MISSION_MIN_QUESTIONS && session.errStreak === 0 && session.phase === 'climb') {
    return null
  }
  // File de montée épuisée → on bascule vers le plancher s'il existe.
  if (session.phase === 'climb' && session.climb.length === 0 && session.floor.length > 0) {
    session.phase = 'floor'
  }
  const inFloor = session.phase === 'floor'
  const queue = inFloor ? session.floor : session.climb
  if (queue.length === 0) return null
  const level = inFloor ? session.floorLevel : session.level
  if (level === null) return null
  const notionId = queue.shift() as string
  const notion = playableNotions(level).find((n) => n.id === notionId)
  if (!notion) return nextProbe(session) // notion introuvable (défensif) : on saute
  const { tier } = probeGeneration(notion, session.rng)
  return { level, notionId, tier }
}

// Génère l'exercice de la prochaine sonde et le pose comme question courante ;
// met `current` à null si la mission est terminée.
function advance(session: MissionSession): void {
  const probe = nextProbe(session)
  if (!probe) {
    session.current = null
    return
  }
  const level = probe.level
  const notion = playableNotions(level).find((n) => n.id === probe.notionId) as Notion
  const { exercise } = probeGeneration(notion, session.rng)
  session.current = { probe, exercise }
}

/** Démarre une mission pour le niveau choisi ; pose la première question. */
export function startMission(level: LevelId, rng: Rng): MissionSession {
  const floorLevel = priorLevel(level)
  const session: MissionSession = {
    level,
    rng,
    climb: playableNotions(level).map((n) => n.id),
    floor: floorLevel ? playableNotions(floorLevel).map((n) => n.id) : [],
    floorLevel,
    phase: 'climb',
    errStreak: 0,
    answers: [],
    current: null,
  }
  advance(session)
  return session
}

/**
 * Enregistre la réponse à la question courante et avance à la suivante.
 * Sur deux erreurs consécutives en phase de montée, on descend au plancher.
 * Renvoie la session mise à jour (même objet, avancé) ; ne pas rejouer un état
 * antérieur (la source d'aléa est consommée).
 */
export function answerMission(session: MissionSession, correct: boolean): MissionSession {
  if (!session.current) return session
  session.answers.push({ probe: session.current.probe, correct })
  if (correct) {
    session.errStreak = 0
  } else {
    session.errStreak += 1
    if (
      session.errStreak >= MISSION_DESCEND_ERRORS &&
      session.phase === 'climb' &&
      session.floor.length > 0
    ) {
      session.phase = 'floor'
      session.errStreak = 0
    }
  }
  advance(session)
  return session
}

/** Vrai quand la mission n'a plus de question à poser. */
export function isMissionComplete(session: MissionSession): boolean {
  return session.current === null
}

/** Progression de la mission (question courante / total prévu), pour l'UI. */
export function missionProgress(session: MissionSession): { asked: number; total: number } {
  const asked = session.answers.length
  return { asked, total: Math.max(MISSION_MIN_QUESTIONS, asked + (session.current ? 1 : 0)) }
}

/**
 * Traduit les réponses en progression : notion réussie → acquise (étape
 * débloquée), notion ratée → fragile. Les notions ratées du niveau précédent
 * rejoignent les rappels (dus immédiatement).
 */
export function missionOutcome(session: MissionSession, now: number): MissionOutcome {
  const mastery: Record<string, MasteryState> = {}
  const reviews: Record<string, ReviewState> = {}
  let correct = 0

  for (const { probe, correct: ok } of session.answers) {
    if (ok) {
      correct += 1
      mastery[probe.notionId] = {
        ...initialMastery(),
        tier: probe.tier,
        score: MASTERY_ACQUIRED,
      }
    } else {
      mastery[probe.notionId] = { ...initialMastery(), score: MISSION_FRAGILE_SCORE }
      if (probe.level === session.floorLevel) {
        // Fragile au niveau précédent : à revoir en priorité (dû maintenant).
        reviews[probe.notionId] = { ...scheduleFirstReview(now), nextReview: now }
      }
    }
  }

  return { mastery, reviews, asked: session.answers.length, correct }
}

/**
 * Fusionne l'issue de la mission dans une progression existante. La mission ne
 * fait que pré-remplir : elle n'écrase pas une notion déjà travaillée.
 */
export function applyMissionOutcome(
  progress: LearnerProgress,
  outcome: MissionOutcome,
): LearnerProgress {
  const mastery = { ...progress.mastery }
  const reviews = { ...progress.reviews }
  for (const [id, state] of Object.entries(outcome.mastery)) {
    if (!(id in mastery)) mastery[id] = state
  }
  for (const [id, state] of Object.entries(outcome.reviews)) {
    if (!(id in reviews)) reviews[id] = state
  }
  return { mastery, reviews }
}
