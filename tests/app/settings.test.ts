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
  it('valeurs par défaut : accessibilité désactivée, écran gardé allumé', () => {
    expect(loadDisplaySettings(memoryStorage())).toEqual(DEFAULT_DISPLAY)
    expect(DEFAULT_DISPLAY.dyslexiaFont).toBe(false)
    expect(DEFAULT_DISPLAY.largeText).toBe(false)
    expect(DEFAULT_DISPLAY.keepScreenAwake).toBe(true)
  })

  it('sauvegarde puis relit les réglages (aller-retour)', () => {
    const storage = memoryStorage()
    const settings = { dyslexiaFont: true, largeText: true, keepScreenAwake: false }
    saveDisplaySettings(settings, storage)
    expect(loadDisplaySettings(storage)).toEqual(settings)
  })

  it('« garder l\'écran allumé » activé par défaut si absent du stockage', () => {
    const storage = memoryStorage({ 'mathkids-display': JSON.stringify({ dyslexiaFont: true }) })
    expect(loadDisplaySettings(storage).keepScreenAwake).toBe(true)
  })

  it('« garder l\'écran allumé » désactivable et persisté', () => {
    const storage = memoryStorage({ 'mathkids-display': JSON.stringify({ keepScreenAwake: false }) })
    expect(loadDisplaySettings(storage).keepScreenAwake).toBe(false)
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
