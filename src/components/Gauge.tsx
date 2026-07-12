// Jauge de progression (session, maîtrise par domaine…). Piste sable +
// remplissage vert. Accessible : expose sa valeur via role="progressbar".
type GaugeProps = {
  /** Progression de 0 à 100. */
  value: number
  /** Libellé lu par les lecteurs d'écran, ex. « Progression de la séance ». */
  label?: string
  className?: string
}

export function Gauge({ value, label, className = '' }: GaugeProps) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`h-4 overflow-hidden rounded-full bg-track ${className}`}
    >
      <div
        className="h-full rounded-full bg-success transition-[width] duration-300 motion-reduce:transition-none"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
