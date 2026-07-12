// Carte de l'île CP : un « tapis roulant à sushis » vertical où chaque étape est
// une notion. Les étapes se débloquent selon la maîtrise (handoff écran 2).

import { useEffect, useState } from 'react'
import { useAppStore } from '@/app/store'
import { cp } from '@/content/curricula'
import { loadLearnerProgress } from '@/db/progress'
import { NekoSushi, type NekoVariant } from '@/components/NekoSushi'
import { Button } from '@/components/Button'
import { LevelChip } from '@/components/LevelChip'
import { mapSteps, type MapStep, type StepState } from './mapModel'

const VARIANT: Record<StepState, NekoVariant> = {
  done: 'nigiri',
  current: 'temaki',
  available: 'maki',
  locked: 'onigiri',
}

function Stars({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span aria-hidden="true" className="text-sm">
      {'⭐'.repeat(count)}
    </span>
  )
}

function Step({ step, onPlay }: { step: MapStep; onPlay: (id: string) => void }) {
  const locked = step.state === 'locked'
  return (
    <li className="flex flex-col items-center gap-1">
      <button
        type="button"
        disabled={locked}
        onClick={() => onPlay(step.notion.id)}
        aria-label={`${step.notion.name}${locked ? ' (verrouillé)' : ''}`}
        className={`flex w-[240px] items-center gap-3 rounded-card border-[3px] border-transparent bg-card p-3 text-left shadow-candy transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 ${
          locked ? 'opacity-60' : 'active:translate-y-[3px] active:shadow-candy-pressed'
        } ${step.state === 'current' ? 'border-gold' : ''}`}
      >
        <NekoSushi variant={VARIANT[step.state]} size={52} />
        <span className="flex-1">
          <span className="block text-[17px] font-extrabold leading-tight text-ink">
            {step.notion.name}
          </span>
          {locked ? (
            <span className="text-sm font-bold text-muted">💤 À débloquer</span>
          ) : (
            <Stars count={step.stars} />
          )}
        </span>
      </button>
    </li>
  )
}

export function MapScreen() {
  const profileId = useAppStore((s) => s.profileId)
  const profiles = useAppStore((s) => s.profiles)
  const selectStep = useAppStore((s) => s.selectStep)
  const goShop = useAppStore((s) => s.goShop)
  const goProfiles = useAppStore((s) => s.goProfiles)
  const [steps, setSteps] = useState<MapStep[]>([])

  const profile = profiles.find((p) => p.id === profileId)

  useEffect(() => {
    if (!profileId) return
    let alive = true
    loadLearnerProgress(profileId).then((progress) => {
      if (alive) setSteps(mapSteps(cp, progress))
    })
    return () => {
      alive = false
    }
  }, [profileId])

  return (
    <main className="flex min-h-full flex-col gap-4 bg-gradient-to-b from-[#FDF3E4] via-[#FAE4D6] to-[#FDF6EA] p-5 font-sans text-ink">
      {/* Topbar : monde, riz, étoiles, boutique. */}
      <header className="flex items-center gap-2">
        <LevelChip level="cp" />
        <span className="ml-auto rounded-full bg-gold px-3 py-1 text-base font-extrabold text-gold-text">
          🍚 {profile?.coins ?? 0}
        </span>
        <span className="rounded-full bg-success-soft px-3 py-1 text-base font-extrabold text-success-text">
          ⭐ {profile?.stars ?? 0}
        </span>
      </header>

      <div>
        <h1 className="text-center text-[24px] font-extrabold">L'île du CP 🍣</h1>
        <p className="text-center text-base font-bold text-muted">
          Choisis une étape, {profile?.name ?? ''} !
        </p>
      </div>

      <ol className="flex flex-col items-center gap-3">
        {steps.map((step, i) => (
          <div key={step.notion.id} className={i % 2 === 0 ? 'self-start pl-4' : 'self-end pr-4'}>
            <Step step={step} onPlay={selectStep} />
          </div>
        ))}
      </ol>

      <div className="mt-auto flex flex-col items-center gap-2 pt-2">
        <Button onClick={goShop}>Le comptoir du chef 🍚</Button>
        <Button variant="ghost" onClick={goProfiles}>
          Changer de joueur
        </Button>
      </div>
    </main>
  )
}
