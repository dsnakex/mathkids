// Types des exercices produits par les générateurs (Phase 3).
// Un exercice est une DONNÉE inerte : le générateur garantit qu'il a
// exactement une bonne réponse ; le rendu (Phase 4) et la correction s'en
// servent sans reconstruire l'énoncé.

/** QCM : 2 à 4 propositions, exactement une correcte (`correctIndex`). */
export interface QcmExercise {
  type: 'qcm'
  prompt: string
  choices: string[]
  correctIndex: number
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

export type Exercise =
  | QcmExercise
  | InputExercise
  | TrueFalseExercise
  | GapExercise

/** Réponse fournie par l'enfant selon le type d'exercice. */
export type Answer = number | boolean

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
  }
}
