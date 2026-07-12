import { enLettres } from '@/engine/generators/frenchNumbers'

describe('enLettres (écriture des nombres en toutes lettres, 0..100)', () => {
  it('écrit les nombres de 0 à 16 (formes irrégulières)', () => {
    expect(enLettres(0)).toBe('zéro')
    expect(enLettres(1)).toBe('un')
    expect(enLettres(7)).toBe('sept')
    expect(enLettres(11)).toBe('onze')
    expect(enLettres(16)).toBe('seize')
  })

  it('écrit les nombres composés en « dix-… » (17 à 19)', () => {
    expect(enLettres(17)).toBe('dix-sept')
    expect(enLettres(18)).toBe('dix-huit')
    expect(enLettres(19)).toBe('dix-neuf')
  })

  it('gère la liaison « et un » et le trait d\'union', () => {
    expect(enLettres(20)).toBe('vingt')
    expect(enLettres(21)).toBe('vingt et un')
    expect(enLettres(22)).toBe('vingt-deux')
    expect(enLettres(31)).toBe('trente et un')
    expect(enLettres(45)).toBe('quarante-cinq')
    expect(enLettres(50)).toBe('cinquante')
  })

  it('gère les soixante-dix (70 à 79)', () => {
    expect(enLettres(60)).toBe('soixante')
    expect(enLettres(69)).toBe('soixante-neuf')
    expect(enLettres(70)).toBe('soixante-dix')
    expect(enLettres(71)).toBe('soixante et onze')
    expect(enLettres(72)).toBe('soixante-douze')
    expect(enLettres(79)).toBe('soixante-dix-neuf')
  })

  it('gère les quatre-vingts (80 à 99)', () => {
    expect(enLettres(80)).toBe('quatre-vingts')
    expect(enLettres(81)).toBe('quatre-vingt-un')
    expect(enLettres(82)).toBe('quatre-vingt-deux')
    expect(enLettres(90)).toBe('quatre-vingt-dix')
    expect(enLettres(91)).toBe('quatre-vingt-onze')
    expect(enLettres(99)).toBe('quatre-vingt-dix-neuf')
  })

  it('écrit cent', () => {
    expect(enLettres(100)).toBe('cent')
  })

  it('rejette les nombres hors intervalle [0, 100]', () => {
    expect(() => enLettres(-1)).toThrow()
    expect(() => enLettres(101)).toThrow()
    expect(() => enLettres(1.5)).toThrow()
  })
})
