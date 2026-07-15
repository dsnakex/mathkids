// Générateur de problèmes rédigés (chantier P3). Tire les variables sous
// contraintes, calcule les variables dérivées, évalue la réponse avec le
// mini-évaluateur maison (PAS de eval), et substitue les placeholders — y
// compris {answer} et le format monétaire {x:€}.

import type { LevelId } from '@/content/schema'
import { problemsForLevel, type ProblemSpec } from '@/content/problems'
import type { BarSchema, ProblemExercise } from './types'
import { evalExpr, evalConstraint, type Scope } from './expr'
import { formatEuros } from './money'
import { randInt, pick, type Rng } from './rng'

const MAX_ATTEMPTS = 50

/** Structures dont le modèle en barres partie-partie-tout est exact et standard. */
const ADDITIVE_STRUCTURES = new Set([
  'ajout',
  'reunion',
  'retrait',
  'transformation',
  'comparaison',
  'complement',
])

const isBareTerm = (s: string): boolean => /^[a-zA-Z][a-zA-Z0-9]*$|^[0-9]+$/.test(s.trim())

// Découpe « x + y » ou « x − y » en (gauche, droite, opérateur) SEULEMENT si les
// deux membres sont des termes simples (variable ou nombre). Renvoie null sinon
// (produit, multi-étapes, parenthèses…) → pas de schéma.
function splitAdditive(expr: string): { left: string; right: string; op: '+' | '-' } | null {
  let depth = 0
  for (let i = expr.length - 1; i >= 0; i--) {
    const c = expr[i]
    if (c === ')') depth++
    else if (c === '(') depth--
    else if (depth === 0 && (c === '+' || c === '-')) {
      const before = expr.slice(0, i).trim()
      if (before === '') continue // signe unaire
      const last = before[before.length - 1]
      if ('+-*/('.includes(last)) continue // opérateur unaire
      const left = expr.slice(0, i)
      const right = expr.slice(i + 1)
      if (!isBareTerm(left) || !isBareTerm(right)) return null
      return { left, right, op: c }
    }
  }
  return null
}

/**
 * Construit le schéma en barres d'un problème additif à une étape à partir des
 * valeurs tirées. Renvoie null si la structure ne s'y prête pas (produit,
 * partage, multi-étapes) ou si l'expression n'est pas un simple « x ± y ».
 */
export function buildBarSchema(
  problem: ProblemSpec,
  scope: Scope & { answer: number },
): BarSchema | null {
  if (!ADDITIVE_STRUCTURES.has(problem.structure)) return null
  const split = splitAdditive(problem.answer)
  if (!split) return null
  const lv = evalExpr(split.left, scope)
  const rv = evalExpr(split.right, scope)
  const fmt = (n: number): string =>
    problem.answerFormat === 'euros' ? formatEuros(n) : String(n)

  if (split.op === '+') {
    // x + y = ? : le tout est l'inconnue, les deux parts sont connues.
    return {
      total: scope.answer,
      totalLabel: '?',
      parts: [
        { label: fmt(lv), value: lv },
        { label: fmt(rv), value: rv },
      ],
    }
  }
  // x − y = ? : le tout (x) est connu, une part (y) connue, l'autre inconnue.
  return {
    total: lv,
    totalLabel: fmt(lv),
    parts: [
      { label: fmt(rv), value: rv },
      { label: '?', value: scope.answer },
    ],
  }
}

function drawVar(spec: { min: number; max: number; step?: number }, rng: Rng): number {
  const step = spec.step ?? 1
  const steps = Math.floor((spec.max - spec.min) / step)
  return spec.min + randInt(rng, 0, Math.max(0, steps)) * step
}

/**
 * Tire une instance : variables + dérivées + `answer`, en respectant les
 * contraintes (jusqu'à 50 essais). Renvoie le scope complet (answer inclus).
 */
