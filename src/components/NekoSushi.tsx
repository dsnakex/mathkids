// Personnage chat-sushi. Rend une instance d'un <symbol> de la feuille de
// sprites (voir NekoSushiSprites, à monter une fois à la racine).
// Chaque variante porte son expression canonique (heureux / éveillé / endormi) ;
// les états animés (pulse, clignement) viendront avec la carte du monde.

export type NekoVariant =
  | 'chef' // mascotte-guide (présente sur tous les écrans)
  | 'nigiri' // étape réussie
  | 'maki' // étape réussie / avatar calico
  | 'tamago' // étape réussie
  | 'temaki' // étape en cours / avatar noir
  | 'onigiri' // étape verrouillée (endormie)
  | 'maki-dodo' // étape verrouillée (endormie)

// viewBox propre à chaque <symbol> (repris de neko-sushi-sprites.svg).
const VIEWBOX: Record<NekoVariant, { w: number; h: number }> = {
  chef: { w: 100, h: 112 },
  nigiri: { w: 96, h: 92 },
  maki: { w: 96, h: 92 },
  tamago: { w: 96, h: 92 },
  temaki: { w: 96, h: 100 },
  onigiri: { w: 96, h: 88 },
  'maki-dodo': { w: 96, h: 92 },
}

type NekoSushiProps = {
  variant: NekoVariant
  /** Largeur affichée en px (la hauteur suit le ratio du personnage). */
  size?: number
  /** Libellé accessible. Sans titre, le personnage est décoratif (aria-hidden). */
  title?: string
  className?: string
}

export function NekoSushi({
  variant,
  size = 84,
  title,
  className = '',
}: NekoSushiProps) {
  const { w, h } = VIEWBOX[variant]
  return (
    <svg
      className={className}
      width={size}
      height={(size * h) / w}
      viewBox={`0 0 ${w} ${h}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <use href={`#ns-${variant}`} width={w} height={h} />
    </svg>
  )
}
