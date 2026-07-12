import { render, screen, fireEvent } from '@testing-library/react'
import { ProfileSelect } from '@/features/profile/ProfileSelect'
import type { Profile } from '@/features/profile/ProfileCard'

const PROFILES: Profile[] = [
  { id: 'lea', name: 'Léa', avatar: '🐰', level: 'ce1' },
  { id: 'tom', name: 'Tom', avatar: '🐸', level: 'cm1' },
]

describe('ProfileSelect', () => {
  it('affiche le titre et les profils fournis', () => {
    render(<ProfileSelect profiles={PROFILES} />)
    expect(
      screen.getByRole('heading', { name: "Qui joue aujourd'hui ?" }),
    ).toBeInTheDocument()
    expect(screen.getByText('Léa')).toBeInTheDocument()
    expect(screen.getByText('Tom')).toBeInTheDocument()
  })

  it("appelle onSelect avec l'identifiant du profil cliqué", () => {
    const onSelect = vi.fn()
    render(<ProfileSelect profiles={PROFILES} onSelect={onSelect} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Jouer avec le profil de Léa' }),
    )
    expect(onSelect).toHaveBeenCalledWith('lea')
  })

  it("propose d'ajouter un profil et d'ouvrir l'espace parent", () => {
    const onAddProfile = vi.fn()
    const onOpenParent = vi.fn()
    render(
      <ProfileSelect
        profiles={PROFILES}
        onAddProfile={onAddProfile}
        onOpenParent={onOpenParent}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Ajouter un profil' }))
    fireEvent.click(screen.getByRole('button', { name: /Espace parent/ }))
    expect(onAddProfile).toHaveBeenCalledOnce()
    expect(onOpenParent).toHaveBeenCalledOnce()
  })
})
