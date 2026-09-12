import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Headphones, Swords, Volume2, ArrowRight } from 'lucide-react'
import { SENTENCE_ITEMS as LISTEN_BANK } from '@/data/listen-bank'
import { useRoomStore } from '@/stores/room'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { sfx, speak } from '@/lib/sound'
import MultiplayerLobby from '@/components/MultiplayerLobby'
import GameLayout from '@/components/GameLayout'
import GlassCard from '@/components/GlassCard'
import Confetti from '@/components/Confetti'

const WIN_TARGET = 5

export default function ListenDuelPage() {
  const navigate = useNavigate()
  const { room } = useRoomStore()

  if (!room || room.status === 'waiting') {
    return (
      <div className="pt-4">
        <MultiplayerLobby gameId="listen-duel" gameName="Listen & Type Duel" onBack={() => navigate('/games')} />
      </div>
    )
  }

  return <ListenDuelBoard />
}

function ListenDuelBoard() {
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
  const winner = state.winner ?? null

  const [sequence] = useState(() => {
    // Deterministic shuffle based on roomId
    const seed = room.id.charCodeAt(0) + room.id.charCodeAt(room.id.length - 1)
    return [...LISTEN_BANK].sort((a, b) => {
      const hashA = (a.text.charCodeAt(0) * seed) % 100
      const hashB = (b.text.charCodeAt(0) * seed) % 100
      return hashA - hashB
    })
  })

  const currentSentence = sequence[roundIdx % sequence.length]
  const [guess, setGuess] = useState('')
  const inputRef = useRef(null)

  const myScore = isHost ? hostScore : guestScore
  const oppScore = isHost ? guestScore : hostScore

  useEffect(() => {
    if (isHost && state.roundIdx === undefined) {
      updateState({ roundIdx: 0, hostScore: 0, guestScore: 0, winner: null })
    }
  }, [isHost, state.roundIdx])

  // Play audio automatically when round changes (if we haven't won)
  useEffect(() => {
    if (currentSentence && !winner) {
      setGuess('')
      inputRef.current?.focus()
      setTimeout(() => speak(currentSentence.text), 500)
    }
  }, [roundIdx, currentSentence, winner])

  function cleanString(str) {
    return str.toLowerCase().replace(/[^\w\s]/g, '').trim()
  }

  async function handleGuess(e) {
    e.preventDefault()
    if (!guess.trim() || winner) return

    const isCorrect = cleanString(guess) === cleanString(currentSentence.text)
    
    if (isCorrect) {
      sfx.correct()
      setGuess('')
      
      const nextScore = myScore + 1
      let newWinner = null
      if (nextScore >= WIN_TARGET) {
        newWinner = role
        incrementStat('listenDuelWins')
        recordActivity()
      }

      await updateState({
        [`${role}Score`]: nextScore,
        winner: newWinner,
        roundIdx: roundIdx + 1
      })
    } else {
      sfx.wrong()
      // Unlike ML Guess, no stun here to keep typing fast-paced, just visual feedback
      setGuess('')
    }
  }

  function handleQuit() {
    sfx.click()
    leaveRoom()
    navigate('/games')
  }

  const amIWinner = winner === role

  return (
    <GameLayout title="Listen & Type Duel" subtitle={`Siapa cepat dapat ${WIN_TARGET} Poin!`} onBack={handleQuit}>
      {amIWinner && <Confetti />}

      <div className="max-w-md mx-auto space-y-4">
        
        {/* Score Board */}
        <div className="flex items-center justify-between p-4 bg-background/50 border border-border rounded-2xl shadow-sm">
          {/* Me */}
          <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-3">
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
          <>
            <GlassCard className="p-8 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 grid place-items-center text-primary relative">
                <Headphones className="w-10 h-10" />
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-background rounded-full grid place-items-center shadow-sm">
                  <div className="w-2.5 h-2.5 bg-growth rounded-full animate-pulse" />
                </span>
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-1">Ronde {roundIdx + 1}</h3>
                <p className="text-sm text-muted-foreground mb-4">Dengarkan audio dan ketik ulang kalimatnya!</p>
                <button 
                  onClick={() => speak(currentSentence.text)}
                  className="mx-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold shadow-glow-primary hover:scale-105 transition active:scale-95"
                >
                  <Volume2 className="w-5 h-5" /> Putar Audio
                </button>
              </div>
            </GlassCard>

            <form onSubmit={handleGuess} className="flex gap-2">
              <input
                ref={inputRef}
                value={guess}
                onChange={e => setGuess(e.target.value)}
                placeholder="Ketik kalimat yang kamu dengar..."
                disabled={!!winner}
                autoFocus
                className="flex-1 bg-background/50 rounded-xl px-4 py-4 outline-none border border-border focus:border-primary font-medium"
              />
              <button type="submit" disabled={!guess.trim() || !!winner} className="px-6 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow-primary disabled:opacity-50">
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </>
        )}
      </div>
    </GameLayout>
  )
}
