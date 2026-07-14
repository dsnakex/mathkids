// « Mission découverte » (SPECIFICATIONS §5) : au premier lancement (ou relancée
// depuis l'espace parent), le chef propose un court quiz adaptatif pour situer
// l'enfant. Optionnelle (« Passer »), aucune étoile en jeu, que des
// encouragements. Le moteur (engine/mission) choisit chaque question selon les
// réponses précédentes ; à la fin, le positionnement pré-remplit la progression.

import { useRef, useState } from 'react'
import { useAppStore } from '@/app/store'
import { mulberry32 } from '@/engine/generators/rng'
import {
  answerMission,
  isMissionComplete,
  missionProgress,
  startMission,
  type MissionSession,
} from '@/engine/mission'
import { Button } from '@/components/Button'
import { NekoSushi } from '@/components/NekoSushi'
import { ExerciseView } from '@/features/exercise/ExerciseView'

export function MissionScreen() {
  const profiles = useAppStore((s) => s.profiles)
  const profileId = useAppStore((s) => s.profileId)
  const finishMission = useAppStore((s) => s.finishMission)
  const skipMission = useAppStore((s) => s.skipMission)

  const profile = profiles.find((p) => p.id === profileId)
  const name = profile?.name ?? ''

  // La mission est une machine à états mutée en place : on la garde dans un ref
  // et on force le rendu via un compteur d'étape.
  const session = useRef<MissionSession | null>(null)
  const [, setStep] = useState(0)

  const start = () => {
    const s = startMission(profile?.level ?? 'cp', mulberry32((Date.now() >>> 0) || 1))
    if (isMissionComplete(s)) {
      void skipMission()
      return
    }
    session.current = s
    setStep((n) => n + 1)
  }

  // Intro festive.
  if (!session.current) {
    return (
      <main className="flex min-h-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-[#FDF3E4] to-[#FAE4D6] p-6 text-center font-sans text-ink">
        <div className="mk-pulse">
          <NekoSushi variant="chef" size={110} title="Le chef propose une mission" />
        </div>
        <h1 className="text-[26px] font-extrabold">🎉 Mission découverte</h1>
        <p className="max-w-sm text-lg font-bold text-muted">
          Salut {name} ! Réponds à quelques questions pour que je trouve par où commencer. Aucune
          étoile en jeu — juste pour faire connaissance ! 🍣
        </p>
        <div className="flex flex-col items-center gap-2">
          <Button onClick={start}>C'est parti ! 🥢</Button>
          <Button variant="ghost" onClick={skipMission}>
            Passer
          </Button>
        </div>
      </main>
    )
  }

  const current = session.current.current
  if (!current) {
    // Sécurité : mission terminée sans question courante → on conclut.
    void finishMission(session.current)
    return null
  }

  const { asked, total } = missionProgress(session.current)
  const onContinue = (firstTryCorrect: boolean) => {
    const s = answerMission(session.current as MissionSession, firstTryCorrect)
    if (isMissionComplete(s)) {
      void finishMission(s)
      return
    }
    setStep((n) => n + 1)
  }

  return (
    <ExerciseView
      key={asked}
      exercise={current.exercise}
      index={asked}
      total={total}
      profileName={name}
      onContinue={onContinue}
      onQuit={skipMission}
      quitReassurance="Pas de souci, tu pourras refaire la mission plus tard."
    />
  )
}
