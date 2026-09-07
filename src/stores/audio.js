// audio store — a thin Pinia wrapper around the existing procedural
// sound module (src/lib/sound.js). Promoted to a store specifically so
// the mute state can be read reactively from anywhere in the component
// tree (e.g. a future NavigationShell's mute control) without prop-
// drilling, per the Frontend Architecture Blueprint's store plan.
//
// Owns no Firestore sync directly — it mirrors into the `settings`
// store's `soundEnabled` field for cross-device persistence (see
// settings.js), but keeps this fast, synchronous local copy so toggling
// mute during gameplay never waits on a network round-trip.

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { isMuted, setMuted, toggleMuted as toggleMutedInLib, sfx, speak } from '@/lib/sound'

export const useAudioStore = defineStore('audio', () => {
  const muted = ref(isMuted())

  function toggleMute() {
    muted.value = toggleMutedInLib()
    return muted.value
  }

  function setMute(value) {
    muted.value = !!value
    setMuted(muted.value)
  }

  return {
    muted,
    toggleMute,
    setMute,
    // Re-exported so components can play sounds/speech through the
    // store instead of importing the lib module directly, keeping a
    // single, discoverable entry point for audio behavior.
    sfx,
    speak,
  }
})
