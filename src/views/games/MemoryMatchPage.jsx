import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, CheckCircle2 } from 'lucide-react'
import { useRoomStore } from '@/stores/room'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { sfx, speak } from '@/lib/sound'
import { WORD_ITEMS } from '@/data/listen-bank'
import MultiplayerLobby from '@/components/MultiplayerLobby'
import GameLayout from '@/components/GameLayout'
import GlassCard from '@/components/GlassCard'
import Confetti from '@/components/Confetti'

const PAIRS_COUNT = 8

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function generateCards() {
  const selected = shuffle(WORD_ITEMS).slice(0, PAIRS_COUNT)
  let cards = []
  selected.forEach(item => {
    cards.push({ id: `en-${item.text}`, pairId: item.text, content: item.text, type: 'en', isMatched: false })
    cards.push({ id: `id-${item.text}`, pairId: item.text, content: item.meaning, type: 'id', isMatched: false })
  })
  return shuffle(cards)
}

export default function MemoryMatchPage() {
  const navigate = useNavigate()
  const { room } = useRoomStore()

  if (!room || room.status === 'waiting') {
    return (
      <div className="pt-4">
        <MultiplayerLobby gameId="memory-match" gameName="Memory Match" onBack={() => navigate('/games')} />
      </div>
    )
  }

  return <MemoryMatchBoard />
}

