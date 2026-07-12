import 'fake-indexeddb/auto'
import { db } from '@/db/db'
import {
  createProfile,
  listProfiles,
  getProfile,
  addRewards,
  deleteProfile,
} from '@/db/profiles'
import { loadLearnerProgress, saveLearnerProgress } from '@/db/progress'
import { initialMastery, applyAnswer } from '@/engine/adaptive'
import { scheduleFirstReview } from '@/engine/spaced'
import type { LearnerProgress } from '@/engine/session'

beforeEach(async () => {
  await db.profiles.clear()
  await db.progress.clear()
})

describe('db/profiles', () => {
  it('crée un profil avec riz et étoiles à zéro, puis le relit', async () => {
    const p = await createProfile({ name: 'Léa', character: 'maki', level: 'cp' })
    expect(p.id).toBeTruthy()
    expect(p.coins).toBe(0)
    expect(p.stars).toBe(0)
    expect(await getProfile(p.id)).toEqual(p)
  })

  it('liste les profils dans l\'ordre de création', async () => {
    const a = await createProfile({ name: 'Léa', character: 'maki', level: 'cp' }, 1000)
    const b = await createProfile({ name: 'Tom', character: 'temaki', level: 'cp' }, 2000)
    expect((await listProfiles()).map((p) => p.id)).toEqual([a.id, b.id])
  })

  it('cumule les récompenses (grains de riz, étoiles)', async () => {
    const p = await createProfile({ name: 'Léa', character: 'maki', level: 'cp' })
    await addRewards(p.id, 12, 3)
    await addRewards(p.id, 4, 2)
    const after = await getProfile(p.id)
    expect(after?.coins).toBe(16)
    expect(after?.stars).toBe(5)
  })

  it('supprime un profil et toute sa progression', async () => {
    const p = await createProfile({ name: 'Léa', character: 'maki', level: 'cp' })
    await saveLearnerProgress(p.id, {
      mastery: { 'nombres-jusqu-20': initialMastery() },
      reviews: {},
    })
    await deleteProfile(p.id)
    expect(await getProfile(p.id)).toBeUndefined()
    expect(await loadLearnerProgress(p.id)).toEqual({ mastery: {}, reviews: {} })
  })
})

describe('db/progress', () => {
  it('renvoie une progression vide pour un profil neuf', async () => {
    const p = await createProfile({ name: 'Léa', character: 'maki', level: 'cp' })
    expect(await loadLearnerProgress(p.id)).toEqual({ mastery: {}, reviews: {} })
  })

  it('sauvegarde et recharge maîtrise + rappels à l\'identique', async () => {
    const p = await createProfile({ name: 'Léa', character: 'maki', level: 'cp' })
    const progress: LearnerProgress = {
      mastery: {
        'nombres-jusqu-20': { tier: 3, score: 90, streak: 1, errStreak: 0 },
        'addition-jusqu-20': applyAnswer(initialMastery(), true).state,
      },
      reviews: { 'nombres-jusqu-20': scheduleFirstReview(5000) },
    }
    await saveLearnerProgress(p.id, progress)
    expect(await loadLearnerProgress(p.id)).toEqual(progress)
  })

  it('isole la progression par profil', async () => {
    const a = await createProfile({ name: 'Léa', character: 'maki', level: 'cp' })
    const b = await createProfile({ name: 'Tom', character: 'temaki', level: 'cp' })
    await saveLearnerProgress(a.id, {
      mastery: { 'addition-jusqu-20': initialMastery() },
      reviews: {},
    })
    expect(Object.keys((await loadLearnerProgress(a.id)).mastery)).toEqual(['addition-jusqu-20'])
    expect(await loadLearnerProgress(b.id)).toEqual({ mastery: {}, reviews: {} })
  })
})
