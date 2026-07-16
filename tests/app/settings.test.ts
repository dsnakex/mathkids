import {
  applyDisplaySettings,
  DEFAULT_DISPLAY,
  loadDisplaySettings,
  saveDisplaySettings,
} from '@/app/settings'

// Petit stockage en mémoire (indépendant du navigateur).
function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  }
}

describe('réglages d\'affichage (accessibilité)', () => {
  it('valeurs par défaut : tout désactivé', () => {
    expect(loadDisplaySettings(memoryStorage())).toEqual(DEFAULT_DISPLAY)
    expect(DEFAULT_DISPLAY.dyslexiaFont).toBe(false)
    expect(DEFAULT_DISPLAY.largeText).toBe(false)
  })

  it('sauvegarde puis relit les réglages (aller-retour)', () => {
    const storage = memoryStorage()
    saveDisplaySettings({ dyslexiaFont: true, largeText: true }, storage)
    expect(loadDisplaySettings(storage)).toEqual({ dyslexiaFont: true, largeText: true })
  })

  it('résiste à un stockage corrompu', () => {
    const storage = memoryStorage({ 'mathkids-display': '{pas du json' })
    expect(loadDisplaySettings(storage)).toEqual(DEFAULT_DISPLAY)
  })

  it('applique et retire les classes sur <html>', () => {
    const root = document.createElement('html')
    applyDisplaySettings({ dyslexiaFont: true, largeText: false }, root)
    expect(root.classList.contains('mk-dyslexia')).toBe(true)
    expect(root.classList.contains('mk-text-lg')).toBe(false)
    applyDisplaySettings({ dyslexiaFont: false, largeText: true }, root)
    expect(root.classList.contains('mk-dyslexia')).toBe(false)
    expect(root.classList.contains('mk-text-lg')).toBe(true)
  })
})
