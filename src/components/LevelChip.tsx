// Pastille indiquant le niveau scolaire, à la couleur d'accent de « l'île »
// correspondante (voir docs/design-handoff/README.md — accents par niveau).

export type Level = 'cp' | 'ce1' | 'ce2' | 'cm1' | 'cm2'

const LEVEL_LABEL: Record<Level, string> = {
  cp: 'CP',
  ce1: 'CE1',
  ce2: 'CE2',
  cm1: 'CM1',
  cm2: 'CM2',
}

// Classes de fond dédiées par niveau (définies dans tailwind.config.js).
const LEVEL_BG: Record<Level, string> = {
  cp: 'bg-cp',
  ce1: 'bg-ce1',
  ce2: 'bg-ce2',
  cm1: 'bg-cm1',
  cm2: 'bg-cm2',
}

type LevelChipProps = {
  level: Level
  className?: string
}

export function LevelChip({ level, className = '' }: LevelChipProps) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-0.5 text-base font-bold text-white ${LEVEL_BG[level]} ${className}`}
    >
      {LEVEL_LABEL[level]}
    </span>
  )
}
