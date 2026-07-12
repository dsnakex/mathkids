import { render, screen } from '@testing-library/react'
import App from '@/app/App'

describe('App', () => {
  it("affiche l'écran de choix du profil", () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: "Qui joue aujourd'hui ?" }),
    ).toBeInTheDocument()
  })
})
