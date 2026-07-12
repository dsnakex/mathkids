import type { HTMLAttributes, ReactNode } from 'react'

// Carte crème à coins très arrondis et léger relief « bonbon ».
// Brique de base des bulles, cartes profil, panneaux de leçon, etc.
type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`rounded-card bg-card shadow-candy ${className}`} {...props}>
      {children}
    </div>
  )
}
