// Helpers de présentation des exercices (purs, sans React) : consigne courte,
// version « parlée » de l'énoncé pour la synthèse vocale, texte de la bonne
// réponse pour le feedback bienveillant.

import type { Exercise } from '@/engine/generators/types'
import { timePhrase } from '@/engine/generators/time'

/** Consigne courte, tutoyée, adaptée au type d'exercice. */
export function consigne(exercise: Exercise): string {
  switch (exercise.type) {
    case 'qcm':
      return 'Touche la bonne réponse 🐾'
    case 'truefalse':
      return 'Vrai ou faux ?'
    case 'input':
      return 'Écris le bon nombre 🐾'
    case 'gap':
      return 'Trouve le nombre qui manque 🐾'
    case 'order':
      return 'Range du plus petit au plus grand 🐾'
    case 'clockset':
      return "Règle l'horloge 🐾"
  }
}

/** Texte de la bonne réponse, pour la correction douce. */
export function correctAnswerText(exercise: Exercise): string {
  switch (exercise.type) {
    case 'qcm':
      return exercise.choices[exercise.correctIndex]
    case 'truefalse':
      return exercise.answer ? 'Vrai' : 'Faux'
    case 'input':
    case 'gap':
      return String(exercise.answer)
    case 'order':
      return exercise.answer.join(' · ')
    case 'clockset':
      return timePhrase(exercise.hours, exercise.minutes)
  }
}

/**
 * Version lisible à voix haute de l'énoncé : le trou et les symboles
 * arithmétiques deviennent des mots, les guillemets sont retirés. On préfixe la
 * consigne pour que l'enfant entende aussi ce qu'il doit faire.
 */
export function spokenPrompt(exercise: Exercise): string {
  const enonce = exercise.prompt
    .replace(/\s\?\s/g, ' combien ') // « 7 + ? = 12 » → trou parlé
    .replace(/\?/g, '') // « ? » final de question : muet
    .replace(/\+/g, ' plus ')
    .replace(/-/g, ' moins ')
    .replace(/=/g, ' égale ')
    .replace(/[«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const intro = consigne(exercise).replace(/[🐾?]/gu, '').trim()
  return `${intro}. ${enonce}`
}
