// Compléter la symétrie : la moitié gauche est donnée (cellules colorées), l'axe
// est vertical au centre ; l'enfant remplit les cellules de droite pour obtenir
// le miroir. On valide l'ensemble des cellules (peu importe l'ordre).

import { useState } from 'react'
import { Button } from '@/components/Button'
import type { SymmetryExercise } from '@/engine/generators/types'

type SymmetryGridProps = {
  exercise: SymmetryExercise
  status: 'neutral' | 'correct' | 'wrong'
  onValidate: (correct: boolean) => void
}

const sameSet = (a: number[], b: number[]) =>
  a.length === b.length && [...a].sort((x, y) => x - y).every((v, i) => v === [...b].sort((x, y) => x - y)[i])

export function SymmetryGrid({ exercise, status, onValidate }: SymmetryGridProps) {
  const { cols, rows, given, target } = exercise
  const half = cols / 2
  const [filled, setFilled] = useState<Set<number>>(new Set())
  const locked = status !== 'neutral'

  const cells = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = r * cols + c
      const isLeft = c < half
      const isGiven = given.includes(cell)
      const isFilled = isLeft ? isGiven : filled.has(cell)
      cells.push(
        <button
          key={cell}
          type="button"
          disabled={locked || isLeft}
          aria-label={`case ligne ${r + 1} colonne ${c + 1}${isFilled ? ' remplie' : ''}`}
          onClick={() =>
            !isLeft &&
            setFilled((prev) => {
              const next = new Set(prev)
              next.has(cell) ? next.delete(cell) : next.add(cell)
              return next
            })
          }
          className={`h-10 w-10 border ${c === half ? 'border-l-[3px] border-l-primary' : 'border-hairline'} ${
            isFilled ? 'bg-primary' : isLeft ? 'bg-cream' : 'bg-card'
          } ${!isLeft && !locked ? 'active:translate-y-[1px]' : ''}`}
        />,
      )
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="grid gap-0 rounded-card border-[3px] border-hairline p-1"
        style={{ gridTemplateColumns: `repeat(${cols}, 2.5rem)` }}
      >
        {cells}
      </div>
      <Button disabled={locked} onClick={() => onValidate(sameSet([...filled], target))}>
        Valider 🐾
      </Button>
    </div>
  )
}
