// Bannière « Installer l'application » (PWA). On capte l'événement
// beforeinstallprompt (Chrome/Android/Edge) et on propose un bouton discret ;
// l'installation reste au choix du parent. Sur iOS (pas d'événement), la
// bannière ne s'affiche pas — l'installation s'y fait via « Partager → Ajouter
// à l'écran d'accueil ».

import { useEffect, useState } from 'react'

// Type minimal de l'événement (non standardisé dans lib.dom).
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault() // on déclenchera l'invite nous-mêmes
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setDeferred(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!deferred || dismissed) return null

  const install = async () => {
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-3 rounded-card bg-card p-3 shadow-candy">
      <span aria-hidden="true" className="text-[28px]">🍣</span>
      <p className="flex-1 text-base font-bold text-ink">Installe MathKids pour jouer hors ligne !</p>
      <button
        type="button"
        onClick={install}
        className="rounded-btn-sm bg-primary px-3 py-2 text-base font-extrabold text-white shadow-candy-primary active:translate-y-[2px]"
      >
        Installer
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Plus tard"
        className="px-1 text-lg font-bold text-muted"
      >
        ✕
      </button>
    </div>
  )
}
