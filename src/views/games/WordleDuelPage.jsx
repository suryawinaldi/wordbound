import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useRoomStore } from '@/stores/room'
import { useAuthStore } from '@/stores/auth'
import { sfx } from '@/lib/sound'
import MultiplayerLobby from '@/components/MultiplayerLobby'
import GameLayout from '@/components/GameLayout'
import GlassCard from '@/components/GlassCard'
import Confetti from '@/components/Confetti'

const WORDS = ['APPLE', 'BRAIN', 'CRAZY', 'DREAM', 'EARTH', 'FLASH', 'GHOST', 'HEART', 'IMAGE', 'JUICE', 'KNIFE', 'LEMON', 'MAGIC', 'NIGHT', 'OCEAN', 'PEACE', 'QUEEN', 'RIVER', 'SNAKE', 'TRAIN']

export default function WordleDuelPage() {
  const navigate = useNavigate()
  const { room } = useRoomStore()

  if (!room || room.status === 'waiting') {
    return (
      <div className="pt-4">
        <MultiplayerLobby gameId="wordle" gameName="Wordle Duel Racing" onBack={() => navigate('/games')} />
      </div>
    )
  }

  return <WordleBoard />
}

function WordleBoard() {
  const navigate = useNavigate()
  const { room, updateState, leaveRoom } = useRoomStore()
  const currentUser = useAuthStore(s => s.currentUser)
  
  const isHost = room.host.uid === currentUser.uid
  const opponent = isHost ? room.guest : room.host
  const role = isHost ? 'host' : 'guest'

  const state = room.state || {}
  const secretWord = state.secretWord
  const hostGuesses = state.hostGuesses || []
  const guestGuesses = state.guestGuesses || []
  const winner = state.winner || null // 'host' | 'guest' | 'draw'

  const myGuesses = isHost ? hostGuesses : guestGuesses
  const oppGuesses = isHost ? guestGuesses : hostGuesses

  const [input, setInput] = useState('')

  useEffect(() => {
    if (isHost && !state.secretWord) {
      const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)]
      updateState({ secretWord: randomWord, hostGuesses: [], guestGuesses: [], winner: null })
    }
  }, [isHost, state])

  const amIWinner = winner === role
  const isGameOver = !!winner
  const myDone = myGuesses.length >= 6 || myGuesses.includes(secretWord)
  const oppDone = oppGuesses.length >= 6 || oppGuesses.includes(secretWord)

  // Evaluate if draw
  useEffect(() => {
    if (isHost && !winner && hostGuesses.length === 6 && guestGuesses.length === 6) {
      if (!hostGuesses.includes(secretWord) && !guestGuesses.includes(secretWord)) {
        updateState({ winner: 'draw' })
      }
    }
  }, [isHost, winner, hostGuesses, guestGuesses, secretWord])

  async function handleGuess(e) {
    e.preventDefault()
    if (isGameOver || myDone || input.length !== 5 || !secretWord) return

    const guess = input.toUpperCase()
    sfx.click()
    
    const newGuesses = [...myGuesses, guess]
    let newWinner = winner

    if (guess === secretWord) {
      sfx.correct()
      newWinner = role
    }

    setInput('')
    await updateState({
      [`${role}Guesses`]: newGuesses,
      winner: newWinner
    })
  }

  function handleQuit() {
    sfx.click()
    leaveRoom()
    navigate('/games')
  }

  function getLetterColors(guess, targetWord) {
    if (!guess) return Array(5).fill('bg-muted/30 border-border text-transparent') // Empty
    const res = Array(5).fill('bg-muted/50 border-border text-foreground') // Default wrong
    const targetArr = targetWord.split('')
    const guessArr = guess.split('')

    // Pass 1: correct
    for (let i=0; i<5; i++) {
      if (guessArr[i] === targetArr[i]) {
        res[i] = 'bg-growth text-growth-foreground border-growth shadow-glow-growth'
        targetArr[i] = null
      }
    }
    // Pass 2: present
    for (let i=0; i<5; i++) {
      if (res[i].includes('bg-growth')) continue
      const idx = targetArr.indexOf(guessArr[i])
      if (idx !== -1) {
        res[i] = 'bg-sun text-sun-foreground border-sun'
        targetArr[idx] = null
      }
    }
    return res
  }

  // Render a mini board for opponent, main board for me
  function renderBoard(guesses, isMini = false) {
    return (
      <div className={`grid gap-1.5 ${isMini ? 'w-24' : 'w-full max-w-[240px]'} mx-auto`}>
        {Array(6).fill(null).map((_, i) => {
          const guess = guesses[i] || ''
          const colors = getLetterColors(guess, secretWord || '     ')
          return (
            <div key={i} className="grid grid-cols-5 gap-1.5">
              {Array(5).fill(null).map((_, j) => {
                const char = guess[j] || ''
                return (
                  <motion.div 
                    key={j}
                    initial={guess ? { rotateX: 90 } : false}
                    animate={guess ? { rotateX: 0 } : false}
                    transition={{ delay: j * 0.1 }}
                    className={`aspect-square flex items-center justify-center font-display font-bold border rounded ${isMini ? 'text-[0.6rem] border' : 'text-xl border-2'} ${colors[j]}`}
                  >
                    {char}
                  </motion.div>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <GameLayout title="Wordle Duel" subtitle="Tebak kata bahasa Inggris 5 huruf!" onBack={handleQuit}>
      {amIWinner && <Confetti />}

      <div className="flex flex-col h-[70vh] justify-between">
        
        {/* Top: Opponent Status */}
        <div className="flex items-center justify-between px-4 py-2 bg-background/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <img src={opponent.photoURL} className="w-10 h-10 rounded-full" alt="" />
            <div>
              <p className="font-bold text-sm">{opponent.displayName}</p>
              <p className="text-[0.65rem] text-muted-foreground uppercase">{oppDone ? 'Selesai' : 'Sedang Menebak...'}</p>
            </div>
          </div>
          <div className="opacity-70 scale-90 origin-right">
            {renderBoard(oppGuesses, true)}
          </div>
        </div>

        {/* Center: Main Board */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {renderBoard(myGuesses)}
          
          <AnimatePresence>
            {winner && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
                className="absolute bg-background/90 backdrop-blur border border-border shadow-2xl p-6 rounded-3xl text-center z-10"
              >
                <h2 className="text-3xl font-black mb-1">{winner === 'draw' ? 'Seri!' : amIWinner ? 'Kamu Menang!' : 'Kamu Kalah!'}</h2>
                <p className="text-muted-foreground mb-4">Kata rahasianya adalah <strong className="text-primary">{secretWord}</strong></p>
                <button onClick={handleQuit} className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold">Keluar</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom: Input */}
        <form onSubmit={handleGuess} className="relative z-0">
          <div className="flex gap-2">
            <input 
              value={input}
              onChange={e => setInput(e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase())}
              maxLength={5}
              disabled={isGameOver || myDone}
              placeholder="Ketik 5 huruf..."
              className="flex-1 bg-background/80 backdrop-blur rounded-2xl px-6 py-4 outline-none border border-border focus:border-primary font-display tracking-[0.3em] font-bold text-center uppercase"
            />
            <button 
              type="submit"
              disabled={input.length !== 5 || isGameOver || myDone}
              className="px-6 bg-growth text-growth-foreground font-bold rounded-2xl disabled:opacity-50"
            >
              Tebak
            </button>
          </div>
        </form>

      </div>
    </GameLayout>
  )
}
