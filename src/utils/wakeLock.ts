// Helper « verrou d'écran » (Screen Wake Lock API) : empêche l'écran de
// s'éteindre pendant qu'un enfant lit une consigne ou réfléchit. Tout est
// enveloppé de gardes : si l'API n'existe pas ou refuse le verrou, on ne casse
// rien (fallback silencieux). Aucune donnée n'est envoyée en ligne.

/** Poignée renvoyée après une demande réussie : permet de relâcher le verrou. */
export interface WakeLockHandle {
  release: () => Promise<void>
}

/** L'appareil expose-t-il la Screen Wake Lock API ? (garde sûre) */
export function wakeLockSupported(nav: Navigator = navigator): boolean {
  return (
    typeof nav !== 'undefined' &&
    'wakeLock' in nav &&
    typeof nav.wakeLock?.request === 'function'
  )
}

/**
 * Demande un verrou d'écran. Renvoie une poignée si le verrou est obtenu,
 * `null` si l'API est absente ou si la demande échoue (onglet en arrière-plan,
 * batterie faible…). Ne lève jamais d'erreur.
 */
export async function requestWakeLock(nav: Navigator = navigator): Promise<WakeLockHandle | null> {
  if (!wakeLockSupported(nav)) return null
  try {
    const sentinel = await nav.wakeLock.request('screen')
    return {
      release: () => (sentinel.released ? Promise.resolve() : sentinel.release()),
    }
  } catch {
    // Verrou refusé par le navigateur : on continue sans, sans rien signaler.
    return null
  }
}
