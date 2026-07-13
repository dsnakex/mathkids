// Helpers « temps » partagés par le générateur d'horloge et le rendu SVG.
// POINT PÉDAGOGIQUE CRITIQUE : la petite aiguille (heures) avance EN CONTINU.
// À la demi-heure ou au quart, elle n'est pas sur le chiffre mais entre deux
// chiffres — c'est la difficulté principale et l'erreur classique des apps.

/** Angle de la PETITE aiguille (heures), en degrés (0 = midi, sens horaire). */
export function smallHandAngle(hours: number, minutes: number): number {
  return (hours % 12) * 30 + minutes * 0.5
}

/** Angle de la GRANDE aiguille (minutes), en degrés. */
export function bigHandAngle(minutes: number): number {
  return minutes * 6
}

const hourWord = (h: number): string => (h === 1 ? '1 heure' : `${h} heures`)

/**
 * Lecture d'une heure en toutes lettres (1 ≤ h ≤ 12, m multiple de 5).
 * « et quart », « et demie », « moins le quart » (rattaché à l'heure suivante).
 */
export function timePhrase(hours: number, minutes: number): string {
  const next = (hours % 12) + 1 // heure suivante, 12 → 1
  switch (minutes) {
    case 0:
      return hourWord(hours)
    case 15:
      return `${hourWord(hours)} et quart`
    case 30:
      return `${hourWord(hours)} et demie`
    case 45:
      return `${hourWord(next)} moins le quart`
    default:
      return `${hourWord(hours)} ${minutes}`
  }
}

/** Minutes autorisées selon le palier (2 = demies, 3 = quarts, 4 = 5 min). */
export function minutesForPalier(palier: number): number[] {
  if (palier <= 2) return [0, 30]
  if (palier === 3) return [0, 15, 30, 45]
  return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
}
