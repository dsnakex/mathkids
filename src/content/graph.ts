import type { Curriculum, Notion } from './schema'

// Utilitaires sur le graphe de prérequis entre notions (fonctions pures).
// Les prérequis forment un graphe orienté : une notion pointe vers celles
// qu'il faut maîtriser avant. Ce graphe doit être acyclique (un DAG), sinon
// une notion se bloquerait elle-même.

/** Toutes les notions du curriculum, aplaties (tous domaines confondus). */
export function allNotions(curriculum: Curriculum): Notion[] {
  return curriculum.domains.flatMap((domain) => domain.notions)
}

/** Map id de notion → liste de ses prérequis. */
export function prerequisiteMap(curriculum: Curriculum): Map<string, string[]> {
  return new Map(allNotions(curriculum).map((n) => [n.id, n.prerequisites]))
}

/**
 * Prérequis qui pointent vers une notion inexistante dans le curriculum.
 * Retourne la liste des couples { notion, prérequis manquant }.
 */
export function danglingPrerequisites(
  curriculum: Curriculum,
): Array<{ notion: string; missing: string }> {
  const known = new Set(allNotions(curriculum).map((n) => n.id))
  const dangling: Array<{ notion: string; missing: string }> = []
  for (const notion of allNotions(curriculum)) {
    for (const prereq of notion.prerequisites) {
      if (!known.has(prereq)) dangling.push({ notion: notion.id, missing: prereq })
    }
  }
  return dangling
}

/** Ids de notions apparaissant en double dans le curriculum. */
export function duplicateNotionIds(curriculum: Curriculum): string[] {
  const seen = new Set<string>()
  const dups = new Set<string>()
  for (const notion of allNotions(curriculum)) {
    if (seen.has(notion.id)) dups.add(notion.id)
    seen.add(notion.id)
  }
  return [...dups]
}

/**
 * Détecte un cycle dans le graphe de prérequis (parcours en profondeur avec
 * coloration). Retourne un cycle sous forme de chemin d'ids s'il en existe un,
 * sinon `null`. Les prérequis pendants (inconnus) sont ignorés ici.
 */
export function findPrerequisiteCycle(curriculum: Curriculum): string[] | null {
  const deps = prerequisiteMap(curriculum)
  const WHITE = 0,
    GREY = 1,
    BLACK = 2
  const color = new Map<string, number>()
  for (const id of deps.keys()) color.set(id, WHITE)

  const stack: string[] = []

  const visit = (id: string): string[] | null => {
    color.set(id, GREY)
    stack.push(id)
    for (const next of deps.get(id) ?? []) {
      if (!deps.has(next)) continue // prérequis inconnu : ignoré ici
      const c = color.get(next)
      if (c === GREY) {
        // Arête arrière → cycle : on renvoie le segment concerné.
        const start = stack.indexOf(next)
        return [...stack.slice(start), next]
      }
      if (c === WHITE) {
        const found = visit(next)
        if (found) return found
      }
    }
    stack.pop()
    color.set(id, BLACK)
    return null
  }

  for (const id of deps.keys()) {
    if (color.get(id) === WHITE) {
      const cycle = visit(id)
      if (cycle) return cycle
    }
  }
  return null
}
