// Pavé numérique pour la saisie (types « input » et « gap »). Gros chiffres,
// bouton effacer et bouton valider. Contrôlé par le parent (valeur + callbacks).

type NumberPadProps = {
  value: string
  status: 'neutral' | 'correct' | 'wrong'
  onChange: (value: string) => void
  onValidate: () => void
  maxLength?: number
}

const KEY =
  'min-h-[56px] rounded-btn-sm bg-card text-[28px] font-extrabold text-ink shadow-candy-sm ' +
  'transition-transform active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-4 ' +
  'focus-visible:ring-primary/40 disabled:opacity-50'

export function NumberPad({ value, status, onChange, onValidate, maxLength = 3 }: NumberPadProps) {
  const locked = status !== 'neutral'
  const press = (digit: string) => {
    if (locked || value.length >= maxLength) return
    onChange(value + digit)
  }
  const erase = () => {
    if (locked) return
    onChange(value.slice(0, -1))
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* Zone d'affichage de la réponse en cours. */}
      <div
        aria-live="polite"
        className="grid min-h-[56px] place-items-center rounded-btn-sm border-[3px] border-hairline bg-cream text-[34px] font-extrabold text-ink"
      >
        {value === '' ? <span className="text-muted">…</span> : value}
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} type="button" className={KEY} disabled={locked} onClick={() => press(d)}>
            {d}
          </button>
        ))}
        <button
          type="button"
          className={`${KEY} text-[22px]`}
          disabled={locked || value === ''}
          onClick={erase}
          aria-label="Effacer"
        >
          ⌫
        </button>
        <button key="0" type="button" className={KEY} disabled={locked} onClick={() => press('0')}>
          0
        </button>
        <button
          type="button"
          onClick={onValidate}
          disabled={locked || value === ''}
          aria-label="Valider"
          className="min-h-[56px] rounded-btn-sm bg-primary text-[24px] font-extrabold text-white shadow-candy-primary transition-transform active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 disabled:opacity-50"
        >
          OK
        </button>
      </div>
    </div>
  )
}
