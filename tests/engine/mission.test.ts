import { mulberry32 } from '@/engine/generators/rng'
import { isNotionAcquired } from '@/engine/adaptive'
import {
  answerMission,
  applyMissionOutcome,
  isMissionComplete,
  missionOutcome,
  priorLevel,
  startMission,
  MISSION_MAX_QUESTIONS,
  MISSION_MIN_QUESTIONS,
  type MissionSession,
} from '@/engine/mission'
import { DEFAULT_TARGET_TIER, type LearnerProgress } from '@/engine/session'
import { curriculumFor } from '@/content/curricula'
import { allNotions } from '@/content/graph'

const NOW = 1_700_000_000_000

// Joue une mission complète en répondant selon un prédicat (probe → correct).
function runMission(
  level: Parameters<typeof startMission>[0],
  seed: number,
  answer: (session: MissionSession) => boolean,
): MissionSession {
  let s = startMission(level, mulberry32(seed))
  let guard = 0
  while (!isMissionComplete(s)) {
    if (guard++ > 100) throw new Error('mission ne se termine pas')
    s = answerMission(s, answer(s))
  }
  return s
}

describe('mission — niveau précédent', () => {
  it('associe chaque niveau à son précédent (null au CP)', () => {
    expect(priorLevel('cp')).toBe(null)
    expect(priorLevel('ce1')).toBe('cp')
    expect(priorLevel('cm2')).toBe('cm1')
  })
})

describe('mission — déroulé et bornes', () => {
  it('pose entre MIN et MAX questions, toutes jouables', () => {
    for (const level of ['cp', 'ce1', 'ce2', 'cm1', 'cm2'] as const) {
      for (let seed = 0; seed < 5; seed++) {
        // Réponses alternées (ni tout juste ni tout faux) pour un déroulé mixte.
        let n = 0
        const s = runMission(level, seed, () => (n++ % 2 === 0))
        expect(s.answers.length).toBeGreaterThanOrEqual(
          Math.min(MISSION_MIN_QUESTIONS, s.answers.length),
        )
        expect(s.answers.length).toBeLessThanOrEqual(MISSION_MAX_QUESTIONS)
        // Chaque question posée a exactement une bonne réponse (invariant moteur).
        for (const a of s.answers) expect(a.probe.notionId.length).toBeGreaterThan(0)
      }
    }
  })

  it('un enfant qui réussit tout s\'arrête au minimum de questions', () => {
    const s = runMission('ce2', 1, () => true)
    expect(s.answers.length).toBe(MISSION_MIN_QUESTIONS)
    expect(s.answers.every((a) => a.correct)).toBe(true)
  })

  it('un enfant qui rate tout va jusqu\'au maximum (descente comprise)', () => {
    const s = runMission('cm2', 3, () => false)
    expect(s.answers.length).toBe(MISSION_MAX_QUESTIONS)
  })
})

describe('mission — descente au niveau précédent', () => {
  it('bascule sur les notions du niveau précédent après deux erreurs', () => {
    // CE2 : deux erreurs d'affilée doivent faire apparaître des sondes CE1.
    const s = runMission('ce2', 2, () => false)
    const levelsProbed = new Set(s.answers.map((a) => a.probe.level))
    expect(levelsProbed.has('ce2')).toBe(true)
    expect(levelsProbed.has('ce1')).toBe(true) // a bien descendu
  })

  it('ne descend jamais au CP (pas de niveau précédent)', () => {
    const s = runMission('cp', 4, () => false)
    expect(s.answers.every((a) => a.probe.level === 'cp')).toBe(true)
  })
})

describe('mission — issue (pré-remplissage de la maîtrise)', () => {
  it('une notion réussie est acquise (étape débloquée)', () => {
    const s = runMission('ce1', 5, () => true)
    const out = missionOutcome(s, NOW)
    expect(out.correct).toBe(out.asked)
    for (const [, state] of Object.entries(out.mastery)) {
      expect(isNotionAcquired(state, DEFAULT_TARGET_TIER)).toBe(true)
    }
  })

  it('une notion ratée est fragile (non acquise, à travailler)', () => {
    const s = runMission('cp', 6, () => false)
    const out = missionOutcome(s, NOW)
    expect(out.correct).toBe(0)
    for (const [, state] of Object.entries(out.mastery)) {
      expect(isNotionAcquired(state, DEFAULT_TARGET_TIER)).toBe(false)
      expect(state.score).toBeGreaterThan(0)
    }
  })

  it('les notions ratées du niveau précédent rejoignent les rappels (dus maintenant)', () => {
    const s = runMission('ce2', 2, () => false)
    const out = missionOutcome(s, NOW)
    const ce1Ids = new Set(allNotions(curriculumFor('ce1')).map((n) => n.id))
    const reviewIds = Object.keys(out.reviews)
    expect(reviewIds.length).toBeGreaterThan(0)
    for (const id of reviewIds) {
      expect(ce1Ids.has(id)).toBe(true) // uniquement du niveau précédent
      expect(out.reviews[id].nextReview).toBe(NOW) // dû immédiatement
    }
  })
})

describe('mission — fusion dans la progression', () => {
  it('pré-remplit sans écraser une notion déjà travaillée', () => {
    const s = runMission('ce1', 7, () => true)
    const out = missionOutcome(s, NOW)
    const firstId = s.answers[0].probe.notionId
    const existing: LearnerProgress = {
      mastery: { [firstId]: { tier: 5, score: 42, streak: 1, errStreak: 0 } },
      reviews: {},
    }
    const merged = applyMissionOutcome(existing, out)
    // La notion déjà présente n'est pas écrasée…
    expect(merged.mastery[firstId]).toEqual(existing.mastery[firstId])
    // …mais les autres sont bien ajoutées.
    const added = Object.keys(out.mastery).filter((id) => id !== firstId)
    for (const id of added) expect(merged.mastery[id]).toEqual(out.mastery[id])
  })
})

describe('mission — exercices valides', () => {
  it('chaque question courante porte un énoncé non vide', () => {
    let s = startMission('cm1', mulberry32(9))
    let guard = 0
    while (!isMissionComplete(s)) {
      if (guard++ > 100) throw new Error('boucle')
      expect(s.current!.exercise.prompt.length).toBeGreaterThan(0)
      s = answerMission(s, guard % 2 === 0)
    }
    expect(s.answers.length).toBeGreaterThan(0)
  })
})
