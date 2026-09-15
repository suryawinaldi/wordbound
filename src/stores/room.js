import { create } from 'zustand'
import { doc, setDoc, updateDoc, onSnapshot, deleteDoc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase-config'
import { useAuthStore } from './auth'

let roomUnsub = null

export const useRoomStore = create((set, get) => ({
  room: null,
  roomId: null,
  loading: false,
  error: null,
  isLocal: false,

  createLocalRoom: (gameId) => {
    const currentUser = useAuthStore.getState().currentUser
    set({
      roomId: 'local',
      isLocal: true,
      room: {
        id: 'local',
        gameId,
        status: 'playing',
        host: { uid: currentUser.uid, displayName: 'Pemain 1 (Kamu)', photoURL: currentUser.photoURL },
        guest: { uid: 'guest', displayName: 'Pemain 2', photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest' },
        state: {}
      }
    })
  },

  createRoom: async (gameId, customSettings = {}) => {
    set({ loading: true, error: null, isLocal: false })
    try {
      const currentUser = useAuthStore.getState().currentUser
      const userData = useAuthStore.getState().userData
      if (!currentUser) throw new Error('Harus login untuk membuat room')

      // Generate random 6 character code
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase()
      
      const roomData = {
        id: roomId,
        gameId,
        host: {
          uid: currentUser.uid,
          displayName: userData?.displayName || currentUser.displayName,
          photoURL: currentUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.displayName}`
        },
        guest: null,
        status: 'waiting', // waiting, playing, finished
        settings: customSettings,
        state: {}, // Game specific state
        createdAt: new Date().toISOString()
      }

      await setDoc(doc(db, 'rooms', roomId), roomData)
      get().watchRoom(roomId)
      set({ loading: false })
      return roomId
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  joinRoom: async (roomId) => {
    set({ loading: true, error: null })
    try {
      const currentUser = useAuthStore.getState().currentUser
      const userData = useAuthStore.getState().userData
      if (!currentUser) throw new Error('Harus login')

      const roomRef = doc(db, 'rooms', roomId.toUpperCase())
      const snap = await getDoc(roomRef)
      
      if (!snap.exists()) throw new Error('Room tidak ditemukan')
      const roomData = snap.data()
      
      if (roomData.status !== 'waiting' && roomData.guest?.uid !== currentUser.uid) {
        throw new Error('Room sudah penuh atau game sedang berjalan')
      }

      if (roomData.host.uid === currentUser.uid) {
        // Host rejoining
        get().watchRoom(roomId.toUpperCase())
        set({ loading: false })
        return true
      }

      // Join as guest
      await updateDoc(roomRef, {
        guest: {
          uid: currentUser.uid,
          displayName: userData?.displayName || currentUser.displayName,
          photoURL: currentUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.displayName}`
        }
      })

      get().watchRoom(roomId.toUpperCase())
      set({ loading: false })
      return true
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  startGame: async () => {
    const { roomId } = get()
    if (!roomId) return
    await updateDoc(doc(db, 'rooms', roomId), { status: 'playing' })
  },

  updateState: async (patch) => {
    const { roomId, isLocal, room } = get()
    if (!roomId) return
    
    if (isLocal) {
      set({ room: { ...room, state: { ...room.state, ...patch } } })
      return
    }

    // patch is merged into the 'state' map
    await updateDoc(doc(db, 'rooms', roomId), patch)
  },

  leaveRoom: async () => {
    const { roomId, room, isLocal } = get()
    if (!roomId) return
    
    if (isLocal) {
      set({ room: null, roomId: null, isLocal: false })
      return
    }
    
    const currentUser = useAuthStore.getState().currentUser
    if (room && currentUser) {
      // If host leaves, maybe delete room or set status closed. We'll just delete for simplicity.
      if (room.host.uid === currentUser.uid) {
        await deleteDoc(doc(db, 'rooms', roomId))
      } else if (room.guest?.uid === currentUser.uid) {
        await updateDoc(doc(db, 'rooms', roomId), { guest: null, status: 'waiting' })
      }
    }

    if (roomUnsub) roomUnsub()
    roomUnsub = null
    set({ room: null, roomId: null, error: null })
  },

  watchRoom: (roomId) => {
    if (roomUnsub) roomUnsub()
    set({ roomId })
    roomUnsub = onSnapshot(doc(db, 'rooms', roomId), (snap) => {
      if (snap.exists()) {
        set({ room: snap.data() })
      } else {
        set({ room: null, error: 'Room telah ditutup oleh Host' })
      }
    })
  }
}))