function MemoryMatchBoard() {
  const navigate = useNavigate()
  const { room, updateState, leaveRoom } = useRoomStore()
  const { incrementStat, recordActivity } = usePlayerStore()
  const currentUser = useAuthStore(s => s.currentUser)
  
  const isHost = room.host.uid === currentUser.uid
  const opponent = isHost ? room.guest : room.host
  const role = isHost ? 'host' : 'guest'

  const state = room.state || {}
  const cards = state.cards || []
  const flipped = state.flipped || []
  const turn = state.turn || 'host'
  const hostScore = state.hostScore || 0
  const guestScore = state.guestScore || 0
  const winner = state.winner || null
  
  // Local lock to prevent clicking fast
  const [locked, setLocked] = useState(false)

  // Initialization
  useEffect(() => {
    if (isHost && !state.cards) {
      updateState({
        cards: generateCards(),
        flipped: [],
        turn: 'host',
        hostScore: 0,
        guestScore: 0,
        winner: null
      })
    }
  }, [isHost, state.cards])

  // Game Logic Effect
  useEffect(() => {
    if (flipped.length === 2 && turn === role) {
      setLocked(true)
      const timer = setTimeout(async () => {
        const [id1, id2] = flipped
        const card1 = cards.find(c => c.id === id1)
        const card2 = cards.find(c => c.id === id2)
        
        let newCards = [...cards]
        let newHostScore = hostScore
        let newGuestScore = guestScore
        let nextTurn = turn // default keep turn if match? Or pass turn? Let's pass turn so it's a duel.
        
        const isMatch = card1.pairId === card2.pairId
        
        if (isMatch) {
          sfx.correct()
          newCards = newCards.map(c => c.pairId === card1.pairId ? { ...c, isMatched: true } : c)
          if (role === 'host') newHostScore++
          else newGuestScore++
          
          // Speak the english word!
          if (card1.type === 'en') speak(card1.content)
          else if (card2.type === 'en') speak(card2.content)
            
          // In Memory Match, finding a pair usually gives you another turn!
          nextTurn = turn 
        } else {
          sfx.wrong()
          // Pass turn
          nextTurn = role === 'host' ? 'guest' : 'host'
        }

        let newWinner = null
        const totalMatches = newHostScore + newGuestScore
        if (totalMatches === PAIRS_COUNT) {
          if (newHostScore > newGuestScore) newWinner = 'host'
          else if (newGuestScore > newHostScore) newWinner = 'guest'
          else newWinner = 'draw'

          incrementStat('memoryMatchWins')
          recordActivity()
        }

        await updateState({
          cards: newCards,
          flipped: [],
          turn: nextTurn,
          hostScore: newHostScore,
          guestScore: newGuestScore,
          winner: newWinner
        })
        setLocked(false)
      }, 1200)

      return () => clearTimeout(timer)
    }
  }, [flipped, turn, role, cards])

  async function handleCardClick(card) {
    if (winner || turn !== role || locked || flipped.length >= 2) return
    if (card.isMatched || flipped.includes(card.id)) return

    sfx.click()
    const newFlipped = [...flipped, card.id]
    await updateState({ flipped: newFlipped })
  }

  function handleQuit() {
    sfx.click()
    leaveRoom()
    navigate('/games')
  }

  const amIWinner = winner === role
  const myScore = isHost ? hostScore : guestScore
  const oppScore = isHost ? guestScore : hostScore

  if (!cards.length) return null

  return (
    <GameLayout title="Memory Match" subtitle="Temukan pasangan kata & artinya!" onBack={handleQuit}>
      {amIWinner && <Confetti />}

      <div className="max-w-md mx-auto space-y-4">
        
        {/* Score Board */}
        <div className="flex items-center justify-between p-4 bg-background/50 border border-border rounded-2xl shadow-sm">
          {/* Me */}
          <div className={`flex items-center gap-3 p-2 rounded-xl transition ${turn === role ? 'bg-primary/10 shadow-glow-primary' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground font-black text-xl grid place-items-center shadow-inner">
              {myScore}
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-primary">Kamu</p>
            </div>
          </div>
          
          <div className="text-sm font-black text-muted-foreground uppercase"><Brain className="w-6 h-6 opacity-30" /></div>

          {/* Opponent */}
          <div className={`flex items-center gap-3 p-2 rounded-xl transition ${turn !== role && !winner ? 'bg-amber-400/10 shadow-glow-amber' : ''}`}>
            <div className="text-right">
              <p className="text-xs font-bold uppercase text-amber-500">{opponent.displayName}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-900 font-black text-xl grid place-items-center shadow-inner">
              {oppScore}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="text-center">
          {winner ? (
            <div className="inline-block px-4 py-2 rounded-xl bg-primary/20 text-primary font-black animate-pulse">
              {winner === 'draw' ? 'SERI!' : (winner === role ? 'KAMU MENANG!' : 'KAMU KALAH!')}
            </div>
          ) : (
            <div className="inline-block px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-semibold">
              {turn === role ? 'Giliranmu (Balik 2 Kartu)' : 'Menunggu lawan...'}
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-4 gap-2">
          {cards.map(card => {
            const isFlipped = card.isMatched || flipped.includes(card.id)
            
            return (
              <div 
                key={card.id}
                onClick={() => handleCardClick(card)}
                className="aspect-square relative cursor-pointer group"
                style={{ perspective: '1000px' }}
              >
                <motion.div 
                  initial={false}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="w-full h-full"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front (Hidden) */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm border-2 border-white/10 grid place-items-center group-hover:scale-105 transition" style={{ backfaceVisibility: 'hidden' }}>
                    <Brain className="w-6 h-6 text-white/30" />
                  </div>
                  
                  {/* Back (Revealed) */}
                  <div className="absolute inset-0 bg-background border-2 border-primary/50 rounded-xl shadow-glow-primary grid place-items-center p-1 text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    {card.isMatched && <div className="absolute inset-0 bg-primary/10 rounded-xl" />}
                    <span className={`text-[0.65rem] font-bold leading-tight break-all ${card.type === 'en' ? 'text-primary' : 'text-foreground'}`}>
                      {card.content.toUpperCase()}
                    </span>
                    {card.isMatched && <CheckCircle2 className="absolute bottom-1 right-1 w-3 h-3 text-primary" />}
                  </div>
                </motion.div>
              </div>
            )
          })}
        </div>

        {winner && (
          <div className="pt-4">
            <button onClick={handleQuit} className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-105 transition">
              Kembali
            </button>
          </div>
        )}
      </div>
    </GameLayout>
  )
}
