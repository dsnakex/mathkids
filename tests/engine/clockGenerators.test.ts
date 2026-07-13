import type { GeneratorSpec } from '@/content/schema'
import { mulberry32 } from '@/engine/generators/rng'
import { generateExercise, canGenerate } from '@/engine/generators'
import { timePhrase, minutesForPalier } from '@/engine/generators/time'
import { timeDistractors } from '@/engine/generators/clock'
import { isAnswerCorrect } from '@/engine/generators/types'

describe('clock-read — lire l\'heure (QCM en toutes lettres)', () => {
  it('affiche une horloge et une seule bonne phrase, minutes conformes au palier', () => {
    for (const palier of [2, 3, 4]) {
      const spec: GeneratorSpec = { type: 'qcm', params: { skill: 'clock-read', palier } }
      const allowed = minutesForPalier(palier)
      for (let seed = 0; seed < 40; seed++) {
        const ex = generateExercise(spec, mulberry32(seed * 7 + palier))
        if (ex.type !== 'qcm' || ex.visual?.kind !== 'clock') throw new Error('attendu qcm+clock')
        const { hours, minutes } = ex.visual
        expect(hours).toBeGreaterThanOrEqual(1)
        expect(hours).toBeLessThanOrEqual(12)
        expect(allowed).toContain(minutes)
        // Exactement une bonne réponse = la lecture correcte.
        expect(ex.choices[ex.correctIndex]).toBe(timePhrase(hours, minutes))
        expect(new Set(ex.choices).size).toBe(ex.choices.length)
        expect(ex.choices).toHaveLength(4)
      }
    }
  })
})

describe('clock-read — familles de distracteurs (piège des aiguilles)', () => {
  it('exploite la confusion « heure suivante » et « quart/demie » (sur plusieurs tirages)', () => {
    const pool = new Set<string>()
    for (let seed = 0; seed < 60; seed++) {
      for (const d of timeDistractors(3, 30, mulberry32(seed))) pool.add(d)
    }
    // Jamais la bonne réponse parmi les distracteurs.
    expect(pool.has('3 heures et demie')).toBe(false)
    // Confusion avec l'heure suivante et avec le quart.
    expect(pool.has('4 heures et demie')).toBe(true)
    expect(pool.has('3 heures et quart')).toBe(true)
  })

  it('renvoie toujours 3 phrases distinctes ≠ bonne réponse', () => {
    for (const [h, m] of [
      [3, 0],
      [7, 15],
      [11, 30],
      [12, 45],
    ] as const) {
      for (let seed = 0; seed < 20; seed++) {
        const ds = timeDistractors(h, m, mulberry32(seed))
        expect(ds).toHaveLength(3)
        expect(new Set(ds).size).toBe(3)
        expect(ds).not.toContain(timePhrase(h, m))
      }
    }
  })
})

describe('clock-set — régler l\'horloge', () => {
  it('produit une cible conforme au palier ; l\'énoncé donne l\'heure à régler', () => {
    for (const palier of [2, 3]) {
      const spec: GeneratorSpec = { type: 'visual', params: { kind: 'clock-set', palier } }
      const allowed = minutesForPalier(palier)
      for (let seed = 0; seed < 40; seed++) {
        const ex = generateExercise(spec, mulberry32(seed))
        if (ex.type !== 'clockset') throw new Error('attendu clockset')
        expect(ex.hours).toBeGreaterThanOrEqual(1)
        expect(ex.hours).toBeLessThanOrEqual(12)
        expect(allowed).toContain(ex.minutes)
        expect(ex.prompt).toContain(timePhrase(ex.hours, ex.minutes))
        // Correction : seule l'heure cible est acceptée.
        expect(isAnswerCorrect(ex, [ex.hours, ex.minutes])).toBe(true)
        expect(isAnswerCorrect(ex, [ex.hours, (ex.minutes + 30) % 60])).toBe(false)
      }
    }
  })
})

describe('support horloge', () => {
  it('canGenerate vrai', () => {
    expect(canGenerate({ type: 'qcm', params: { skill: 'clock-read', palier: 2 } })).toBe(true)
    expect(canGenerate({ type: 'visual', params: { kind: 'clock-set', palier: 3 } })).toBe(true)
  })
})
