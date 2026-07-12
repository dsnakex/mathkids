import { render, screen } from '@testing-library/react'
import { Gauge } from '@/components/Gauge'

describe('Gauge', () => {
  it('expose sa valeur via role progressbar', () => {
    render(<Gauge value={44} label="Progression" />)
    const bar = screen.getByRole('progressbar', { name: 'Progression' })
    expect(bar).toHaveAttribute('aria-valuenow', '44')
  })

  it('borne les valeurs hors intervalle à [0, 100]', () => {
    const { rerender } = render(<Gauge value={-10} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')

    rerender(<Gauge value={150} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })
})
