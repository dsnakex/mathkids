// État global de l'application (Zustand). Machine à écrans :
//   profils → (création) → carte → (leçon) → session → fin → carte
//   carte ↔ boutique
//
// Le store orchestre : progression (Dexie) → composition de session (moteur) →
// enregistrement des réponses (runner) → récompenses, badges et persistance.

import { create } from 'zustand'
import { cp } from '@/content/curricula'
import { allNotions } from '@/content/graph'
import { isNotionAcquired } from '@/engine/adaptive'
import { mulberry32 } from '@/engine/generators/rng'
import {
  composeSession,
  DEFAULT_TARGET_TIER,
  type LearnerProgress,
  type SessionExercise,
} from '@/engine/session'
import { recordAnswer, sessionReward, type SessionReward } from '@/features/session/runner'
import { newlyEarnedBadges } from '@/features/rewards/badges'
import { buy } from '@/features/shop/shopModel'
import type { ProfileRecord } from '@/db/db'
import {
  createProfile,
  deleteProfile,
  getProfile,
  listProfiles,
  updateProfile,
  type NewProfile,
} from '@/db/profiles'
import { loadLearnerProgress, saveLearnerProgress } from '@/db/progress'

/** Nombre d'exercices par séance (~10 min au CP). */
export const SESSION_LENGTH = 10

type Screen = 'profiles' | 'create' | 'map' | 'lesson' | 'session' | 'end' | 'shop' | 'parent'

interface AppState {
  screen: Screen
  profiles: ProfileRecord[]
  profileId: string | null
  pendingNotionId: string | null // notion choisie sur la carte, en attente de leçon
  session: SessionExercise[]
  index: number
  correctCount: number
  progress: LearnerProgress
  reward: SessionReward | null
  earnedBadges: string[] // badges gagnés à la dernière séance (affichés à la fin)
  sessionStartedAt: number // horodatage de début de séance (pour le temps passé)

  init: () => Promise<void>
  goCreate: () => void
  goProfiles: () => Promise<void>
  goMap: () => Promise<void>
  goShop: () => void
  goParent: () => void
  refreshProfiles: () => Promise<void>
  addProfile: (input: NewProfile) => Promise<void>
  removeProfile: (id: string) => Promise<void>
  selectProfile: (id: string) => void
  selectStep: (notionId: string) => Promise<void>
  lessonDone: () => Promise<void>
  startSession: (profileId: string) => Promise<void>
  answerCurrent: (firstTryCorrect: boolean) => Promise<void>
  replay: () => Promise<void>
  buyItem: (itemId: string) => Promise<void>
}

const emptyProgress = (): LearnerProgress => ({ mastery: {}, reviews: {} })

const dayKey = (): string => new Date().toISOString().slice(0, 10)

function acquiredNotionIds(progress: LearnerProgress): string[] {
  return allNotions(cp)
    .map((n) => n.id)
    .filter((id) => {
      const m = progress.mastery[id]
      return m ? isNotionAcquired(m, DEFAULT_TARGET_TIER) : false
    })
}

function makeSession(progress: LearnerProgress, currentNotionId?: string): SessionExercise[] {
  return composeSession(cp, progress, {
    now: Date.now(),
    rng: mulberry32(Date.now() >>> 0),
    total: SESSION_LENGTH,
    currentNotionId,
  })
}

