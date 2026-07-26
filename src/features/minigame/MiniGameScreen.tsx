// Mini-jeu de calcul mental (SPECIFICATIONS §7, chantier G) : « course contre la
// montre douce ». Mode ZEN par défaut (10 questions, sans chrono — seul mode au
// CP-CE1) ; mode CHRONO optionnel dès le CE2. Jamais de pénalité : chaque bonne
// réponse rapporte une croquette d'or, les erreurs passent simplement à la suite.
//
// Chantier G : on peut choisir SON entraînement — une table de multiplication
// précise (ex. « table de 7 ») ou « au hasard » — et l'app mémorise, PAR FAIT,
// ce qui coince (mini-Leitner) pour le reproposer plus souvent. Un tableau « mes
// tables » montre les tables sues (vert) vs à retravailler (orange).

import { useEffect, useRef, useState } from 'react'
import { CroquetteOr } from '@/components/CroquetteOr'
import { useAppStore } from '@/app/store'
import { loadDisplaySettings } from '@/app/settings'
import { useWakeLock } from '@/hooks/useWakeLock'
import { mulberry32, type Rng } from '@/engine/generators/rng'
import type { QcmExercise } from '@/engine/generators/types'
import {
  chronoAllowed,
  nextMinigameQuestion,
  MINIGAME_CHRONO_SECONDS,
  MINIGAME_ZEN_QUESTIONS,
} from '@/engine/minigame'
import {
  applyFactResult,
  factKey,
  factQuestion,
  multiplicationFacts,
  nextFact,
  tablesForLevel,
  tableStatus,
  type Fact,
  type FactState,
} from '@/engine/facts'
import { loadFactStates, saveFactStates } from '@/db/facts'
import { Button } from '@/components/Button'
import { AudioButton } from '@/components/AudioButton'
import { NekoSushi } from '@/components/NekoSushi'
import { speak } from '@/utils/speech'

type Mode = 'zen' | 'chrono'
type Phase = 'intro' | 'play' | 'end'
type Training = { kind: 'random' } | { kind: 'table'; table: number }

const FEEDBACK_MS = 700
/** Au-delà de ce délai, une bonne réponse est jugée « lente » (le fait ne progresse pas). */
const SLOW_MS = 6000

