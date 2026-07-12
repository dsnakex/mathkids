import { render, screen } from '@testing-library/react'
import { NekoSushi } from '@/components/NekoSushi'

describe('NekoSushi', () => {
  it('référence le bon symbole selon la variante', () => {
    const { container } = render(<NekoSushi variant="chef" />)
    const use = container.querySelector('use')
    expect(use).toHaveAttribute('href', '#ns-chef')
  })

  it('est accessible quand un titre est fourni', () => {
    render(<NekoSushi variant="maki" title="Léa, chat-maki" />)
    expect(screen.getByRole('img', { name: 'Léa, chat-maki' })).toBeInTheDocument()
  })

  it('est décoratif (masqué) sans titre', () => {
    const { container } = render(<NekoSushi variant="temaki" />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
