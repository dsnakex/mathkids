// Bouton audio en forme de patte de chat (lecture des consignes via Web Speech
// API, branchée en Phase 4). Rond, relief « bonbon », grande cible tactile.
type AudioButtonProps = {
  /** Décrit l'action pour les lecteurs d'écran, ex. « Écouter la consigne ». */
  label: string
  onClick?: () => void
  className?: string
}

export function AudioButton({ label, onClick, className = '' }: AudioButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`grid h-[52px] w-[52px] flex-none place-items-center rounded-full bg-primary text-white shadow-candy-primary transition-transform active:translate-y-[3px] active:shadow-candy-primary-pressed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 ${className}`}
    >
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="currentColor">
        {/* 3 coussinets + pad blanc : une petite patte de chat */}
        <ellipse cx="7.5" cy="8.5" rx="1.9" ry="2.5" />
        <ellipse cx="12" cy="7" rx="1.9" ry="2.5" />
        <ellipse cx="16.5" cy="8.5" rx="1.9" ry="2.5" />
        <path d="M12 11.2c2.8 0 4.9 1.9 4.9 4 0 1.9-1.7 2.9-3.3 2.3-1-.4-2.2-.4-3.2 0-1.6.6-3.3-.4-3.3-2.3 0-2.1 2.1-4 4.9-4Z" />
      </svg>
    </button>
  )
}
