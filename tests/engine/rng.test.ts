import {
  mulberry32,
  randInt,
  pick,
  sample,
  shuffle,
  buildNumericChoices,
} from '@/engine/generators/rng'

describe('mulberry32 (générateur pseudo-aléatoire déterministe)', () => {
  it('produit la même suite pour une même graine', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    const suiteA = [a(), a(), a(), a()]
    const suiteB = [b(), b(), b(), b()]
    expect(suiteA).toEqual(suiteB)
  })

  it('produit des valeurs dans [0, 1)', () => {
    const r = mulberry32(1)
    for (let i = 0; i < 100; i++) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('produit des suites différentes pour des graines différentes', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)())
  })
})

describe('randInt', () => {
  it('reste dans l\'intervalle inclusif [min, max]', () => {
    const r = mulberry32(7)
    for (let i = 0; i < 500; i++) {
      const v = randInt(r, 3, 8)
      expect(v).toBeGreaterThanOrEqual(3)
      expect(v).toBeLessThanOrEqual(8)
      expect(Number.isInteger(v)).toBe(true)
    }
  })

  it('couvre les deux bornes', () => {
    const r = mulberry32(123)
    const seen = new Set<number>()
    for (let i = 0; i < 500; i++) seen.add(randInt(r, 0, 3))
    expect(seen).toEqual(new Set([0, 1, 2, 3]))
  })

  it('renvoie la valeur unique quand min === max', () => {
    const r = mulberry32(9)
    expect(randInt(r, 5, 5)).toBe(5)
  })
})

describe('pick / sample / shuffle', () => {
  it('pick renvoie un élément du tableau', () => {
    const r = mulberry32(3)
    const arr = ['a', 'b', 'c']
    for (let i = 0; i < 50; i++) expect(arr).toContain(pick(r, arr))
  })

  it('sample renvoie k éléments distincts du tableau', () => {
    const r = mulberry32(5)
    const arr = [1, 2, 3, 4, 5, 6]
    const s = sample(r, arr, 3)
    expect(s).toHaveLength(3)
    expect(new Set(s).size).toBe(3)
    for (const v of s) expect(arr).toContain(v)
  })

  it('shuffle conserve exactement les mêmes éléments', () => {
    const r = mulberry32(11)
    const arr = [1, 2, 3, 4, 5]
    const s = shuffle(r, arr)
    expect([...s].sort((a, b) => a - b)).toEqual(arr)
  })

  it('shuffle ne modifie pas le tableau source', () => {
    const r = mulberry32(11)
    const arr = [1, 2, 3]
    shuffle(r, arr)
    expect(arr).toEqual([1, 2, 3])
  })
})

describe('buildNumericChoices', () => {
  it('contient exactement une bonne réponse, à l\'index annoncé', () => {
    const r = mulberry32(2)
    const { choices, correctIndex } = buildNumericChoices(r, 12, [10, 11, 13, 14], 4)
    expect(choices).toHaveLength(4)
    expect(choices[correctIndex]).toBe(12)
    expect(choices.filter((c) => c === 12)).toHaveLength(1)
  })

  it('ne contient que des propositions distinctes', () => {
    const r = mulberry32(4)
    const { choices } = buildNumericChoices(r, 8, [8, 9, 9, 7, 6], 4)
    expect(new Set(choices).size).toBe(choices.length)
  })

  it('complète avec des valeurs voisines si le vivier est insuffisant', () => {
    const r = mulberry32(6)
    // Vivier trop pauvre (une seule valeur exploitable) : le helper doit
    // fabriquer assez de distracteurs pour atteindre 4 propositions.
    const { choices, correctIndex } = buildNumericChoices(r, 5, [6], 4)
    expect(choices).toHaveLength(4)
    expect(new Set(choices).size).toBe(4)
    expect(choices[correctIndex]).toBe(5)
    expect(choices.every((c) => c >= 0)).toBe(true)
  })

  it('n\'utilise jamais la bonne réponse comme distracteur', () => {
    const r = mulberry32(8)
    const { choices, correctIndex } = buildNumericChoices(r, 10, [10, 10, 10], 3)
    const distractors = choices.filter((_, i) => i !== correctIndex)
    expect(distractors).not.toContain(10)
  })
})
