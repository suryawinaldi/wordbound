import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, ArrowRight, Zap, Target } from 'lucide-react'
import { ML_HEROES } from '@/data/ml-heroes'
import { useRoomStore } from '@/stores/room'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { sfx } from '@/lib/sound'
import MultiplayerLobby from '@/components/MultiplayerLobby'
import GameLayout from '@/components/GameLayout'
import GlassCard from '@/components/GlassCard'
import Confetti from '@/components/Confetti'

const WIN_TARGET = 10

export default function MLDuelPage() {
  const navigate = useNavigate()
  const { room } = useRoomStore()

  if (!room || room.status === 'waiting') {
    return (
      <div className="pt-4">
        <MultiplayerLobby gameId="ml-duel" gameName="ML Duel Racing" onBack={() => navigate('/ml-guess')} />
      </div>
    )
  }

  return <MLDuelBoard />
}

function MLDuelBoard() {
  const navigate = useNavigate()
  const { room, updateState, leaveRoom } = useRoomStore()
  const { incrementStat } = usePlayerStore()
  const currentUser = useAuthStore(s => s.currentUser)
  
  const isHost = room.host.uid === currentUser.uid
  const opponent = isHost ? room.guest : room.host
  const role = isHost ? 'host' : 'guest'

  const state = room.state || {}
  const heroIdx = state.heroIdx ?? 0
  const clueIndex = state.clueIndex ?? 0
  const hostScore = state.hostScore ?? 0
  const guestScore = state.guestScore ?? 0
  const winner = state.winner ?? null // 'host' | 'guest'

  // Generate a synchronized sequence of heroes
  // We use the room ID as a seed to ensure both players get the exact same sequence
  const [heroSequence] = useState(() => {
    // Simple deterministic shuffle based on room ID
    const seed = room.id.charCodeAt(0) + room.id.charCodeAt(room.id.length - 1)
    return [...ML_HEROES].sort((a, b) => {
      const hashA = (a.name.charCodeAt(0) * seed) % 100
      const hashB = (b.name.charCodeAt(0) * seed) % 100
      return hashA - hashB
    })
  })

  const hero = heroSequence[heroIdx % heroSequence.length]

  const myScore = isHost ? hostScore : guestScore
  const oppScore = isHost ? guestScore : hostScore

  const [guess, setGuess] = useState('')
  const [stunnedUntil, setStunnedUntil] = useState(0)
  const inputRef = useRef(null)

  const isStunned = stunnedUntil > Date.now()

  // Re-focus input if stun wears off
  useEffect(() => {
    if (isStunned) {
      const timer = setTimeout(() => {
        setStunnedUntil(0)
      }, stunnedUntil - Date.now())
      return () => clearTimeout(timer)
    }
  }, [isStunned, stunnedUntil])

  // Initialize state if host
  useEffect(() => {
    if (isHost && state.heroIdx === undefined) {
      updateState({ heroIdx: 0, clueIndex: 0, hostScore: 0, guestScore: 0, winner: null })
    }
  }, [isHost, state.heroIdx])

  async function handleGuess(e) {
    e.preventDefault()
    if (!guess.trim() || winner || isStunned) return

    const isCorrect = guess.toLowerCase().trim() === hero.name.toLowerCase()
    
    if (isCorrect) {
      sfx.correct()
      setGuess('')
      
      const nextScore = myScore + 1
      let newWinner = null
      if (nextScore >= WIN_TARGET) {
        newWinner = role
        incrementStat('mlDuelWins') // Record win!
      }

      // Update global state: award point, next hero, reset clue
      await updateState({
        [`${role}Score`]: nextScore,
        winner: newWinner,
        heroIdx: heroIdx + 1,
        clueIndex: 0
      })
    } else {
      sfx.wrong()
      setGuess('')
      // Apply 3 second stun locally
      setStunnedUntil(Date.now() + 3000)
    }
  }

  async function handleOpenClue() {
    if (clueIndex >= 6 || winner) return
    sfx.click()
    // Anyone can open clues for both players
    await updateState({ clueIndex: clueIndex + 1 })
  }

  function handleQuit() {
    sfx.click()
    leaveRoom()
    navigate('/ml-guess')
  }

  const amIWinner = winner === role

  const clues = [
    { label: 'Role/Lane', value: hero.role },
    { label: 'Ciri Fisik', value: hero.appearance },
    { label: 'Senjata/Kekuatan', value: hero.weapon },
    { label: 'Teman/Lawan', value: hero.synergy },
    { label: 'Mekanik/Skill', value: hero.mechanics },
    { label: 'Cerita/Asal', value: hero.lore },
    { label: 'Suara', value: 'Audio' }
  ]

  return (
    <GameLayout title="Duel Balapan Hero" subtitle="Siapa cepat dapat 10 Poin!" onBack={handleQuit}>
      {amIWinner && <Confetti />}

      <div className="max-w-md mx-auto space-y-4">
        
        {/* Score Board */}
        <div className="flex items-center justify-between p-4 bg-background/50 border border-border rounded-2xl shadow-sm">
          {/* Me */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl grid place-items-center font-black text-2xl ${myScore >= WIN_TARGET ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {myScore}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Kamu</p>
              <img src={currentUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.displayName}`} className="w-6 h-6 rounded-full mt-1" alt="" />
            </div>
          </div>
          
          <div className="text-2xl font-black text-muted-foreground/30 px-2"><Swords className="w-6 h-6" /></div>

          {/* Opponent */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-500">Lawan</p>
              <img src={opponent.photoURL} className="w-6 h-6 rounded-full mt-1 ml-auto" alt="" />
            </div>
            <div className={`w-12 h-12 rounded-xl grid place-items-center font-black text-2xl ${oppScore >= WIN_TARGET ? 'bg-rose-500 text-white' : 'bg-muted'}`}>
              {oppScore}
            </div>
          </div>
        </div>

        {winner ? (
          <GlassCard className="p-8 text-center space-y-4 shadow-glow-primary">
            <h2 className="text-4xl font-black">{amIWinner ? 'Kamu Menang!' : 'Kamu Kalah!'}</h2>
            <p className="text-muted-foreground">Hero terakhir adalah {hero.name}</p>
            <button onClick={handleQuit} className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold">
              Kembali
            </button>
          </GlassCard>
        ) : (
          <>
            {/* Clues */}
            <GlassCard className="p-5 space-y-4">
              <div className="flex justify-between items-end mb-4">
                <h3 className="font-bold text-lg">Petunjuk ({clueIndex + 1}/7)</h3>
              </div>

              <div className="space-y-3">
                {clues.map((clue, i) => {
                  const isOpen = i <= clueIndex
                  return (
                    <motion.div
                      key={i}
                      initial={false}
                      animate={{ opacity: isOpen ? 1 : 0.4, scale: isOpen ? 1 : 0.98 }}
                      className={`p-3 rounded-xl border ${isOpen ? 'bg-primary/5 border-primary/20' : 'bg-background border-border border-dashed'}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted grid place-items-center text-xs font-bold">
                          {i + 1}
                        </span>
                        {isOpen ? (
                          <div className="flex-1">
                            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary block mb-1">
                              {clue.label}
                            </span>
                            {i === 6 && hero.audioUrl ? (
                              <div className="mt-2 sm:mt-0 w-full sm:w-auto">
                                <audio src={`/api/proxy-audio?url=${encodeURIComponent(hero.audioUrl)}`} controls autoPlay className="h-10 w-full sm:w-48 outline-none rounded-full" />
                              </div>
                            ) : (
                              <p className="text-sm font-medium pt-1 flex-1">{clue.value}</p>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center h-6">
                            <div className="w-1/2 h-2 rounded-full bg-muted"></div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </GlassCard>

            {/* Input Area */}
            <div className="relative">
              {isStunned && (
                <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur rounded-2xl flex flex-col items-center justify-center border-2 border-rose-500 animate-pulse">
                  <Zap className="w-6 h-6 text-rose-500 mb-1" />
                  <p className="text-rose-500 font-bold tracking-widest uppercase text-sm">STUNNED!</p>
                </div>
              )}
              
              <form onSubmit={handleGuess} className="flex gap-2 mb-3">
                <input
                  ref={inputRef}
                  value={guess}
                  onChange={e => setGuess(e.target.value)}
                  placeholder="Ketik nama hero..."
                  disabled={isStunned || winner}
                  className="flex-1 bg-background/50 rounded-xl px-4 py-3 outline-none border border-border focus:border-primary"
                />
                <button type="submit" disabled={!guess.trim() || isStunned || winner} className="px-6 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50">
                  Tebak
                </button>
              </form>
              
              {clueIndex < 6 && (
                <button 
                  onClick={handleOpenClue} 
                  disabled={isStunned || winner}
                  className="w-full py-3 rounded-xl glass text-muted-foreground text-sm font-semibold hover:text-foreground transition border border-border"
                >
                  Buka Clue Selanjutnya (Gratis)
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </GameLayout>
  )
}
