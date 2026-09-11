import { create } from 'zustand'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase-config'
import { useAuthStore } from './auth'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function xpThresholdForLevel(level) {
  if (level <= 1) return 0
  return Math.round(100 * Math.pow(level, 1.3))
}

export function levelFromXp(xp) {
  let level = 1
  while (xpThresholdForLevel(level + 1) <= xp) {
    level += 1
  }
  return level
}

export function xpToNextLevel(xp) {
  const level = levelFromXp(xp)
  const nextThreshold = xpThresholdForLevel(level + 1)
  const currentThreshold = xpThresholdForLevel(level)
  return {
    current: xp - currentThreshold,
    needed: nextThreshold - currentThreshold,
  }
}

export function isStreakAtRisk(userData) {
  if (!userData?.lastDate) return false
  return userData.lastDate !== todayStr() && userData.lastDate !== yesterdayStr()
}

export const usePlayerStore = create(() => ({
  async persistPatch(patch) {
    const { currentUser } = useAuthStore.getState()
    if (!currentUser) return
    await setDoc(doc(db, 'users', currentUser.uid), patch, { merge: true })
  },

  async recordActivity(extraPatch = {}) {
    const { currentUser, userData } = useAuthStore.getState()
    if (!currentUser) return
    const data = userData || {}
    const today = todayStr()
    let nextStreak = data.streak || 0
    if (data.lastDate !== today) {
      nextStreak = data.lastDate === yesterdayStr() ? nextStreak + 1 : 1
    }
    const { persistPatch } = usePlayerStore.getState()
    return persistPatch({ ...extraPatch, streak: nextStreak, lastDate: today })
  },

  async awardXP(amount) {
    if (!amount) return
    const { userData } = useAuthStore.getState()
    const currentXp = userData?.xp || 0
    const { persistPatch } = usePlayerStore.getState()
    return persistPatch({ xp: currentXp + amount })
  },

  async awardCoins(amount) {
    if (!amount) return
    const { userData } = useAuthStore.getState()
    const currentCoins = userData?.coins || 0
    const { persistPatch } = usePlayerStore.getState()
    return persistPatch({ coins: currentCoins + amount })
  },

  async addSavings(amount) {
    if (!amount) return
    const { userData } = useAuthStore.getState()
    const currentSavings = userData?.savings || 0
    const { persistPatch } = usePlayerStore.getState()
    return persistPatch({ savings: currentSavings + amount })
  },

  async spendCoins(amount) {
    if (amount <= 0) return true
    const { userData } = useAuthStore.getState()
    const currentCoins = userData?.coins || 0
    if (currentCoins < amount) return false
    const { persistPatch } = usePlayerStore.getState()
    await persistPatch({ coins: currentCoins - amount })
    return true
  },

  async consumeStreakFreeze() {
    const { userData } = useAuthStore.getState()
    const count = userData?.streakFreezeCount || 0
    if (count <= 0) return false
    const { persistPatch } = usePlayerStore.getState()
    await persistPatch({ streakFreezeCount: count - 1, lastDate: todayStr() })
    return true
  },
}))
