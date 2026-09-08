import { create } from 'zustand'
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore'
import { auth as firebaseAuth, googleProvider, db } from '@/firebase-config'

let userUnsub = null
let partnerUnsub = null

function watchPartnerData(partnerUid) {
  if (partnerUnsub) partnerUnsub()
  partnerUnsub = onSnapshot(doc(db, 'users', partnerUid), (snap) => {
    if (snap.exists()) {
      useAuthStore.setState({ partnerData: snap.data() })
    }
  })
}

function watchUserData(uid) {
  if (userUnsub) userUnsub()
  userUnsub = onSnapshot(doc(db, 'users', uid), (snap) => {
    if (snap.exists()) {
      const userData = snap.data()
      useAuthStore.setState({ userData })
      if (userData.partnerUid && !partnerUnsub) {
        watchPartnerData(userData.partnerUid)
      }
    }
  })
}

function stopWatching() {
  if (userUnsub) userUnsub()
  if (partnerUnsub) partnerUnsub()
  userUnsub = null
  partnerUnsub = null
  useAuthStore.setState({ userData: null, partnerData: null })
}

// Initialize Firebase Auth listener — runs once on module load, same as Pinia's setup()
onAuthStateChanged(firebaseAuth, (user) => {
  useAuthStore.setState({ currentUser: user, authReady: true })
  if (user) {
    watchUserData(user.uid)
  } else {
    stopWatching()
  }
})

export const useAuthStore = create((set, get) => ({
  currentUser: null,
  userData: null,
  partnerData: null,
  authReady: false,
  loading: false,
  error: null,

  async loginWithGoogle() {
    set({ loading: true, error: null })
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider)
      const user = result.user

      // Ensure user document exists in Firestore
      const userRef = doc(db, 'users', user.uid)
      const snap = await getDoc(userRef)
      if (!snap.exists()) {
        await setDoc(userRef, {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          partnerUid: null,
          createdAt: new Date().toISOString(),
          streak: 0,
          lastDate: null,
          xp: 0,
          coins: 0,
          level: 1,
          streakFreezeCount: 0
        })
      } else {
        // Update profile info just in case
        await updateDoc(userRef, {
          displayName: user.displayName,
          photoURL: user.photoURL
        })
      }
    } catch (err) {
      console.error('Login failed', err)
      set({ error: err.message })
      alert('Google Login Error: ' + err.message + '\n\nPastikan Google Auth diaktifkan di Firebase Console dan domain ini di-whitelist.')
    } finally {
      set({ loading: false })
    }
  },

  async logout() {
    await signOut(firebaseAuth)
    stopWatching()
  },

  async generateInviteCode() {
    const { currentUser } = get()
    if (!currentUser) return null
    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const inviteRef = doc(db, 'invites', code)
    await setDoc(inviteRef, {
      creatorUid: currentUser.uid,
      createdAt: new Date().toISOString()
    })
    return code
  },

  async linkWithCode(code) {
    const { currentUser } = get()
    if (!currentUser) throw new Error('Not logged in')
    set({ loading: true, error: null })
    try {
      const inviteRef = doc(db, 'invites', code)
      const snap = await getDoc(inviteRef)
      if (!snap.exists()) {
        throw new Error('Invalid or expired code')
      }
      const data = snap.data()
      if (data.creatorUid === currentUser.uid) {
        throw new Error('You cannot use your own code')
      }

      const partnerUid = data.creatorUid

      // Link both users
      const myRef = doc(db, 'users', currentUser.uid)
      const partnerRef = doc(db, 'users', partnerUid)

      await updateDoc(myRef, { partnerUid })
      await updateDoc(partnerRef, { partnerUid: currentUser.uid })

      // Clean up invite
      await deleteDoc(inviteRef)

      // Start watching partner immediately
      watchPartnerData(partnerUid)

    } catch (err) {
      console.error('Link failed', err)
      set({ error: err.message })
      throw err
    } finally {
      set({ loading: false })
    }
  },
}))
