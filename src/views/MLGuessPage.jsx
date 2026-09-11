import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Search, Trophy, ArrowRight, User, Users } from 'lucide-react'
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
  const { awardXP, recordActivity } = usePlayerStore()
  const userData = useAuthStore((s) => s.userData)
  const hasPartner = !!userData?.partnerUid

  const [mode, setMode] = useState(null) // 'solo' or 'duo'
  
  if (!mode) {
    return (
      <GameLayout title="Tebak Hero ML">
        <GlassCard className="p-8 text-center max-w-sm mx-auto">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-couple to-sun text-white grid place-items-center mb-6 shadow-glow">
            <Search className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-display font-bold mb-2">Pilih Mode Bermain</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Diberikan maksimal 5 clue gratis dan 2 clue premium, tebak heronya! (Nyawa: 3)
          </p>
          <div className="space-y-3">
            <button
              onClick={() => { sfx.click(); setMode('solo') }}
              className="w-full py-4 rounded-2xl glass-strong flex items-center justify-center gap-3 font-semibold hover:bg-white/10 transition"
            >
              <User className="w-5 h-5 text-sky" /> Main Sendiri (Solo)
            </button>
            {hasPartner && (
              <button
                onClick={() => { sfx.click(); setMode('duo') }}
                className="w-full py-4 rounded-2xl glass-strong flex items-center justify-center gap-3 font-semibold hover:bg-white/10 transition"
              >
                <Users className="w-5 h-5 text-couple" /> Bareng Pasangan (Duo)
              </button>
            )}
          </div>
        </GlassCard>
      </GameLayout>
    )
  }

  return <MLGuessGame mode={mode} onBack={() => setMode(null)} />
}

