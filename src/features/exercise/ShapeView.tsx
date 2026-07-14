// Rendu SVG des figures planes et des paires de droites (indices de géométrie).

import type { ReactNode } from 'react'

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
