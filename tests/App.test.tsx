import { render, screen } from '@testing-library/react'
import App from '@/app/App'

describe('App (page d\'accueil provisoire)', () => {
  it('affiche le titre MathKids', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'MathKids' }),
    ).toBeInTheDocument()
  })

  it('affiche les cinq niveaux scolaires', () => {
    render(<App />)
    for (const label of ['CP', 'CE1', 'CE2', 'CM1', 'CM2']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })
})