function MLGuessGame({ mode }) {
  const { awardXP, recordActivity } = usePlayerStore()
  const [heroes] = useState(() => [...ML_HEROES].sort(() => Math.random() - 0.5))
  const [idx, setIdx] = useState(0)
  
  const [clueIndex, setClueIndex] = useState(0)
  const [lives, setLives] = useState(3)
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState(null) // 'wrong' or 'correct'
  const [score, setScore] = useState(0)
  const [turn, setTurn] = useState(0) // 0 for player 1, 1 for player 2
  const [gameOver, setGameOver] = useState(false)
  const inputRef = useRef(null)

  const hero = heroes[idx]

  function handleGuess(e) {
    e.preventDefault()
    if (!guess.trim() || feedback === 'correct' || gameOver) return

    const isCorrect = guess.toLowerCase().trim() === hero.name.toLowerCase()
    
    if (isCorrect) {
      sfx.correct()
      setFeedback('correct')
      const xp = XP_REWARD[clueIndex] || 10
      setScore(s => s + xp)
      awardXP(xp)
      recordActivity()
    } else {
      sfx.wrong()
      const newLives = lives - 1
      setLives(newLives)
      setGuess('')
      
      if (newLives <= 0) {
        setGameOver(true)
      } else {
        // Next turn if duo
        if (mode === 'duo') setTurn(t => (t === 0 ? 1 : 0))
      }
    }
  }

  function handleNextClue() {
    sfx.click()
    if (clueIndex < 4) {
      setClueIndex(c => c + 1)
      if (mode === 'duo') setTurn(t => (t === 0 ? 1 : 0))
    }
  }

  function buyPremiumClue() {
    sfx.click()
    if (lives > 1 && clueIndex >= 4 && clueIndex < 6) {
      setLives(l => l - 1)
      setClueIndex(c => c + 1)
      if (mode === 'duo') setTurn(t => (t === 0 ? 1 : 0))
    }
  }

  function nextHero() {
    sfx.click()
    if (idx + 1 >= heroes.length) {
      setGameOver(true)
    } else {
      setIdx(i => i + 1)
      setClueIndex(0)
      setGuess('')
      setFeedback(null)
      if (mode === 'duo') setTurn(t => (t === 0 ? 1 : 0))
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  if (gameOver) {
    return (
      <GameLayout title="Tebak Hero ML" right={<span className="text-sm font-bold text-sky">{score} XP</span>}>
        <GlassCard strong className="p-8 text-center relative overflow-hidden max-w-sm mx-auto">
          {lives > 0 && <Confetti fire={true} />}
          <div className={`grid place-items-center w-20 h-20 rounded-3xl text-white mx-auto mb-4 shadow-glow ${lives > 0 ? 'bg-gradient-to-br from-growth to-sky' : 'bg-gradient-to-br from-destructive to-orange-500'}`}>
            {lives > 0 ? <Trophy className="w-10 h-10" /> : <Heart className="w-10 h-10 break-heart" />}
          </div>
          <h2 className="font-display text-2xl font-extrabold">{lives > 0 ? 'Selesai! 🎉' : 'Game Over! 😭'}</h2>
          <p className="text-muted-foreground mt-1">Total skor yang didapat:</p>
          <p className="mt-4 text-3xl font-display font-extrabold text-gradient">+{score} XP</p>
          <Link to="/games" className="inline-block mt-6 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold">Kembali ke Games</Link>
        </GlassCard>
      </GameLayout>
    )
  }

  return (
    <GameLayout 
      title="Tebak Hero ML" 
      right={
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} className={`w-5 h-5 ${i < lives ? 'text-destructive fill-destructive' : 'text-muted-foreground opacity-30'}`} />
          ))}
        </div>
      }
    >
      <div className="relative max-w-md mx-auto space-y-4">
        {feedback === 'correct' && <Confetti fire={true} count={40} />}
        
        {mode === 'duo' && !feedback && (
          <div className="text-center py-2">
            <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${turn === 0 ? 'bg-sky/20 text-sky' : 'bg-couple/20 text-couple'}`}>
              Giliran: {turn === 0 ? 'Pemain 1' : 'Pemain 2 (Pasangan)'}
            </span>
          </div>
        )}

        <GlassCard className="p-6">
          <div className="space-y-4 mb-6">
            <AnimatePresence>
              {hero.clues.map((clue, i) => (
                i <= clueIndex && (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 flex-col sm:flex-row sm:items-start"
                  >
                    <div className="flex gap-3">
                      <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm font-medium pt-1 flex-1">{clue}</p>
                    </div>
                    {i === 6 && hero.audioUrl && (
                      <div className="mt-2 sm:mt-0 w-full sm:w-auto">
                        <audio src={`/api/proxy-audio?url=${encodeURIComponent(hero.audioUrl)}`} controls autoPlay className="h-10 w-full sm:w-48 outline-none rounded-full" />
                      </div>
                    )}
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>

          {!feedback ? (
            <div className="space-y-3">
              <form onSubmit={handleGuess} className="flex gap-2">
                <input
                  ref={inputRef}
                  value={guess}
                  onChange={e => setGuess(e.target.value)}
                  placeholder="Nama Hero..."
                  autoFocus
                  className="flex-1 bg-background/60 rounded-xl px-4 py-3 outline-none border border-border focus:border-primary"
                />
                <button type="submit" disabled={!guess.trim()} className="px-5 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50">
                  Tebak
                </button>
              </form>
              
              {clueIndex < 4 && (
                <button onClick={handleNextClue} className="w-full py-3 rounded-xl glass text-muted-foreground text-sm font-semibold hover:text-foreground transition">
                  Minta Clue Berikutnya ({4 - clueIndex} gratis)
                </button>
              )}
              {clueIndex >= 4 && clueIndex < 6 && (
                <button 
                  onClick={buyPremiumClue}
                  disabled={lives <= 1}
                  className="w-full py-3 rounded-xl glass border border-orange-500/30 text-orange-400 text-sm font-semibold hover:text-orange-300 transition disabled:opacity-30 disabled:hover:text-orange-400"
                >
                  {lives <= 1 ? "Nyawa tidak cukup untuk clue premium" : `Buka Clue Premium (Bayar 1 Nyawa)`}
                </button>
              )}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="inline-block px-4 py-2 rounded-xl bg-growth/20 text-growth font-bold mb-4">
                Jawaban Benar! Itu adalah {hero.name}
              </div>
              <button onClick={nextHero} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2">
                Lanjut <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </GlassCard>
        
        <div className="text-center">
          <span className="text-xs text-muted-foreground">Soal {idx + 1} dari {heroes.length}</span>
        </div>
      </div>
    </GameLayout>
  )
}
