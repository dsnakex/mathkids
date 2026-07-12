import { LevelChip, type Level } from '@/components/LevelChip'
import { NekoSushi, type NekoVariant } from '@/components/NekoSushi'

export type Profile = {
  id: string
  name: string
  character: NekoVariant // le chat-sushi de l'enfant (avatar)
  level: Level
}

type ProfileCardProps = {
  profile: Profile
  onSelect: (id: string) => void
}

// Carte d'un profil enfant : avatar chat-sushi, prénom, pastille de niveau.
// Toute la carte est cliquable (grande cible tactile).
export function ProfileCard({ profile, onSelect }: ProfileCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(profile.id)}
      aria-label={`Jouer avec le profil de ${profile.name}`}
      className="w-[134px] rounded-card bg-card p-[18px] text-center shadow-candy transition-transform active:translate-y-[3px] active:shadow-candy-pressed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
    >
      <NekoSushi variant={profile.character} size={84} className="mx-auto" />
      <span className="mt-1 block text-[19px] font-extrabold text-ink">
        {profile.name}
      </span>
      <LevelChip level={profile.level} className="mt-1.5" />
    </button>
  )
}
