// Croquette d'or — récompense-signature commune du portefeuille MaiTao
// (« l'éditeur des mondes de chats »). Pièce d'or frappée d'une patte de chat.
// Or maison #F4C95D + contour #C98A2E : reste lisible même posée sur une
// pastille dorée (bg-gold), sur fond crème et sur fond nuit.
// Décoratif par défaut (aria-hidden) ; un libellé accessible via `title`.

type CroquetteOrProps = {
  /** Taille affichée en px (carré). */
  size?: number
  /** Libellé accessible. Sans titre, l'icône est décorative. */
  title?: string
  className?: string
}

export function CroquetteOr({
  size = 20,
  title,
  className = 'inline-block align-middle',
}: CroquetteOrProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="16" cy="16" r="15" fill="#C98A2E" />
      <circle cx="16" cy="16" r="12.4" fill="#F4C95D" />
      <circle cx="16" cy="16" r="12.4" fill="none" stroke="#E0AE4A" strokeWidth="1" />
      <ellipse
        cx="11.5"
        cy="11"
        rx="4"
        ry="2.6"
        fill="#FCE7A6"
        opacity="0.7"
        transform="rotate(-35 11.5 11)"
      />
      <g fill="#7A511A">
        <ellipse cx="16" cy="19.2" rx="4.2" ry="3.4" />
        <ellipse cx="10.8" cy="14.7" rx="1.9" ry="2.3" />
        <ellipse cx="14.3" cy="12.2" rx="1.9" ry="2.4" />
        <ellipse cx="17.7" cy="12.2" rx="1.9" ry="2.4" />
        <ellipse cx="21.2" cy="14.7" rx="1.9" ry="2.3" />
      </g>
    </svg>
  )
}
