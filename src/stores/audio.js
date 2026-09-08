// audio store — Zustand wrapper around the procedural sound module (src/lib/sound.js).
// Keeps mute state reactive globally without prop-drilling,
// per the Frontend Architecture Blueprint's store plan.
//
// Owns no Firestore sync directly — it mirrors into the `settings`
// store's `soundEnabled` field for cross-device persistence (see
// settings.js), but keeps this fast, synchronous local copy so toggling
// mute during gameplay never waits on a network round-trip.

import { create } from 'zustand'
import { isMuted, setMuted, toggleMuted as toggleMutedInLib, sfx, speak } from '@/lib/sound'

export const useAudioStore = create((set) => ({
  muted: isMuted(),

  toggleMute() {
    const newMuted = toggleMutedInLib()
    set({ muted: newMuted })
    return newMuted
  },

  setMute(value) {
    const muted = !!value
    setMuted(muted)
    set({ muted })
  },

  // Re-exported so components can play sounds/speech through the
  // store instead of importing the lib module directly, keeping a
  // single, discoverable entry point for audio behavior.
  sfx,
  speak,
}))
