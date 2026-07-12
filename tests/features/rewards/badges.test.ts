import { newlyEarnedBadges, type BadgeContext } from '@/features/rewards/badges'

const base: BadgeContext = {
  owned: [],
  acquiredNotionIds: [],
  sessionStars: 1,
  distinctPlayDays: 1,
}

describe('badges — attribution', () => {
  it('accorde un badge par notion nouvellement acquise', () => {
    const got = newlyEarnedBadges({ ...base, acquiredNotionIds: ['addition-jusqu-20'] })
    expect(got).toContain('notion:addition-jusqu-20')
  })

  it('ne redonne pas un badge déjà possédé', () => {
    const got = newlyEarnedBadges({
      ...base,
      acquiredNotionIds: ['addition-jusqu-20'],
      owned: ['notion:addition-jusqu-20'],
    })
    expect(got).not.toContain('notion:addition-jusqu-20')
  })

  it('accorde le badge « sans-faute » pour une séance à 3 étoiles', () => {
    expect(newlyEarnedBadges({ ...base, sessionStars: 3 })).toContain('exploit:sans-faute')
    expect(newlyEarnedBadges({ ...base, sessionStars: 2 })).not.toContain('exploit:sans-faute')
  })

  it('accorde le badge d\'assiduité à partir de 3 jours de jeu distincts', () => {
    expect(newlyEarnedBadges({ ...base, distinctPlayDays: 3 })).toContain('assiduite:3-jours')
    expect(newlyEarnedBadges({ ...base, distinctPlayDays: 2 })).not.toContain('assiduite:3-jours')
  })

  it('ne renvoie que des badges nouveaux (aucun doublon avec les possédés)', () => {
    const got = newlyEarnedBadges({
      ...base,
      sessionStars: 3,
      owned: ['exploit:sans-faute'],
    })
    expect(got).toEqual([])
  })
})
