import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Trophy, Users, ShieldAlert, Zap } from 'lucide-react'
import { ML_HEROES } from '@/data/ml-heroes'
import { useRoomStore } from '@/stores/room'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { sfx } from '@/lib/sound'
import MultiplayerLobby from '@/components/MultiplayerLobby'
import GameLayout from '@/components/GameLayout'
import GlassCard from '@/components/GlassCard'
import Confetti from '@/components/Confetti'

export default function MLCoopPage() {
  const navigate = useNavigate()
  const { room } = useRoomStore()

  if (!room || room.status === 'waiting') {
    return (
      <div className="pt-4">
        {/* Pass customSettings for difficulty selection */}
        <MultiplayerLobby 
          gameId="ml-coop" 
          gameName="ML Co-op" 
          onBack={() => navigate('/ml-guess')} 
          settingsUI={
            <div className="space-y-2 mt-4 text-left">
              <label className="text-sm font-bold text-muted-foreground ml-1">Kesulitan Tim</label>
              <select 
                id="difficulty" 
                className="w-full p-3 rounded-xl bg-background/50 border border-border outline-none font-semibold"
                defaultValue="medium"
              >
                <option value="easy">🟢 Easy (10 HP)</option>
                <option value="medium">🟡 Medium (7 HP)</option>
                <option value="hard">🔴 Hard (5 HP, Clue 6-7 Bayar)</option>
                <option value="nightmare">💀 Nightmare (5 HP, No Heal)</option>
              </select>
            </div>
          }
          customSettings={() => ({
            difficulty: document.getElementById('difficulty').value
          })}
        />
      </div>
    )
  }

  return <MLCoopBoard />
}

