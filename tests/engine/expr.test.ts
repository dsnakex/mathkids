import { evalExpr, evalConstraint } from '@/engine/generators/expr'

describe('evalExpr — mini-évaluateur arithmétique maison (sans eval)', () => {
  it('additions et soustractions', () => {
    expect(evalExpr('a+b', { a: 3, b: 4 })).toBe(7)
    expect(evalExpr('a-b', { a: 10, b: 4 })).toBe(6)
    expect(evalExpr('500-a', { a: 120 })).toBe(380)
    expect(evalExpr('a+b+1', { a: 2, b: 3 })).toBe(6)
  })
  it('multiplication avec priorité correcte', () => {
    expect(evalExpr('a*b', { a: 3, b: 4 })).toBe(12)
    expect(evalExpr('a+b*d', { a: 1, b: 2, d: 3 })).toBe(7)
    expect(evalExpr('a*b+d', { a: 2, b: 3, d: 4 })).toBe(10)
    expect(evalExpr('b*60+30', { b: 2 })).toBe(150)
  })
  it('parenthèses', () => {
    expect(evalExpr('(a+b)*2', { a: 2, b: 3 })).toBe(10)
    expect(evalExpr('20-(a+b)', { a: 5, b: 3 })).toBe(12)
    expect(evalExpr('a-(b+d)', { a: 10, b: 2, d: 3 })).toBe(5)
  })
  it('division et moins unaire', () => {
    expect(evalExpr('a/b', { a: 12, b: 4 })).toBe(3)
    expect(evalExpr('-a', { a: 3 })).toBe(-3)
  })
  it('littéraux seuls', () => {
    expect(evalExpr('3', {})).toBe(3)
    expect(evalExpr('1000-a', { a: 250 })).toBe(750)
  })
  it('rejette une variable inconnue (garde-fou contre les gabarits mal écrits)', () => {
    expect(() => evalExpr('a+z', { a: 1 })).toThrow()
  })
})

describe('evalConstraint — comparaisons', () => {
  it('évalue les opérateurs de comparaison', () => {
    expect(evalConstraint('a+b<=40', { a: 20, b: 10 })).toBe(true)
    expect(evalConstraint('a+b<=40', { a: 30, b: 20 })).toBe(false)
    expect(evalConstraint('a>b', { a: 5, b: 3 })).toBe(true)
    expect(evalConstraint('a>b', { a: 2, b: 3 })).toBe(false)
    expect(evalConstraint('a+b<20', { a: 10, b: 9 })).toBe(true)
    expect(evalConstraint('d*2000>a*b', { d: 1, a: 10, b: 10 })).toBe(true)
  })
})