export function drawInstance(problem: ProblemSpec, rng: Rng): Scope & { answer: number } {
  let scope: Scope = {}
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    scope = {}
    for (const [name, spec] of Object.entries(problem.vars)) scope[name] = drawVar(spec, rng)
    for (const [name, expr] of Object.entries(problem.derived)) scope[name] = evalExpr(expr, scope)
    if (problem.constraints.every((c) => evalConstraint(c, scope))) break
  }
  const answer = evalExpr(problem.answer, scope)
  return { ...scope, answer }
}

// Remplace {name} et {name:€} (name pouvant être « answer ») dans un texte.
function substitute(text: string, scope: Scope & { answer: number }): string {
  return text.replace(/\{([a-zA-Z]+)(:€)?\}/g, (_, name: string, euro?: string) => {
    const value = scope[name]
    if (value === undefined) throw new Error(`Placeholder inconnu « {${name}} »`)
    return euro ? formatEuros(value) : String(value)
  })
}

/** Options de rendu d'un problème. `barModel` active le schéma en barres (hors CP). */
export interface RenderOptions {
  barModel?: boolean
}

/** Construit l'exercice à partir d'un tirage déjà réalisé (substitution). */
export function renderProblem(
  problem: ProblemSpec,
  scope: Scope & { answer: number },
  opts: RenderOptions = {},
): ProblemExercise {
  const schema = opts.barModel ? buildBarSchema(problem, scope) : null
  return {
    type: 'problem',
    prompt: substitute(problem.template, scope),
    answer: scope.answer,
    answerFormat: problem.answerFormat,
    hints: problem.hints.map((h) => substitute(h, scope)),
    explanation: substitute(problem.explanation, scope),
    unit: problem.unit,
    ...(schema ? { schema } : {}),
  }
}

/** Produit un exercice « problème » prêt à afficher (énoncé, indices, explication). */
export function generateProblem(
  problem: ProblemSpec,
  rng: Rng,
  opts: RenderOptions = {},
): ProblemExercise {
  return renderProblem(problem, drawInstance(problem, rng), opts)
}

// --- Branchement des GeneratorSpec « problem » sur la banque -----------------

// Le curriculum emploie des structures plus fines que la banque : on les
// ramène aux structures de la banque.
const STRUCTURE_ALIAS: Record<string, string> = {
  'comparaison-plus': 'ajout',
  'comparaison-moins': 'retrait',
  ecart: 'retrait',
  partage: 'division',
  'ajout-retrait': 'deux-etapes',
  mixte: 'deux-etapes',
}

const stepClass = (etapes: number): 'single' | 'multi' => (etapes <= 1 ? 'single' : 'multi')

/**
 * Sélectionne un problème de la banque correspondant au gabarit (niveau,
 * structure, nombre d'étapes). Repli par classe d'étapes si aucune structure ne
 * correspond, puis n'importe quel problème du niveau. `null` si le niveau est vide.
 */
export function pickProblem(
  level: LevelId,
  structure: string,
  etapes: number,
  rng: Rng,
): ProblemSpec | null {
  const pool = problemsForLevel(level)
  if (pool.length === 0) return null
  const wanted = STRUCTURE_ALIAS[structure] ?? structure
  const wantedClass = stepClass(etapes)

  const exact = pool.filter((p) => p.structure === wanted && stepClass(p.etapes) === wantedClass)
  if (exact.length > 0) return pick(rng, exact)
  const sameClass = pool.filter((p) => stepClass(p.etapes) === wantedClass)
  if (sameClass.length > 0) return pick(rng, sameClass)
  return pick(rng, pool)
}

/** Vrai s'il existe un problème EXACT (structure aliasée + classe d'étapes). */
export function hasExactProblem(level: LevelId, structure: string, etapes: number): boolean {
  const wanted = STRUCTURE_ALIAS[structure] ?? structure
  return problemsForLevel(level).some(
    (p) => p.structure === wanted && stepClass(p.etapes) === stepClass(etapes),
  )
}