function MLCoopBoard() {
  const navigate = useNavigate()
  const { room, updateState, leaveRoom } = useRoomStore()
  const { awardAchievement, updateMaxStreak, recordActivity } = usePlayerStore()
  
  const currentUser = useAuthStore(s => s.currentUser)
  const isHost = room.host.uid === currentUser.uid

  const difficulty = room.settings?.difficulty || 'medium'
  const diffConfig = {
    easy: { startHp: 10, heal: true, clueCost: false },
    medium: { startHp: 7, heal: true, clueCost: false },
    hard: { startHp: 5, heal: true, clueCost: true },
    nightmare: { startHp: 5, heal: false, clueCost: true }
  }
  const config = diffConfig[difficulty] || diffConfig.easy

  const state = room.state || {}
  const lives = state.lives ?? config.startHp
  const score = state.score ?? 0
  const heroIdx = state.heroIdx ?? 0
  const clueIndex = state.clueIndex ?? 0
  const gameOver = state.gameOver ?? false
  const justGuessed = state.justGuessed ?? false // To show success feedback to both

  // Deterministic hero sequence based on room ID
  const [heroSequence] = useState(() => {
    const seed = room.id.charCodeAt(0) + room.id.charCodeAt(room.id.length - 1)
    return [...ML_HEROES].sort((a, b) => {
      const hashA = (a.name.charCodeAt(0) * seed) % 100
      const hashB = (b.name.charCodeAt(0) * seed) % 100
      return hashA - hashB
    })
  })

  const hero = heroSequence[heroIdx % heroSequence.length]
  const [guess, setGuess] = useState('')
  const [localFeedback, setLocalFeedback] = useState(null)
  
  const inputRef = useRef(null)

  // Initialization
  useEffect(() => {
    if (isHost && state.heroIdx === undefined) {
      updateState({
        lives: config.startHp,
        score: 0,
        heroIdx: 0,
        clueIndex: 0,
        gameOver: false,
        justGuessed: false
      })
    }
  }, [isHost, state.heroIdx])

  // Play sounds when state updates from the other player
  useEffect(() => {
    if (justGuessed) {
      sfx.correct()
      setLocalFeedback('correct')
      setTimeout(() => {
        // Only host resets justGuessed state after 2 seconds
        if (isHost) {
          updateState({ justGuessed: false, heroIdx: heroIdx + 1, clueIndex: 0 })
        }
        setLocalFeedback(null)
      }, 2000)
    }
  }, [justGuessed])

  // End game logic runs on both clients independently when gameOver is true
  useEffect(() => {
    if (gameOver) {
      recordActivity()
      updateMaxStreak(difficulty, score)
      if (score >= 30) {
        awardAchievement(`ml-streak30-${difficulty}`)
      }
      if (score >= 133) {
        awardAchievement(`ml-perfect-${difficulty}`)
      }
    }
  }, [gameOver])

  async function handleGuess(e) {
    e.preventDefault()
    if (!guess.trim() || gameOver || justGuessed) return

    const isCorrect = guess.toLowerCase().trim() === hero.name.toLowerCase()

    if (isCorrect) {
      sfx.correct()
      setGuess('')
      
      let nextLives = lives
      if (config.heal && clueIndex <= 2) {
        nextLives = Math.min(nextLives + 1, config.startHp)
        sfx.chime()
      }
      
      await updateState({
        score: score + 1,
        lives: nextLives,
        justGuessed: true // triggers success screen for both
      })
    } else {
      sfx.wrong()
      setGuess('')
      
      const nextLives = lives - 1
      if (nextLives <= 0) {
        await updateState({ lives: 0, gameOver: true })
      } else {
        setLocalFeedback('wrong')
        setTimeout(() => setLocalFeedback(null), 1000)
        await updateState({ lives: nextLives })
      }
    }
  }

  async function handleOpenClue() {
    if (clueIndex >= 6 || gameOver || justGuessed) return
    const nextClue = clueIndex + 1
    
    if (config.clueCost && (nextClue === 5 || nextClue === 6)) {
      if (lives <= 1) {
        sfx.wrong()
        return // Can't suicide to open clue
      }
      sfx.click()
      await updateState({ lives: lives - 1, clueIndex: nextClue })
    } else {
      sfx.click()
      await updateState({ clueIndex: nextClue })
    }
  }

  function handleQuit() {
    sfx.click()
    leaveRoom()
    navigate('/ml-guess')
  }

  if (gameOver) {
    return (
      <GameLayout title="Game Over" onBack={handleQuit}>
        <GlassCard className="p-8 text-center max-w-sm mx-auto mt-8 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent"></div>
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-rose-500 to-orange-500 text-white grid place-items-center mb-6 shadow-glow">
            <Trophy className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-display font-black mb-2">Game Over!</h2>
          <p className="text-muted-foreground mb-6">
            Tim kalian kehabisan nyawa di hero <strong className="text-foreground">{hero.name}</strong>
          </p>
          <div className="bg-background/50 rounded-2xl p-6 mb-6">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">Total Streak Tim</p>
            <p className="text-5xl font-black text-primary drop-shadow-md">{score}</p>
          </div>
          <button onClick={handleQuit} className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90">
            Kembali
          </button>
        </GlassCard>
      </GameLayout>
    )
  }

  const clues = hero.clues ? hero.clues.map(c => {
    const idx = c.indexOf(':')
    if (idx !== -1) {
      return { label: c.substring(0, idx).trim(), value: c.substring(idx + 1).trim() }
    }
    return { label: 'Petunjuk', value: c }
  }) : []

  while (clues.length < 7) {
    clues.push({ label: 'Petunjuk Ekstra', value: '...' })
  }

  const isPremiumClue = config.clueCost && (clueIndex === 4 || clueIndex === 5)

  return (
    <GameLayout title="Co-op ML Guess" subtitle={`Kesulitan: ${difficulty.toUpperCase()} | Streak Bersama: ${score}`} onBack={handleQuit}>
      {justGuessed && <Confetti />}

      <div className="max-w-md mx-auto space-y-4">
        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-background/40 rounded-2xl border border-border">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
            <span className="font-bold text-lg">{lives} <span className="text-xs text-muted-foreground font-normal">/ {config.startHp}</span></span>
          </div>
          <div className="flex gap-1">
            {Array(config.startHp).fill(0).map((_, i) => (
              <div key={i} className={`w-2 h-4 rounded-full ${i < lives ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-muted'}`} />
            ))}
          </div>
        </div>

        {/* Both Players Info */}
        <div className="flex items-center justify-center gap-4 bg-background/30 py-2 rounded-xl">
          <div className="flex items-center gap-2">
            <img src={room.host.photoURL} className="w-6 h-6 rounded-full" alt="" />
            <span className="text-xs font-bold">{room.host.displayName}</span>
          </div>
          <span className="text-xs text-muted-foreground">&amp;</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">{room.guest.displayName}</span>
            <img src={room.guest.photoURL} className="w-6 h-6 rounded-full" alt="" />
          </div>
        </div>

        {/* Clues */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex justify-between items-end mb-4">
            <h3 className="font-bold text-lg">Petunjuk ({clueIndex + 1}/7)</h3>
          </div>

          <div className="space-y-3">
            {clues.map((clue, i) => {
              const isOpen = i <= clueIndex
              const isNext = i === clueIndex + 1
              const costsHp = config.clueCost && i >= 5

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
                        {costsHp && isNext && <span className="ml-auto text-[0.65rem] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">Bayar 1 HP</span>}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </GlassCard>

        {/* Input Area */}
        <div className="h-32">
          <AnimatePresence mode="wait">
            {!justGuessed ? (
              <motion.div key="guessing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <form onSubmit={handleGuess} className="flex gap-2 mb-3">
                  <input
                    ref={inputRef}
                    value={guess}
                    onChange={e => setGuess(e.target.value)}
                    placeholder="Ketik nama hero..."
                    disabled={justGuessed || gameOver}
                    className={`flex-1 bg-background/50 rounded-xl px-4 py-3 outline-none border ${localFeedback === 'wrong' ? 'border-rose-500 text-rose-500 bg-rose-500/10 animate-shake' : 'border-border focus:border-primary'}`}
                  />
                  <button type="submit" disabled={!guess.trim() || justGuessed || gameOver} className="px-6 rounded-xl bg-primary text-primary-foreground font-semibold shadow-glow-primary hover:opacity-90 transition">
                    Tebak
                  </button>
                </form>
                
                {clueIndex < 6 && (
                  <button 
                    onClick={handleOpenClue} 
                    disabled={isPremiumClue && lives <= 1}
                    className={`w-full py-3 rounded-xl glass text-sm font-semibold transition ${isPremiumClue ? 'border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 disabled:opacity-30' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {isPremiumClue ? (lives <= 1 ? "Nyawa tidak cukup untuk clue selanjutnya" : "Buka Clue Selanjutnya (Bayar 1 Nyawa)") : "Buka Clue Selanjutnya (Gratis)"}
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center h-full flex flex-col justify-center">
                <div className="inline-block px-4 py-3 rounded-xl bg-growth/20 text-growth font-bold shadow-glow">
                  Jawaban Benar! Itu adalah {hero.name}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Menyiapkan hero berikutnya...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GameLayout>
  )
}
