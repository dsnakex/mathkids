// Réponse « ranger » : l'enfant tape les nombres du plus petit au plus grand.
// Quand tous sont placés, on valide la séquence. Le parent réinitialise ce
// composant (via `key`) pour un nouvel essai.

import { useEffect, useRef, useState } from 'react'

type OrderPadProps = {
  values: number[]
  answer: number[]
  status: 'neutral' | 'correct' | 'wrong'
  onResult: (correct: boolean) => void
}

export function OrderPad({ values, answer, status, onResult }: OrderPadProps) {
  const [chosen, setChosen] = useState<number[]>([])
  const fired = useRef(false)
  const done = chosen.length === values.length

  useEffect(() => {
    if (done && !fired.current) {
      fired.current = true
      onResult(chosen.every((v, i) => v === answer[i]))
    }
  }, [done, chosen, answer, onResult])

  const remaining = values.filter((v) => !chosen.includes(v))
  const locked = status !== 'neutral'

  return (
    <div className="flex flex-col gap-3">
      {/* Séquence en construction. */}
      <div className="flex min-h-[56px] flex-wrap items-center justify-center gap-2 rounded-btn-sm border-[3px] border-hairline bg-cream p-2">
        {chosen.length === 0 ? (
          <span className="text-base font-bold text-muted">Tape dans l'ordre…</span>
        ) : (
          chosen.map((v, i) => (
            <span
              key={`${v}-${i}`}
              className="grid h-11 w-11 place-items-center rounded-btn-sm bg-success-soft text-[22px] font-extrabold text-success-text"
            >
              {v}
            </span>
          ))
        )}
      </div>

      {/* Nombres à placer. */}
      <div className="flex flex-wrap justify-center gap-2.5">
        {remaining.map((v) => (
          <button
            key={v}
            type="button"
            disabled={locked}
            onClick={() => setChosen((c) => [...c, v])}
            className="grid h-[60px] w-[60px] place-items-center rounded-btn-sm bg-card text-[30px] font-extrabold text-ink shadow-candy transition-transform active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 disabled:opacity-50"
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}
