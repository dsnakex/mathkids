import { useEffect } from 'react'
import { NekoSushiSprites } from '@/components/NekoSushiSprites'
import { useAppStore } from '@/app/store'
import { ProfileSelect } from '@/features/profile/ProfileSelect'
import { ProfileCreate } from '@/features/profile/ProfileCreate'
import { SessionScreen } from '@/features/session/SessionScreen'
import { SessionEnd } from '@/features/session/SessionEnd'

// Point d'entrée de l'app. Navigation par « écran » pilotée par le store
// (Phase 4 : profils → création → session → fin). NekoSushiSprites injecte une
// fois les personnages SVG réutilisés partout.
export default function App() {
  const screen = useAppStore((s) => s.screen)
  const profiles = useAppStore((s) => s.profiles)
  const init = useAppStore((s) => s.init)
  const startSession = useAppStore((s) => s.startSession)
  const goCreate = useAppStore((s) => s.goCreate)

  useEffect(() => {
    void init()
  }, [init])

  return (
    <>
      <NekoSushiSprites />
      {screen === 'profiles' && (
        <ProfileSelect profiles={profiles} onSelect={startSession} onAddProfile={goCreate} />
      )}
      {screen === 'create' && <ProfileCreate />}
      {screen === 'session' && <SessionScreen />}
      {screen === 'end' && <SessionEnd />}
    </>
  )
}
