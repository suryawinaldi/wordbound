import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Hand, Scissors, Square } from 'lucide-react'
import { useRoomStore } from '@/stores/room'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { sfx } from '@/lib/sound'
import MultiplayerLobby from '@/components/MultiplayerLobby'
import GameLayout from '@/components/GameLayout'
import GlassCard from '@/components/GlassCard'
import Confetti from '@/components/Confetti'

const MOVES = [
  { id: 'rock', icon: Square, label: 'Batu', color: 'bg-stone-500' },
  { id: 'paper', icon: Hand, label: 'Kertas', color: 'bg-sky-500' },
  { id: 'scissors', icon: Scissors, label: 'Gunting', color: 'bg-rose-500' },
]

export default function RPSGamePage() {
  const navigate = useNavigate()
  const { room, updateState, leaveRoom } = useRoomStore()
  const currentUser = useAuthStore(s => s.currentUser)

  if (!room || room.status === 'waiting') {
    return (
      <div className="pt-4">
        <MultiplayerLobby gameId="rps" gameName="Gunting Batu Kertas" onBack={() => navigate('/games')} />
      </div>
    )
  }

  return <RPSBoard />
}

function RPSBoard() {
  const navigate = useNavigate()
  const { room, updateState, leaveRoom } = useRoomStore()
  const currentUser = useAuthStore(s => s.currentUser)
  
  const isHost = room.host.uid === currentUser.uid
  const opponent = isHost ? room.guest : room.host
  const role = isHost ? 'host' : 'guest'

  const state = room.state || {}
  const round = state.round || 1
  const hostScore = state.hostScore || 0
  const guestScore = state.guestScore || 0
  const maxScore = state.maxScore || 3 // BO5

  const myMove = isHost ? state.hostMove : state.guestMove
  const opponentMove = isHost ? state.guestMove : state.hostMove

  const isRoundResolved = state.hostMove && state.guestMove
  const winner = state.winner // 'host' | 'guest' | null

  useEffect(() => {
    if (isRoundResolved && !winner) {
      // Evaluate round
      // Only host evaluates to avoid double processing
      if (isHost) {
        setTimeout(() => evaluateRound(state.hostMove, state.guestMove), 2000)
      }
    }
  }, [isRoundResolved, winner])

  function evaluateRound(hMove, gMove) {
    let result = 0 // 0 draw, 1 host wins, -1 guest wins
    if (hMove === 'rock' && gMove === 'scissors') result = 1
    if (hMove === 'rock' && gMove === 'paper') result = -1
    if (hMove === 'paper' && gMove === 'rock') result = 1
    if (hMove === 'paper' && gMove === 'scissors') result = -1
    if (hMove === 'scissors' && gMove === 'paper') result = 1
    if (hMove === 'scissors' && gMove === 'rock') result = -1

    let newHostScore = hostScore
    let newGuestScore = guestScore
    if (result === 1) newHostScore++
    if (result === -1) newGuestScore++

    let newWinner = null
    if (newHostScore >= maxScore) newWinner = 'host'
    if (newGuestScore >= maxScore) newWinner = 'guest'

    if (newWinner) {
      updateState({ hostScore: newHostScore, guestScore: newGuestScore, winner: newWinner })
      const { incrementStat } = usePlayerStore.getState()
      if ((newWinner === 'host' && isHost) || (newWinner === 'guest' && !isHost)) {
        incrementStat('rpsWins')
      }
    } else {
      updateState({ 
        hostScore: newHostScore, 
        guestScore: newGuestScore, 
        round: round + 1,
        hostMove: null,
        guestMove: null
      })
    }
  }

  async function handleMove(moveId) {
    if (myMove || winner) return
    sfx.click()
    await updateState({ [`${role}Move`]: moveId })
  }

  function handleQuit() {
    sfx.click()
    leaveRoom()
    navigate('/games')
  }

  const amIWinner = winner === role
  const isOpponentWinner = winner && winner !== role

  return (
    <GameLayout 
      title="Gunting Batu Kertas" 
      subtitle={`Round ${round}`} 
      onBack={handleQuit}
    >
      {amIWinner && <Confetti />}
      
      <div className="flex flex-col items-center justify-between h-[60vh] py-8">
        
        {/* Opponent Area */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={opponent.photoURL} className="w-10 h-10 rounded-full" alt="" />
            <div>
              <p className="font-bold text-sm">{opponent.displayName}</p>
              <p className="text-xs text-muted-foreground">Skor: {isHost ? guestScore : hostScore}</p>
            </div>
          </div>
          
          <GlassCard className="w-24 h-24 grid place-items-center">
            {isRoundResolved ? (
              <MoveIcon move={opponentMove} />
            ) : opponentMove ? (
              <span className="text-3xl animate-bounce">👍</span> // Ready
            ) : (
              <span className="text-sm text-muted-foreground animate-pulse">Berpikir...</span>
            )}
          </GlassCard>
        </div>

        {/* Center Status */}
        <div className="text-center z-10">
          {winner ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-background/80 backdrop-blur px-6 py-4 rounded-3xl border border-border shadow-2xl">
              <h2 className="text-2xl font-black mb-2">{amIWinner ? 'Kamu Menang!' : 'Kamu Kalah!'}</h2>
              <button onClick={handleQuit} className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm">Kembali</button>
            </motion.div>
          ) : isRoundResolved ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl font-black text-primary">VS</motion.div>
          ) : (
            <div className="text-xs font-semibold text-muted-foreground px-4 py-2 bg-muted rounded-full uppercase tracking-widest">
              First to {maxScore}
            </div>
          )}
        </div>

        {/* Player Area */}
        <div className="flex flex-col items-center gap-6">
          <GlassCard className={`w-24 h-24 grid place-items-center ${myMove ? 'ring-2 ring-primary' : ''}`}>
            {myMove ? <MoveIcon move={myMove} /> : <span className="text-sm text-muted-foreground">Pilih senjatamu</span>}
          </GlassCard>
          
          <div className="flex items-center gap-3">
            <div>
              <p className="font-bold text-sm text-right">Kamu</p>
              <p className="text-xs text-muted-foreground text-right">Skor: {isHost ? hostScore : guestScore}</p>
            </div>
            <img src={currentUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.displayName}`} className="w-10 h-10 rounded-full" alt="" />
          </div>

          {!myMove && !winner && (
            <div className="flex gap-4 mt-4">
              {MOVES.map(m => (
                <button 
                  key={m.id}
                  onClick={() => handleMove(m.id)}
                  className={`w-16 h-16 rounded-2xl text-white shadow-lg flex items-center justify-center transition-transform hover:-translate-y-2 hover:shadow-xl active:scale-90 ${m.color}`}
                >
                  <m.icon className="w-8 h-8" />
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </GameLayout>
  )
}

function MoveIcon({ move }) {
  const m = MOVES.find(x => x.id === move)
  if (!m) return null
  const Icon = m.icon
  return <Icon className={`w-10 h-10 ${m.color.replace('bg-', 'text-')}`} />
}
