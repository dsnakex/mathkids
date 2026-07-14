// Monnaie en euros. POINT CRITIQUE : tout est manipulé en CENTIMES ENTIERS en
// interne (jamais de flottants : 0.1 + 0.2 ≠ 0.3). Le formatage français ne se
// fait qu'à l'affichage. La confusion 3,5 / 3,05 / 3,50 est exploitée dans les
// distracteurs et gérée à la saisie (« 3,5 » et « 3,50 » valent tous deux 350).

import { randInt, pick, shuffle, type Rng } from './rng'
import type { MoneyComposeExercise, MoneyInputExercise, QcmExercise } from './types'

/** Pièces et billets en circulation, en centimes (1 c → 50 €). */
export const MONEY_UNITS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000] as const

/** Étiquette courte d'une pièce/d'un billet : « 20 c » ou « 2 € ». */
export function unitLabel(cents: number): string {
  return cents < 100 ? `${cents} c` : `${cents / 100} €`
}

/** Affichage français : virgule, centimes sur 2 chiffres, symbole € après. */
export function formatEuros(cents: number): string {
  const euros = Math.floor(cents / 100)
  const rest = cents % 100
  if (rest === 0) return `${euros} €`
  return `${euros},${String(rest).padStart(2, '0')} €`
}

/**
 * Lit une saisie en euros → centimes entiers, ou `null` si invalide.
 * Accepte la virgule ET le point, l'espace et le €. « 3,5 » et « 3,50 » → 350.
 */
export function parseEuros(text: string): number | null {
  const cleaned = text.replace(/€/g, '').replace(/\s/g, '').replace(',', '.')
  if (cleaned === '') return null
  const m = cleaned.match(/^(\d+)(?:\.(\d{1,2}))?$/)
  if (!m) return null
  const euros = Number(m[1])
  const cents = Number((m[2] ?? '').padEnd(2, '0')) // « 5 » → 50, « 05 » → 5
  return euros * 100 + cents
}

/**
 * Distracteurs plausibles (en centimes), en exploitant EN PREMIER la confusion
 * des centimes : pour 3 € 5 c (305) → propose 3,50 € (350) ; pour 3 € 50 c (350)
 * → propose 3,05 € (305). Complète avec des écarts d'1 €, 10 c, 5 c.
 */
export function moneyDistractors(cents: number, rng: Rng, count = 3): number[] {
  const euros = Math.floor(cents / 100)
  const rest = cents % 100

  const confusion: number[] = []
  if (rest > 0 && rest < 10) confusion.push(euros * 100 + rest * 10) // 3,05 → 3,50
  if (rest >= 10 && rest % 10 === 0) confusion.push(euros * 100 + rest / 10) // 3,50 → 3,05

  const out: number[] = []
  const add = (v: number) => {
    if (v >= 0 && v !== cents && !out.includes(v)) out.push(v)
  }
  confusion.forEach(add) // garantie : la confusion figure en premier
  for (const v of shuffle(rng, [cents + 100, cents - 100, cents + 10, cents - 10, cents + 5, cents - 5, cents + 50])) {
    if (out.length >= count) break
    add(v)
  }
  for (let k = 1; out.length < count; k++) {
    add(cents + k * 5)
    add(cents - k * 5)
  }
  return out.slice(0, count)
}

type Params = Record<string, unknown>
const numParam = (p: Params, k: string): number | undefined =>
  typeof p[k] === 'number' ? (p[k] as number) : undefined

// Décompose un montant en pièces/billets (glouton, exact avec les euros).
function greedyUnits(cents: number): number[] {
  const out: number[] = []
  let rest = cents
  for (const u of [...MONEY_UNITS].reverse()) {
    while (rest >= u) {
      out.push(u)
      rest -= u
    }
  }
  return out
}

// Construit les 4 propositions (formatées) autour du bon montant, en incluant
// la confusion des centimes.
function moneyChoices(cents: number, rng: Rng): { choices: string[]; correctIndex: number } {
  const values = shuffle(rng, [cents, ...moneyDistractors(cents, rng)])
  return { choices: values.map(formatEuros), correctIndex: values.indexOf(cents) }
}

// Montant tiré selon le palier : 1 = euros entiers (CP) ; 2 = centimes seuls ;
// 3+ = euros et centimes.
function amountForPalier(palier: number, rng: Rng): number {
  if (palier <= 1) return randInt(rng, 1, 20) * 100
  if (palier === 2) return randInt(rng, 1, 19) * 5
  return randInt(rng, 1, 5) * 100 + randInt(rng, 0, 19) * 5
}

/** Compter une somme : pièces posées → choisir le total (QCM). */
export function genMoneyCount(params: Params, rng: Rng): QcmExercise {
  const cents = amountForPalier(numParam(params, 'palier') ?? 2, rng)
  const { choices, correctIndex } = moneyChoices(cents, rng)
  return {
    type: 'qcm',
    prompt: "Combien d'argent y a-t-il ?",
    choices,
    correctIndex,
    visual: { kind: 'coins', units: greedyUnits(cents) },
  }
}

/** Convertir « X € et Y c » → saisie « X,YY € » (accepte 3,5 et 3,50). */
export function genMoneyConvert(_params: Params, rng: Rng): MoneyInputExercise {
  const euros = randInt(rng, 1, 9)
  const c = pick(rng, [5, 50, 25, 45, 15, 30, 20, 10, 35, 40, 60, 75])
  return {
    type: 'moneyinput',
    prompt: `${euros} € et ${c} c = ? €`,
    cents: euros * 100 + c,
  }
}

/** Composer une somme en posant des pièces/billets (plusieurs solutions valides). */
export function genMoneyCompose(params: Params, rng: Rng): MoneyComposeExercise {
  const cents = amountForPalier(numParam(params, 'palier') ?? 3, rng)
  return { type: 'moneycompose', prompt: `Compose ${formatEuros(cents)}`, cents }
}

/** Rendre la monnaie : prix + somme donnée → saisie du rendu. */
export function genMoneyChange(_params: Params, rng: Rng): MoneyInputExercise {
  const price = randInt(rng, 1, 9) * 100 + randInt(rng, 1, 19) * 5
  const paid = (Math.floor(price / 100) + randInt(rng, 1, 3)) * 100 // billet supérieur
  return {
    type: 'moneyinput',
    prompt: `L'article coûte ${formatEuros(price)}. Tu donnes ${formatEuros(paid)}. Rends la monnaie : ? €`,
    cents: paid - price,
  }
}
