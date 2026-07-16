// Mini-jeu de calcul mental (SPECIFICATIONS §7) : « course contre la montre
// douce ». Mode ZEN par défaut (10 questions, sans chrono — seul mode au
// CP-CE1) ; mode CHRONO optionnel dès le CE2 (1 minute, jauge discrète, pas de
// compte à rebours anxiogène). Jamais de pénalité : chaque bonne réponse
// rapporte un grain de riz, les erreurs passent simplement à la suite.

import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/app/store'
import { mulberry32, type Rng } from '@/engine/generators/rng'
import type { QcmExercise } from '@/engine/generators/types'
import {
  chronoAllowed,
  nextMinigameQuestion,
  MINIGAME_CHRONO_SECONDS,
  MINIGAME_ZEN_QUESTIONS,
} from '@/engine/minigame'
import { Button } from '@/components/Button'
import { AudioButton } from '@/components/AudioButton'
import { NekoSushi } from '@/components/NekoSushi'
import { speak } from '@/utils/speech'

type Mode = 'zen' | 'chrono'
type Phase = 'intro' | 'play' | 'end'

const FEEDBACK_MS = 700

export function MiniGameScreen() {
  const profiles = useAppStore((s) => s.profiles)
  const profileId = useAppStore((s) => s.profileId)
  const goMap = useAppStore((s) => s.goMap)
  const rewardMinigame = useAppStore((s) => s.rewardMinigame)

  const profile = profiles.find((p) => p.id === profileId)
  const level = profile?.level ?? 'cp'

  const [phase, setPhase] = useState<Phase>('intro')
  const [mode, setMode] = useState<Mode>('zen')
  const [question, setQuestion] = useState<QcmExercise | null>(null)
  const [asked, setAsked] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [picked, setPicked] = useState<number | null>(null) // réponse en cours de feedback
  const [secondsLeft, setSecondsLeft] = useState(MINIGAME_CHRONO_SECONDS)

  const rng = useRef<Rng>(mulberry32((Date.now() >>> 0) || 1))
  const timeout = useRef<number | undefined>(undefined)

  const start = (m: Mode) => {
    setMode(m)
    setAsked(0)
    setCorrect(0)
    setPicked(null)
    setSecondsLeft(MINIGAME_CHRONO_SECONDS)
    setQuestion(nextMinigameQuestion(level, rng.current))
    setPhase('play')
  }

  // Chrono doux : décompte seulement en jeu, fin de partie à zéro.
  useEffect(() => {
    if (phase !== 'play' || mode !== 'chrono') return
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id)
          setPhase('end')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [phase, mode])

  // Récompense créditée UNE fois, à l'arrivée sur l'écran de fin.
  useEffect(() => {
    if (phase === 'end') void rewardMinigame(correct)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Nettoie le timeout de feedback si on quitte en plein jeu.
  useEffect(() => () => window.clearTimeout(timeout.current), [])

  const answer = (index: number) => {
    if (picked !== null || !question) return
    setPicked(index)
    const good = index === question.correctIndex
    if (good) setCorrect((c) => c + 1)
    const nextAsked = asked + 1
    timeout.current = window.setTimeout(() => {
      setPicked(null)
      setAsked(nextAsked)
      if (mode === 'zen' && nextAsked >= MINIGAME_ZEN_QUESTIONS) {
        setPhase('end')
      } else {
        setQuestion(nextMinigameQuestion(level, rng.current))
      }
    }, FEEDBACK_MS)
  }

  // --- Intro ------------------------------------------------------------------
  if (phase === 'intro') {
    return (
      <main className="flex min-h-full flex-col items-center justify-center gap-5 bg-cream p-6 text-center font-sans text-ink">
        <div className="mk-pulse">
          <NekoSushi variant="chef" size={100} title="Le chef propose un défi" />
        </div>
        <h1 className="text-[26px] font-extrabold">Défi calcul 🐾</h1>
        <p className="max-w-sm text-lg font-bold text-muted">
          Réponds à des petits calculs de tête. Chaque bonne réponse te donne un grain de riz 🍚 —
          et on ne perd jamais rien !
        </p>
        <div className="flex flex-col items-center gap-2">
          <Button onClick={() => start('zen')}>Mode zen — {MINIGAME_ZEN_QUESTIONS} questions 🍵</Button>
          {chronoAllowed(level) ? (
            <Button variant="ghost" onClick={() => start('chrono')}>
              Course douce — 1 minute ⏳
            </Button>
          ) : null}
          <Button variant="ghost" onClick={goMap}>
            Retour à la carte
          </Button>
        </div>
      </main>
    )
  }

  // --- Fin --------------------------------------------------------------------
  if (phase === 'end') {
    return (
      <main className="flex min-h-full flex-col items-center justify-center gap-5 bg-cream p-6 text-center font-sans text-ink">
        <div className="mk-pulse">
          <NekoSushi variant="chef" size={100} title="Le chef félicite" />
        </div>
        <h1 className="text-[26px] font-extrabold">Bien joué, {profile?.name ?? ''} ! 🎉</h1>
        <p className="text-xl font-extrabold">
          {correct} bonne{correct > 1 ? 's' : ''} réponse{correct > 1 ? 's' : ''} · 🍚 +{correct}
        </p>
        <p className="max-w-sm text-lg font-bold text-muted">
          {correct >= asked && asked > 0
            ? 'Sans faute — le chef est impressionné !'
            : 'Chaque partie te rend plus rapide. Reviens quand tu veux !'}
        </p>
        <div className="flex flex-col items-center gap-2">
          <Button onClick={() => setPhase('intro')}>Encore ! 🥢</Button>
          <Button variant="ghost" onClick={goMap}>
            Retour à la carte
          </Button>
        </div>
      </main>
    )
  }

  // --- Jeu --------------------------------------------------------------------
  if (!question) return null
  const chronoRatio = secondsLeft / MINIGAME_CHRONO_SECONDS

  return (
    <main className="flex min-h-full flex-col gap-4 bg-cream p-5 font-sans text-ink">
      <header className="flex items-center gap-3">
        <Button variant="ghost" onClick={goMap} aria-label="Quitter le défi">
          ✕
        </Button>
        {mode === 'chrono' ? (
          // Jauge discrète (pas de gros compte à rebours) — course DOUCE.
          <div
            className="h-[14px] flex-1 overflow-hidden rounded-full border-2 border-track-border bg-track"
            role="progressbar"
            aria-label="Temps restant"
            aria-valuenow={secondsLeft}
            aria-valuemin={0}
            aria-valuemax={MINIGAME_CHRONO_SECONDS}
          >
            <div
              className="h-full rounded-full bg-gold transition-[width] duration-1000 ease-linear"
              style={{ width: `${chronoRatio * 100}%` }}
            />
          </div>
        ) : (
          <p className="flex-1 text-center text-base font-extrabold text-muted">
            {asked + 1}/{MINIGAME_ZEN_QUESTIONS}
          </p>
        )}
        <p className="text-base font-extrabold">🍚 {correct}</p>
      </header>

      <div className="flex items-center justify-center gap-2">
        <AudioButton label="Écouter le calcul" onClick={() => speak(question.prompt)} />
        <p className="text-center text-[24px] font-extrabold">{question.prompt}</p>
      </div>

      <div className="grid flex-1 grid-cols-2 content-center gap-3">
        {question.choices.map((choice, i) => {
          const revealed = picked !== null
          const tone = !revealed
            ? 'bg-card text-ink shadow-candy'
            : i === question.correctIndex
              ? 'bg-success-soft text-success-text ring-4 ring-success'
              : i === picked
                ? 'bg-error-soft text-error-text'
                : 'bg-card text-muted'
          return (
            <button
              key={i}
              type="button"
              onClick={() => answer(i)}
              className={`min-h-[72px] rounded-card text-[26px] font-extrabold transition-transform active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 ${tone}`}
            >
              {choice}
            </button>
          )
        })}
      </div>
    </main>
  )
}
