// Conteneur de session : lit l'exercice courant dans le store et le confie à
// ExerciseView. La clé `index` réinitialise l'état local de l'exercice à chaque
// question. À la dernière réponse, le store bascule vers l'écran de fin.

import { useAppStore } from '@/app/store'
import { ExerciseView } from '@/features/exercise/ExerciseView'

export function SessionScreen() {
  const session = useAppStore((s) => s.session)
  const index = useAppStore((s) => s.index)
  const answerCurrent = useAppStore((s) => s.answerCurrent)
  const profileId = useAppStore((s) => s.profileId)
  const profiles = useAppStore((s) => s.profiles)

  const item = session[index]
  if (!item) return null
  const name = profiles.find((p) => p.id === profileId)?.name ?? ''

  return (
    <ExerciseView
      key={index}
      exercise={item.exercise}
      index={index}
      total={session.length}
      profileName={name}
      onContinue={answerCurrent}
    />
  )
}
