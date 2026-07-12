// Grille de réponses d'un QCM (2 colonnes), fidèle aux maquettes (turn 10).
// Grandes cibles (≥ 72 px), relief « bonbon ». États : neutre, bonne réponse
// (vert, autres estompées), erreur douce (gingembre rosé sur le choix fautif).

export type AnswerStatus = 'neutral' | 'correct' | 'wrong'

type AnswerGridProps = {
  choices: string[]
  correctIndex: number
  selected: number | null
  status: AnswerStatus
  onSelect: (index: number) => void
}

const BASE =
  'min-h-[72px] rounded-[26px] border-[3px] font-extrabold text-[34px] leading-none ' +
  'transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 ' +
  'disabled:cursor-default'

function classesFor(
  index: number,
  correctIndex: number,
  selected: number | null,
  status: AnswerStatus,
): string {
  const neutral = 'border-transparent bg-card text-ink shadow-candy active:translate-y-[3px]'
  if (status === 'correct') {
    return index === correctIndex
      ? 'border-success bg-success-soft text-success-text shadow-[0_5px_0_#A9C487]'
      : `${neutral} opacity-50`
  }
  if (status === 'wrong' && index === selected) {
    return 'border-error bg-error-soft text-ink shadow-[0_5px_0_#E5C3BA]'
  }
  return neutral
}

export function AnswerGrid({ choices, correctIndex, selected, status, onSelect }: AnswerGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3.5">
      {choices.map((choice, index) => (
        <button
          key={`${index}-${choice}`}
          type="button"
          disabled={status !== 'neutral'}
          onClick={() => onSelect(index)}
          className={`${BASE} ${classesFor(index, correctIndex, selected, status)}`}
        >
          {choice}
          {status === 'correct' && index === correctIndex ? (
            <span aria-hidden="true"> ✓</span>
          ) : null}
        </button>
      ))}
    </div>
  )
}
