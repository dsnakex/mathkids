// Cadran d'horloge SVG. POINT CRITIQUE : la petite aiguille (heures) est
// dessinée à son angle CONTINU (elle voyage entre les chiffres aux demies et
// aux quarts). Utilisé pour lire (statique) comme pour régler (interactif).

import { smallHandAngle, bigHandAngle } from '@/engine/generators/time'

const C = 100 // centre dans un viewBox 200×200

// Point sur le cadran à `angle` degrés (0 = midi, sens horaire) et rayon `r`.
function polar(angle: number, r: number): { x: number; y: number } {
  const rad = (angle * Math.PI) / 180
  return { x: C + r * Math.sin(rad), y: C - r * Math.cos(rad) }
}

type ClockFaceProps = {
  hours: number
  minutes: number
  size?: number
  minuteTicks?: boolean // graduations des minutes (palier 5 min)
  title?: string
}

export function ClockFace({ hours, minutes, size = 220, minuteTicks = false, title }: ClockFaceProps) {
  const hour = polar(smallHandAngle(hours, minutes), 48)
  const minute = polar(bigHandAngle(minutes), 74)

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={title ?? `Horloge affichant ${hours} heures ${minutes}`}
    >
      {/* Cadran « assiette ». */}
      <circle cx={C} cy={C} r={94} fill="#FFFFFF" stroke="#E8DCC4" strokeWidth={8} />
      <circle cx={C} cy={C} r={94} fill="none" stroke="#D9C9A8" strokeWidth={2} />

      {/* Graduations des minutes (discrètes) au palier 5 min. */}
      {minuteTicks
        ? Array.from({ length: 60 }, (_, i) => {
            const p1 = polar(i * 6, 88)
            const p2 = polar(i * 6, i % 5 === 0 ? 80 : 84)
            return (
              <line
                key={i}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#D3C6AC"
                strokeWidth={i % 5 === 0 ? 2 : 1}
              />
            )
          })
        : null}

      {/* Chiffres 1 à 12. */}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1
        const p = polar(n * 30, 72)
        return (
          <text
            key={n}
            x={p.x}
            y={p.y + 7}
            textAnchor="middle"
            fontSize={20}
            fontWeight={800}
            fill="#4A4038"
          >
            {n}
          </text>
        )
      })}

      {/* Grande aiguille (minutes) : fine, sombre. */}
      <line x1={C} y1={C} x2={minute.x} y2={minute.y} stroke="#4A4038" strokeWidth={4} strokeLinecap="round" />
      {/* Petite aiguille (heures) : épaisse, couleur d'accent, angle CONTINU. */}
      <line x1={C} y1={C} x2={hour.x} y2={hour.y} stroke="#C25A38" strokeWidth={7} strokeLinecap="round" />
      <circle cx={C} cy={C} r={6} fill="#C25A38" />
    </svg>
  )
}
