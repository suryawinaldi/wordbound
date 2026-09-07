import { computed } from 'vue'
import { defineStore } from 'pinia'
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

function levelFromXp(xp) {
  let level = 1
  while (xpThresholdForLevel(level + 1) <= xp) {
    level += 1
  }
  return level
}

export const usePlayerStore = defineStore('player', () => {
  const auth = useAuthStore()

  const currentData = computed(() => auth.userData)

  const xp = computed(() => currentData.value?.xp || 0)
  const coins = computed(() => currentData.value?.coins || 0)
  const streak = computed(() => currentData.value?.streak || 0)
  const streakFreezeCount = computed(() => currentData.value?.streakFreezeCount || 0)
  const level = computed(() => levelFromXp(xp.value))

  const xpToNextLevel = computed(() => {
    const nextThreshold = xpThresholdForLevel(level.value + 1)
    const currentThreshold = xpThresholdForLevel(level.value)
    return {
      current: xp.value - currentThreshold,
      needed: nextThreshold - currentThreshold,
    }
  })

  const isStreakAtRisk = computed(() => {
    const data = currentData.value
    if (!data?.lastDate) return false
    return data.lastDate !== todayStr() && data.lastDate !== yesterdayStr()
  })

  async function persistPatch(patch) {
    const uid = auth.currentUser?.uid
    if (!uid) return
    const merged = { ...currentData.value, ...patch }
    await setDoc(doc(db, 'users', uid), patch, { merge: true })
    // Local state is updated via firestore onSnapshot in auth.js
    return merged
  }

  async function recordActivity(extraPatch = {}) {
    const uid = auth.currentUser?.uid
    if (!uid) return
    const data = currentData.value || {}
    const today = todayStr()
    let nextStreak = data.streak || 0
    if (data.lastDate !== today) {
      nextStreak = data.lastDate === yesterdayStr() ? nextStreak + 1 : 1
    }
    return persistPatch({ ...extraPatch, streak: nextStreak, lastDate: today })
  }

  async function awardXP(amount) {
    if (!amount) return
    const nextXp = xp.value + amount
    return persistPatch({ xp: nextXp })
  }

  async function awardCoins(amount) {
    if (!amount) return
    return persistPatch({ coins: coins.value + amount })
  }

  async function spendCoins(amount) {
    if (amount <= 0) return true
    if (coins.value < amount) return false
    await persistPatch({ coins: coins.value - amount })
    return true
  }

  async function consumeStreakFreeze() {
    if (streakFreezeCount.value <= 0) return false
    await persistPatch({ streakFreezeCount: streakFreezeCount.value - 1, lastDate: todayStr() })
    return true
  }

  return {
    xp,
    coins,
    streak,
    streakFreezeCount,
    level,
    xpToNextLevel,
    isStreakAtRisk,
    recordActivity,
    awardXP,
    awardCoins,
    spendCoins,
    consumeStreakFreeze,
  }
})
