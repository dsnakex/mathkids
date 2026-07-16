import { LEVEL_IDS } from '@/content/schema'
import { mulberry32 } from '@/engine/generators/rng'
import {
  chronoAllowed,
  minigameSpecs,
  nextMinigameQuestion,
  MINIGAME_ZEN_QUESTIONS,
  MINIGAME_CHRONO_SECONDS,
} from '@/engine/minigame'

describe('mini-jeu de calcul mental', () => {
  it('chaque niveau a des gabarits jouables', () => {
    for (const level of LEVEL_IDS) {
      expect(minigameSpecs(level).length, level).toBeGreaterThan(0)
    }
  })

  it('le chrono n\'est jamais proposé au CP ni au CE1 (règle produit)', () => {
    expect(chronoAllowed('cp')).toBe(false)
    expect(chronoAllowed('ce1')).toBe(false)
    expect(chronoAllowed('ce2')).toBe(true)
    expect(chronoAllowed('cm2')).toBe(true)
  })

  it('30 tirages par niveau : QCM valide avec exactement une bonne réponse', () => {
    const failures: string[] = []
    for (const level of LEVEL_IDS) {
      for (let seed = 0; seed < 30; seed++) {
        const ex = nextMinigameQuestion(level, mulberry32(seed * 7 + 1))
        const label = `${level}#${seed}`
        if (ex.prompt.length === 0) failures.push(`énoncé vide ${label}`)
        if (ex.correctIndex < 0 || ex.correctIndex >= ex.choices.length) {
          failures.push(`correctIndex hors bornes ${label}`)
        }
        if (new Set(ex.choices).size !== ex.choices.length) {
          failures.push(`choix en doublon ${label} : ${ex.choices.join(',')}`)
        }
      }
    }
    expect(failures).toEqual([])
  })

  it('constantes cohérentes (zen court, chrono d\'une minute)', () => {
    expect(MINIGAME_ZEN_QUESTIONS).toBeGreaterThanOrEqual(5)
    expect(MINIGAME_CHRONO_SECONDS).toBe(60)
  })
})
