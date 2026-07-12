// Écran de fin de séance : félicitations, étoiles, grains de riz et badges
// éventuellement gagnés. On repart ensuite vers la carte de l'île.

import { useAppStore } from '@/app/store'
import { ALL_NOTION_NAMES } from '@/content/curricula'
import { Button } from '@/components/Button'
import { NekoSushi } from '@/components/NekoSushi'
import { Confetti } from '@/features/exercise/Confetti'
import { badgeLabel } from '@/features/rewards/badges'

export function SessionEnd() {
  const reward = useAppStore((s) => s.reward)
  const correctCount = useAppStore((s) => s.correctCount)
  const session = useAppStore((s) => s.session)
  const profiles = useAppStore((s) => s.profiles)
  const profileId = useAppStore((s) => s.profileId)
  const earnedBadges = useAppStore((s) => s.earnedBadges)
  const replay = useAppStore((s) => s.replay)
  const goMap = useAppStore((s) => s.goMap)

  const name = profiles.find((p) => p.id === profileId)?.name ?? ''
  const stars = reward?.stars ?? 1
  const coins = reward?.coins ?? 0
  const total = session.length

  return (
    <main className="relative flex min-h-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-cream to-[#FAE4D6] p-6 text-center font-sans text-ink">
      <Confetti />

      <div className="mk-pulse">
        <NekoSushi variant="chef" size={110} title="Le chef te félicite" />
      </div>

      <h1 className="text-[28px] font-extrabold">Miam, quelle séance, {name} !</h1>

      <div aria-label={`${stars} étoiles sur 3`} className="flex gap-2 text-[52px] leading-none">
        {[1, 2, 3].map((n) => (
          <span key={n} aria-hidden="true" className={n <= stars ? '' : 'opacity-25'}>
            ⭐
          </span>
        ))}
      </div>

      <p className="text-lg font-bold text-muted">
        {correctCount} bonnes réponses sur {total}
      </p>

      <div className="rounded-card bg-gold px-5 py-3 text-[20px] font-extrabold text-gold-text shadow-candy-gold">
        🍚 +{coins} grains de riz dorés
      </div>

      {earnedBadges.length > 0 ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-extrabold text-success-text">Nouveau badge !</p>
          <ul className="flex flex-wrap justify-center gap-2">
            {earnedBadges.map((id) => (
              <li
                key={id}
                className="rounded-full bg-success-soft px-3 py-1 text-base font-extrabold text-success-text"
              >
                {badgeLabel(id, ALL_NOTION_NAMES)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-2 flex flex-col items-center gap-2">
        <Button onClick={goMap}>Retour à la carte 🗺️</Button>
        <Button variant="ghost" onClick={replay}>
          Rejouer une séance 🥢
        </Button>
      </div>
    </main>
  )
}
