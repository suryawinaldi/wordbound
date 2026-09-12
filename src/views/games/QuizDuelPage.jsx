import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, Swords, Zap, Check, X } from 'lucide-react'
import { QUIZ_BANK } from '@/data/quiz-bank'
import { useRoomStore } from '@/stores/room'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { sfx } from '@/lib/sound'
import MultiplayerLobby from '@/components/MultiplayerLobby'
import GameLayout from '@/components/GameLayout'
import GlassCard from '@/components/GlassCard'
import Confetti from '@/components/Confetti'

const WIN_TARGET = 5
const STUN_DURATION = 2000 // 2 seconds penalty for wrong answer

export default function QuizDuelPage() {
  const navigate = useNavigate()
  const { room } = useRoomStore()

  if (!room || room.status === 'waiting') {
    return (
      <div className="pt-4">
        <MultiplayerLobby gameId="quiz-duel" gameName="English Quiz Duel" onBack={() => navigate('/games')} />
      </div>
    )
  }

  return <QuizDuelBoard />
}

function QuizDuelBoard() {
  const navigate = useNavigate()
  const { room, updateState, leaveRoom } = useRoomStore()
  const { incrementStat, recordActivity } = usePlayerStore()
  const currentUser = useAuthStore(s => s.currentUser)
  
  const isHost = room.host.uid === currentUser.uid
  const opponent = isHost ? room.guest : room.host
  const role = isHost ? 'host' : 'guest'

  const state = room.state || {}
  const roundIdx = state.roundIdx ?? 0
  const hostScore = state.hostScore ?? 0
  const guestScore = state.guestScore ?? 0
  const hostStunnedUntil = state.hostStunnedUntil ?? 0
  const guestStunnedUntil = state.guestStunnedUntil ?? 0
  const winner = state.winner ?? null

  const myScore = isHost ? hostScore : guestScore
  const oppScore = isHost ? guestScore : hostScore
  const myStunnedUntil = isHost ? hostStunnedUntil : guestStunnedUntil
  const oppStunnedUntil = isHost ? guestStunnedUntil : hostStunnedUntil

  const [sequence] = useState(() => {
    // Deterministic shuffle
    const seed = room.id.charCodeAt(0) + room.id.charCodeAt(room.id.length - 1)
    return [...QUIZ_BANK].sort((a, b) => {
      const hashA = (a.q.charCodeAt(0) * seed) % 100
      const hashB = (b.q.charCodeAt(0) * seed) % 100
      return hashA - hashB
    })
  })

  const currentQ = sequence[roundIdx % sequence.length]
  const [now, setNow] = useState(Date.now())
  const amIStunned = now < myStunnedUntil
  const isOppStunned = now < oppStunnedUntil

  useEffect(() => {
    if (isHost && state.roundIdx === undefined) {
      updateState({ roundIdx: 0, hostScore: 0, guestScore: 0, winner: null, hostStunnedUntil: 0, guestStunnedUntil: 0 })
    }
  }, [isHost, state.roundIdx])

  // Timer for stun effect
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(t)
  }, [])

  async function handleSelect(optIdx) {
    if (winner || amIStunned) return

    const isCorrect = optIdx === currentQ.a
    
    if (isCorrect) {
      sfx.correct()
      const nextScore = myScore + 1
      let newWinner = null
      
      if (nextScore >= WIN_TARGET) {
        newWinner = role
        incrementStat('quizDuelWins')
        recordActivity()
      }

      await updateState({
        [`${role}Score`]: nextScore,
        winner: newWinner,
        roundIdx: roundIdx + 1,
        hostStunnedUntil: 0, // reset stuns for next round
        guestStunnedUntil: 0
      })
    } else {
      sfx.wrong()
      await updateState({
        [`${role}StunnedUntil`]: Date.now() + STUN_DURATION
      })
    }
  }

  function handleQuit() {
    sfx.click()
    leaveRoom()
    navigate('/games')
  }

  const amIWinner = winner === role

  return (
    <GameLayout title="Quiz Duel" subtitle={`Balapan ${WIN_TARGET} Poin!`} onBack={handleQuit}>
      {amIWinner && <Confetti />}

      <div className="max-w-md mx-auto space-y-4">
        
        {/* Score Board */}
        <div className="flex items-center justify-between p-4 bg-background/50 border border-border rounded-2xl shadow-sm">
          {/* Me */}
          <div className="flex items-center gap-3 relative">
            {amIStunned && (
              <div className="absolute inset-0 z-10 grid place-items-center bg-background/80 rounded-xl backdrop-blur-sm animate-pulse">
                <Zap className="w-6 h-6 text-yellow-500" />
              </div>
            )}
            <div className={`w-12 h-12 rounded-xl grid place-items-center font-black text-2xl ${myScore >= WIN_TARGET ? 'bg-primary text-primary-foreground shadow-glow-primary' : 'bg-muted'}`}>
              {myScore}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Kamu</p>
              <img src={currentUser.photoURL} className="w-6 h-6 rounded-full mt-1" alt="" />
            </div>
          </div>
          
          <div className="text-2xl font-black text-muted-foreground/30 px-2"><Swords className="w-6 h-6" /></div>

          {/* Opponent */}
          <div className="flex items-center gap-3 relative">
            {isOppStunned && (
              <div className="absolute inset-0 z-10 grid place-items-center bg-background/80 rounded-xl backdrop-blur-sm animate-pulse">
                <Zap className="w-6 h-6 text-yellow-500" />
              </div>
            )}
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-500">Lawan</p>
              <img src={opponent.photoURL} className="w-6 h-6 rounded-full mt-1 ml-auto" alt="" />
            </div>
            <div className={`w-12 h-12 rounded-xl grid place-items-center font-black text-2xl ${oppScore >= WIN_TARGET ? 'bg-rose-500 text-white shadow-glow-destructive' : 'bg-muted'}`}>
              {oppScore}
            </div>
          </div>
        </div>

        {winner ? (
          <GlassCard className="p-8 text-center space-y-4 shadow-glow-primary">
            <h2 className="text-4xl font-black">{amIWinner ? 'Kamu Menang!' : 'Kamu Kalah!'}</h2>
            <button onClick={handleQuit} className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold">
              Kembali
            </button>
          </GlassCard>
        ) : (
          <GlassCard className="p-6 relative overflow-hidden">
            {amIStunned && (
              <div className="absolute inset-0 z-20 bg-destructive/10 backdrop-blur-sm grid place-items-center text-destructive font-black text-2xl animate-pulse">
                STUNNED!
              </div>
            )}
            
            <p className="text-lg font-medium text-center mb-6 leading-relaxed">{currentQ.q}</p>

            <div className="space-y-3">
              {currentQ.opts.map((opt, i) => (
                <button 
                  key={`${roundIdx}-${i}`}
                  disabled={amIStunned || winner} 
                  onClick={() => handleSelect(i)} 
                  className="w-full py-4 px-5 rounded-2xl text-left font-medium border-2 border-border bg-background/40 hover:border-primary/50 text-foreground transition-all active:scale-95"
                >
                  <div className="flex justify-between items-center">
                    <span>{opt}</span>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </GameLayout>
  )
}
