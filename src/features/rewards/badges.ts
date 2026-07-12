// Badges (gamification, SPECIFICATIONS §7). Logique pure d'attribution : à
// partir de l'état possédé et du bilan de la séance, calcule les NOUVEAUX
// badges gagnés. La persistance (liste des badges du profil) est gérée ailleurs.
//
// Familles de badges :
//   • notion:<id>        → une notion vient d'être acquise
//   • exploit:sans-faute → une séance réussie sans erreur (3 étoiles)
//   • assiduite:3-jours  → joué 3 jours différents

export interface BadgeContext {
  owned: string[] // badges déjà obtenus
  acquiredNotionIds: string[] // toutes les notions acquises à ce jour
  sessionStars: number // étoiles de la séance qui vient de finir
  distinctPlayDays: number // nombre de jours distincts de jeu
}

/** Badges nouvellement gagnés (jamais déjà possédés). */
export function newlyEarnedBadges(ctx: BadgeContext): string[] {
  const owned = new Set(ctx.owned)
  const candidates: string[] = ctx.acquiredNotionIds.map((id) => `notion:${id}`)
  if (ctx.sessionStars >= 3) candidates.push('exploit:sans-faute')
  if (ctx.distinctPlayDays >= 3) candidates.push('assiduite:3-jours')

  const earned: string[] = []
  for (const id of candidates) {
    if (!owned.has(id) && !earned.includes(id)) earned.push(id)
  }
  return earned
}

/** Libellé lisible d'un badge, pour l'affichage. */
export function badgeLabel(id: string, notionNames: Record<string, string> = {}): string {
  if (id === 'exploit:sans-faute') return '🌟 Sans-faute'
  if (id === 'assiduite:3-jours') return '📅 3 jours de suite'
  if (id.startsWith('notion:')) {
    const notionId = id.slice('notion:'.length)
    return `🍽️ ${notionNames[notionId] ?? notionId}`
  }
  return id
}
