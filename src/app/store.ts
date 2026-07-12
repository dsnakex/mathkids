// État global de l'application (Zustand). Machine à écrans simple pour la
// Phase 4 : profils → session → fin. La carte du monde, les leçons et la
// boutique arriveront en Phase 5 ; l'espace parent en Phase 6.
//
// Le store orchestre : chargement de la progression (Dexie) → composition de la
// session (moteur) → enregistrement de chaque réponse (runner) → persistance et
// récompenses en fin de séance.

import { create } from 'zustand'
import { cp } from '@/content/curricula'
import { mulberry32 } from '@/engine/generators/rng'
import {
  composeSession,
  DEFAULT_TARGET_TIER,
  type LearnerProgress,
  type SessionExercise,
} from '@/engine/session'
import { recordAnswer, sessionReward, type SessionReward } from '@/features/session/runner'
import type { ProfileRecord } from '@/db/db'
import {
  addRewards,
  createProfile,
  deleteProfile,
  listProfiles,
  type NewProfile,
} from '@/db/profiles'
import { loadLearnerProgress, saveLearnerProgress } from '@/db/progress'

/** Nombre d'exercices par séance (~10 min au CP). */
export const SESSION_LENGTH = 10

type Screen = 'profiles' | 'create' | 'session' | 'end'

interface AppState {
  screen: Screen
  profiles: ProfileRecord[]
  profileId: string | null
  session: SessionExercise[]
  index: number
  correctCount: number
  progress: LearnerProgress
  reward: SessionReward | null

  init: () => Promise<void>
  goCreate: () => void
  goProfiles: () => Promise<void>
  addProfile: (input: NewProfile) => Promise<void>
  removeProfile: (id: string) => Promise<void>
  startSession: (profileId: string) => Promise<void>
  answerCurrent: (firstTryCorrect: boolean) => Promise<void>
  replay: () => Promise<void>
}

const emptyProgress = (): LearnerProgress => ({ mastery: {}, reviews: {} })

export const useAppStore = create<AppState>((set, get) => ({
  screen: 'profiles',
  profiles: [],
  profileId: null,
  session: [],
  index: 0,
  correctCount: 0,
  progress: emptyProgress(),
  reward: null,

  async init() {
    set({ profiles: await listProfiles(), screen: 'profiles' })
  },

  goCreate() {
    set({ screen: 'create' })
  },

  async goProfiles() {
    // Recharge les profils pour refléter le riz/étoiles gagnés.
    set({ profiles: await listProfiles(), screen: 'profiles', session: [], reward: null })
  },

  async addProfile(input) {
    await createProfile(input)
    set({ profiles: await listProfiles(), screen: 'profiles' })
  },

  async removeProfile(id) {
    await deleteProfile(id)
    set({ profiles: await listProfiles() })
  },

  async startSession(profileId) {
    const progress = await loadLearnerProgress(profileId)
    const session = composeSession(cp, progress, {
      now: Date.now(),
      rng: mulberry32(Date.now() >>> 0),
      total: SESSION_LENGTH,
    })
    if (session.length === 0) {
      // Aucun exercice disponible : on reste sur l'écran des profils.
      set({ profiles: await listProfiles(), screen: 'profiles' })
      return
    }
    set({ profileId, progress, session, index: 0, correctCount: 0, reward: null, screen: 'session' })
  },

  async answerCurrent(firstTryCorrect) {
    const { session, index, progress, correctCount, profileId } = get()
    const item = session[index]
    if (!item || !profileId) return

    const out = recordAnswer(
      progress,
      item.notionId,
      item.role,
      firstTryCorrect,
      Date.now(),
      DEFAULT_TARGET_TIER,
    )
    const nextCorrect = correctCount + (firstTryCorrect ? 1 : 0)
    const nextIndex = index + 1

    if (nextIndex >= session.length) {
      const reward = sessionReward(nextCorrect, session.length)
      await saveLearnerProgress(profileId, out.progress)
      await addRewards(profileId, reward.coins, reward.stars)
      set({ progress: out.progress, correctCount: nextCorrect, reward, screen: 'end' })
    } else {
      set({ progress: out.progress, correctCount: nextCorrect, index: nextIndex })
    }
  },

  async replay() {
    const { profileId } = get()
    if (profileId) await get().startSession(profileId)
  },
}))
