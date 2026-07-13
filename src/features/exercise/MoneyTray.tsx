// Composer une somme : l'enfant pose des pièces/billets sur le comptoir. Le
// total en cours s'affiche en continu ; on valide le TOTAL (plusieurs
// compositions sont acceptées). Tout est calculé en centimes entiers.

import { useState } from 'react'
import { Button } from '@/components/Button'
import { formatEuros, unitLabel } from '@/engine/generators/money'

type MoneyTrayProps = {
  targetCents: number
  status: 'neutral' | 'correct' | 'wrong'
  onValidate: (correct: boolean) => void
}

// Sous-ensemble suffisant pour les montants du CE2 (≤ quelques euros).
const PALETTE = [1, 2, 5, 10, 20, 50, 100, 200, 500]

function unitTone(cents: number): string {
  if (cents <= 5) return '#C98A5E'
  if (cents < 100) return '#E9C46A'
  if (cents <= 200) return '#D9B15A'
  return '#BFE3C8'
}

export function MoneyTray({ targetCents, status, onValidate }: MoneyTrayProps) {
  const [placed, setPlaced] = useState<number[]>([])
  const total = placed.reduce((a, b) => a + b, 0)
  const locked = status !== 'neutral'

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Comptoir : total en cours. */}
      <div className="flex min-h-[64px] w-full max-w-[320px] flex-col items-center gap-1 rounded-card border-[3px] border-hairline bg-cream p-2">
        <span className="text-sm font-bold text-muted">
          Total : <span className="text-ink">{formatEuros(total)}</span> / {formatEuros(targetCents)}
        </span>
        <div className="flex flex-wrap justify-center gap-1">
          {placed.map((u, i) => (
            <button
              key={i}
              type="button"
              disabled={locked}
              aria-label={`Retirer ${unitLabel(u)}`}
              onClick={() => setPlaced((p) => p.filter((_, j) => j !== i))}
              className="grid h-9 w-9 place-items-center rounded-full text-xs font-extrabold text-ink"
              style={{ backgroundColor: unitTone(u) }}
            >
              {unitLabel(u)}
            </button>
          ))}
        </div>
      </div>

      {/* Palette de pièces/billets à poser. */}
      <div className="flex flex-wrap justify-center gap-2">
        {PALETTE.map((u) => (
          <button
            key={u}
            type="button"
            disabled={locked}
            aria-label={`Poser ${unitLabel(u)}`}
            onClick={() => setPlaced((p) => [...p, u])}
            className="grid h-12 min-w-[56px] place-items-center rounded-btn-sm px-2 text-sm font-extrabold text-ink shadow-candy transition-transform active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 disabled:opacity-50"
            style={{ backgroundColor: unitTone(u) }}
          >
            {unitLabel(u)}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => !locked && setPlaced([])}>
          Vider
        </Button>
        <Button disabled={locked} onClick={() => onValidate(total === targetCents)}>
          Valider 🐾
        </Button>
      </div>
    </div>
  )
}
