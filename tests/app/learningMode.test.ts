import {
  DEFAULT_LEARNING,
  loadLearningSettings,
  saveLearningSettings,
  pathMode,
} from '@/app/learningMode'

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  }
}

describe('réglage du parcours (guidé / libre)', () => {
  it('parcours guidé par défaut', () => {
    expect(loadLearningSettings(memoryStorage())).toEqual(DEFAULT_LEARNING)
    expect(DEFAULT_LEARNING.guidedPath).toBe(true)
  })

  it('aller-retour : exploration libre persistée', () => {
    const storage = memoryStorage()
    saveLearningSettings({ guidedPath: false }, storage)
    expect(loadLearningSettings(storage).guidedPath).toBe(false)
  })

  it('guidé si la clé est présente mais incomplète', () => {
    const storage = memoryStorage({ 'mathkids-learning': JSON.stringify({}) })
    expect(loadLearningSettings(storage).guidedPath).toBe(true)
  })

  it('résiste à un stockage corrompu', () => {
    const storage = memoryStorage({ 'mathkids-learning': '{pas du json' })
    expect(loadLearningSettings(storage)).toEqual(DEFAULT_LEARNING)
  })

  it('pathMode traduit le réglage pour le moteur', () => {
    expect(pathMode({ guidedPath: true })).toBe('guided')
    expect(pathMode({ guidedPath: false })).toBe('free')
  })
})
