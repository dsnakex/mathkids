// Composition d'une session d'entraînement (SPECIFICATIONS §5).
//
// Une session type (10-15 min) mêle trois rôles :
//   • « en cours »   ~60 % : la notion travaillée du moment ;
//   • « rappel »     ~25 % : les notions acquises dont l'échéance Leitner arrive ;
//   • « découverte » ~15 % : une nouvelle notion dont les prérequis sont acquis.
//
// Quand un vivier est vide (rien à réviser, rien de neuf), ses créneaux sont
// réaffectés — en priorité à la notion « en cours ». Tout est piloté par la
// donnée (curriculum) et reste pur (rng et instant injectés).

import { allNotions } from '@/content/graph'
import type { Curriculum, Notion } from '@/content/schema'
import { isNotionAcquired, type MasteryState } from './adaptive'
import { canGenerate, generateExercise, type Exercise } from './generators'
import { pick, type Rng } from './generators/rng'
import { dueNotions, type ReviewState } from './spaced'

/** Palier cible par défaut pour juger une notion « acquise » au CP. */
export const DEFAULT_TARGET_TIER = 3

/** Progression d'un apprenant (sous-ensemble en mémoire de ce que stocke la DB). */
export interface LearnerProgress {
  mastery: Record<string, MasteryState> // notions démarrées (en cours ou acquises)
  reviews: Record<string, ReviewState> // notions acquises suivies en révision espacée
}

export type SessionRole = 'current' | 'review' | 'discovery'

/** Un exercice de session, étiqueté par sa notion, son palier et son rôle. */
export interface SessionExercise {
  notionId: string
  tier: number
  role: SessionRole
  exercise: Exercise
}

export interface ComposeOptions {
  now: number // instant courant (ms epoch) pour la révision espacée
  rng: Rng
  total?: number // nombre d'exercices visé (défaut 10)
  targetTier?: number
}

// --- Prédicats sur les notions -----------------------------------------------

/** Une notion est jouable si au moins un de ses paliers a un générateur supporté. */
function isNotionGeneratable(notion: Notion): boolean {
  return notion.tiers.some((t) => t.generators.some(canGenerate))
}

function generatableTierLevels(notion: Notion): number[] {
  return notion.tiers
    .filter((t) => t.generators.some(canGenerate))
    .map((t) => t.level)
    .sort((a, b) => a - b)
}

/** Palier jouable le plus proche du palier souhaité (égalité → palier inférieur). */
function pickGeneratableTier(notion: Notion, preferred: number): number | null {
  const levels = generatableTierLevels(notion)
  if (levels.length === 0) return null
  if (levels.includes(preferred)) return preferred
  return levels.reduce((best, l) =>
    Math.abs(l - preferred) < Math.abs(best - preferred) ? l : best,
  )
}

const isStarted = (progress: LearnerProgress, id: string): boolean => id in progress.mastery

function isAcquired(progress: LearnerProgress, id: string, targetTier: number): boolean {
  const m = progress.mastery[id]
  return m ? isNotionAcquired(m, targetTier) : false
}

function prerequisitesAcquired(
  notion: Notion,
  progress: LearnerProgress,
  targetTier: number,
): boolean {
  return notion.prerequisites.every((p) => isAcquired(progress, p, targetTier))
}

// --- Sélection des viviers ----------------------------------------------------

/** Notion « en cours » : première notion démarrée, non acquise et jouable. */
export function currentNotion(
  curriculum: Curriculum,
  progress: LearnerProgress,
  targetTier: number,
): Notion | null {
  return (
    allNotions(curriculum).find(
      (n) =>
        isStarted(progress, n.id) &&
        !isAcquired(progress, n.id, targetTier) &&
        isNotionGeneratable(n),
    ) ?? null
  )
}

/** Notions « découverte » : non démarrées, prérequis acquis, jouables. */
export function discoveryNotions(
  curriculum: Curriculum,
  progress: LearnerProgress,
  targetTier: number,
): Notion[] {
  return allNotions(curriculum).filter(
    (n) =>
      !isStarted(progress, n.id) &&
      prerequisitesAcquired(n, progress, targetTier) &&
      isNotionGeneratable(n),
  )
}

/** Notions « rappel » : dues à l'instant `now` et jouables. */
export function reviewNotions(
  curriculum: Curriculum,
  progress: LearnerProgress,
  now: number,
): Notion[] {
  const due = new Set(dueNotions(progress.reviews, now))
  return allNotions(curriculum).filter((n) => due.has(n.id) && isNotionGeneratable(n))
}

// --- Répartition des créneaux 60 / 25 / 15 -----------------------------------

