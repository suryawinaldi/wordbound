// progress store — Zustand version. Skeleton for Mastery Tracks.
// Defines the shape of the six Mastery Tracks and the CEFR aggregate
// from the Game Design Document's Step 2 progression system.
// Pure helper functions exported for components to use with userData from auth store.

import { create } from 'zustand'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase-config'
import { useAuthStore } from './auth'

export const MASTERY_TRACKS = [
  'vocabulary',
  'grammar',
  'listening',
  'reading',
  'writing',
  'speaking',
]

export function defaultMastery() {
  return MASTERY_TRACKS.reduce((acc, track) => {
    acc[track] = 0
    return acc
  }, {})
}

export function getMastery(userData) {
  return { ...defaultMastery(), ...(userData?.mastery || {}) }
}

// A simple, provisional aggregate — the average of all six tracks,
// mapped onto a CEFR-shaped label.
export function getCefrEstimate(userData) {
  const mastery = getMastery(userData)
  const scores = Object.values(mastery)
  const average = scores.reduce((sum, s) => sum + s, 0) / scores.length
  if (average >= 90) return 'C2'
  if (average >= 75) return 'C1'
  if (average >= 60) return 'B2'
  if (average >= 40) return 'B1'
  if (average >= 20) return 'A2'
  return 'A1'
}

export const useProgressStore = create(() => ({
  /**
   * Applies a delta to a single mastery track, clamped to 0–100.
   * This is the intended future entry point for the Game Engine's
   * session-result payload (Milestone 4) — not called by anything yet.
   */
  async applyMasteryDelta(track, delta) {
    if (!MASTERY_TRACKS.includes(track)) {
      console.warn(`[progress] Unknown mastery track: ${track}`)
      return
    }
    const { currentUser, userData } = useAuthStore.getState()
    if (!currentUser) return
    const mastery = getMastery(userData)
    const current = mastery[track]
    const next = Math.min(100, Math.max(0, current + delta))
    const nextMastery = { ...mastery, [track]: next }
    await setDoc(doc(db, 'users', currentUser.uid), { mastery: nextMastery }, { merge: true })
  },

  /**
   * Overwrites all six tracks at once — the intended future entry point
   * for a Level Test/Placement recalibration (a later milestone).
   */
  async recalibrate(scores) {
    const { currentUser } = useAuthStore.getState()
    if (!currentUser) return
    const nextMastery = { ...defaultMastery(), ...scores }
    await setDoc(doc(db, 'users', currentUser.uid), { mastery: nextMastery }, { merge: true })
  },
}))
