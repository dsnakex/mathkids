import { consigne, spokenPrompt, correctAnswerText } from '@/features/exercise/present'
import type { Exercise } from '@/engine/generators/types'

describe('present — consigne par type', () => {
  it('donne une consigne courte et tutoyée pour chaque type', () => {
    expect(consigne({ type: 'qcm', prompt: '', choices: ['1'], correctIndex: 0 })).toMatch(/réponse/i)
    expect(consigne({ type: 'truefalse', prompt: '', answer: true })).toMatch(/vrai/i)
    expect(consigne({ type: 'input', prompt: '', answer: 3 })).toMatch(/écris|nombre/i)
    expect(consigne({ type: 'gap', prompt: '', answer: 3 })).toMatch(/manque/i)
  })
})

describe('present — énoncé parlé (symboles → mots)', () => {
  it('remplace le trou et les symboles arithmétiques par des mots', () => {
    const gap: Exercise = { type: 'gap', prompt: '7 + ? = 12', answer: 5 }
    const spoken = spokenPrompt(gap)
    expect(spoken).toContain('plus')
    expect(spoken).toContain('égale')
    expect(spoken).toContain('combien')
    expect(spoken).not.toContain('+')
    expect(spoken).not.toContain('?')
    expect(spoken).not.toContain('=')
  })

  it('lit une soustraction sans laisser de symbole', () => {
    const spoken = spokenPrompt({ type: 'input', prompt: 'Combien font 12 - 5 ?', answer: 7 })
    expect(spoken).toContain('moins')
    expect(spoken).not.toContain('-')
    expect(spoken).not.toContain('?')
  })

  it('retire les guillemets autour des nombres en lettres', () => {
    const spoken = spokenPrompt({
      type: 'qcm',
      prompt: 'Quel nombre s\'écrit « treize » ?',
      choices: ['13', '31'],
      correctIndex: 0,
    })
    expect(spoken).not.toContain('«')
    expect(spoken).not.toContain('»')
    expect(spoken).toContain('treize')
  })
})

describe('present — texte de la bonne réponse (feedback)', () => {
  it('renvoie la proposition correcte d\'un QCM', () => {
    expect(
      correctAnswerText({ type: 'qcm', prompt: '', choices: ['4', '6', '2'], correctIndex: 0 }),
    ).toBe('4')
  })

  it('traduit vrai / faux en toutes lettres', () => {
    expect(correctAnswerText({ type: 'truefalse', prompt: '', answer: true })).toBe('Vrai')
    expect(correctAnswerText({ type: 'truefalse', prompt: '', answer: false })).toBe('Faux')
  })

  it('renvoie le nombre pour saisie et trou', () => {
    expect(correctAnswerText({ type: 'input', prompt: '', answer: 7 })).toBe('7')
    expect(correctAnswerText({ type: 'gap', prompt: '', answer: 5 })).toBe('5')
  })
})
