// Indices visuels des exercices « visual » (manipulation visuelle CP) :
// compter des objets, lire une droite graduée, lire une horloge. Purement
// illustratif (aria-hidden) : la réponse se donne via le QCM associé.

import type { VisualHint } from '@/engine/generators/types'
import { ClockFace } from './ClockFace'

function Count({ objects }: { objects: number }) {
  return (
    <div aria-hidden="true" className="flex max-w-[280px] flex-wrap justify-center gap-1 text-[28px]">
      {Array.from({ length: objects }, (_, i) => (
        <span key={i}>🍙</span>
      ))}
    </div>
  )
}

function NumberLine({ max, step, marker }: { max: number; step: number; marker: number }) {
  const W = 300
  const pad = 16
  const x = (v: number) => pad + (v / max) * (W - 2 * pad)
  const ticks: number[] = []
  for (let v = 0; v <= max; v += step) ticks.push(v)

  return (
    <svg viewBox={`0 0 ${W} 64`} width="100%" role="img" aria-label="Droite graduée" className="max-w-[320px]">
      <line x1={pad} y1={44} x2={W - pad} y2={44} stroke="#847C6C" strokeWidth={3} strokeLinecap="round" />
      {ticks.map((v) => (
        <line key={v} x1={x(v)} y1={38} x2={x(v)} y2={50} stroke="#847C6C" strokeWidth={2} />
      ))}
      {/* Repères chiffrés seulement aux extrémités (l'enfant lit le repère marqué). */}
      <text x={x(0)} y={62} textAnchor="middle" fontSize={12} fill="#847C6C" fontWeight={700}>0</text>
      <text x={x(max)} y={62} textAnchor="middle" fontSize={12} fill="#847C6C" fontWeight={700}>{max}</text>
      {/* Flèche « ? » sur le nombre à trouver. */}
      <polygon points={`${x(marker)},34 ${x(marker) - 7},20 ${x(marker) + 7},20`} fill="#C25A38" />
      <text x={x(marker)} y={14} textAnchor="middle" fontSize={14} fill="#C25A38" fontWeight={800}>?</text>
    </svg>
  )
}

export function VisualHintView({ hint }: { hint: VisualHint }) {
  switch (hint.kind) {
    case 'count':
      return <Count objects={hint.objects} />
    case 'numberline':
      return <NumberLine max={hint.max} step={hint.step} marker={hint.marker} />
    case 'clock':
      return (
        <ClockFace
          hours={hint.hours}
          minutes={hint.minutes}
          size={200}
          minuteTicks={hint.minutes % 15 !== 0}
        />
      )
  }
}
