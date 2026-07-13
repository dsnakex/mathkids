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

describe('ExerciseView — régler l\'horloge (clockset)', () => {
  const clockset: Exercise = {
    type: 'clockset',
    prompt: "Mets l'horloge sur 3 heures.",
    hours: 3,
    minutes: 0,
  }

  it('placer les aiguilles sur la cible puis valider = bonne réponse', () => {
    const { onContinue } = setup(clockset)
    // Départ à 12 h : on avance de 3 heures.
    const plusHeure = screen.getByRole('button', { name: /heure en avant/i })
    fireEvent.click(plusHeure)
    fireEvent.click(plusHeure)
    fireEvent.click(plusHeure)
    fireEvent.click(screen.getByRole('button', { name: /valider/i }))
    fireEvent.click(screen.getByRole('button', { name: /continuer/i }))
    expect(onContinue).toHaveBeenCalledWith(true)
  })

  it('valider une mauvaise heure propose de réessayer', () => {
    setup(clockset)
    // On valide sans bouger (12 h ≠ 3 h).
    fireEvent.click(screen.getByRole('button', { name: /valider/i }))
    expect(screen.getByRole('button', { name: /réessayer/i })).toBeInTheDocument()
  })
})

describe('ExerciseView — monnaie', () => {
  const digit = (d: string) => fireEvent.click(screen.getByRole('button', { name: d }))

  it('convertir : « 3,5 » est accepté pour 3,50 €', () => {
    const { onContinue } = setup({ type: 'moneyinput', prompt: '3 € et 50 c = ? €', cents: 350 })
    digit('3')
    fireEvent.click(screen.getByRole('button', { name: 'virgule' }))
    digit('5')
    fireEvent.click(screen.getByRole('button', { name: /valider/i }))
    fireEvent.click(screen.getByRole('button', { name: /continuer/i }))
    expect(onContinue).toHaveBeenCalledWith(true)
  })

  it('convertir : « 3,5 » est refusé pour 3,05 € (confusion des centimes)', () => {
    setup({ type: 'moneyinput', prompt: '3 € et 5 c = ? €', cents: 305 })
    digit('3')
    fireEvent.click(screen.getByRole('button', { name: 'virgule' }))
    digit('5')
    fireEvent.click(screen.getByRole('button', { name: /valider/i }))
    expect(screen.getByRole('button', { name: /réessayer/i })).toBeInTheDocument()
  })

  it('composer : poser des pièces jusqu\'au total valide la réponse', () => {
    const { onContinue } = setup({ type: 'moneycompose', prompt: 'Compose 0,35 €', cents: 35 })
    fireEvent.click(screen.getByRole('button', { name: /poser 20 c/i }))
    fireEvent.click(screen.getByRole('button', { name: /poser 10 c/i }))
    fireEvent.click(screen.getByRole('button', { name: /poser 5 c/i }))
    fireEvent.click(screen.getByRole('button', { name: /valider/i }))
    fireEvent.click(screen.getByRole('button', { name: /continuer/i }))
    expect(onContinue).toHaveBeenCalledWith(true)
  })
})

describe('ExerciseView — saisie décimale', () => {
  const type = (label: string) => fireEvent.click(screen.getByRole('button', { name: label }))

  it('taper « 5,9 » valide la réponse (59 dixièmes)', () => {
    const { onContinue } = setup({
      type: 'decimalinput',
      prompt: 'Combien font 3,5 + 2,4 ?',
      value: 59,
      decimals: 1,
    })
    type('5')
    type('virgule')
    type('9')
    type('Valider 🐾')
    fireEvent.click(screen.getByRole('button', { name: /continuer/i }))
    expect(onContinue).toHaveBeenCalledWith(true)
  })

  it('« 5,90 » est aussi accepté (zéro de fin)', () => {
    const { onContinue } = setup({
      type: 'decimalinput',
      prompt: 'Combien font 3,5 + 2,4 ?',
      value: 59,
      decimals: 1,
    })
    type('5')
    type('virgule')
    type('9')
    type('0')
    type('Valider 🐾')
    fireEvent.click(screen.getByRole('button', { name: /continuer/i }))
    expect(onContinue).toHaveBeenCalledWith(true)
  })
})

describe('ExerciseView — quitter (pause)', () => {
  it('le bouton ✕ demande confirmation avant de quitter, sans quitter par accident', () => {
    const onQuit = vi.fn()
    render(
      <ExerciseView exercise={qcm} index={0} total={5} profileName="Léa" onContinue={vi.fn()} onQuit={onQuit} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /quitter/i }))
    // Confirmation adaptée à l'enfant, rassurante.
    expect(screen.getByText(/tu veux faire une pause/i)).toBeInTheDocument()
    expect(onQuit).not.toHaveBeenCalled()

    // On peut revenir en arrière (continuer) sans quitter.
    fireEvent.click(screen.getByRole('button', { name: /je continue/i }))
    expect(onQuit).not.toHaveBeenCalled()

    // Puis confirmer la pause quitte réellement.
    fireEvent.click(screen.getByRole('button', { name: /quitter/i }))
    fireEvent.click(screen.getByRole('button', { name: /oui, pause/i }))
    expect(onQuit).toHaveBeenCalledTimes(1)
  })

  it('n\'affiche pas de bouton quitter sans onQuit', () => {
    render(<ExerciseView exercise={qcm} index={0} total={5} profileName="Léa" onContinue={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /quitter/i })).toBeNull()
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
