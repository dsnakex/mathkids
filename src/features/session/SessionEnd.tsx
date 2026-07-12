// Écran de fin de séance : félicitations, étoiles gagnées, grains de riz.
// Version Phase 4 (la boutique et la carte du monde arrivent en Phase 5).

import { useAppStore } from '@/app/store'
import { Button } from '@/components/Button'
import { NekoSushi } from '@/components/NekoSushi'
import { Confetti } from '@/features/exercise/Confetti'

export function SessionEnd() {
  const reward = useAppStore((s) => s.reward)
  const correctCount = useAppStore((s) => s.correctCount)
  const session = useAppStore((s) => s.session)
  const profiles = useAppStore((s) => s.profiles)
  const profileId = useAppStore((s) => s.profileId)
  const replay = useAppStore((s) => s.replay)
  const goProfiles = useAppStore((s) => s.goProfiles)

  const name = profiles.find((p) => p.id === profileId)?.name ?? ''
  const stars = reward?.stars ?? 1
  const coins = reward?.coins ?? 0
  const total = session.length

  return (
    <main className="relative flex min-h-full flex-col items-center justify-center gap-5 bg-cream p-6 text-center font-sans text-ink">
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

      <div className="mt-2 flex flex-col items-center gap-2">
        <Button onClick={replay}>Rejouer une séance 🥢</Button>
        <Button variant="ghost" onClick={goProfiles}>
          Retour aux profils
        </Button>
      </div>
    </main>
  )
}
