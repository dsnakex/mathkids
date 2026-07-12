// Page publique « Pour les parents » : explique l'app avant même de créer un
// profil. Accessible librement depuis l'écran d'accueil (Phase 8).

import { useAppStore } from '@/app/store'
import { Button } from '@/components/Button'
import { NekoSushi } from '@/components/NekoSushi'

const POINTS: Array<{ emoji: string; title: string; text: string }> = [
  {
    emoji: '🧮',
    title: 'Toutes les maths du primaire',
    text: 'Du CP au CM2, conforme aux programmes 2025-2026 : nombres, calcul, problèmes, grandeurs, géométrie.',
  },
  {
    emoji: '🎯',
    title: "S'adapte à chaque enfant",
    text: 'Les exercices montent en difficulté quand c\'est réussi, redescendent en cas d\'erreur, et reviennent en révision au bon moment.',
  },
  {
    emoji: '🔒',
    title: 'Aucune donnée en ligne',
    text: 'Tout reste sur votre appareil : pas de compte, pas de serveur, pas de pub, pas de suivi. Conforme au RGPD par conception.',
  },
  {
    emoji: '📴',
    title: 'Fonctionne hors ligne',
    text: 'Installable comme une application ; après la première visite, tout marche sans connexion.',
  },
  {
    emoji: '💛',
    title: 'Bienveillant',
    text: 'Aucune pénalité, aucun classement, aucun chrono anxiogène : l\'erreur est corrigée en douceur, on peut toujours réessayer.',
  },
]

export function AboutScreen() {
  const goProfiles = useAppStore((s) => s.goProfiles)

  return (
    <main className="flex min-h-full flex-col items-center gap-5 bg-cream p-6 font-sans text-ink">
      <NekoSushi variant="chef" size={92} title="Le chef de MathKids" />
      <div className="text-center">
        <h1 className="text-[28px] font-extrabold">MathKids</h1>
        <p className="mt-1 text-lg font-bold text-muted">
          Apprendre les maths en s'amusant, du CP au CM2.
        </p>
      </div>

      <ul className="flex w-full max-w-md flex-col gap-3">
        {POINTS.map((p) => (
          <li key={p.title} className="flex items-start gap-3 rounded-card bg-card p-4 shadow-candy-sm">
            <span aria-hidden="true" className="text-[28px] leading-none">
              {p.emoji}
            </span>
            <span>
              <span className="block text-lg font-extrabold">{p.title}</span>
              <span className="block text-base font-bold text-muted">{p.text}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-1">
        <Button onClick={goProfiles}>Commencer 🍣</Button>
      </div>
      <p className="pb-2 text-center text-sm font-bold text-muted">
        Gratuit et sans publicité · Progression sauvegardée sur cet appareil
      </p>
    </main>
  )
}
