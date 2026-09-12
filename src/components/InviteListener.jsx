import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Swords, X, Check } from 'lucide-react'
import { doc, updateDoc, deleteField } from 'firebase/firestore'
import { db } from '@/firebase-config'
import { useAuthStore } from '@/stores/auth'
import { useRoomStore } from '@/stores/room'
import { sfx } from '@/lib/sound'

export default function InviteListener() {
  const navigate = useNavigate()
  const currentUser = useAuthStore(s => s.currentUser)
  const userData = useAuthStore(s => s.userData)
  const joinRoom = useRoomStore(s => s.joinRoom)
  const leaveRoom = useRoomStore(s => s.leaveRoom)

  const invite = userData?.currentInvite

  // Only show if invite is newer than 5 minutes
  const isInviteValid = invite && (Date.now() - invite.timestamp < 5 * 60 * 1000)

  // Play sound when invite arrives
  useEffect(() => {
    if (isInviteValid) {
      sfx.chime() // Notification sound
    }
  }, [isInviteValid, invite?.timestamp])

  async function clearInvite() {
    if (!currentUser) return
    await updateDoc(doc(db, 'users', currentUser.uid), {
      currentInvite: deleteField()
    })
  }

  async function handleAccept() {
    sfx.click()
    leaveRoom() // Leave current room if any
    await joinRoom(invite.roomId)
    await clearInvite()
    navigate(`/${invite.gameId}`)
  }

  async function handleDecline() {
    sfx.click()
    await clearInvite()
  }

  return (
    <AnimatePresence>
      {isInviteValid && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 glass-strong shadow-glow p-4 rounded-3xl border border-primary/30"
        >
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-rose-500 text-white grid place-items-center shadow-soft shrink-0">
              <Swords className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-0.5">Undangan Mabar!</p>
              <p className="text-sm font-medium leading-tight">
                <span className="font-bold">{invite.hostName}</span> mengajakmu main <span className="font-bold text-foreground">{invite.gameName}</span>!
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button 
              onClick={handleDecline}
              className="flex-1 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4" /> Tolak
            </button>
            <button 
              onClick={handleAccept}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-glow-primary hover:opacity-90 transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Terima & Gabung
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
