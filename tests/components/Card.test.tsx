import { render, screen } from '@testing-library/react'
import { Card } from '@/components/Card'

describe('Card', () => {
  it('rend son contenu et conserve les classes fournies', () => {
    render(<Card className="p-4">Bonjour</Card>)
    const card = screen.getByText('Bonjour')
    expect(card).toHaveClass('bg-card', 'rounded-card', 'p-4')
  })
})