export function MiniGameScreen() {
  const profiles = useAppStore((s) => s.profiles)
  const profileId = useAppStore((s) => s.profileId)
  const goMap = useAppStore((s) => s.goMap)
  const rewardMinigame = useAppStore((s) => s.rewardMinigame)

  const profile = profiles.find((p) => p.id === profileId)
  const level = profile?.level ?? 'cp'
  const tables = tablesForLevel(level)

  // Garde l'écran allumé pendant le Défi calcul (réglage appareil, activé par défaut).
  useWakeLock(loadDisplaySettings().keepScreenAwake)

  const [phase, setPhase] = useState<Phase>('intro')
  const [mode, setMode] = useState<Mode>('zen')
  const [training, setTraining] = useState<Training>({ kind: 'random' })
  const [question, setQuestion] = useState<QcmExercise | null>(null)
  const [asked, setAsked] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [picked, setPicked] = useState<number | null>(null) // réponse en cours de feedback
  const [secondsLeft, setSecondsLeft] = useState(MINIGAME_CHRONO_SECONDS)
  const [factStates, setFactStates] = useState<Record<string, FactState>>({})

  const rng = useRef<Rng>(mulberry32((Date.now() >>> 0) || 1))
  const timeout = useRef<number | undefined>(undefined)
  const factStatesRef = useRef<Record<string, FactState>>({}) // maj en jeu, persisté en fin
  const currentFact = useRef<Fact | null>(null) // fait posé (mode table) pour le suivi
  const questionStart = useRef<number>(0) // pour juger « lent »

  // Charge le suivi fait-par-fait du profil (pour le tableau « mes tables »).
  useEffect(() => {
    if (!profileId) return
    let alive = true
    loadFactStates(profileId).then((s) => {
      if (!alive) return
      setFactStates(s)
      factStatesRef.current = s
    })
    return () => {
      alive = false
    }
  }, [profileId])

  // Tire la prochaine question selon l'entraînement choisi.
  const nextQuestion = (): QcmExercise => {
    questionStart.current = Date.now()
    if (training.kind === 'table') {
      const fact = nextFact(multiplicationFacts(training.table), factStatesRef.current, rng.current)
      currentFact.current = fact
      return factQuestion(fact, rng.current)
    }
    currentFact.current = null
    return nextMinigameQuestion(level, rng.current)
  }

  const start = (m: Mode) => {
    setMode(m)
    setAsked(0)
    setCorrect(0)
    setPicked(null)
    setSecondsLeft(MINIGAME_CHRONO_SECONDS)
    factStatesRef.current = { ...factStates }
    setQuestion(nextQuestion())
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

  // Fin de partie : récompense créditée UNE fois + persistance du suivi des faits.
  useEffect(() => {
    if (phase !== 'end') return
    void rewardMinigame(correct)
    if (profileId) {
      setFactStates(factStatesRef.current)
      void saveFactStates(profileId, factStatesRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Nettoie le timeout de feedback si on quitte en plein jeu.
  useEffect(() => () => window.clearTimeout(timeout.current), [])

  const answer = (index: number) => {
    if (picked !== null || !question) return
    setPicked(index)
    const good = index === question.correctIndex
    if (good) setCorrect((c) => c + 1)
    // Suivi fait-par-fait (mode table) : un fait raté OU lent remonte en priorité.
    if (currentFact.current) {
      const slow = Date.now() - questionStart.current > SLOW_MS
      const key = factKey(currentFact.current)
      factStatesRef.current = {
        ...factStatesRef.current,
        [key]: applyFactResult(factStatesRef.current[key], good, slow),
      }
    }
    const nextAsked = asked + 1
    timeout.current = window.setTimeout(() => {
      setPicked(null)
      setAsked(nextAsked)
      if (mode === 'zen' && nextAsked >= MINIGAME_ZEN_QUESTIONS) {
        setPhase('end')
      } else {
        setQuestion(nextQuestion())
      }
    }, FEEDBACK_MS)
  }

  const trainingLabel = training.kind === 'table' ? `table de ${training.table}` : 'au hasard'

  // --- Intro ------------------------------------------------------------------
  if (phase === 'intro') {
    return (
      <main className="flex min-h-full flex-col items-center gap-5 bg-cream p-6 text-center font-sans text-ink">
        <div className="mk-pulse">
          <NekoSushi variant="chef" size={84} title="Le chef propose un défi" />
        </div>
        <h1 className="text-[26px] font-extrabold">Défi calcul 🐾</h1>
        <p className="max-w-sm text-base font-bold text-muted">
          Réponds à des petits calculs de tête. Chaque bonne réponse te donne une croquette d'or <CroquetteOr /> —
          et on ne perd jamais rien !
        </p>

        {/* Choix de l'entraînement + tableau « mes tables ». */}
        {tables.length > 0 ? (
          <section className="w-full max-w-sm">
            <h2 className="mb-1 text-base font-extrabold">Mes tables</h2>
            <p className="mb-2 text-sm font-bold text-muted">
              Vert = tu sais · Orange = à revoir. Choisis une table, ou joue au hasard.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {tables.map((t) => {
                const status = tableStatus(t, factStates)
                const selected = training.kind === 'table' && training.table === t
                const tone =
                  status === 'mastered'
                    ? 'bg-success-soft text-success-text'
                    : status === 'learning'
                      ? 'bg-gold/40 text-gold-text'
                      : 'bg-card text-muted'
                const statusLabel =
                  status === 'mastered' ? ' (tu sais)' : status === 'learning' ? ' (à revoir)' : ''
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTraining({ kind: 'table', table: t })}
                    aria-label={`Table de ${t}${statusLabel}${selected ? ' (choisie)' : ''}`}
                    className={`min-h-[48px] rounded-btn-sm text-lg font-extrabold shadow-candy-sm transition-transform active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 ${tone} ${
                      selected ? 'ring-4 ring-primary' : ''
                    }`}
                  >
                    ×{t}
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              onClick={() => setTraining({ kind: 'random' })}
              aria-label={`Au hasard${training.kind === 'random' ? ' (choisi)' : ''}`}
              className={`mt-2 min-h-[48px] w-full rounded-btn-sm bg-card text-base font-extrabold text-ink shadow-candy-sm transition-transform active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 ${
                training.kind === 'random' ? 'ring-4 ring-primary' : ''
              }`}
            >
              Au hasard 🎲
            </button>
          </section>
        ) : null}

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-bold text-muted">Tu t'entraînes : {trainingLabel}</p>
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
          {correct} bonne{correct > 1 ? 's' : ''} réponse{correct > 1 ? 's' : ''} · <CroquetteOr /> +{correct}
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
        <p className="text-base font-extrabold">
          <CroquetteOr /> {correct}
        </p>
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
