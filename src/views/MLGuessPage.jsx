import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Search, Trophy, ArrowRight, User, Users, Swords } from 'lucide-react'
import { ML_HEROES } from '@/data/ml-heroes'
import { usePlayerStore } from '@/stores/player'
import { useAuthStore } from '@/stores/auth'
import { sfx } from '@/lib/sound'
import GlassCard from '@/components/GlassCard'
import Confetti from '@/components/Confetti'
import GameLayout from '@/components/GameLayout'

const XP_REWARD = {
  0: 50, // Answered on clue 1
  1: 30, // Answered on clue 2
  2: 15, // Answered on clue 3
}

export default function MLGuessPage() {
  const navigate = useNavigate()
  const userData = useAuthStore((s) => s.userData)
  const hasPartner = !!userData?.partnerUid

  const [mode, setMode] = useState(null) // 'solo', 'duo' (local), 'online'
  const [difficulty, setDifficulty] = useState(null)
  
  if (!mode) {
    return (
      <GameLayout title="Tebak Hero ML">
        <GlassCard className="p-8 text-center max-w-sm mx-auto mt-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-couple to-sun text-white grid place-items-center mb-6 shadow-glow">
            <Swords className="w-10 h-10" />
          </div>
          <h2 className="font-display font-bold text-2xl mb-2">Pilih Mode Main</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Main sendiri, atau uji kekompakan & kecepatanmu bersama teman!
          </p>
          <div className="space-y-3">
            <button
              onClick={() => { sfx.click(); setMode('solo') }}
              className="w-full py-4 rounded-2xl glass-strong flex items-center justify-center gap-3 font-semibold hover:bg-white/10 transition"
            >
              <User className="w-5 h-5 text-sky" /> Main Sendiri (Solo)
            </button>
            <button
              onClick={() => { sfx.click(); setMode('online') }}
              className="w-full py-4 rounded-2xl glass-strong flex items-center justify-center gap-3 font-semibold hover:bg-white/10 transition relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-rose-500/10"></div>
              <Users className="w-5 h-5 text-primary" /> Mabar Online (Room)
            </button>
            {hasPartner && (
              <button
                onClick={() => { sfx.click(); setMode('duo') }}
                className="w-full py-4 rounded-2xl glass-strong flex items-center justify-center gap-3 font-semibold hover:bg-white/10 transition"
              >
                <Users className="w-5 h-5 text-couple" /> Gantian (1 Layar)
              </button>
            )}
          </div>
        </GlassCard>
      </GameLayout>
    )
  }

  if (mode === 'online') {
    return (
      <GameLayout title="Tebak Hero ML" onBack={() => setMode(null)}>
        <GlassCard className="p-6 max-w-md mx-auto mt-4 space-y-4 text-center">
          <h2 className="font-display font-bold text-2xl mb-6">Pilih Tipe Mabar</h2>
          
          <button onClick={() => { sfx.click(); navigate('/ml-coop') }} className="w-full p-6 rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition">
            <h3 className="font-bold text-primary text-xl mb-2">🤝 Co-op (Kerja Sama)</h3>
            <p className="text-sm text-muted-foreground">Berbagi Nyawa, Clue, dan Rekor Streak bersama-sama. Mampukah tim kalian mencapai God of MLBB?</p>
          </button>

          <button onClick={() => { sfx.click(); navigate('/ml-duel') }} className="w-full p-6 rounded-2xl border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 transition">
            <h3 className="font-bold text-rose-500 text-xl mb-2">⚔️ Duel (Balapan)</h3>
            <p className="text-sm text-muted-foreground">Adu cepat mengetik! Siapa yang mencapai 10 Poin duluan, dia yang menang. Salah ketik = Stun 3 Detik!</p>
          </button>
        </GlassCard>
      </GameLayout>
    )
  }

  // If Solo or Duo (Local), user must pick difficulty
  if (!difficulty) {
    return (
      <GameLayout title="Tebak Hero ML" onBack={() => setMode(null)}>
        <GlassCard className="p-6 max-w-md mx-auto mt-4 space-y-4">
          <div className="text-center mb-6">
            <h2 className="font-display font-bold text-2xl mb-1">Pilih Kesulitan</h2>
            <p className="text-sm text-muted-foreground">Pilih tantanganmu!</p>
          </div>

          <button onClick={() => { sfx.click(); setDifficulty('easy') }} className="w-full p-4 rounded-2xl border border-growth/30 bg-growth/5 text-left hover:bg-growth/10 transition">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xl">🟢</span>
              <h3 className="font-bold text-growth">Easy (Santai)</h3>
            </div>
            <p className="text-xs text-muted-foreground ml-9">Modal 10 HP. Clue gratis. <b>Pasif:</b> Nebak benar di Clue 1-3 = +1 HP.</p>
          </button>

          <button onClick={() => { sfx.click(); setDifficulty('medium') }} className="w-full p-4 rounded-2xl border border-sun/30 bg-sun/5 text-left hover:bg-sun/10 transition">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xl">🟡</span>
              <h3 className="font-bold text-sun">Medium (Menantang)</h3>
            </div>
            <p className="text-xs text-muted-foreground ml-9">Modal 7 HP. Clue gratis. <b>Pasif:</b> Nebak benar di Clue 1-3 = +1 HP.</p>
          </button>

          <button onClick={() => { sfx.click(); setDifficulty('hard') }} className="w-full p-4 rounded-2xl border border-orange-500/30 bg-orange-500/5 text-left hover:bg-orange-500/10 transition">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xl">🔴</span>
              <h3 className="font-bold text-orange-500">Hard (Keras)</h3>
            </div>
            <p className="text-xs text-muted-foreground ml-9">Modal 5 HP. <b>Buka Clue 6 & 7 bayar 1 HP!</b> <b>Pasif:</b> Nebak benar di Clue 1-3 = +1 HP.</p>
          </button>

          <button onClick={() => { sfx.click(); setDifficulty('nightmare') }} className="w-full p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 text-left hover:bg-rose-500/10 transition relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20"></div>
            <div className="relative flex items-center gap-3 mb-1">
              <span className="text-xl">💀</span>
              <h3 className="font-black text-rose-500 tracking-wider">NIGHTMARE</h3>
            </div>
            <p className="relative text-xs text-muted-foreground ml-9 font-medium">Modal 5 HP. Buka Clue 6 & 7 bayar 1 HP. <b>TIDAK ADA HEALING!</b></p>
          </button>
        </GlassCard>
      </GameLayout>
    )
  }

  return <MLGuessGame mode={mode} difficulty={difficulty} onBack={() => setDifficulty(null)} />
}

