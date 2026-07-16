// Réglages d'affichage (accessibilité, SPECIFICATIONS §9) : police adaptée aux
// lecteurs dyslexiques (OpenDyslexic, embarquée offline) et texte agrandi.
// Réglages d'APPAREIL (localStorage), pas par profil : ils suivent la tablette
// ou le téléphone, pas l'enfant. Appliqués via des classes sur <html>
// (voir index.css : html.mk-dyslexia, html.mk-text-lg).

export interface DisplaySettings {
  dyslexiaFont: boolean // police OpenDyslexic + espacement des lettres/mots
  largeText: boolean // interface agrandie (~15 %)
}

const STORAGE_KEY = 'mathkids-display'

export const DEFAULT_DISPLAY: DisplaySettings = { dyslexiaFont: false, largeText: false }

/** Charge les réglages (valeurs sûres si le stockage est vide ou corrompu). */
export function loadDisplaySettings(storage: Pick<Storage, 'getItem'> = localStorage): DisplaySettings {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_DISPLAY }
    const parsed = JSON.parse(raw) as Partial<DisplaySettings>
    return {
      dyslexiaFont: parsed.dyslexiaFont === true,
      largeText: parsed.largeText === true,
    }
  } catch {
    return { ...DEFAULT_DISPLAY }
  }
}

export function saveDisplaySettings(
  settings: DisplaySettings,
  storage: Pick<Storage, 'setItem'> = localStorage,
): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

/** Applique les réglages en posant les classes sur `<html>`. */
export function applyDisplaySettings(
  settings: DisplaySettings,
  root: HTMLElement = document.documentElement,
): void {
  root.classList.toggle('mk-dyslexia', settings.dyslexiaFont)
  root.classList.toggle('mk-text-lg', settings.largeText)
}
