// Mini-évaluateur arithmétique MAISON pour les gabarits de problèmes.
// Sécurité : PAS de `eval` / `Function`. Grammaire volontairement minimale :
//   + - * /, parenthèses, moins unaire, littéraux entiers et variables.
// Descente récursive classique (priorité * / avant + -).

export type Scope = Record<string, number>

const TOKEN = /([0-9]+|[a-zA-Z][a-zA-Z0-9]*|<=|>=|==|!=|[-+*/()<>])/g

function tokenize(expr: string): string[] {
  const tokens = expr.match(TOKEN)
  if (!tokens || tokens.join('').replace(/\s/g, '') !== expr.replace(/\s/g, '')) {
    throw new Error(`Expression invalide : « ${expr} »`)
  }
  return tokens
}

/** Évalue une expression arithmétique dans un scope de variables. */
export function evalExpr(expr: string, scope: Scope): number {
  const tokens = tokenize(expr)
  let i = 0
  const peek = (): string | undefined => tokens[i]
  const next = (): string => tokens[i++]

  function parseExpr(): number {
    let value = parseTerm()
    while (peek() === '+' || peek() === '-') {
      const op = next()
      const right = parseTerm()
      value = op === '+' ? value + right : value - right
    }
    return value
  }

  function parseTerm(): number {
    let value = parseFactor()
    while (peek() === '*' || peek() === '/') {
      const op = next()
      const right = parseFactor()
      value = op === '*' ? value * right : value / right
    }
    return value
  }

  function parseFactor(): number {
    const token = peek()
    if (token === undefined) throw new Error(`Expression incomplète : « ${expr} »`)
    if (token === '-') {
      next()
      return -parseFactor()
    }
    if (token === '(') {
      next()
      const value = parseExpr()
      if (next() !== ')') throw new Error(`Parenthèse non fermée : « ${expr} »`)
      return value
    }
    if (/^[0-9]+$/.test(token)) {
      next()
      return Number(token)
    }
    if (/^[a-zA-Z]/.test(token)) {
      next()
      if (!(token in scope)) throw new Error(`Variable inconnue « ${token} » dans « ${expr} »`)
      return scope[token]
    }
    throw new Error(`Jeton inattendu « ${token} » dans « ${expr} »`)
  }

  const result = parseExpr()
  if (i !== tokens.length) throw new Error(`Expression mal formée : « ${expr} »`)
  return result
}

const COMPARATORS = /^(.*?)(<=|>=|==|!=|<|>)(.*)$/

/** Évalue une contrainte « expr OP expr » (op de comparaison) → booléen. */
export function evalConstraint(expr: string, scope: Scope): boolean {
  const m = expr.match(COMPARATORS)
  if (!m) throw new Error(`Contrainte invalide : « ${expr} »`)
  const left = evalExpr(m[1], scope)
  const right = evalExpr(m[3], scope)
  switch (m[2]) {
    case '<=':
      return left <= right
    case '>=':
      return left >= right
    case '<':
      return left < right
    case '>':
      return left > right
    case '==':
      return left === right
    default:
      return left !== right
  }
}
