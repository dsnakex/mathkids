import { parseDecimal, formatDecimalFr } from '@/engine/generators/decimal'

describe('formatDecimalFr — affichage français (virgule)', () => {
  it('formate une valeur mise à l\'échelle (dixièmes / centièmes)', () => {
    expect(formatDecimalFr(59, 1)).toBe('5,9')
    expect(formatDecimalFr(50, 1)).toBe('5') // pas de décimale inutile
    expect(formatDecimalFr(305, 2)).toBe('3,05')
    expect(formatDecimalFr(370, 2)).toBe('3,7')
    expect(formatDecimalFr(0, 1)).toBe('0')
  })
})

describe('parseDecimal — « 5,9 » = « 5,90 », rejet des précisions excédentaires', () => {
  it('accepte virgule et point', () => {
    expect(parseDecimal('5,9', 1)).toBe(59)
    expect(parseDecimal('5.9', 1)).toBe(59)
  })
  it('« 5,9 » et « 5,90 » valent 59 dixièmes', () => {
    expect(parseDecimal('5,9', 1)).toBe(59)
    expect(parseDecimal('5,90', 1)).toBe(59) // zéros de fin ignorés
  })
  it('entiers acceptés', () => {
    expect(parseDecimal('5', 1)).toBe(50)
    expect(parseDecimal('12', 2)).toBe(1200)
  })
  it('rejette une précision plus fine que le format', () => {
    expect(parseDecimal('5,95', 1)).toBeNull() // centièmes pour un exo en dixièmes
    expect(parseDecimal('', 1)).toBeNull()
    expect(parseDecimal('abc', 1)).toBeNull()
  })
  it('gère les centièmes', () => {
    expect(parseDecimal('3,05', 2)).toBe(305)
    expect(parseDecimal('3,5', 2)).toBe(350)
  })
})
