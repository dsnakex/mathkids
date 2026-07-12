// « Mission découverte » (SPECIFICATIONS §5) : au premier lancement (ou relancée
// depuis l'espace parent), le chef propose un court quiz pour situer l'enfant.
// Optionnelle (« Passer »), aucune étoile en jeu, que des encouragements. À la
// fin, le positionnement pré-remplit la progression (via le store).

import { useRef, useState } from 'react'
import { useAppStore } from '@/app/store'
import { curriculumFor } from '@/content/curricula'
import { mulberry32 } from '@/engine/generators/rng'
import { Button } from '@/components/Button'
import { NekoSushi } from '@/components/NekoSushi'
import { ExerciseView } from '@/features/exercise/ExerciseView'
import {
  buildPlacementQuiz,
  type PlacementAnswer,
  type PlacementQuestion,
} from './placement'

export function MissionScreen() {
  const profiles = useAppStore((s) => s.profiles)
  const profileId = useAppStore((s) => s.profileId)
  const finishMission = useAppStore((s) => s.finishMission)
  const skipMission = useAppStore((s) => s.skipMission)

  const profile = profiles.find((p) => p.id === profileId)
  const name = profile?.name ?? ''

  const [quiz, setQuiz] = useState<PlacementQuestion[] | null>(null)
  const [index, setIndex] = useState(0)
  const answers = useRef<PlacementAnswer[]>([])

  const start = () => {
    const q = buildPlacementQuiz(curriculumFor(profile?.level ?? 'cp'), mulberry32((Date.now() >>> 0) || 1))
    if (q.length === 0) {
      void skipMission()
      return
    }
    answers.current = []
    setIndex(0)
    setQuiz(q)
  }

  // Intro festive.
  if (!quiz) {
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

  // Déroulé du quiz (réutilise le rendu d'exercice).
  const question = quiz[index]
  const onContinue = (firstTryCorrect: boolean) => {
    answers.current = [...answers.current, { notionId: question.notionId, correct: firstTryCorrect }]
    const next = index + 1
    if (next >= quiz.length) void finishMission(answers.current)
    else setIndex(next)
  }

  return (
    <ExerciseView
      key={index}
      exercise={question.exercise}
      index={index}
      total={quiz.length}
      profileName={name}
      onContinue={onContinue}
      onQuit={skipMission}
      quitReassurance="Pas de souci, tu pourras refaire la mission plus tard."
    />
  )
}
