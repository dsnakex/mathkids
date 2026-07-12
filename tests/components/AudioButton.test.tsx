import { render, screen, fireEvent } from '@testing-library/react'
import { AudioButton } from '@/components/AudioButton'

describe('AudioButton', () => {
  it('expose son libellé accessible et réagit au clic', () => {
    const onClick = vi.fn()
    render(<AudioButton label="Écouter la consigne" onClick={onClick} />)

    const button = screen.getByRole('button', { name: 'Écouter la consigne' })
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })
})
