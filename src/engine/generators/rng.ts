// Générateur pseudo-aléatoire injectable et utilitaires de tirage.
//
// Toutes les fonctions de génération d'exercices reçoivent un `Rng` en
// paramètre plutôt que d'appeler `Math.random` directement : c'est ce qui
// rend les générateurs DÉTERMINISTES et donc testables (on injecte une graine
// fixe dans les tests, `Math.random` en production).

/** Une source d'aléa : renvoie un flottant dans [0, 1), comme `Math.random`. */
export type Rng = () => number

/**
 * PRNG « mulberry32 » : rapide, sans dépendance, reproductible pour une graine
 * donnée. Suffisant pour générer des exercices (pas d'usage cryptographique).
 */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Entier aléatoire dans l'intervalle inclusif [min, max]. */
export function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

/** Un élément au hasard du tableau (le tableau ne doit pas être vide). */
export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[randInt(rng, 0, arr.length - 1)]
}

/** `k` éléments distincts tirés au hasard (mélange partiel de Fisher-Yates). */
export function sample<T>(rng: Rng, arr: readonly T[], k: number): T[] {
  const copy = [...arr]
  const n = Math.min(k, copy.length)
  for (let i = 0; i < n; i++) {
    const j = randInt(rng, i, copy.length - 1)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

/** Copie mélangée du tableau (ne modifie pas la source). */
export function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randInt(rng, 0, i)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Construit les propositions d'un QCM numérique : exactement UNE bonne réponse
 * (`correct`) et `nChoices - 1` distracteurs distincts, plausibles mais faux.
 *
 * Les distracteurs sont d'abord puisés dans `pool` (erreurs typiques fournies
 * par le générateur : ±1, ±10, opérande échangée…). Si le vivier ne suffit pas,
 * on complète avec des valeurs voisines (correct ± k, jamais négatives) pour
 * toujours atteindre `nChoices` propositions.
 */
export function buildNumericChoices(
  rng: Rng,
  correct: number,
  pool: readonly number[],
  nChoices: number,
): { choices: number[]; correctIndex: number } {
  const distractors: number[] = []
  const used = new Set<number>([correct])

  const addCandidate = (value: number): void => {
    if (distractors.length >= nChoices - 1) return
    if (value < 0 || used.has(value)) return
    used.add(value)
    distractors.push(value)
  }

  for (const candidate of shuffle(rng, pool)) addCandidate(candidate)

  // Repli : élargit progressivement autour de la bonne réponse jusqu'à obtenir
  // assez de distracteurs (garanti de terminer car les valeurs sont uniques).
  for (let k = 1; distractors.length < nChoices - 1; k++) {
    addCandidate(correct + k)
    addCandidate(correct - k)
  }

  const choices = shuffle(rng, [correct, ...distractors])
  return { choices, correctIndex: choices.indexOf(correct) }
}
