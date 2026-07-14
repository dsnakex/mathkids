// Rendu SVG des figures planes et des paires de droites (indices de géométrie).

import type { ReactNode } from 'react'
import { SOLIDS_3D } from '@/engine/generators/geometry'

const FILL = '#F7D9CB'
const STROKE = '#C25A38'

function Frame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 120 120" width="150" height="150" role="img" aria-label={label}>
      {children}
    </svg>
  )
}

const shapeProps = { fill: FILL, stroke: STROKE, strokeWidth: 4, strokeLinejoin: 'round' as const }

export function ShapeView({ shape }: { shape: string }) {
  switch (shape) {
    case 'carre':
      return (
        <Frame label="un carré">
          <rect x={22} y={22} width={76} height={76} {...shapeProps} />
        </Frame>
      )
    case 'rectangle':
      return (
        <Frame label="un rectangle">
          <rect x={12} y={35} width={96} height={50} {...shapeProps} />
        </Frame>
      )
    case 'triangle':
      return (
        <Frame label="un triangle">
          <polygon points="60,18 18,102 102,102" {...shapeProps} />
        </Frame>
      )
    case 'triangle-rectangle':
      return (
        <Frame label="un triangle rectangle">
          <polygon points="24,20 24,100 104,100" {...shapeProps} />
          {/* Petit carré marquant l'angle droit. */}
          <rect x={24} y={86} width={14} height={14} fill="none" stroke={STROKE} strokeWidth={2} />
        </Frame>
      )
    default:
      return (
        <Frame label="un cercle">
          <circle cx={60} cy={60} r={44} {...shapeProps} />
        </Frame>
      )
  }
}

export function SolidView({ solid }: { solid: string }) {
  const s = SOLIDS_3D.find((x) => x.id === solid) ?? SOLIDS_3D[0]
  return (
    <span role="img" aria-label={s.name} className="text-[80px] leading-none">
      {s.emoji}
    </span>
  )
}

export function RulerView({ cm, max }: { cm: number; max: number }) {
  const x0 = 12
  const span = 216
  const scale = span / max
  return (
    <svg viewBox="0 0 240 80" width="240" height="80" role="img" aria-label={`un trait de ${cm} cm`}>
      {/* Trait à mesurer. */}
      <line x1={x0} y1={26} x2={x0 + cm * scale} y2={26} stroke={STROKE} strokeWidth={6} strokeLinecap="round" />
      {/* Règle graduée. */}
      <rect x={x0} y={44} width={span} height={22} fill="#FFFDF7" stroke="#847C6C" strokeWidth={2} />
      {Array.from({ length: max + 1 }, (_, i) => (
        <line key={i} x1={x0 + i * scale} y1={44} x2={x0 + i * scale} y2={i % 5 === 0 ? 54 : 50} stroke="#847C6C" strokeWidth={1} />
      ))}
      {Array.from({ length: Math.floor(max / 5) + 1 }, (_, i) => (
        <text key={i} x={x0 + i * 5 * scale} y={78} textAnchor="middle" fontSize={9} fill="#847C6C">
          {i * 5}
        </text>
      ))}
    </svg>
  )
}

export function BarsView({ lengths }: { lengths: number[] }) {
  const max = Math.max(...lengths, 1)
  return (
    <svg viewBox="0 0 220 120" width="220" height="120" role="img" aria-label="des traits à comparer">
      {lengths.map((len, i) => {
        const y = 20 + i * 34
        return (
          <g key={i}>
            <text x={8} y={y + 14} fontSize={16} fontWeight={800} fill="#4A4038">
              {['A', 'B', 'C'][i]}
            </text>
            <line x1={30} y1={y + 9} x2={30 + (len / max) * 170} y2={y + 9} stroke={STROKE} strokeWidth={8} strokeLinecap="round" />
          </g>
        )
      })}
    </svg>
  )
}

export function PositionView({ where }: { where: 'gauche' | 'droite' | 'dessus' | 'dessous' }) {
  const pos: Record<string, { x: number; y: number }> = {
    gauche: { x: 20, y: 70 },
    droite: { x: 120, y: 70 },
    dessus: { x: 70, y: 20 },
    dessous: { x: 70, y: 120 },
  }
  const p = pos[where]
  return (
    <svg viewBox="0 0 160 160" width="160" height="160" role="img" aria-label={`le poisson est ${where} de la boîte`}>
      <rect x={58} y={58} width={44} height={44} rx={6} fill={FILL} stroke={STROKE} strokeWidth={4} />
      <text x={p.x} y={p.y} fontSize={30}>
        🐟
      </text>
    </svg>
  )
}

export function GridView({ cols, rows, col, row }: { cols: number; rows: number; col: number; row: number }) {
  const cell = 30
  const pad = 16
  const W = cols * cell + pad
  const H = rows * cell + pad
  const letters = 'ABCDEF'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={`case ${letters[col]}${row + 1}`}>
      {Array.from({ length: cols }, (_, c) =>
        Array.from({ length: rows }, (_, r) => (
          <rect key={`${c},${r}`} x={pad + c * cell} y={r * cell} width={cell} height={cell} fill="#FFFDF7" stroke="#D3C6AC" strokeWidth={1} />
        )),
      )}
      {Array.from({ length: cols }, (_, c) => (
        <text key={c} x={pad + c * cell + cell / 2} y={rows * cell + 12} textAnchor="middle" fontSize={11} fontWeight={700} fill="#847C6C">
          {letters[c]}
        </text>
      ))}
      {Array.from({ length: rows }, (_, r) => (
        <text key={r} x={8} y={r * cell + cell / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#847C6C">
          {r + 1}
        </text>
      ))}
      <text x={pad + col * cell + cell / 2} y={row * cell + cell / 2 + 8} textAnchor="middle" fontSize={18}>
        🐟
      </text>
    </svg>
  )
}

export function LinesView({ relation }: { relation: 'perpendiculaires' | 'paralleles' | 'secantes' }) {
  const line = { stroke: STROKE, strokeWidth: 5, strokeLinecap: 'round' as const }
  return (
    <Frame label={`deux droites ${relation}`}>
      {relation === 'paralleles' ? (
        <>
          <line x1={12} y1={45} x2={108} y2={45} {...line} />
          <line x1={12} y1={78} x2={108} y2={78} {...line} />
        </>
      ) : relation === 'perpendiculaires' ? (
        <>
          <line x1={12} y1={60} x2={108} y2={60} {...line} />
          <line x1={60} y1={12} x2={60} y2={108} {...line} />
        </>
      ) : (
        <>
          <line x1={14} y1={30} x2={106} y2={96} {...line} />
          <line x1={14} y1={96} x2={106} y2={40} {...line} />
        </>
      )}
    </Frame>
  )
}
