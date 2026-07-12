import {
  initialMastery,
  applyAnswer,
  isNotionAcquired,
  MASTERY_ACQUIRED,
  type MasteryState,
} from '@/engine/adaptive'

// Applique une suite de réponses (true = bonne) et renvoie l'état final.
function replay(state: MasteryState, answers: boolean[]): MasteryState {
  return answers.reduce((s, ok) => applyAnswer(s, ok).state, state)
}

describe('moteur adaptatif — état initial', () => {
  it('démarre au palier 1, maîtrise 0, séries à zéro', () => {
    expect(initialMastery()).toEqual({ tier: 1, score: 0, streak: 0, errStreak: 0 })
  })
})

describe('moteur adaptatif — bonnes réponses et montée de palier', () => {
  it('une bonne réponse augmente la maîtrise et la série', () => {
    const r = applyAnswer(initialMastery(), true)
    expect(r.state.streak).toBe(1)
    expect(r.state.errStreak).toBe(0)
    expect(r.state.score).toBeGreaterThan(0)
    expect(r.leveledUp).toBe(false)
  })

  it('monte d\'un palier après 4 bonnes réponses consécutives', () => {
    let state = initialMastery()
    for (let i = 0; i < 3; i++) {
      const r = applyAnswer(state, true)
      expect(r.leveledUp).toBe(false)
      state = r.state
    }
    const r = applyAnswer(state, true) // 4e bonne réponse
    expect(r.leveledUp).toBe(true)
    expect(r.state.tier).toBe(2)
    expect(r.state.streak).toBe(0) // la série repart à zéro après la montée
  })

  it('ne dépasse jamais le palier 5', () => {
    const state = replay(initialMastery(), Array(100).fill(true))
    expect(state.tier).toBe(5)
  })

  it('plafonne la maîtrise à 100', () => {
    const state = replay(initialMastery(), Array(100).fill(true))
    expect(state.score).toBe(100)
  })
})

describe('moteur adaptatif — erreurs et descente de palier', () => {
  it('une erreur diminue la maîtrise et remet la série de réussites à zéro', () => {
    const start = replay(initialMastery(), [true, true]) // streak 2, un peu de score
    const r = applyAnswer(start, false)
    expect(r.state.streak).toBe(0)
    expect(r.state.errStreak).toBe(1)
    expect(r.state.score).toBeLessThan(start.score)
    expect(r.leveledDown).toBe(false)
  })

  it('descend d\'un palier après 2 erreurs consécutives (et signale la leçon)', () => {
    // On monte d'abord au palier 2 pour pouvoir redescendre.
    let state = replay(initialMastery(), [true, true, true, true])
    expect(state.tier).toBe(2)
    state = applyAnswer(state, false).state
    const r = applyAnswer(state, false) // 2e erreur consécutive
    expect(r.leveledDown).toBe(true)
    expect(r.state.tier).toBe(1)
    expect(r.state.errStreak).toBe(0) // la série d'erreurs repart à zéro
  })

  it('ne descend jamais sous le palier 1', () => {
    const state = replay(initialMastery(), Array(10).fill(false))
    expect(state.tier).toBe(1)
  })

  it('plancher la maîtrise à 0', () => {
    const state = replay(initialMastery(), Array(10).fill(false))
    expect(state.score).toBe(0)
  })

  it('une bonne réponse remet à zéro la série d\'erreurs (une erreur isolée ne fait pas descendre)', () => {
    let state = replay(initialMastery(), [true, true, true, true]) // palier 2
    state = applyAnswer(state, false).state // 1 erreur
    const r = applyAnswer(state, true) // bonne réponse : errStreak remis à 0
    expect(r.state.errStreak).toBe(0)
    state = applyAnswer(r.state, false).state // 1 erreur… isolée
    const r2 = applyAnswer(state, true)
    expect(r2.state.tier).toBe(2) // toujours au palier 2, pas de descente
  })
})

describe('moteur adaptatif — notion acquise', () => {
  it('n\'est pas acquise tant que la maîtrise est sous le seuil', () => {
    const state: MasteryState = { tier: 5, score: MASTERY_ACQUIRED - 1, streak: 0, errStreak: 0 }
    expect(isNotionAcquired(state, 3)).toBe(false)
  })

  it('n\'est pas acquise si le palier cible n\'est pas atteint', () => {
    const state: MasteryState = { tier: 2, score: 100, streak: 0, errStreak: 0 }
    expect(isNotionAcquired(state, 3)).toBe(false)
  })

  it('est acquise dès maîtrise ≥ seuil ET palier ≥ cible', () => {
    const state: MasteryState = { tier: 3, score: MASTERY_ACQUIRED, streak: 0, errStreak: 0 }
    expect(isNotionAcquired(state, 3)).toBe(true)
  })
})