function MLGuessGame({ mode, difficulty, onBack }) {
  const { awardXP, recordActivity, updateMaxStreak, awardAchievement } = usePlayerStore()
  const [heroes, setHeroes] = useState(() => [...ML_HEROES].sort(() => Math.random() - 0.5))
  const [idx, setIdx] = useState(0)
  
  const [clueIndex, setClueIndex] = useState(0)
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState(null) // 'wrong' or 'correct'
  const [turn, setTurn] = useState(0) // 0 for player 1, 1 for player 2
  const [gameOver, setGameOver] = useState(false)
  const inputRef = useRef(null)

  // Difficulty settings
  const diffConfig = {
    easy: { startHp: 10, heal: true, clueCost: false },
    medium: { startHp: 7, heal: true, clueCost: false },
    hard: { startHp: 5, heal: true, clueCost: true },
    nightmare: { startHp: 5, heal: false, clueCost: true }
  }
  const config = diffConfig[difficulty] || diffConfig.easy

  const [lives, setLives] = useState(config.startHp)
  const [score, setScore] = useState(0)

  const hero = heroes[idx]

  async function handleGameOver(finalScore) {
    setGameOver(true)
    await recordActivity()
    await updateMaxStreak(difficulty, finalScore)

    // Evaluate Badges
    if (finalScore >= 30) {
      await awardAchievement(`ml-streak30-${difficulty}`)
    }
    if (finalScore >= 133) {
      await awardAchievement(`ml-perfect-${difficulty}`)
    }
  }

  function handleGuess(e) {
    e.preventDefault()
    if (!guess.trim() || feedback === 'correct' || gameOver) return

    const isCorrect = guess.toLowerCase().trim() === hero.name.toLowerCase()

    if (isCorrect) {
      sfx.correct()
      setFeedback('correct')
      
      let nextLives = lives
      if (config.heal && clueIndex <= 2) {
        nextLives = Math.min(nextLives + 1, config.startHp)
        sfx.chime() // Play heal sound
      }
      setLives(nextLives)

      const xp = XP_REWARD[clueIndex] || 5
      awardXP(xp)
      setScore(s => s + 1)
    } else {
      sfx.wrong()
      const nextLives = lives - 1
      setLives(nextLives)
      setGuess('')
      
      if (nextLives <= 0) {
        handleGameOver(score)
      } else {
        setFeedback('wrong')
        setTimeout(() => setFeedback(null), 1000)
        if (mode === 'duo') setTurn(t => t === 0 ? 1 : 0)
      }
    }
  }

  function nextHero() {
    sfx.click()
    setFeedback(null)
    setGuess('')
    setClueIndex(0)
    
    const newHeroes = [...heroes]
    newHeroes.splice(idx, 1)
    
    if (newHeroes.length === 0) {
      handleGameOver(score + 1) // Perfect clear
      return
    }

    setHeroes(newHeroes)
    setIdx(Math.floor(Math.random() * newHeroes.length))
    if (mode === 'duo') setTurn(t => t === 0 ? 1 : 0)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  function handleOpenClue() {
    if (clueIndex >= 6 || gameOver) return
    const nextClue = clueIndex + 1
    
    if (config.clueCost && (nextClue === 5 || nextClue === 6)) { // 5 and 6 are Clue 6 and 7 (0-indexed)
      if (lives <= 1) {
        sfx.wrong()
        return // Can't suicide to open clue
      }
      setLives(l => l - 1)
    }
    
    sfx.click()
    setClueIndex(nextClue)
    if (mode === 'duo') setTurn(t => (t === 0 ? 1 : 0))
  }

  if (gameOver) {
    return (
      <GameLayout title="Game Over" onBack={onBack}>
        <GlassCard className="p-8 text-center max-w-sm mx-auto mt-8 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent"></div>
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-rose-500 to-orange-500 text-white grid place-items-center mb-6 shadow-glow">
            <Trophy className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-display font-black mb-2">Game Over!</h2>
          <p className="text-muted-foreground mb-6">
            Hero terakhir adalah <strong className="text-foreground">{hero.name}</strong>
          </p>
          <div className="bg-background/50 rounded-2xl p-6 mb-6">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">Total Streak Beruntun</p>
            <p className="text-5xl font-black text-primary drop-shadow-md">{score}</p>
          </div>
          <button onClick={onBack} className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90">
            Kembali
          </button>
        </GlassCard>
      </GameLayout>
    )
  }

  const clues = [
    { label: 'Role/Lane', value: hero.role },
    { label: 'Ciri Fisik', value: hero.appearance },
    { label: 'Senjata/Kekuatan', value: hero.weapon },
    { label: 'Teman/Lawan', value: hero.synergy },
    { label: 'Mekanik/Skill', value: hero.mechanics },
    { label: 'Cerita/Asal', value: hero.lore },
    { label: 'Suara', value: 'Audio' }
  ]

  const isPremiumClue = config.clueCost && (clueIndex === 4 || clueIndex === 5)

  return (
    <GameLayout title="Tebak Hero ML" subtitle={`Mode: ${difficulty.toUpperCase()} | Streak: ${score}`} onBack={onBack}>
      {feedback === 'correct' && <Confetti />}

      <div className="max-w-md mx-auto mt-4 space-y-4">
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

        {/* Turn indicator */}
        {mode === 'duo' && (
          <div className="text-center py-2">
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm">
              Giliran Player {turn + 1}
            </span>
          </div>
        )}

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
                  className={`p-4 rounded-xl border ${isOpen ? 'bg-primary/5 border-primary/20' : 'bg-background border-border border-dashed'}`}
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

        {/* Interaction Area */}
        <div className="h-32">
          <AnimatePresence mode="wait">
            {feedback !== 'correct' ? (
              <motion.div key="guessing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <form onSubmit={handleGuess} className="flex gap-2 mb-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={guess}
                    onChange={e => setGuess(e.target.value)}
                    placeholder="Ketik nama hero..."
                    className={`flex-1 bg-background/50 rounded-xl px-4 py-3 outline-none border ${feedback === 'wrong' ? 'border-rose-500 text-rose-500 bg-rose-500/10 animate-shake' : 'border-border focus:border-primary'}`}
                  />
                  <button type="submit" className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-glow-primary hover:opacity-90 transition">
                    Tebak
                  </button>
                </form>
                
                {clueIndex < 6 && (
                  <button 
                    onClick={handleOpenClue} 
                    disabled={isPremiumClue && lives <= 1}
                    className={`w-full py-3 rounded-xl glass text-sm font-semibold transition ${isPremiumClue ? 'border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 disabled:opacity-30' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {isPremiumClue ? (lives <= 1 ? "Nyawa tidak cukup" : "Buka Clue (Bayar 1 HP)") : "Buka Clue (Gratis)"}
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="inline-block px-4 py-2 rounded-xl bg-growth/20 text-growth font-bold mb-4">
                  Jawaban Benar! Itu adalah {hero.name}
                </div>
                <button onClick={nextHero} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2">
                  Lanjut Hero Berikutnya <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GameLayout>
  )
}
