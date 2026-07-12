import { useRef, useState, type ReactNode } from 'react'
import type { Exercise } from '@/engine/generators/types'
import { AudioButton } from '@/components/AudioButton'
import { NekoSushi } from '@/components/NekoSushi'
import { speak } from '@/utils/speech'
import { consigne, correctAnswerText, spokenPrompt } from './present'
import { AnswerGrid, type AnswerStatus } from './AnswerGrid'
import { NumberPad } from './NumberPad'
import { Confetti } from './Confetti'

type ExerciseViewProps = {
  exercise: Exercise
  index: number // position 0-based dans la session
  total: number
  profileName: string
  /** Appelé quand l'enfant passe à la suite ; `firstTryCorrect` = 1er essai réussi. */
  onContinue: (firstTryCorrect: boolean) => void
}

// Écran d'un exercice (turn 10 des maquettes). Gère localement la sélection, le
// feedback (neutre / bonne réponse / erreur douce) et le réessai. Le résultat
// du PREMIER essai est remonté au parent pour l'adaptation et le score.
export function ExerciseView({ exercise, index, total, profileName, onContinue }: ExerciseViewProps) {
  const [status, setStatus] = useState<AnswerStatus>('neutral')
  const [selected, setSelected] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const firstTry = useRef<boolean | null>(null)

  const commit = (correct: boolean) => {
    if (firstTry.current === null) firstTry.current = correct
    setStatus(correct ? 'correct' : 'wrong')
  }
  const retry = () => {
    setStatus('neutral')
    setSelected(null)
    setInput('')
  }

  const gaugePct = (index / total) * 100

  return (
    <main className="relative flex min-h-full flex-col gap-3.5 bg-cream p-5 font-sans text-ink">
      {status === 'correct' ? <Confetti /> : null}

      {/* En-tête : mascotte + jauge « bol de riz » + progression. */}
      <div className="flex items-center gap-2.5">
        <NekoSushi variant="chef" size={42} />
        <span aria-hidden="true" className="text-xl">🍚</span>
        <div
          role="progressbar"
          aria-label="Progression de la séance"
          aria-valuenow={index}
          aria-valuemin={0}
          aria-valuemax={total}
          className="h-[18px] flex-1 overflow-hidden rounded-full border-2 border-track-border bg-track"
        >
          <div
            className="h-full rounded-full bg-track-fill transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${gaugePct}%` }}
          />
        </div>
        <span className="text-lg font-extrabold">
          {index + 1}/{total}
        </span>
      </div>

      {/* Consigne + bouton audio (patte de chat). */}
      <div className="flex items-center gap-3">
        <AudioButton label="Écouter la consigne" onClick={() => speak(spokenPrompt(exercise))} />
        <p className="text-[21px] font-extrabold">{consigne(exercise)}</p>
      </div>

      {/* Carte question : le grand énoncé. */}
      <div className="rounded-card-lg bg-card px-5 pb-5 pt-[22px] text-center shadow-[0_4px_0_rgba(0,0,0,0.06)]">
        <div className="text-[44px] font-extrabold leading-tight">{exercise.prompt}</div>
      </div>

      {/* Zone de réponse selon le type. */}
      {exercise.type === 'qcm' ? (
        <AnswerGrid
          choices={exercise.choices}
          correctIndex={exercise.correctIndex}
          selected={selected}
          status={status}
          onSelect={(i) => {
            setSelected(i)
            commit(i === exercise.correctIndex)
          }}
        />
      ) : exercise.type === 'truefalse' ? (
        <TrueFalseButtons status={status} onChoose={(v) => commit(v === exercise.answer)} />
      ) : (
        <NumberPad
          value={input}
          status={status}
          onChange={setInput}
          onValidate={() => input !== '' && commit(Number(input) === exercise.answer)}
        />
      )}

      {/* Bas d'écran : invite (neutre) ou feedback + bouton (répondu). */}
      {status === 'neutral' ? (
        <p className="mt-auto text-center text-[17px] font-bold text-muted">Touche ta réponse 🐾</p>
      ) : status === 'correct' ? (
        <div className="mt-auto flex flex-col gap-3.5">
          <FeedbackBanner tone="correct">
            Miam, bravo {profileName} ! Tu as trouvé ⭐
          </FeedbackBanner>
          <PrimaryButton onClick={() => onContinue(firstTry.current ?? true)}>
            Continuer 🥢
          </PrimaryButton>
        </div>
      ) : (
        <div className="mt-auto flex flex-col gap-3.5">
          <FeedbackBanner tone="wrong">
            Presque ! La bonne réponse est {correctAnswerText(exercise)} 🍣
          </FeedbackBanner>
          <PrimaryButton onClick={retry}>Réessayer 🐾</PrimaryButton>
        </div>
      )}
    </main>
  )
}

function TrueFalseButtons({
  status,
  onChoose,
}: {
  status: AnswerStatus
  onChoose: (value: boolean) => void
}) {
  const base =
    'min-h-[72px] flex-1 rounded-[26px] border-[3px] border-transparent bg-card text-[28px] ' +
    'font-extrabold text-ink shadow-candy transition-transform active:translate-y-[3px] ' +
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 disabled:opacity-50'
  return (
    <div className="flex gap-3.5">
      <button type="button" disabled={status !== 'neutral'} onClick={() => onChoose(true)} className={base}>
        <span aria-hidden="true">👍 </span>Vrai
      </button>
      <button type="button" disabled={status !== 'neutral'} onClick={() => onChoose(false)} className={base}>
        <span aria-hidden="true">👎 </span>Faux
      </button>
    </div>
  )
}

function FeedbackBanner({ tone, children }: { tone: 'correct' | 'wrong'; children: ReactNode }) {
  const box =
    tone === 'correct'
      ? 'border-success bg-success-soft text-success-text'
      : 'border-error bg-error-soft text-error-text'
  return (
    <div className={`flex items-center gap-2.5 rounded-card border-[3px] p-3 ${box}`}>
      <div className={tone === 'correct' ? 'mk-pulse flex-none' : 'flex-none'}>
        <NekoSushi variant="chef" size={40} />
      </div>
      <p className="text-lg font-extrabold">{children}</p>
    </div>
  )
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[52px] rounded-btn bg-primary py-4 text-[21px] font-extrabold text-white shadow-candy-primary transition-transform active:translate-y-[3px] active:shadow-candy-primary-pressed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
    >
      {children}
    </button>
  )
}