const PROPORTIONS = { current: 0.6, review: 0.25, discovery: 0.15 } as const
const ROLES: SessionRole[] = ['current', 'review', 'discovery']

/**
 * Répartit `total` créneaux en 60 / 25 / 15 (méthode du plus fort reste pour
 * tomber juste), puis réaffecte les créneaux des viviers absents au premier
 * vivier disponible (priorité : en cours → rappel → découverte).
 */
export function allocateSlots(
  total: number,
  has: Record<SessionRole, boolean>,
): Record<SessionRole, number> {
  const raw = {
    current: total * PROPORTIONS.current,
    review: total * PROPORTIONS.review,
    discovery: total * PROPORTIONS.discovery,
  }
  const slots: Record<SessionRole, number> = {
    current: Math.floor(raw.current),
    review: Math.floor(raw.review),
    discovery: Math.floor(raw.discovery),
  }
  let assigned = slots.current + slots.review + slots.discovery
  // Distribue le reste aux plus forts restes (égalité → ordre en cours/rappel/découverte).
  const byRemainder = [...ROLES].sort(
    (a, b) => raw[b] - Math.floor(raw[b]) - (raw[a] - Math.floor(raw[a])) || ROLES.indexOf(a) - ROLES.indexOf(b),
  )
  for (let i = 0; assigned < total; i++, assigned++) slots[byRemainder[i % ROLES.length]]++

  const fallback = ROLES.find((r) => has[r])
  if (!fallback) return { current: 0, review: 0, discovery: 0 }
  for (const r of ROLES) {
    if (!has[r] && slots[r] > 0) {
      slots[fallback] += slots[r]
      slots[r] = 0
    }
  }
  return slots
}

// --- Génération ---------------------------------------------------------------

function tierFor(notion: Notion, progress: LearnerProgress, role: SessionRole): number {
  // Une découverte démarre au palier 1 ; sinon on suit le palier de maîtrise.
  const preferred = role === 'discovery' ? 1 : progress.mastery[notion.id]?.tier ?? 1
  const tier = pickGeneratableTier(notion, preferred)
  if (tier === null) throw new Error(`Aucun palier jouable pour « ${notion.id} »`)
  return tier
}

function generateFrom(
  notion: Notion,
  tier: number,
  role: SessionRole,
  count: number,
  rng: Rng,
): SessionExercise[] {
  const tierObj = notion.tiers.find((t) => t.level === tier)
  const specs = tierObj ? tierObj.generators.filter(canGenerate) : []
  const out: SessionExercise[] = []
  for (let i = 0; i < count; i++) {
    const spec = specs.length === 1 ? specs[0] : pick(rng, specs)
    out.push({ notionId: notion.id, tier, role, exercise: generateExercise(spec, rng) })
  }
  return out
}

// Répartit `count` exercices aussi équitablement que possible entre `k` notions.
function distribute(count: number, k: number): number[] {
  const base = Math.floor(count / k)
  const rem = count % k
  return Array.from({ length: k }, (_, i) => base + (i < rem ? 1 : 0))
}

/**
 * Compose une session complète à partir du curriculum et de la progression.
 * Renvoie la liste ordonnée des exercices, chacun étiqueté par son rôle.
 */
export function composeSession(
  curriculum: Curriculum,
  progress: LearnerProgress,
  opts: ComposeOptions,
): SessionExercise[] {
  const total = opts.total ?? 10
  const targetTier = opts.targetTier ?? DEFAULT_TARGET_TIER
  const { rng, now } = opts

  const current = currentNotion(curriculum, progress, targetTier)
  const reviews = reviewNotions(curriculum, progress, now)
  const discoveries = discoveryNotions(curriculum, progress, targetTier)

  const slots = allocateSlots(total, {
    current: current !== null,
    review: reviews.length > 0,
    discovery: discoveries.length > 0,
  })

  const session: SessionExercise[] = []

  if (current && slots.current > 0) {
    session.push(...generateFrom(current, tierFor(current, progress, 'current'), 'current', slots.current, rng))
  }

  if (slots.review > 0 && reviews.length > 0) {
    const perNotion = distribute(slots.review, reviews.length)
    reviews.forEach((notion, i) => {
      session.push(...generateFrom(notion, tierFor(notion, progress, 'review'), 'review', perNotion[i], rng))
    })
  }

  if (slots.discovery > 0 && discoveries.length > 0) {
    const notion = discoveries[0]
    session.push(...generateFrom(notion, tierFor(notion, progress, 'discovery'), 'discovery', slots.discovery, rng))
  }

  return session
}
