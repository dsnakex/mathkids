import { buildBackup, parseBackup, BACKUP_VERSION } from '@/features/parent/backup'
import type { ProfileRecord, ProgressRecord } from '@/db/db'
import { initialMastery } from '@/engine/adaptive'
import { scheduleFirstReview } from '@/engine/spaced'

const profile: ProfileRecord = {
  id: 'p1',
  name: 'Léa',
  character: 'maki',
  level: 'cp',
  coins: 12,
  stars: 3,
  createdAt: 1000,
  badges: ['notion:addition-jusqu-20'],
  owned: ['garniture-avocat'],
  playDays: ['2026-07-12'],
  sessions: 2,
  totalSeconds: 600,
}

const progress: ProgressRecord[] = [
  { profileId: 'p1', notionId: 'nombres-jusqu-20', mastery: initialMastery(), review: scheduleFirstReview(5000), updatedAt: 2000 },
  { profileId: 'p1', notionId: 'addition-jusqu-20', mastery: { tier: 3, score: 90, streak: 0, errStreak: 0 }, updatedAt: 3000 },
]

describe('backup — export/import JSON', () => {
  it('construit une sauvegarde versionnée relisible à l\'identique', () => {
    const backup = buildBackup(profile, progress)
    expect(backup.version).toBe(BACKUP_VERSION)
    // Round-trip via JSON (comme un vrai fichier).
    const restored = parseBackup(JSON.parse(JSON.stringify(backup)))
    expect(restored.profile).toEqual(profile)
    expect(restored.progress).toEqual(progress)
  })

  it('rejette un JSON invalide', () => {
    expect(() => parseBackup({ version: 1 })).toThrow()
    expect(() => parseBackup({ profile, progress: 'pas un tableau' })).toThrow()
    expect(() => parseBackup(null)).toThrow()
  })
})
