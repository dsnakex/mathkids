import { render, screen } from '@testing-library/react'
import { LevelChip } from '@/components/LevelChip'

describe('LevelChip', () => {
  it('affiche le libellé du niveau', () => {
    render(<LevelChip level="ce1" />)
    expect(screen.getByText('CE1')).toBeInTheDocument()
  })

  it("applique la couleur d'accent du niveau", () => {
    render(<LevelChip level="cm2" />)
    expect(screen.getByText('CM2')).toHaveClass('bg-cm2')
  })
})
