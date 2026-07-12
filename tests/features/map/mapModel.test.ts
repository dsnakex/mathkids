import { cp } from '@/content/curricula'
import { initialMastery, type MasteryState } from '@/engine/adaptive'
import type { LearnerProgress } from '@/engine/session'
import { mapSteps, DEFAULT_TARGET_TIER } from '@/features/map/mapModel'

const acquise: MasteryState = { tier: 3, score: 90, streak: 0, errStreak: 0 }

describe('mapModel — étapes de la carte', () => {
  it('ne liste que des notions jouables, dans un ordre respectant les prérequis', () => {
    const steps = mapSteps(cp, { mastery: {}, reviews: {} }, DEFAULT_TARGET_TIER)
    expect(steps.length).toBeGreaterThan(0)
    const ids = steps.map((s) => s.notion.id)
    // Un prérequis apparaît toujours avant la notion qui en dépend.
    for (const step of steps) {
      const here = ids.indexOf(step.notion.id)
      for (const pre of step.notion.prerequisites) {
        const preIdx = ids.indexOf(pre)
        if (preIdx !== -1) expect(preIdx).toBeLessThan(here)
      }
    }
  })

  it('pour un profil neuf : la frontière est « disponible », le reste « verrouillé »', () => {
    const steps = mapSteps(cp, { mastery: {}, reviews: {} }, DEFAULT_TARGET_TIER)
    const byId = new Map(steps.map((s) => [s.notion.id, s]))
    // « nombres-jusqu-20 » (sans prérequis) est jouable d'emblée.
    expect(byId.get('nombres-jusqu-20')?.state).toBe('available')
    // « addition-jusqu-100 » dépend de notions non acquises : verrouillée.
    expect(byId.get('addition-jusqu-100')?.state).toBe('locked')
  })

  it('marque « acquise » et « en cours » selon la maîtrise', () => {
    const progress: LearnerProgress = {
      mastery: {
        'nombres-jusqu-20': acquise,
        'addition-jusqu-20': initialMastery(),
      },
      reviews: {},
    }
    const steps = mapSteps(cp, progress, DEFAULT_TARGET_TIER)
    const byId = new Map(steps.map((s) => [s.notion.id, s]))
    expect(byId.get('nombres-jusqu-20')?.state).toBe('done')
    expect(byId.get('addition-jusqu-20')?.state).toBe('current')
    // Une notion débloquée par l'acquisition précédente devient disponible.
    expect(byId.get('complements-a-10')?.state).toBe('available')
  })

  it('donne 3 étoiles à une notion acquise, 0 à une notion non commencée', () => {
    const progress: LearnerProgress = { mastery: { 'nombres-jusqu-20': acquise }, reviews: {} }
    const steps = mapSteps(cp, progress, DEFAULT_TARGET_TIER)
    const byId = new Map(steps.map((s) => [s.notion.id, s]))
    expect(byId.get('nombres-jusqu-20')?.stars).toBe(3)
    expect(byId.get('comparaison-jusqu-20')?.stars).toBe(0)
  })
})
