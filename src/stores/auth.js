import { create } from 'zustand'
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  signInAnonymously
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

async function ensureUserDoc(user, guestName = null) {
  const userRef = doc(db, 'users', user.uid)
  const snap = await getDoc(userRef)
  
  const displayName = user.displayName || guestName || `Guest-${Math.floor(Math.random() * 10000)}`
  const email = user.email || null
  const photoURL = user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`

  if (!snap.exists()) {
    await setDoc(userRef, {
      displayName,
      email,
      photoURL,
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
    // Update profile info just in case, but avoid overwriting guest names on reload
    const updates = {}
    if (user.displayName) updates.displayName = user.displayName
    if (user.photoURL) updates.photoURL = user.photoURL
    if (Object.keys(updates).length > 0) {
      await updateDoc(userRef, updates)
    }
  }
}

// Handle redirect result for mobile Safari
getRedirectResult(firebaseAuth).then(result => {
  if (result && result.user) {
    ensureUserDoc(result.user).catch(console.error)
  }
}).catch(err => {
  console.error('Redirect result error', err)
  // Only alert if it's a real error, not just no redirect found
  if (err.code !== 'auth/no-redirect-result') {
    alert('Redirect Login Error: ' + err.code + ' - ' + err.message)
  }
})

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

  async loginAsGuest(guestName) {
    set({ loading: true, error: null })
    try {
      const result = await signInAnonymously(firebaseAuth)
      await ensureUserDoc(result.user, guestName)
      set({ loading: false })
    } catch (err) {
      console.error('Guest login failed', err)
      set({ error: err.message, loading: false })
      alert('Guest Login Error: ' + err.message)
    }
  },

  async loginWithGoogle() {
    set({ loading: true, error: null })
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    
    try {
      if (isIOS) {
        // Direct redirect for iOS to avoid popup blocking/third-party cookie issues initially
        await signInWithRedirect(firebaseAuth, googleProvider)
        // Do not set loading to false, wait for page redirect
        return
      }

      const result = await signInWithPopup(firebaseAuth, googleProvider)
      await ensureUserDoc(result.user)
      set({ loading: false })
    } catch (err) {
      console.error('Login failed', err)
      
      if (
        err.code === 'auth/network-request-failed' ||
        err.code === 'auth/popup-blocked' ||
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request' ||
        err.code === 'auth/web-storage-unsupported'
      ) {
        console.log('Falling back to redirect login...')
        signInWithRedirect(firebaseAuth, googleProvider).catch(e => {
          set({ error: e.message, loading: false })
          alert('Fallback Redirect Error: ' + e.code + ' - ' + e.message)
        })
      } else {
        set({ error: err.message, loading: false })
        alert('Google Login Error (' + err.code + '): ' + err.message)
      }
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
