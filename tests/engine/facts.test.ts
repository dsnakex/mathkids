import { mulberry32 } from '@/engine/generators/rng'
import {
  factKey,
  factAnswer,
  applyFactResult,
  initialFactState,
  factsByPriority,
  nextFact,
  factQuestion,
  multiplicationFacts,
  tablesForLevel,
  tableStatus,
  FACT_MAX_BOX,
  FACT_MASTERED_BOX,
  type FactState,
} from '@/engine/facts'

describe('facts — identité stable d\'un fait', () => {
  it('7×8 et 8×7 partagent la même clé (commutatif)', () => {
    expect(factKey({ op: '×', a: 7, b: 8 })).toBe(factKey({ op: '×', a: 8, b: 7 }))
    expect(factKey({ op: '×', a: 7, b: 8 })).toBe('×:7:8')
  })
  it('la division n\'est pas commutative', () => {
    expect(factKey({ op: '÷', a: 56, b: 8 })).not.toBe(factKey({ op: '÷', a: 8, b: 56 }))
  })
  it('factAnswer calcule le résultat', () => {
    expect(factAnswer({ op: '×', a: 7, b: 8 })).toBe(56)
    expect(factAnswer({ op: '÷', a: 56, b: 8 })).toBe(7)
  })
})

describe('facts — mini-Leitner par fait', () => {
  it('bonne réponse → boîte suivante, plafonnée', () => {
    let s = initialFactState()
    for (let i = 0; i < 10; i++) s = applyFactResult(s, true)
    expect(s.box).toBe(FACT_MAX_BOX)
    expect(s.correct).toBe(10)
  })
  it('erreur → retour boîte 0 (le fait remonte en priorité)', () => {
    const s = applyFactResult({ box: 3, correct: 5, wrong: 0 }, false)
    expect(s.box).toBe(0)
    expect(s.wrong).toBe(1)
  })
  it('bonne mais lente → reste dans sa boîte (ni progrès ni sanction)', () => {
    const s = applyFactResult({ box: 2, correct: 1, wrong: 0 }, true, true)
    expect(s.box).toBe(2)
    expect(s.correct).toBe(2)
  })
})

describe('facts — priorité de révision', () => {
  const facts = multiplicationFacts(7) // 7×1..7×10

  function statesWithWeak(): Record<string, FactState> {
    const states: Record<string, FactState> = {}
    for (const f of facts) states[factKey(f)] = { box: FACT_MAX_BOX, correct: 3, wrong: 0 }
    states[factKey({ op: '×', a: 7, b: 8 })] = { box: 0, correct: 0, wrong: 2 } // raté
    return states
  }

  it('un fait raté remonte en tête du classement', () => {
    const ordered = factsByPriority(facts, statesWithWeak())
    expect(factKey(ordered[0])).toBe('×:7:8')
  })

  it('nextFact renvoie toujours un fait de la table, en favorisant le plus faible', () => {
    const states = statesWithWeak()
    let weakHits = 0
    for (let seed = 0; seed < 60; seed++) {
      const f = nextFact(facts, states, mulberry32(seed * 13 + 1))
      expect(facts.some((x) => factKey(x) === factKey(f))).toBe(true)
      if (factKey(f) === '×:7:8') weakHits++
    }
    // Poids 5 (raté) contre 1 (maîtrisés × 9) ⇒ le fait faible sort souvent.
    expect(weakHits).toBeGreaterThan(10)
  })
})

describe('facts — question ciblée (une bonne réponse + distracteurs)', () => {
  it('produit un QCM correct pour le fait demandé', () => {
    for (let seed = 0; seed < 40; seed++) {
      const q = factQuestion({ op: '×', a: 7, b: 8 }, mulberry32(seed))
      expect(q.type).toBe('qcm')
      expect(q.prompt).toBe('Combien font 7 × 8 ?')
      expect(q.choices).toHaveLength(4)
      expect(q.choices[q.correctIndex]).toBe('56')
      expect(new Set(q.choices).size).toBe(4) // toutes distinctes
    }
  })
})

describe('facts — tableau « mes tables »', () => {
  it('tablesForLevel : rien au CP, plus large dès le CE2', () => {
    expect(tablesForLevel('cp')).toEqual([])
    expect(tablesForLevel('ce1')).toEqual([2, 3, 4, 5])
    expect(tablesForLevel('ce2')).toContain(9)
  })

  it('statut d\'une table : neuve → à revoir → maîtrisée', () => {
    expect(tableStatus(7, {})).toBe('new')

    const learning: Record<string, FactState> = {
      [factKey({ op: '×', a: 7, b: 8 })]: { box: 0, correct: 0, wrong: 1 },
    }
    expect(tableStatus(7, learning)).toBe('learning')

    const mastered: Record<string, FactState> = {}
    for (const f of multiplicationFacts(7)) {
      mastered[factKey(f)] = { box: FACT_MASTERED_BOX, correct: 2, wrong: 0 }
    }
    expect(tableStatus(7, mastered)).toBe('mastered')
  })
})
