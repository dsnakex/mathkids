import { db } from '@/db/db'
import { createProfile, getProfile } from '@/db/profiles'
import { saveLearnerProgress, loadLearnerProgress } from '@/db/progress'
import { exportProfile, importProfile } from '@/db/backup'
import { parseBackup } from '@/features/parent/backup'
import { initialMastery } from '@/engine/adaptive'
import { scheduleFirstReview } from '@/engine/spaced'

beforeEach(async () => {
  await db.profiles.clear()
  await db.progress.clear()
})

describe('db/backup — export puis import', () => {
  it('exporte une sauvegarde valide et la restaure à l\'identique', async () => {
    const p = await createProfile({ name: 'Léa', character: 'maki', level: 'cp' })
    await saveLearnerProgress(p.id, {
      mastery: { 'nombres-jusqu-20': initialMastery() },
      reviews: { 'nombres-jusqu-20': scheduleFirstReview(5000) },
    })

    const backup = await exportProfile(p.id)
    expect(backup).not.toBeNull()
    // La sauvegarde passe la validation (comme un fichier importé).
    expect(() => parseBackup(JSON.parse(JSON.stringify(backup)))).not.toThrow()

    // On efface tout puis on réimporte : la progression revient.
    await db.profiles.clear()
    await db.progress.clear()
    await importProfile(backup!)

    expect((await getProfile(p.id))?.name).toBe('Léa')
    const restored = await loadLearnerProgress(p.id)
    expect(restored.mastery['nombres-jusqu-20']).toEqual(initialMastery())
    expect(restored.reviews['nombres-jusqu-20']).toEqual(scheduleFirstReview(5000))
  })

  it('renvoie null pour un profil inexistant', async () => {
    expect(await exportProfile('fantome')).toBeNull()
  })
})
