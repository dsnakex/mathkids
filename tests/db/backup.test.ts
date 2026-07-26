import { db } from '@/db/db'
import { createProfile, getProfile, listProfiles, deleteProfile } from '@/db/profiles'
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

  it('n\'écrase jamais un profil existant : un réimport crée un nouveau profil', async () => {
    const p = await createProfile({ name: 'Léa', character: 'maki', level: 'cp' })
    await saveLearnerProgress(p.id, {
      mastery: { 'nombres-jusqu-20': initialMastery() },
      reviews: {},
    })
    const backup = await exportProfile(p.id)

    // Réimport SANS effacer : l'original reste intact, une copie est créée.
    const newId = await importProfile(backup!)
    expect(newId).not.toBe(p.id)
    expect(await listProfiles()).toHaveLength(2)
    expect((await getProfile(p.id))?.name).toBe('Léa') // original intact
    const copy = await loadLearnerProgress(newId)
    expect(copy.mastery['nombres-jusqu-20']).toEqual(initialMastery())
  })

  it('supprime le profil ET toute sa progression', async () => {
    const p = await createProfile({ name: 'Tom', character: 'temaki', level: 'cp' })
    await saveLearnerProgress(p.id, {
      mastery: { 'addition-jusqu-20': initialMastery() },
      reviews: {},
    })
    await deleteProfile(p.id)
    expect(await getProfile(p.id)).toBeUndefined()
    const leftovers = await db.progress.where('profileId').equals(p.id).toArray()
    expect(leftovers).toHaveLength(0)
  })
})
