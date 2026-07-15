// Schéma en barres (modèle partie-partie-tout) illustrant un problème additif
// (indice visuel, dès le CE1). Les parts se juxtaposent pour former le tout ;
// l'inconnue porte un « ? ». Purement illustratif (la réponse se tape au pavé).

import type { BarSchema } from '@/engine/generators/types'

const FILL_KNOWN = '#F7D9CB'
const FILL_UNKNOWN = '#FFF3D6'
const STROKE = '#C25A38'
const BRACE = '#847C6C'

export function BarSchemaView({ schema }: { schema: BarSchema }) {
  const W = 300
  const H = 96
  const pad = 10
  const barY = 12
  const barH = 40
  const inner = W - 2 * pad
  const totalValue = schema.parts.reduce((s, p) => s + Math.max(p.value, 0), 0) || 1

  // Largeurs proportionnelles, avec un minimum pour rester lisibles/tactiles.
  const minW = 44
  const rawW = schema.parts.map((p) => (Math.max(p.value, 0) / totalValue) * inner)
  const extra = rawW.reduce((s, w) => s + Math.max(0, minW - w), 0)
  const shrink = extra > 0 ? (inner - schema.parts.length * minW) / (inner - extra || 1) : 1
  const widths = rawW.map((w) => (w < minW ? minW : minW + (w - minW) * Math.max(shrink, 0)))

  let x = pad
  const segments = schema.parts.map((p, i) => {
    const w = widths[i]
    const seg = { p, x, w }
    x += w
    return seg
  })
  const braceRight = x

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      className="max-w-[320px]"
      role="img"
      aria-label={`Schéma en barres : ${schema.parts.map((p) => p.label).join(' et ')} pour un tout de ${schema.totalLabel}`}
    >
      {segments.map(({ p, x: sx, w }, i) => (
        <g key={i}>
          <rect
            x={sx}
            y={barY}
            width={w}
            height={barH}
            rx={7}
            fill={p.label === '?' ? FILL_UNKNOWN : FILL_KNOWN}
            stroke={STROKE}
            strokeWidth={3}
            strokeDasharray={p.label === '?' ? '5 4' : undefined}
          />
          <text
            x={sx + w / 2}
            y={barY + barH / 2 + 7}
            textAnchor="middle"
            fontSize={20}
            fontWeight={800}
            fill={STROKE}
          >
            {p.label}
          </text>
        </g>
      ))}

      {/* Accolade du tout, sous les parts. */}
      <path
        d={`M ${pad} ${barY + barH + 8} v 6 H ${braceRight} v -6`}
        fill="none"
        stroke={BRACE}
        strokeWidth={2}
      />
      <text
        x={(pad + braceRight) / 2}
        y={H - 6}
        textAnchor="middle"
        fontSize={17}
        fontWeight={800}
        fill={schema.totalLabel === '?' ? STROKE : BRACE}
      >
        {schema.totalLabel}
      </text>
    </svg>
  )
}
