// progress store — SKELETON, per PART 10 Step 18.
//
// Defines the shape of the six Mastery Tracks and the CEFR aggregate
// from the Game Design Document's Step 2 progression system, and
// provides the write path for updating them. It does NOT yet contain
// real game-derived update logic, because no game emits a session-
// result payload yet — that's Milestone 4 (Game Engine) territory, per
// the Master Implementation Blueprint's roadmap ("progress store...
// skeleton, no mastery data yet" at Step 18; real wiring lands once
// the Question Engine and session lifecycle exist).
//
// Persists under the same per-player Firestore document as `auth`/
// `player` (players/{name}.mastery), consistent with the "no schema
// change yet" scope established in Step 13.

import { computed } from 'vue'
import { defineStore } from 'pinia'
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

function defaultMastery() {
  return MASTERY_TRACKS.reduce((acc, track) => {
    acc[track] = 0
    return acc
  }, {})
}

export const useProgressStore = defineStore('progress', () => {
  const auth = useAuthStore()

  const currentData = computed(() => auth.userData)

  const mastery = computed(() => ({
    ...defaultMastery(),
    ...(currentData.value?.mastery || {}),
  }))

  // A simple, provisional aggregate — the average of all six tracks,
  // mapped onto a CEFR-shaped label. This is deliberately basic: real
  // CEFR calibration is the Level Test/Placement screen's job (a later
  // milestone), not something this skeleton should attempt to get right.
  const cefrEstimate = computed(() => {
    const scores = Object.values(mastery.value)
    const average = scores.reduce((sum, s) => sum + s, 0) / scores.length
    if (average >= 90) return 'C2'
    if (average >= 75) return 'C1'
    if (average >= 60) return 'B2'
    if (average >= 40) return 'B1'
    if (average >= 20) return 'A2'
    return 'A1'
  })

  /**
   * Applies a delta to a single mastery track, clamped to 0–100.
   * This is the intended future entry point for the Game Engine's
   * session-result payload (Milestone 4) — not called by anything yet.
   */
  async function applyMasteryDelta(track, delta) {
    if (!MASTERY_TRACKS.includes(track)) {
      console.warn(`[progress] Unknown mastery track: ${track}`)
      return
    }
    const uid = auth.currentUser?.uid
    if (!uid) return
    const current = mastery.value[track]
    const next = Math.min(100, Math.max(0, current + delta))
    const nextMastery = { ...mastery.value, [track]: next }
    await setDoc(doc(db, 'users', uid), { mastery: nextMastery }, { merge: true })
  }

  /**
   * Overwrites all six tracks at once — the intended future entry point
   * for a Level Test/Placement recalibration (a later milestone).
   */
  async function recalibrate(scores) {
    const uid = auth.currentUser?.uid
    if (!uid) return
    const nextMastery = { ...defaultMastery(), ...scores }
    await setDoc(doc(db, 'users', uid), { mastery: nextMastery }, { merge: true })
  }

  return {
    mastery,
    cefrEstimate,
    applyMasteryDelta,
    recalibrate,
  }
})
