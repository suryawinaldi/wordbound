// Sesi "Main Bareng" (co-op) generik yang dipakai semua game — beda dari Duel Wordle
// yang sifatnya versus, di sini skor digabung dan gantian jawab, bukan saling ngalahin.
import { ref, onUnmounted } from 'vue'
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase-config'

export function useCoopSession(gameKey) {
  const session = ref(null)
  let unsub = null

  function watch() {
    if (unsub) return
    unsub = onSnapshot(doc(db, 'coop', gameKey), (snap) => {
      session.value = snap.exists() ? snap.data() : null
    })
  }

  function stopWatch() {
    if (unsub) {
      unsub()
      unsub = null
    }
  }

  async function createSession(data) {
    await setDoc(doc(db, 'coop', gameKey), data)
  }

  async function patchSession(patch) {
    await setDoc(doc(db, 'coop', gameKey), patch, { merge: true })
  }

  // Membubarkan sesi supaya lain kali dibuka bukan nyangkut di game yang sudah selesai.
  async function endSession() {
    await deleteDoc(doc(db, 'coop', gameKey))
  }

  onUnmounted(stopWatch)

  return { session, watch, stopWatch, createSession, patchSession, endSession }
}
