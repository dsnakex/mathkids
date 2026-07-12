import { render, screen, fireEvent } from '@testing-library/react'
import { ExerciseView } from '@/features/exercise/ExerciseView'
import type { Exercise } from '@/engine/generators/types'

function setup(exercise: Exercise) {
  const onContinue = vi.fn()
  render(
    <ExerciseView
      exercise={exercise}
      index={0}
      total={5}
      profileName="Léa"
      onContinue={onContinue}
    />,
  )
  return { onContinue }
}

const qcm: Exercise = {
  type: 'qcm',
  prompt: 'Combien font 3 + 1 ?',
  choices: ['4', '6', '2', '5'],
  correctIndex: 0,
}

describe('ExerciseView — QCM', () => {
  it('bonne réponse du premier coup : propose « Continuer » et remonte firstTry=true', () => {
    const { onContinue } = setup(qcm)
    // État neutre : pas encore de bouton Continuer.
    expect(screen.queryByRole('button', { name: /continuer/i })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: '4' }))
    const cont = screen.getByRole('button', { name: /continuer/i })
    fireEvent.click(cont)
    expect(onContinue).toHaveBeenCalledWith(true)
  })

  it('erreur puis réussite : montre « Réessayer », révèle la réponse, garde firstTry=false', () => {
    const { onContinue } = setup(qcm)
    fireEvent.click(screen.getByRole('button', { name: '6' })) // mauvais choix
    expect(screen.getByRole('button', { name: /réessayer/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /continuer/i })).toBeNull()
    // Correction douce : la bonne réponse est révélée (« 4 »).
    expect(screen.getByText(/presque/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /réessayer/i }))
    fireEvent.click(screen.getByRole('button', { name: '4' })) // bonne réponse
    fireEvent.click(screen.getByRole('button', { name: /continuer/i }))
    expect(onContinue).toHaveBeenCalledWith(false) // le 1er essai était faux
  })
})

describe('ExerciseView — Vrai/Faux', () => {
  it('valide immédiatement le bon choix', () => {
    const { onContinue } = setup({ type: 'truefalse', prompt: '5 est plus grand que 3.', answer: true })
    fireEvent.click(screen.getByRole('button', { name: /vrai/i }))
    fireEvent.click(screen.getByRole('button', { name: /continuer/i }))
    expect(onContinue).toHaveBeenCalledWith(true)
  })
})

describe('ExerciseView — saisie numérique', () => {
  it('compose un nombre au pavé puis valide', () => {
    const { onContinue } = setup({ type: 'input', prompt: 'Combien font 5 + 2 ?', answer: 7 })
    fireEvent.click(screen.getByRole('button', { name: '7' }))
    fireEvent.click(screen.getByRole('button', { name: /valider/i }))
    fireEvent.click(screen.getByRole('button', { name: /continuer/i }))
    expect(onContinue).toHaveBeenCalledWith(true)
  })

  it('complète-le-trou : compose la réponse manquante', () => {
    const { onContinue } = setup({ type: 'gap', prompt: '7 + ? = 12', answer: 5 })
    fireEvent.click(screen.getByRole('button', { name: '5' }))
    fireEvent.click(screen.getByRole('button', { name: /valider/i }))
    fireEvent.click(screen.getByRole('button', { name: /continuer/i }))
    expect(onContinue).toHaveBeenCalledWith(true)
  })
})

describe('ExerciseView — ranger (ordre croissant)', () => {
  const order = { type: 'order' as const, prompt: 'Range…', values: [5, 2, 8], answer: [2, 5, 8] }

  it('taper dans le bon ordre valide la réponse', () => {
    const { onContinue } = setup(order)
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(screen.getByRole('button', { name: '5' }))
    fireEvent.click(screen.getByRole('button', { name: '8' }))
    fireEvent.click(screen.getByRole('button', { name: /continuer/i }))
    expect(onContinue).toHaveBeenCalledWith(true)
  })

  it('un mauvais ordre propose de réessayer', () => {
    setup(order)
    fireEvent.click(screen.getByRole('button', { name: '8' }))
    fireEvent.click(screen.getByRole('button', { name: '5' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    expect(screen.getByRole('button', { name: /réessayer/i })).toBeInTheDocument()
  })
})
