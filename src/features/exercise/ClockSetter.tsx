// Horloge interactive pour « régler l'heure ». La grande aiguille se règle en
// glissant (aimantation à 5 min) ; l'heure via les boutons ±. La petite
// aiguille est COUPLÉE (elle suit h ET m → position continue entre les chiffres).
// Le parent réinitialise via `key` à chaque nouvel essai.

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Button } from '@/components/Button'
import { ClockFace } from './ClockFace'

type ClockSetterProps = {
  status: 'neutral' | 'correct' | 'wrong'
  onValidate: (correct: boolean) => void
  targetHours: number
  targetMinutes: number
}

const stepBtn =
  'grid h-11 w-11 place-items-center rounded-full bg-card text-2xl font-extrabold text-ink ' +
  'shadow-candy-sm transition-transform active:translate-y-[2px] focus-visible:outline-none ' +
  'focus-visible:ring-4 focus-visible:ring-primary/40 disabled:opacity-50'

export function ClockSetter({ status, onValidate, targetHours, targetMinutes }: ClockSetterProps) {
  const [hours, setHours] = useState(12)
  const [minutes, setMinutes] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const locked = status !== 'neutral'

  const stepHours = (d: number) => !locked && setHours((h) => ((h - 1 + d + 12) % 12) + 1)
  const stepMinutes = (d: number) => !locked && setMinutes((m) => (m + d * 5 + 60) % 60)

  // Glisser la grande aiguille : on lit l'angle du pointeur, aimanté à 5 min.
  const dragMinute = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (locked) return
    const el = wrapRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    let angle = (Math.atan2(dx, -dy) * 180) / Math.PI // 0 = midi, sens horaire
    if (angle < 0) angle += 360
    setMinutes((Math.round(angle / 6 / 5) * 5) % 60) // 6°/min, aimanté à 5 min
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={wrapRef}
        className="touch-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          dragMinute(e)
        }}
        onPointerMove={(e) => e.buttons === 1 && dragMinute(e)}
      >
        <ClockFace hours={hours} minutes={minutes} size={230} title="Horloge à régler" />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Heure en arrière" className={stepBtn} disabled={locked} onClick={() => stepHours(-1)}>
            −
          </button>
          <span className="w-16 text-center text-lg font-extrabold text-muted">Heure</span>
          <button type="button" aria-label="Heure en avant" className={stepBtn} disabled={locked} onClick={() => stepHours(1)}>
            +
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Minutes en arrière" className={stepBtn} disabled={locked} onClick={() => stepMinutes(-1)}>
            −
          </button>
          <span className="w-16 text-center text-lg font-extrabold text-muted">Minutes</span>
          <button type="button" aria-label="Minutes en avant" className={stepBtn} disabled={locked} onClick={() => stepMinutes(1)}>
            +
          </button>
        </div>
      </div>

      <Button disabled={locked} onClick={() => onValidate(hours === targetHours && minutes === targetMinutes)}>
        Valider 🐾
      </Button>
    </div>
  )
}
