import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Play, Copy, CheckCircle2, ArrowLeft, Heart } from 'lucide-react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase-config'
import { useRoomStore } from '@/stores/room'
import { useAuthStore } from '@/stores/auth'
import GlassCard from '@/components/GlassCard'
import { sfx } from '@/lib/sound'

export default function MultiplayerLobby({ gameId, gameName, customSettings = {}, settingsUI = null, onBack }) {
  const { room, roomId, createRoom, joinRoom, startGame, leaveRoom, loading, error } = useRoomStore()
  const currentUser = useAuthStore(s => s.currentUser)
  const userData = useAuthStore(s => s.userData)
  const [joinCode, setJoinCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)

  // Auto-leave room on unmount if we didn't start playing
  useEffect(() => {
    return () => {
    }
  }, [])

  async function handleCreate() {
    sfx.click()
    await createRoom(gameId, customSettings)
  }

  async function handleInvitePartner() {
    sfx.click()
    await createRoom(gameId, customSettings)
    
    // Get the newly created room id from the store
    const state = useRoomStore.getState()
    if (state.roomId && userData?.partnerUid) {
      await updateDoc(doc(db, 'users', userData.partnerUid), {
        currentInvite: {
          roomId: state.roomId,
          gameId,
          gameName,
          hostName: currentUser.displayName,
          timestamp: Date.now()
        }
      })
      setInviteSent(true)
    }
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (joinCode.length !== 6) return
    sfx.click()
    await joinRoom(joinCode)
  }

  function handleCopy() {
    sfx.click()
    navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleBack() {
    sfx.click()
    if (room) leaveRoom()
    onBack()
  }

  if (room) {
    const isHost = room.host.uid === currentUser?.uid
    const hasGuest = !!room.guest

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto space-y-6">
        <button onClick={handleBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Batal & Keluar
        </button>

        <GlassCard className="p-8 text-center space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold mb-2">Lobby: {gameName}</h2>
            <p className="text-sm text-muted-foreground">Bagikan kode ini ke teman duelmu!</p>
          </div>

          <div 
            onClick={handleCopy}
            className="group relative bg-background/50 border border-border rounded-2xl p-4 flex items-center justify-center gap-3 cursor-pointer hover:border-primary transition"
          >
            <span className="font-display font-black text-4xl tracking-widest text-primary">{roomId}</span>
            {copied ? <CheckCircle2 className="w-5 h-5 text-growth" /> : <Copy className="w-5 h-5 text-muted-foreground group-hover:text-primary transition" />}
          </div>

          <div className="flex items-center justify-center gap-6 pt-4">
            {/* Host */}
            <div className="flex flex-col items-center gap-2">
              <img src={room.host.photoURL} className="w-16 h-16 rounded-full border-4 border-primary/20" alt="Host" />
              <p className="text-sm font-semibold truncate w-24">{room.host.displayName}</p>
            </div>
            
            <div className="text-2xl font-black text-muted-foreground/50 italic">VS</div>

            {/* Guest */}
            <div className="flex flex-col items-center gap-2">
              {hasGuest ? (
                <motion.img initial={{ scale: 0 }} animate={{ scale: 1 }} src={room.guest.photoURL} className="w-16 h-16 rounded-full border-4 border-growth/20" alt="Guest" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted border-4 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-muted-foreground/50" />
                </div>
              )}
              <p className="text-sm font-semibold truncate w-24">
                {hasGuest ? room.guest.displayName : <span className="animate-pulse text-muted-foreground">{inviteSent ? 'Menunggu Pasangan...' : 'Menunggu...'}</span>}
              </p>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {inviteSent && !hasGuest && (
            <div className="bg-couple/10 text-couple p-3 rounded-xl text-sm font-semibold animate-pulse border border-couple/20 mb-4">
              Undangan mabar telah dikirim ke HP pasanganmu! 💌
            </div>
          )}

          {isHost ? (
            <button 
              onClick={() => { sfx.correct(); startGame() }}
              disabled={!hasGuest}
              className="w-full py-4 rounded-2xl bg-growth text-growth-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-growth transition"
            >
              <Play className="w-5 h-5" /> {hasGuest ? 'Mulai Duel!' : 'Menunggu Lawan...'}
            </button>
          ) : (
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Menunggu Host memulai game...</p>
          )}
        </GlassCard>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto space-y-6">
      <button onClick={handleBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <GlassCard className="p-8 space-y-8">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-2">{gameName}</h2>
          <p className="text-sm text-muted-foreground">Main berdua bareng teman atau pasangan secara langsung!</p>
        </div>

        {settingsUI}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-glow-primary transition hover:-translate-y-1"
          >
            <Users className="w-5 h-5" /> Buat Room Baru
          </button>
          
          {userData?.partnerUid && (
            <button 
              onClick={handleInvitePartner}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-couple text-white font-bold flex items-center justify-center gap-2 shadow-glow-couple transition hover:-translate-y-1"
            >
              <Heart className="w-5 h-5" /> Ajak Pasangan
            </button>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
          <div className="relative flex justify-center"><span className="bg-card px-4 text-xs font-semibold text-muted-foreground uppercase">Atau</span></div>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground ml-1">Kode Room</label>
            <input 
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="A B C 1 2 3"
              maxLength={6}
              className="w-full mt-1 bg-background/60 rounded-xl px-4 py-4 outline-none border border-border focus:border-primary text-center tracking-[0.5em] font-display text-xl"
            />
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl">{error}</p>}
          <button 
            type="submit"
            disabled={loading || joinCode.length !== 6}
            className="w-full py-4 rounded-2xl bg-background border border-border text-foreground font-bold transition hover:bg-muted disabled:opacity-50"
          >
            Gabung Room
          </button>
        </form>
      </GlassCard>
    </motion.div>
  )
}
