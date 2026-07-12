// Écriture des nombres entiers en toutes lettres, de 0 à 100 (français).
// Utilisé par les générateurs « lire-nombre » / « écrire-nombre » du CP.
// Volontairement borné à [0, 100] : c'est l'intervalle du programme CP.

// Formes de 0 à 19 (toutes irrégulières en français).
const JUSQU_A_19 = [
  'zéro',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
  'dix-sept',
  'dix-huit',
  'dix-neuf',
]

// Dizaines « régulières » (celles qui se combinent avec « et un » / « -deux »…).
const DIZAINES: Record<number, string> = {
  2: 'vingt',
  3: 'trente',
  4: 'quarante',
  5: 'cinquante',
  6: 'soixante',
}

// Rend un entier de 0 à 99 en toutes lettres (brique interne).
function sousCent(n: number): string {
  if (n <= 19) return JUSQU_A_19[n]

  // 20..69 : dizaine régulière + unité, avec « et un » pour les 21, 31, 41, 51, 61.
  if (n < 70) {
    const tens = Math.floor(n / 10)
    const unit = n % 10
    if (unit === 0) return DIZAINES[tens]
    if (unit === 1) return `${DIZAINES[tens]} et un`
    return `${DIZAINES[tens]}-${JUSQU_A_19[unit]}`
  }

  // 70..79 : « soixante » + (dix..dix-neuf), avec « et onze » pour 71.
  if (n < 80) {
    const reste = n - 60 // 10..19
    if (reste === 11) return 'soixante et onze'
    return `soixante-${JUSQU_A_19[reste]}`
  }

  // 80..99 : « quatre-vingt(s) » + reste 0..19 (pas de « et » : 81 = quatre-vingt-un).
  const reste = n - 80 // 0..19
  if (reste === 0) return 'quatre-vingts'
  return `quatre-vingt-${JUSQU_A_19[reste]}`
}

// Rend un entier de 0 à 999 en toutes lettres (brique interne).
function sousMille(n: number): string {
  if (n < 100) return sousCent(n)
  // 100..999 : centaines + reste. « cent » ne prend un « s » que s'il n'est pas
  // suivi d'un nombre (200 = « deux cents », mais 201 = « deux cent un »).
  const hundreds = Math.floor(n / 100)
  const reste = n % 100
  if (reste === 0) return hundreds === 1 ? 'cent' : `${sousCent(hundreds)} cents`
  const prefix = hundreds === 1 ? 'cent' : `${sousCent(hundreds)} cent`
  return `${prefix} ${sousCent(reste)}`
}

/**
 * Rend un entier de 0 à 10000 en toutes lettres.
 * @throws si `n` n'est pas un entier de l'intervalle [0, 10000].
 */
export function enLettres(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 10000) {
    throw new RangeError(`enLettres attend un entier de 0 à 10000 (reçu : ${n})`)
  }

  if (n < 1000) return sousMille(n)
  if (n === 10000) return 'dix mille'

  // 1000..9999 : milliers + reste. « mille » est invariable (jamais de « s »).
  const thousands = Math.floor(n / 1000)
  const reste = n % 1000
  const prefix = thousands === 1 ? 'mille' : `${sousMille(thousands)} mille`
  return reste === 0 ? prefix : `${prefix} ${sousMille(reste)}`
}
