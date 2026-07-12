// Création d'un profil enfant : prénom + avatar + niveau scolaire.
// Le niveau n'est JAMAIS imposé par défaut (SPECIFICATIONS §5) : le parent le
// choisit parmi les niveaux disposant de contenu.

import { useState, type FormEvent } from 'react'
import { useAppStore } from '@/app/store'
import { AVAILABLE_LEVELS } from '@/content/curricula'
import type { LevelId } from '@/content/schema'
import { Button } from '@/components/Button'
import { LevelChip } from '@/components/LevelChip'
import { NekoSushi, type NekoVariant } from '@/components/NekoSushi'

const AVATARS: NekoVariant[] = ['maki', 'temaki', 'nigiri', 'tamago', 'onigiri']

export function ProfileCreate() {
  const addProfile = useAppStore((s) => s.addProfile)
  const goProfiles = useAppStore((s) => s.goProfiles)
  const [name, setName] = useState('')
  const [character, setCharacter] = useState<NekoVariant>('maki')
  const [level, setLevel] = useState<LevelId | null>(null)

  const trimmed = name.trim()
  const ready = trimmed !== '' && level !== null

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!ready || level === null) return
    void addProfile({ name: trimmed, character, level })
  }

  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-5 bg-cream p-6 text-center font-sans text-ink">
      <h1 className="text-[26px] font-extrabold">Nouveau chat-sushi</h1>

      <form onSubmit={submit} className="flex w-full max-w-sm flex-col items-center gap-5">
        <label className="flex w-full flex-col items-start gap-1.5 text-left">
          <span className="text-lg font-bold text-muted">Ton prénom</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={12}
            autoFocus
            className="w-full rounded-card border-[3px] border-hairline bg-card px-4 py-3 text-[22px] font-extrabold text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            placeholder="Léa"
          />
        </label>

        <fieldset className="w-full">
          <legend className="mb-2 text-lg font-bold text-muted">Choisis ton avatar</legend>
          <div className="flex flex-wrap justify-center gap-3">
            {AVATARS.map((variant) => {
              const selected = variant === character
              return (
                <button
                  key={variant}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`Avatar ${variant}`}
                  onClick={() => setCharacter(variant)}
                  className={`grid h-[84px] w-[84px] place-items-center rounded-card bg-card shadow-candy transition-transform active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 ${
                    selected ? 'ring-4 ring-primary' : ''
                  }`}
                >
                  <NekoSushi variant={variant} size={60} />
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="w-full">
          <legend className="mb-2 text-lg font-bold text-muted">Choisis ton niveau</legend>
          <div className="flex flex-wrap justify-center gap-3">
            {AVAILABLE_LEVELS.map((lvl) => {
              const selected = lvl === level
              return (
                <button
                  key={lvl}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setLevel(lvl)}
                  className={`rounded-card bg-card px-4 py-2 shadow-candy-sm transition-transform active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 ${
                    selected ? 'ring-4 ring-primary' : ''
                  }`}
                >
                  <LevelChip level={lvl} />
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="flex flex-col items-center gap-2">
          <Button type="submit" disabled={!ready}>
            C'est parti ! 🍣
          </Button>
          <Button variant="ghost" type="button" onClick={goProfiles}>
            Annuler
          </Button>
        </div>
      </form>
    </main>
  )
}
