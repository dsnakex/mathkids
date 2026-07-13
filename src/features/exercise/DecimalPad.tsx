// Pavé de saisie d'un nombre décimal, AVEC la virgule (décimaux CM1-CM2). La
// validation se fait dans ExerciseView via parseDecimal (« 5,9 » = « 5,90 »).
// Réinitialisé via `key` à chaque essai.

import { useState } from 'react'
import { Button } from '@/components/Button'

type DecimalPadProps = {
  status: 'neutral' | 'correct' | 'wrong'
  onValidate: (text: string) => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '⌫']

export function DecimalPad({ status, onValidate }: DecimalPadProps) {
  const [value, setValue] = useState('')
  const locked = status !== 'neutral'

  const press = (k: string) => {
    if (locked) return
    if (k === '⌫') setValue((v) => v.slice(0, -1))
    else if (k === ',') setValue((v) => (v.includes(',') || v === '' ? v : `${v},`))
    else setValue((v) => (v.replace(',', '').length >= 6 ? v : v + k))
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="grid min-h-[56px] min-w-[140px] place-items-center rounded-btn border-[3px] border-hairline bg-cream px-4 text-[30px] font-extrabold text-ink">
        {value === '' ? <span className="text-muted">0</span> : value}
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            disabled={locked}
            aria-label={k === ',' ? 'virgule' : k === '⌫' ? 'effacer' : k}
            onClick={() => press(k)}
            className="grid h-14 w-14 place-items-center rounded-btn-sm bg-card text-[26px] font-extrabold text-ink shadow-candy transition-transform active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 disabled:opacity-50"
          >
            {k}
          </button>
        ))}
      </div>
      <Button disabled={locked || value === ''} onClick={() => onValidate(value)}>
        Valider 🐾
      </Button>
    </div>
  )
}
