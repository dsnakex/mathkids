import { timePhrase, smallHandAngle, bigHandAngle, minutesForPalier } from '@/engine/generators/time'

describe('timePhrase — lecture en toutes lettres', () => {
  it('heures entières (singulier pour 1 heure)', () => {
    expect(timePhrase(3, 0)).toBe('3 heures')
    expect(timePhrase(1, 0)).toBe('1 heure')
    expect(timePhrase(12, 0)).toBe('12 heures')
  })
  it('et quart / et demie', () => {
    expect(timePhrase(3, 15)).toBe('3 heures et quart')
    expect(timePhrase(3, 30)).toBe('3 heures et demie')
    expect(timePhrase(1, 30)).toBe('1 heure et demie')
  })
  it('moins le quart (rattaché à l\'heure suivante, avec passage 12 → 1)', () => {
    expect(timePhrase(3, 45)).toBe('4 heures moins le quart')
    expect(timePhrase(12, 45)).toBe('1 heure moins le quart')
  })
  it('minutes intermédiaires (palier 5 min)', () => {
    expect(timePhrase(3, 20)).toBe('3 heures 20')
    expect(timePhrase(3, 5)).toBe('3 heures 5')
  })
})

describe('angles des aiguilles — POINT CRITIQUE : petite aiguille continue', () => {
  it('petite aiguille = (h%12)*30 + m*0,5 (entre les chiffres aux demies/quarts)', () => {
    expect(smallHandAngle(3, 0)).toBe(90)
    expect(smallHandAngle(12, 0)).toBe(0)
    expect(smallHandAngle(6, 0)).toBe(180)
    // À 3 h 30, la petite aiguille est à MI-CHEMIN entre 3 (90°) et 4 (120°) → 105°.
    expect(smallHandAngle(3, 30)).toBe(105)
    // À 3 h 45, aux trois quarts entre 3 et 4 → 112,5°.
    expect(smallHandAngle(3, 45)).toBe(112.5)
    // À 12 h 30, entre 12 (0°/360°) et 1 (30°) → 15°.
    expect(smallHandAngle(12, 30)).toBe(15)
  })
  it('grande aiguille = m*6', () => {
    expect(bigHandAngle(0)).toBe(0)
    expect(bigHandAngle(15)).toBe(90)
    expect(bigHandAngle(30)).toBe(180)
    expect(bigHandAngle(45)).toBe(270)
  })
})

describe('minutesForPalier', () => {
  it('palier 2 = heures et demies', () => {
    expect(minutesForPalier(2)).toEqual([0, 30])
  })
  it('palier 3 = quarts', () => {
    expect(minutesForPalier(3)).toEqual([0, 15, 30, 45])
  })
  it('palier 4 = 5 minutes près', () => {
    expect(minutesForPalier(4)).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])
  })
})
