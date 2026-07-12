import cpData from './curriculum/cp.json'
import ce1Data from './curriculum/ce1.json'
import ce2Data from './curriculum/ce2.json'
import cm1Data from './curriculum/cm1.json'
import { curriculumSchema, type Curriculum, type LevelId, type Notion } from './schema'

// Charge et VALIDE chaque curriculum au chargement du module (fail-fast) : si un
// fichier de contenu est mal formé, l'erreur est levée immédiatement plutôt
// qu'au milieu d'une session enfant.
export const cp: Curriculum = curriculumSchema.parse(cpData)
export const ce1: Curriculum = curriculumSchema.parse(ce1Data)
export const ce2: Curriculum = curriculumSchema.parse(ce2Data)
export const cm1: Curriculum = curriculumSchema.parse(cm1Data)

// Le niveau CM2 sera ajouté en poursuivant la Phase 7.
export const CURRICULA = { cp, ce1, ce2, cm1 } satisfies Partial<Record<LevelId, Curriculum>>

/** Niveaux effectivement disponibles (avec contenu), dans l'ordre scolaire. */
export const AVAILABLE_LEVELS = Object.keys(CURRICULA) as LevelId[]

/** Curriculum d'un niveau (repli sur le CP si le niveau n'a pas encore de contenu). */
export function curriculumFor(level: LevelId): Curriculum {
  return (CURRICULA as Partial<Record<LevelId, Curriculum>>)[level] ?? cp
}

/** Retrouve une notion par son id, tous niveaux confondus. */
export function findNotion(notionId: string): Notion | undefined {
  for (const curriculum of Object.values(CURRICULA)) {
    for (const domain of curriculum.domains) {
      const notion = domain.notions.find((n) => n.id === notionId)
      if (notion) return notion
    }
  }
  return undefined
}

/** Nom lisible de chaque notion, tous niveaux confondus (badges, feedback…). */
export const ALL_NOTION_NAMES: Record<string, string> = Object.fromEntries(
  Object.values(CURRICULA).flatMap((c) =>
    c.domains.flatMap((d) => d.notions.map((n) => [n.id, n.name] as const)),
  ),
)
