import { formatEuros, parseEuros, moneyDistractors } from '@/engine/generators/money'
import { mulberry32 } from '@/engine/generators/rng'

describe('formatEuros — affichage français (virgule, € après, centimes sur 2 chiffres)', () => {
  it('formate euros et centimes', () => {
    expect(formatEuros(305)).toBe('3,05 €')
    expect(formatEuros(350)).toBe('3,50 €')
    expect(formatEuros(50)).toBe('0,50 €')
    expect(formatEuros(5)).toBe('0,05 €')
    expect(formatEuros(1250)).toBe('12,50 €')
  })
  it('euros ronds sans centimes', () => {
    expect(formatEuros(300)).toBe('3 €')
    expect(formatEuros(0)).toBe('0 €')
  })
})

describe('parseEuros — POINT CRITIQUE : « 3,5 » = « 3,50 » = 3,50 €', () => {
  it('accepte virgule ET point, avec ou sans €', () => {
    expect(parseEuros('3,45')).toBe(345)
    expect(parseEuros('3.45')).toBe(345)
    expect(parseEuros('3,45 €')).toBe(345)
  })
  it('« 3,5 » et « 3,50 » valent tous deux 350 centimes', () => {
    expect(parseEuros('3,5')).toBe(350)
    expect(parseEuros('3,50')).toBe(350)
  })
  it('distingue bien 3,05 (3 € et 5 c) de 3,50', () => {
    expect(parseEuros('3,05')).toBe(305)
    expect(parseEuros('0,05')).toBe(5)
  })
  it('euros entiers', () => {
    expect(parseEuros('3')).toBe(300)
    expect(parseEuros('12 €')).toBe(1200)
  })
  it('rejette les saisies invalides', () => {
    expect(parseEuros('')).toBeNull()
    expect(parseEuros('abc')).toBeNull()
    expect(parseEuros('3,456')).toBeNull() // plus de 2 décimales
  })
})

describe('moneyDistractors — exploite la confusion des centimes', () => {
  it('pour 3 € et 5 c (305), propose 3,50 € (350)', () => {
    const d = moneyDistractors(305, mulberry32(1))
    expect(d).toContain(350)
    expect(d).not.toContain(305)
  })
  it('pour 3 € et 50 c (350), propose 3,05 € (305)', () => {
    const d = moneyDistractors(350, mulberry32(1))
    expect(d).toContain(305)
    expect(d).not.toContain(350)
  })
  it('ne renvoie que des montants positifs et distincts', () => {
    const d = moneyDistractors(120, mulberry32(2))
    expect(d.every((c) => c >= 0)).toBe(true)
    expect(new Set(d).size).toBe(d.length)
  })
})
