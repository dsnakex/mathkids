// Hook React d'activation du verrou d'écran, à monter sur les écrans où l'enfant
// peut rester immobile (session d'exercice, Défi calcul). Le verrou est relâché
// automatiquement par le navigateur quand l'onglet passe en arrière-plan : on le
// re-demande dès que l'onglet redevient visible. Cleanup propre au démontage.

import { useEffect } from 'react'
import { requestWakeLock, type WakeLockHandle } from '@/utils/wakeLock'

export function useWakeLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return

    let handle: WakeLockHandle | null = null
    let cancelled = false

    const acquire = async () => {
      if (cancelled || document.visibilityState !== 'visible' || handle) return
      handle = await requestWakeLock()
      if (cancelled && handle) {
        // Démonté pendant l'await : on relâche aussitôt le verrou obtenu.
        void handle.release()
        handle = null
      }
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void acquire()
    }

    void acquire()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      void handle?.release()
    }
  }, [enabled])
}
