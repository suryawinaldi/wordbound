// settings store — user preferences: theme, sound, notifications.
// Persisted under the same per-player Firestore document used by the auth store.
// Every change is applied optimistically — a settings change should never
// appear to "wait" on the network.

import { create } from 'zustand'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase-config'
import { useAuthStore } from './auth'
import { useAudioStore } from './audio'

const DEFAULT_SETTINGS = {
  theme: 'dark',
  soundEnabled: true,
  notificationsEnabled: true,
}

async function persistSettings(settings) {
  const { currentUser } = useAuthStore.getState()
  if (!currentUser) return
  try {
    await setDoc(doc(db, 'users', currentUser.uid), { settings }, { merge: true })
  } catch (e) {
    // Falls back to silently retrying on the next change — a settings
    // write failure should never interrupt the app.
    console.warn('[settings] Failed to persist settings:', e)
  }
}

function applyThemeToDom(value) {
  if (value === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (value === 'light') {
    document.documentElement.classList.remove('dark')
  } else {
    // 'system' — defer to the OS preference.
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', prefersDark)
  }
  try { localStorage.setItem('wb-theme', value) } catch (e) {}
}

export const useSettingsStore = create((set, get) => ({
  theme: DEFAULT_SETTINGS.theme,
  soundEnabled: DEFAULT_SETTINGS.soundEnabled,
  notificationsEnabled: DEFAULT_SETTINGS.notificationsEnabled,
  loaded: false,

  applyFromPlayerData(data) {
    const s = { ...DEFAULT_SETTINGS, ...(data?.settings || {}) }
    set({
      theme: s.theme,
      soundEnabled: s.soundEnabled,
      notificationsEnabled: s.notificationsEnabled,
      loaded: true,
    })
    applyThemeToDom(s.theme)
  },

  setTheme(value) {
    set({ theme: value })
    applyThemeToDom(value)
    const { soundEnabled, notificationsEnabled } = get()
    persistSettings({ theme: value, soundEnabled, notificationsEnabled })
  },

  setSoundEnabled(value) {
    const muted = !value
    set({ soundEnabled: !!value })
    useAudioStore.getState().setMute(muted)
    const { theme, notificationsEnabled } = get()
    persistSettings({ theme, soundEnabled: !!value, notificationsEnabled })
  },

  setNotificationsEnabled(value) {
    set({ notificationsEnabled: !!value })
    const { theme, soundEnabled } = get()
    persistSettings({ theme, soundEnabled, notificationsEnabled: !!value })
  },
}))
