// settings store — user preferences: theme, sound, notifications.
// Persisted under the same per-player Firestore document used by the
// `auth` store (players/{name}), consistent with the "no breaking
// Firestore schema change" scope established when auth.js was narrowed
// in Step 13. Every change here is applied optimistically — a settings
// change should never appear to "wait" on the network, per the Pinia
// Store Plan's explicit guidance for this store.

import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase-config'
import { useAuthStore } from './auth'
import { useAudioStore } from './audio'

const DEFAULT_SETTINGS = {
  theme: 'system',
  soundEnabled: true,
  notificationsEnabled: true,
}

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref(DEFAULT_SETTINGS.theme)
  const soundEnabled = ref(DEFAULT_SETTINGS.soundEnabled)
  const notificationsEnabled = ref(DEFAULT_SETTINGS.notificationsEnabled)
  const loaded = ref(false)

  function applyFromPlayerData(data) {
    const s = { ...DEFAULT_SETTINGS, ...(data?.settings || {}) }
    theme.value = s.theme
    soundEnabled.value = s.soundEnabled
    notificationsEnabled.value = s.notificationsEnabled
    loaded.value = true
  }

  async function persist() {
    const auth = useAuthStore()
    const uid = auth.currentUser?.uid
    if (!uid) return
    const patch = {
      settings: {
        theme: theme.value,
        soundEnabled: soundEnabled.value,
        notificationsEnabled: notificationsEnabled.value,
      },
    }
    // Optimistic: local refs are already updated by the caller before
    // this runs; the Firestore write happens in the background and is
    // not awaited by the UI-facing setter functions below.
    try {
      await setDoc(doc(db, 'users', uid), patch, { merge: true })
    } catch (e) {
      // Falls back to silently retrying on the next change — a settings
      // write failure should never interrupt the app the way a failed
      // game-session write might.
      console.warn('[settings] Failed to persist settings:', e)
    }
  }

  function setTheme(value) {
    theme.value = value
    document.documentElement.classList.toggle('dark', value === 'dark')
    persist()
  }

  function setSoundEnabled(value) {
    soundEnabled.value = !!value
    const audio = useAudioStore()
    audio.setMute(!value)
    persist()
  }

  function setNotificationsEnabled(value) {
    notificationsEnabled.value = !!value
    persist()
  }

  // Keep the document-level `.dark` class in sync if theme is loaded
  // from Firestore after initial mount (e.g. session restored).
  watch(theme, (value) => {
    if (value === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (value === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // 'system' — defer to the OS preference.
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
    }
  })

  return {
    theme,
    soundEnabled,
    notificationsEnabled,
    loaded,
    applyFromPlayerData,
    setTheme,
    setSoundEnabled,
    setNotificationsEnabled,
  }
})
