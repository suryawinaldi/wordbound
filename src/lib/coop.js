// Sesi "Main Bareng" (co-op) generik yang dipakai semua game — beda dari Duel Wordle
// yang sifatnya versus, di sini skor digabung dan gantian jawab, bukan saling ngalahin.
import { useState, useEffect, useRef } from 'react'
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase-config'

export function useCoopSession(gameKey) {
  const [session, setSession] = useState(null)
  const unsubRef = useRef(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubRef.current) {
        unsubRef.current()
        unsubRef.current = null
      }
    }
  }, [])

  function watch() {
    if (unsubRef.current) return
    unsubRef.current = onSnapshot(doc(db, 'coop', gameKey), (snap) => {
      setSession(snap.exists() ? snap.data() : null)
    })
  }

  function stopWatch() {
    if (unsubRef.current) {
      unsubRef.current()
      unsubRef.current = null
    }
  }

  async function createSession(data) {
    await setDoc(doc(db, 'coop', gameKey), data)
    // watch() will be called by the component after creating
    watch()
  }

  async function patchSession(patch) {
    await setDoc(doc(db, 'coop', gameKey), patch, { merge: true })
  }

  // Membubarkan sesi supaya lain kali dibuka bukan nyangkut di game yang sudah selesai.
  async function endSession() {
    await deleteDoc(doc(db, 'coop', gameKey))
    setSession(null)
  }

  return { session, watch, stopWatch, createSession, patchSession, endSession }
}
