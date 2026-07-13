// Affichage de pièces et billets posés (valeurs en centimes). Pièces rondes,
// billets rectangulaires ; couleurs distinctes (cuivre / or / bicolore / billet).

import { unitLabel } from '@/engine/generators/money'

function unitStyle(cents: number): { bg: string; fg: string; bill: boolean } {
  if (cents <= 5) return { bg: '#C98A5E', fg: '#3B2A1C', bill: false } // cuivre
  if (cents < 100) return { bg: '#E9C46A', fg: '#4A3B12', bill: false } // or
  if (cents <= 200) return { bg: '#D9B15A', fg: '#3B2E10', bill: false } // bicolore
  return { bg: '#BFE3C8', fg: '#234A2E', bill: true } // billet
}

function Token({ cents }: { cents: number }) {
  const { bg, fg, bill } = unitStyle(cents)
  return (
    <span
      aria-hidden="true"
      className={`grid place-items-center text-sm font-extrabold ${
        bill ? 'h-9 w-16 rounded-md' : 'h-12 w-12 rounded-full'
      }`}
      style={{ backgroundColor: bg, color: fg, border: `2px solid ${fg}22` }}
    >
      {unitLabel(cents)}
    </span>
  )
}

export function MoneyCoins({ units }: { units: number[] }) {
  return (
    <div
      className="flex max-w-[300px] flex-wrap items-center justify-center gap-2"
      aria-label={`Pièces et billets : ${units.map(unitLabel).join(', ')}`}
    >
      {units.map((u, i) => (
        <Token key={i} cents={u} />
      ))}
    </div>
  )
}
