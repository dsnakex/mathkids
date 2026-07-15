// Zone de réponse d'un problème rédigé : indices en 2 temps (révélés à la
// demande, AUCUN malus), explication bienveillante à l'erreur, et saisie au pavé
// (MoneyPad si la réponse est un montant en euros). Réinitialisé via `key`.

import { useState } from 'react'
import type { ProblemExercise } from '@/engine/generators/types'
import { parseEuros } from '@/engine/generators/money'
import { Button } from '@/components/Button'
import { NumberPad } from './NumberPad'
import { MoneyPad } from './MoneyPad'
import { BarSchemaView } from './BarSchemaView'

type ProblemAnswerProps = {
  exercise: ProblemExercise
  status: 'neutral' | 'correct' | 'wrong'
  onCommit: (correct: boolean) => void
}

export function ProblemAnswer({ exercise, status, onCommit }: ProblemAnswerProps) {
  const [revealed, setRevealed] = useState(0)
  const [input, setInput] = useState('')
  const locked = status !== 'neutral'

  return (
    <div className="flex flex-col gap-3">
      {/* Indices déjà révélés : le 1er montre le schéma en barres (s'il existe). */}
      {revealed > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {exercise.hints.slice(0, revealed).map((hint, i) => (
            <li key={i} className="rounded-card bg-gold/25 px-3 py-2 text-base font-bold text-ink">
              {i === 0 && exercise.schema ? (
                <span className="mb-1.5 flex justify-center">
                  <BarSchemaView schema={exercise.schema} />
                </span>
              ) : null}
              💡 {hint}
            </li>
          ))}
        </ul>
      ) : null}

      {/* Demander un indice (2 temps), sans pénalité. */}
      {!locked && revealed < exercise.hints.length ? (
        <Button variant="ghost" onClick={() => setRevealed((r) => r + 1)}>
          {revealed === 0 ? "Besoin d'un indice ? 💡" : 'Un autre indice 💡'}
        </Button>
      ) : null}

      {/* Explication à l'erreur. */}
      {status === 'wrong' ? (
        <p className="rounded-card bg-error-soft px-3 py-2 text-base font-bold text-error-text">
          {exercise.explanation}
        </p>
      ) : null}

      {/* Saisie de la réponse. */}
      {exercise.answerFormat === 'euros' ? (
        <MoneyPad status={status} onValidate={(text) => onCommit(parseEuros(text) === exercise.answer)} />
      ) : (
        <NumberPad
          value={input}
          status={status}
          onChange={setInput}
          onValidate={() => input !== '' && onCommit(Number(input) === exercise.answer)}
        />
      )}
    </div>
  )
}
