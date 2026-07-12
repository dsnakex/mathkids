import { ProfileSelect } from '@/features/profile/ProfileSelect'

// Point d'entrée de l'app. En Phase 1, on affiche l'écran de choix du profil.
// La navigation entre écrans (île, leçon, exercice…) sera branchée plus tard.
export default function App() {
  return <ProfileSelect />
}
