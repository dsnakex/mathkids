import { cp } from '@/content/curricula'
import { allNotions } from '@/content/graph'
import { isNotionGeneratable, type LearnerProgress } from '@/engine/session'
import { mulberry32 } from '@/engine/generators/rng'
import {
  domainMastery,
  notionsInDifficulty,
  formatDuration,
  generateGateQuestion,
  DEFAULT_TARGET_TIER,
} from '@/features/parent/parentModel'

const full = { tier: 5, score: 100, streak: 0, errStreak: 0 }

describe('parentModel — maîtrise par domaine', () => {
  it('renvoie une entrée par domaine, en pourcentage borné', () => {
    const rows = domainMastery(cp, { mastery: {}, reviews: {} })
    expect(rows.map((r) => r.id)).toEqual(['nombres', 'calcul', 'problemes', 'grandeurs-mesures', 'geometrie'])
    for (const r of rows) {
      expect(r.percent).toBeGreaterThanOrEqual(0)
      expect(r.percent).toBeLessThanOrEqual(100)
    }
  })

  it('atteint 100 % quand toutes les notions jouables du domaine sont maîtrisées', () => {
    const mastery: LearnerProgress['mastery'] = {}
    for (const n of allNotions(cp)) {
      if (n.id === 'complements-a-10' || n.tiers.some(() => false)) mastery[n.id] = full
    }
    // Toutes les notions jouables du domaine « calcul ».
    for (const n of allNotions(cp)) {
      if (isNotionGeneratable(n)) mastery[n.id] = full
    }
    const calcul = domainMastery(cp, { mastery, reviews: {} }).find((r) => r.id === 'calcul')
    expect(calcul?.percent).toBe(100)
  })

  it('reste à 0 % pour un profil neuf', () => {
    const nombres = domainMastery(cp, { mastery: {}, reviews: {} }).find((r) => r.id === 'nombres')
    expect(nombres?.percent).toBe(0)
  })
})

describe('parentModel — notions en difficulté', () => {
  it('signale une notion commencée, non acquise, à faible maîtrise', () => {
    const progress: LearnerProgress = {
      mastery: {
        'addition-jusqu-20': { tier: 1, score: 20, streak: 0, errStreak: 1 },
        'nombres-jusqu-20': { tier: 5, score: 100, streak: 0, errStreak: 0 }, // acquise
      },
      reviews: {},
    }
    const ids = notionsInDifficulty(cp, progress, DEFAULT_TARGET_TIER).map((n) => n.id)
    expect(ids).toContain('addition-jusqu-20')
    expect(ids).not.toContain('nombres-jusqu-20')
  })

  it('ne signale rien pour un profil neuf', () => {
    expect(notionsInDifficulty(cp, { mastery: {}, reviews: {} }, DEFAULT_TARGET_TIER)).toEqual([])
  })
})

describe('parentModel — durée', () => {
  it('formate en minutes puis en heures', () => {
    expect(formatDuration(0)).toBe('0 min')
    expect(formatDuration(120)).toBe('2 min')
    expect(formatDuration(3660)).toBe('1 h 01')
  })
})

describe('parentModel — porte d\'accès adulte', () => {
  it('génère une multiplication et sa réponse', () => {
    const gate = generateGateQuestion(mulberry32(1))
    expect(gate.question).toMatch(/×/)
    const [a, b] = [...gate.question.matchAll(/\d+/g)].map((m) => Number(m[0]))
    expect(gate.answer).toBe(a * b)
  })

  it('est déterministe pour une graine donnée', () => {
    expect(generateGateQuestion(mulberry32(3))).toEqual(generateGateQuestion(mulberry32(3)))
  })
})