export const useAppStore = create<AppState>((set, get) => ({
  screen: 'profiles',
  profiles: [],
  profileId: null,
  pendingNotionId: null,
  session: [],
  index: 0,
  correctCount: 0,
  progress: emptyProgress(),
  reward: null,
  earnedBadges: [],
  sessionStartedAt: 0,

  async init() {
    set({ profiles: await listProfiles(), screen: 'profiles' })
  },

  goCreate() {
    set({ screen: 'create' })
  },

  async goProfiles() {
    set({ profiles: await listProfiles(), screen: 'profiles', session: [], reward: null })
  },

  async goMap() {
    set({ profiles: await listProfiles(), screen: 'map', session: [], reward: null })
  },

  goShop() {
    set({ screen: 'shop' })
  },

  goParent() {
    set({ screen: 'parent' })
  },

  async refreshProfiles() {
    set({ profiles: await listProfiles() })
  },

  async addProfile(input) {
    const created = await createProfile(input)
    set({ profiles: await listProfiles(), profileId: created.id, screen: 'map' })
  },

  async removeProfile(id) {
    await deleteProfile(id)
    set({ profiles: await listProfiles() })
  },

  selectProfile(id) {
    set({ profileId: id, screen: 'map' })
  },

  async selectStep(notionId) {
    const { profileId } = get()
    if (!profileId) return
    const progress = await loadLearnerProgress(profileId)
    if (progress.mastery[notionId]) {
      // Notion déjà commencée : on va droit à la session (leçon accessible via la carte).
      const session = makeSession(progress, notionId)
      if (session.length === 0) return set({ screen: 'map' })
      set({ progress, session, index: 0, correctCount: 0, reward: null, earnedBadges: [], screen: 'session', sessionStartedAt: Date.now() })
    } else {
      // Nouvelle notion : on montre d'abord la leçon.
      set({ pendingNotionId: notionId, screen: 'lesson' })
    }
  },

  async lessonDone() {
    const { pendingNotionId, profileId } = get()
    set({ pendingNotionId: null })
    if (!pendingNotionId || !profileId) return set({ screen: 'map' })
    const progress = await loadLearnerProgress(profileId)
    const session = makeSession(progress, pendingNotionId)
    if (session.length === 0) return set({ screen: 'map' })
    set({ progress, session, index: 0, correctCount: 0, reward: null, earnedBadges: [], screen: 'session', sessionStartedAt: Date.now() })
  },

  async startSession(profileId) {
    const progress = await loadLearnerProgress(profileId)
    const session = makeSession(progress)
    if (session.length === 0) {
      set({ profiles: await listProfiles(), screen: 'map' })
      return
    }
    set({
      profileId,
      progress,
      session,
      index: 0,
      correctCount: 0,
      reward: null,
      earnedBadges: [],
      screen: 'session',
      sessionStartedAt: Date.now(),
    })
  },

  async answerCurrent(firstTryCorrect) {
    const { session, index, progress, correctCount, profileId, sessionStartedAt } = get()
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

    if (nextIndex < session.length) {
      set({ progress: out.progress, correctCount: nextCorrect, index: nextIndex })
      return
    }

    // Fin de séance : récompenses, badges, persistance.
    const reward = sessionReward(nextCorrect, session.length)
    await saveLearnerProgress(profileId, out.progress)

    const profile = await getProfile(profileId)
    const playDays = [...new Set([...(profile?.playDays ?? []), dayKey()])]
    const earnedBadges = newlyEarnedBadges({
      owned: profile?.badges ?? [],
      acquiredNotionIds: acquiredNotionIds(out.progress),
      sessionStars: reward.stars,
      distinctPlayDays: playDays.length,
    })
    const elapsedSec = sessionStartedAt > 0 ? Math.round((Date.now() - sessionStartedAt) / 1000) : 0
    await updateProfile(profileId, {
      coins: (profile?.coins ?? 0) + reward.coins,
      stars: (profile?.stars ?? 0) + reward.stars,
      badges: [...(profile?.badges ?? []), ...earnedBadges],
      playDays,
      sessions: (profile?.sessions ?? 0) + 1,
      totalSeconds: (profile?.totalSeconds ?? 0) + elapsedSec,
    })

    set({
      progress: out.progress,
      correctCount: nextCorrect,
      reward,
      earnedBadges,
      profiles: await listProfiles(),
      screen: 'end',
    })
  },

  async replay() {
    const { profileId } = get()
    if (profileId) await get().startSession(profileId)
  },

  async buyItem(itemId) {
    const { profileId } = get()
    if (!profileId) return
    const profile = await getProfile(profileId)
    if (!profile) return
    const res = buy({ coins: profile.coins, owned: profile.owned ?? [] }, itemId)
    if (!res) return // achat refusé (trop cher, déjà possédé, inconnu)
    await updateProfile(profileId, { coins: res.coins, owned: res.owned })
    set({ profiles: await listProfiles() })
  },
}))
