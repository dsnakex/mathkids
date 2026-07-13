// Types des exercices produits par les générateurs (Phase 3).
// Un exercice est une DONNÉE inerte : le générateur garantit qu'il a
// exactement une bonne réponse ; le rendu (Phase 4) et la correction s'en
// servent sans reconstruire l'énoncé.

/**
 * Indice visuel accompagnant un QCM (manipulation visuelle CP) : compter des
 * objets, lire une droite graduée, lire une horloge. La réponse reste un choix.
 */
export type VisualHint =
  | { kind: 'count'; objects: number } // nombre d'objets à compter
  | { kind: 'numberline'; max: number; step: number; marker: number } // repère à lire
  | { kind: 'clock'; hours: number; minutes: number } // heure affichée (petite aiguille continue)
  | { kind: 'coins'; units: number[] } // pièces/billets posés (valeurs en centimes)

/** QCM : 2 à 4 propositions, exactement une correcte (`correctIndex`). */
export interface QcmExercise {
  type: 'qcm'
  prompt: string
  choices: string[]
  correctIndex: number
  visual?: VisualHint // support visuel optionnel (compter, droite graduée, horloge)
}

/** Saisie numérique : l'enfant tape un entier, comparé à `answer`. */
export interface InputExercise {
  type: 'input'
  prompt: string
  answer: number
}

/** Vrai / Faux : `answer` est la valeur de vérité de l'énoncé `prompt`. */
export interface TrueFalseExercise {
  type: 'truefalse'
  prompt: string
  answer: boolean
}

/** Complète le trou : l'énoncé contient « ? », `answer` est l'entier manquant. */
export interface GapExercise {
  type: 'gap'
  prompt: string
  answer: number
}

/** Ranger : remettre des nombres dans l'ordre croissant (glisser-déposer / tap). */
export interface OrderExercise {
  type: 'order'
  prompt: string
  values: number[] // nombres proposés (ordre mélangé)
  answer: number[] // les mêmes, triés dans le bon ordre
}

/** Régler l'horloge : l'enfant place les aiguilles sur l'heure cible. */
export interface ClocksetExercise {
  type: 'clockset'
  prompt: string
  hours: number // heure cible (1..12)
  minutes: number // minutes cible
}

/** Saisie d'un montant en euros (pavé avec virgule) ; réponse en centimes. */
export interface MoneyInputExercise {
  type: 'moneyinput'
  prompt: string
  cents: number // montant attendu, en centimes
}

/** Composer une somme en posant des pièces/billets ; on valide le TOTAL. */
export interface MoneyComposeExercise {
  type: 'moneycompose'
  prompt: string
  cents: number // total à atteindre (plusieurs compositions valides)
}

/** Saisie d'un nombre décimal (pavé avec virgule) ; réponse mise à l'échelle. */
export interface DecimalInputExercise {
  type: 'decimalinput'
  prompt: string
  value: number // réponse = nombre × 10^decimals (entier, sans flottant)
  decimals: number
}

/** Problème rédigé : énoncé, réponse, indices en 2 temps, explication. */
export interface ProblemExercise {
  type: 'problem'
  prompt: string
  answer: number // entier, ou centimes si answerFormat === 'euros'
  answerFormat: 'int' | 'euros'
  hints: string[]
  explanation: string
  unit?: string
}

export type Exercise =
  | QcmExercise
  | InputExercise
  | TrueFalseExercise
  | GapExercise
  | OrderExercise
  | ClocksetExercise
  | MoneyInputExercise
  | MoneyComposeExercise
  | DecimalInputExercise
  | ProblemExercise

/** Réponse fournie par l'enfant selon le type d'exercice. */
export type Answer = number | boolean | number[]

const sameOrder = (a: number[], b: number[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i])

/** Vrai si `response` est la bonne réponse à l'exercice. */
export function isAnswerCorrect(exercise: Exercise, response: Answer): boolean {
  switch (exercise.type) {
    case 'qcm':
      return response === exercise.correctIndex
    case 'input':
    case 'gap':
      return response === exercise.answer
    case 'truefalse':
      return response === exercise.answer
    case 'order':
      return Array.isArray(response) && sameOrder(response, exercise.answer)
    case 'clockset':
      return (
        Array.isArray(response) &&
        response[0] === exercise.hours &&
        response[1] === exercise.minutes
      )
    case 'moneyinput':
    case 'moneycompose':
      return response === exercise.cents
    case 'decimalinput':
      return response === exercise.value
    case 'problem':
      return response === exercise.answer
  }
}
