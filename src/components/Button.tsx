import type { ButtonHTMLAttributes, ReactNode } from 'react'

// Bouton d'action. Deux variantes :
// - « primary » : gros bouton vert « bonbon » avec relief 3D (action principale).
// - « ghost »   : lien discret souligné (actions secondaires, ex. « Espace parent »).
type Variant = 'primary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-btn font-sans font-extrabold ' +
  'transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 ' +
  'disabled:pointer-events-none disabled:opacity-60'

const VARIANTS: Record<Variant, string> = {
  // Relief « bonbon » : ombre pleine dessous, qui se réduit quand on presse.
  primary:
    'min-h-[52px] bg-primary px-6 py-4 text-[21px] text-white ' +
    'shadow-candy-primary active:translate-y-[3px] active:shadow-candy-primary-pressed',
  ghost:
    'min-h-[48px] bg-transparent px-3 py-3 text-lg text-muted underline ' +
    'active:translate-y-[1px]',
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
