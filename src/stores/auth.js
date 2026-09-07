import { ref } from 'vue'
import { defineStore } from 'pinia'
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore'
import { auth as firebaseAuth, googleProvider, db } from '@/firebase-config'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const userData = ref(null)
  const partnerData = ref(null)
  const authReady = ref(false)
  const loading = ref(false)
  const error = ref(null)
  
  let userUnsub = null
  let partnerUnsub = null

  function watchUserData(uid) {
    if (userUnsub) userUnsub()
    userUnsub = onSnapshot(doc(db, 'users', uid), (snap) => {
      if (snap.exists()) {
        userData.value = snap.data()
        if (userData.value.partnerUid && !partnerUnsub) {
          watchPartnerData(userData.value.partnerUid)
        }
      }
    })
  }

  function watchPartnerData(partnerUid) {
    if (partnerUnsub) partnerUnsub()
    partnerUnsub = onSnapshot(doc(db, 'users', partnerUid), (snap) => {
      if (snap.exists()) {
        partnerData.value = snap.data()
      }
    })
  }

  function stopWatching() {
    if (userUnsub) userUnsub()
    if (partnerUnsub) partnerUnsub()
    userUnsub = null
    partnerUnsub = null
    userData.value = null
    partnerData.value = null
  }

  async function loginWithGoogle() {
    loading.value = true
    error.value = null
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider)
      const user = result.user
      
      // Ensure user document exists
      const userRef = doc(db, 'users', user.uid)
      const snap = await getDoc(userRef)
      if (!snap.exists()) {
        await setDoc(userRef, {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          partnerUid: null,
          createdAt: new Date().toISOString(),
          // Default player stats
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
      console.error("Login failed", err)
      error.value = err.message
      alert("Google Login Error: " + err.message + "\n\nPastikan Google Auth diaktifkan di Firebase Console dan domain ini di-whitelist.")
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await signOut(firebaseAuth)
    stopWatching()
  }

  async function generateInviteCode() {
    if (!currentUser.value) return null
    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const inviteRef = doc(db, 'invites', code)
    await setDoc(inviteRef, {
      creatorUid: currentUser.value.uid,
      createdAt: new Date().toISOString()
    })
    return code
  }

  async function linkWithCode(code) {
    if (!currentUser.value) throw new Error("Not logged in")
    loading.value = true
    error.value = null
    try {
      const inviteRef = doc(db, 'invites', code)
      const snap = await getDoc(inviteRef)
      if (!snap.exists()) {
        throw new Error("Invalid or expired code")
      }
      const data = snap.data()
      if (data.creatorUid === currentUser.value.uid) {
        throw new Error("You cannot use your own code")
      }

      const partnerUid = data.creatorUid

      // Link both users
      const myRef = doc(db, 'users', currentUser.value.uid)
      const partnerRef = doc(db, 'users', partnerUid)

      await updateDoc(myRef, { partnerUid })
      await updateDoc(partnerRef, { partnerUid: currentUser.value.uid })

      // Clean up invite
      await deleteDoc(inviteRef)

      // Start watching partner immediately
      watchPartnerData(partnerUid)

    } catch (err) {
      console.error("Link failed", err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Initialize Auth state listener
  onAuthStateChanged(firebaseAuth, (user) => {
    currentUser.value = user
    if (user) {
      watchUserData(user.uid)
    } else {
      stopWatching()
    }
    authReady.value = true
  })

  return {
    currentUser,
    userData,
    partnerData,
    authReady,
    loading,
    error,
    loginWithGoogle,
    logout,
    generateInviteCode,
    linkWithCode
  }
})
