import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, Trophy, User, Users, Check, X, ArrowRight } from 'lucide-react'
import { usePlayerStore } from '@/stores/player'
import { useAuthStore } from '@/stores/auth'
import { useProgressStore } from '@/stores/progress'
import { sfx } from '@/lib/sound'
import GlassCard from '@/components/GlassCard'
import Confetti from '@/components/Confetti'
import GameLayout from '@/components/GameLayout'

const XP_REWARD = 20

export default function QuizSoloPage() {
  const { awardXP, recordActivity } = usePlayerStore()
  const userData = useAuthStore((s) => s.userData)
  const hasPartner = !!userData?.partnerUid

  const [mode, setMode] = useState(null) // 'solo' or 'duo'

  if (!mode) {
    return (
      <GameLayout title="English Quiz">
        <GlassCard className="p-8 text-center max-w-sm mx-auto mt-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-growth to-sky text-white grid place-items-center mb-6 shadow-glow">
            <HelpCircle className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-display font-bold mb-2">Pilih Mode Bermain</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Uji kemampuan kosakata & grammar kamu!
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
                <Users className="w-5 h-5 text-couple" /> Gantian (1 Layar)
              </button>
            )}
            <button
              onClick={() => { sfx.click(); navigate('/quiz-duel') }}
              className="w-full py-4 rounded-2xl glass-strong flex items-center justify-center gap-3 font-semibold hover:bg-white/10 transition relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-rose-500/10"></div>
              <Users className="w-5 h-5 text-primary" /> Mabar Online (Room)
            </button>
          </div>
        </GlassCard>
      </GameLayout>
    )
  }

  return <QuizGame mode={mode} onBack={() => setMode(null)} />
}

function QuizGame({ mode }) {
  const { awardXP, recordActivity } = usePlayerStore()
  const [questions] = useState(() => [...QUIZ_BANK].sort(() => Math.random() - 0.5))
  const [idx, setIdx] = useState(0)
  
  const [selected, setSelected] = useState(null) // index of selected option
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [turn, setTurn] = useState(0) // 0 for player 1, 1 for player 2
  const [gameOver, setGameOver] = useState(false)

  const q = questions[idx]

  function handleSelect(optIdx) {
    if (checked) return
    sfx.click()
    setSelected(optIdx)
  }

  function handleCheck() {
    if (selected === null || checked) return
    setChecked(true)
    
    const isCorrect = selected === q.a
    setCorrect(isCorrect)

    if (isCorrect) {
      sfx.correct()
      setScore(s => s + 1)
      awardXP(XP_REWARD)
    } else {
      sfx.wrong()
    }
  }

  function handleNext() {
    sfx.whoosh()
    if (idx + 1 >= questions.length) {
      recordActivity()
      if (score >= questions.length / 2) sfx.win()
      setGameOver(true)
    } else {
      setIdx(i => i + 1)
      setSelected(null)
      setChecked(false)
      setCorrect(false)
      if (mode === 'duo') setTurn(t => (t === 0 ? 1 : 0))
    }
  }

  if (gameOver) {
    return (
      <GameLayout title="English Quiz" right={<span className="text-sm font-bold text-sky">{score * XP_REWARD} XP</span>}>
        <GlassCard strong className="p-8 text-center relative overflow-hidden max-w-sm mx-auto">
          {score > 0 && <Confetti fire={true} />}
          <div className="grid place-items-center w-20 h-20 rounded-3xl bg-gradient-to-br from-growth to-sky text-white mx-auto mb-4 shadow-glow">
            <Trophy className="w-10 h-10" />
          </div>
          <h2 className="font-display text-2xl font-extrabold">Selesai! 🎉</h2>
          <p className="text-muted-foreground mt-1">Jawaban Benar: <span className="font-bold text-foreground">{score}/{questions.length}</span></p>
          <p className="mt-4 text-3xl font-display font-extrabold text-gradient">+{score * XP_REWARD} XP</p>
          <Link to="/games" className="inline-block mt-6 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold">Kembali ke Games</Link>
        </GlassCard>
      </GameLayout>
    )
  }

  return (
    <GameLayout 
      title="English Quiz" 
      right={<span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-muted">{idx + 1}/{questions.length}</span>}
    >
      <div className="relative max-w-md mx-auto space-y-4">
        {correct && <Confetti fire={true} />}
        
        {mode === 'duo' && !checked && (
          <div className="text-center py-2">
            <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${turn === 0 ? 'bg-sky/20 text-sky' : 'bg-couple/20 text-couple'}`}>
              Giliran: {turn === 0 ? 'Pemain 1' : 'Pemain 2 (Pasangan)'}
            </span>
          </div>
        )}

        <GlassCard className="p-6">
          <p className="text-lg font-medium text-center mb-6 leading-relaxed">{q.q}</p>

          <div className="space-y-3">
            {q.opts.map((opt, i) => {
              let btnClass = "w-full py-4 px-5 rounded-2xl text-left font-medium border-2 transition-all "
              
              if (!checked) {
                if (selected === i) btnClass += "border-primary bg-primary/10 text-primary"
                else btnClass += "border-border bg-background/40 hover:border-primary/50 text-foreground"
              } else {
                if (i === q.a) btnClass += "border-growth bg-growth/20 text-growth"
                else if (selected === i) btnClass += "border-destructive bg-destructive/20 text-destructive"
                else btnClass += "border-border bg-background/20 opacity-50"
              }

              return (
                <button key={i} disabled={checked} onClick={() => handleSelect(i)} className={btnClass}>
                  <div className="flex justify-between items-center">
                    <span>{opt}</span>
                    {checked && i === q.a && <Check className="w-5 h-5" />}
                    {checked && selected === i && i !== q.a && <X className="w-5 h-5" />}
                  </div>
                </button>
              )
            })}
          </div>

          {!checked ? (
            <button 
              onClick={handleCheck} 
              disabled={selected === null} 
              className="mt-6 w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold disabled:opacity-50"
            >
              Periksa Jawaban
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <button 
                onClick={handleNext} 
                className="mt-6 w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2"
              >
                Lanjut <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </GlassCard>
      </div>
    </GameLayout>
  )
}
