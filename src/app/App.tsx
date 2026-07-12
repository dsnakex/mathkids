import { NekoSushiSprites } from '@/components/NekoSushiSprites'
import { ProfileSelect } from '@/features/profile/ProfileSelect'

// Point d'entrée de l'app. En Phase 1, on affiche l'écran de choix du profil.
// NekoSushiSprites injecte une fois les personnages SVG réutilisés partout.
// La navigation entre écrans (monde, leçon, exercice…) sera branchée plus tard.
export default function App() {
  return (
    <>
      <NekoSushiSprites />
      <ProfileSelect />
    </>
  )
}
