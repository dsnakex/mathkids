import { db } from '@/db/db'
import { createProfile } from '@/db/profiles'
import { loadFactStates, saveFactStates } from '@/db/facts'
import { factKey } from '@/engine/facts'

beforeEach(async () => {
  await db.profiles.clear()
})

describe('db/facts — persistance du suivi fait-par-fait', () => {
  it('objet vide pour un profil neuf', async () => {
    const p = await createProfile({ name: 'Léa', character: 'maki', level: 'ce2' })
    expect(await loadFactStates(p.id)).toEqual({})
  })

  it('sauvegarde puis relit les états de faits (aller-retour)', async () => {
    const p = await createProfile({ name: 'Léa', character: 'maki', level: 'ce2' })
    const states = {
      [factKey({ op: '×', a: 7, b: 8 })]: { box: 1, correct: 1, wrong: 1 },
      [factKey({ op: '×', a: 6, b: 9 })]: { box: 3, correct: 4, wrong: 0 },
    }
    await saveFactStates(p.id, states)
    expect(await loadFactStates(p.id)).toEqual(states)
  })
})
