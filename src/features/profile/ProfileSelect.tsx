import { Button } from '@/components/Button'
import { NekoSushi } from '@/components/NekoSushi'
import { ProfileCard, type Profile } from './ProfileCard'

// Profils de démonstration pour la Phase 1 (design). La création réelle et la
// persistance (Dexie / IndexedDB) arriveront en Phase 4.
const DEMO_PROFILES: Profile[] = [
  { id: 'lea', name: 'Léa', character: 'maki', level: 'ce1' },
  { id: 'tom', name: 'Tom', character: 'temaki', level: 'cm1' },
]

type ProfileSelectProps = {
  profiles?: Profile[]
  onSelect?: (id: string) => void
  onAddProfile?: () => void
  onOpenParent?: () => void
}

// Écran d'accueil de l'app : choix du profil (« Qui joue aujourd'hui ? »).
// Fidèle à la maquette du handoff (univers chats-sushis) : le chef chat-nigiri
// accueille l'enfant, chaque profil est un chat-sushi.
export function ProfileSelect({
  profiles = DEMO_PROFILES,
  onSelect = () => {},
  onAddProfile = () => {},
  onOpenParent = () => {},
}: ProfileSelectProps) {
  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-4 bg-cream p-6 text-center font-sans text-ink">
      <NekoSushi variant="chef" size={96} className="mx-auto" />

      <div>
        <h1 className="text-[28px] font-extrabold">Qui joue aujourd'hui ?</h1>
        <p className="mt-1 text-lg font-bold text-muted">Choisis ton chat-sushi !</p>
      </div>

      <ul className="flex flex-wrap justify-center gap-4">
        {profiles.map((profile) => (
          <li key={profile.id}>
            <ProfileCard profile={profile} onSelect={onSelect} />
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={onAddProfile}
            aria-label="Ajouter un profil"
            className="flex min-h-[132px] w-[134px] items-center justify-center rounded-card border-[3px] border-dashed border-hairline text-[44px] leading-none text-muted transition-transform active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          >
            <span aria-hidden="true">+</span>
          </button>
        </li>
      </ul>

      <Button variant="ghost" onClick={onOpenParent} className="mt-1">
        <span aria-hidden="true">🏮</span> Espace parent
      </Button>
    </main>
  )
}
