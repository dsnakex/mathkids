import { useEffect } from 'react'
import { NekoSushiSprites } from '@/components/NekoSushiSprites'
import { useAppStore } from '@/app/store'
import { ProfileSelect } from '@/features/profile/ProfileSelect'
import { ProfileCreate } from '@/features/profile/ProfileCreate'
import { MapScreen } from '@/features/map/MapScreen'
import { LessonScreen } from '@/features/lesson/LessonScreen'
import { SessionScreen } from '@/features/session/SessionScreen'
import { SessionEnd } from '@/features/session/SessionEnd'
import { ShopScreen } from '@/features/shop/ShopScreen'
import { ParentScreen } from '@/features/parent/ParentScreen'
import { MissionScreen } from '@/features/placement/MissionScreen'
import { InstallPrompt } from '@/app/InstallPrompt'

// Point d'entrée de l'app. Navigation par « écran » pilotée par le store :
// profils → carte → (leçon) → session → fin → carte ; carte ↔ boutique.
export default function App() {
  const screen = useAppStore((s) => s.screen)
  const profiles = useAppStore((s) => s.profiles)
  const init = useAppStore((s) => s.init)
  const selectProfile = useAppStore((s) => s.selectProfile)
  const goCreate = useAppStore((s) => s.goCreate)
  const goParent = useAppStore((s) => s.goParent)

  useEffect(() => {
    void init()
  }, [init])

  return (
    <>
      <NekoSushiSprites />
      {screen === 'profiles' && (
        <ProfileSelect
          profiles={profiles}
          onSelect={selectProfile}
          onAddProfile={goCreate}
          onOpenParent={goParent}
        />
      )}
      {screen === 'create' && <ProfileCreate />}
      {screen === 'map' && <MapScreen />}
      {screen === 'lesson' && <LessonScreen />}
      {screen === 'session' && <SessionScreen />}
      {screen === 'end' && <SessionEnd />}
      {screen === 'shop' && <ShopScreen />}
      {screen === 'parent' && <ParentScreen />}
      {screen === 'mission' && <MissionScreen />}
      <InstallPrompt />
    </>
  )
}
