import { render, screen, fireEvent } from '@testing-library/react'
import { ClockSetter } from '@/features/exercise/ClockSetter'

// La grande aiguille démarre à 0 min et l'heure à 12 h : en ciblant 12 h on
// isole le calage des minutes. Un seul appui sur « Minutes en avant » doit
// avancer du PAS du niveau (30 au CE1, 15 au CE2), et non de 5 min.
function setup(step: number, targetMinutes: number) {
  const onValidate = vi.fn()
  render(
    <ClockSetter
      status="neutral"
      onValidate={onValidate}
      targetHours={12}
      targetMinutes={targetMinutes}
      step={step}
    />,
  )
  return { onValidate }
}

const plusMin = () => fireEvent.click(screen.getByRole('button', { name: /minutes en avant/i }))
const valider = () => fireEvent.click(screen.getByRole('button', { name: /valider/i }))

describe('ClockSetter — calage de la grande aiguille par niveau', () => {
  it('CE1 (pas 30) : un appui cale sur la demie (0 → 30)', () => {
    const { onValidate } = setup(30, 30)
    plusMin() // 0 → 30 (et non 5)
    valider()
    expect(onValidate).toHaveBeenCalledWith(true)
  })

  it('CE1 (pas 30) : deux appuis reviennent à l\'heure pile (30 → 0)', () => {
    const { onValidate } = setup(30, 0)
    plusMin()
    plusMin() // 30 → 0
    valider()
    expect(onValidate).toHaveBeenCalledWith(true)
  })

  it('CE2 (pas 15) : un appui cale sur le quart (0 → 15)', () => {
    const { onValidate } = setup(15, 15)
    plusMin() // 0 → 15 (et non 5)
    valider()
    expect(onValidate).toHaveBeenCalledWith(true)
  })

  it('le pas ne s\'arrête jamais sur une position interdite (CE1 : 15 refusé)', () => {
    const { onValidate } = setup(30, 15) // 15 n'est pas atteignable au pas de 30
    plusMin() // 0 → 30
    valider()
    expect(onValidate).toHaveBeenCalledWith(false)
  })
})
