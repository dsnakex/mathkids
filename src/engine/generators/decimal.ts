// Nombres décimaux manipulés en ENTIERS mis à l'échelle (dixièmes, centièmes)
// pour éviter les erreurs de virgule flottante (0.1 + 0.2 ≠ 0.3). `decimals`
// est le nombre de chiffres après la virgule ; la valeur stockée est
// `nombre × 10^decimals`. Formatage et saisie à la française (virgule).

/** Affiche une valeur mise à l'échelle sans décimale inutile : 59,1 → « 5,9 ». */
export function formatDecimalFr(scaled: number, decimals: number): string {
  const unit = 10 ** decimals
  const whole = Math.floor(scaled / unit)
  const frac = scaled % unit
  if (frac === 0) return String(whole)
  const fracStr = String(frac).padStart(decimals, '0').replace(/0+$/, '')
  return `${whole},${fracStr}`
}

/**
 * Lit une saisie décimale → entier mis à l'échelle, ou `null`. Accepte la
 * virgule et le point ; « 5,9 » et « 5,90 » valent 59 (dixièmes) ; rejette une
 * précision plus fine que `decimals` (« 5,95 » en dixièmes → null).
 */
export function parseDecimal(text: string, decimals: number): number | null {
  const cleaned = text.replace(/\s/g, '').replace(',', '.')
  const m = cleaned.match(/^(\d+)(?:\.(\d+))?$/)
  if (!m) return null
  const whole = Number(m[1])
  const frac = (m[2] ?? '').replace(/0+$/, '') // ignore les zéros de fin
  if (frac.length > decimals) return null // trop de précision pour le format
  const scaledFrac = Number(frac.padEnd(decimals, '0') || '0')
  return whole * 10 ** decimals + scaledFrac
}
