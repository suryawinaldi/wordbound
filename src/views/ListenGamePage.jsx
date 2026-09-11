import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, Check, X, Trophy } from 'lucide-react'
import { SENTENCE_ITEMS as LISTEN_BANK } from '@/data/listen-bank'
import { usePlayerStore } from '@/stores/player'
import { useProgressStore } from '@/stores/progress'
import { sfx, speak } from '@/lib/sound'
import GlassCard from '@/components/GlassCard'
import Confetti from '@/components/Confetti'
import GameLayout from '@/components/GameLayout'

const ROUND = 5
const XP_PER_CORRECT = 25

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
}

export default function ListenGamePage() {
  const { awardXP, recordActivity } = usePlayerStore()
  const { applyMasteryDelta } = useProgressStore()
  const [items] = useState(() => [...LISTEN_BANK].sort(() => Math.random() - 0.5).slice(0, ROUND))
  const [idx, setIdx] = useState(0)
  const [value, setValue] = useState('')
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [burst, setBurst] = useState(false)

  const item = items[idx]

  function play() {
    sfx.click()
    speak(item.text)
  }

  useEffect(() => {
    const t = setTimeout(() => speak(items[0].text), 300)
    return () => clearTimeout(t)
  }, [])

  function check(e) {
    e?.preventDefault()
    if (checked) return
    setChecked(true)
    const ok = normalize(value) === normalize(item.text)
    setCorrect(ok)
    if (ok) {
      sfx.correct()
      setScore((s) => s + 1)
      setBurst(true)
      setTimeout(() => setBurst(false), 900)
      awardXP(XP_PER_CORRECT)
      applyMasteryDelta('listening', 4)
    } else {
      sfx.wrong()
    }
  }

  function next() {
    sfx.click()
    if (idx + 1 >= items.length) {
      recordActivity()
      sfx.win()
      setDone(true)
    } else {
      setIdx((n) => n + 1)
      setValue('')
      setChecked(false)
      setCorrect(false)
      setTimeout(() => speak(items[idx + 1].text), 300)
    }
  }

  if (done) {
    return (
      <GameLayout title="Listen & Type" right={<span className="text-sm font-bold text-sky">{score * XP_PER_CORRECT} XP</span>}>
        <GlassCard strong className="p-8 text-center relative overflow-hidden">
          <Confetti fire={true} />
          <div className="grid place-items-center w-20 h-20 rounded-3xl bg-gradient-to-br from-sky to-couple text-white mx-auto mb-4 shadow-glow">
            <Trophy className="w-10 h-10" />
          </div>
          <h2 className="font-display text-2xl font-extrabold">Selesai! 🎉</h2>
          <p className="text-muted-foreground mt-1">Tepat: <span className="font-bold text-foreground">{score}/{items.length}</span></p>
          <p className="mt-4 text-3xl font-display font-extrabold text-gradient">+{score * XP_PER_CORRECT} XP</p>
          <Link to="/games" className="inline-block mt-6 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold">Main Lagi</Link>
        </GlassCard>
      </GameLayout>
    )
  }

  return (
    <GameLayout title="Listen & Type" right={<span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-muted">{idx + 1}/{items.length}</span>}>
      <div className="relative">
        <Confetti fire={burst} />
        <GlassCard className="p-6">
          <p className="text-xs text-muted-foreground text-center mb-4">Dengarkan, lalu ketik ulang kalimatnya</p>
          <div className="flex flex-col items-center gap-4">
            <motion.button onClick={play} whileTap={{ scale: 0.92 }} className="grid place-items-center w-20 h-20 rounded-3xl bg-gradient-to-br from-sky to-couple text-white shadow-glow">
              <Volume2 className="w-9 h-9" />
            </motion.button>
            <p className="text-xs text-muted-foreground">Tap untuk memutar ulang</p>

            <form onSubmit={check} className="w-full mt-2">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={checked}
                placeholder="Ketik yang kamu dengar..."
                autoFocus
                className="w-full bg-background/60 rounded-2xl px-4 py-3.5 text-center outline-none border border-border focus:border-primary disabled:opacity-70"
              />
              {!checked && (
                <button type="submit" className="mt-3 w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky to-couple text-white font-semibold">
                  Periksa
                </button>
              )}
            </form>

            {checked && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                <div className={`flex items-center gap-2 rounded-2xl px-4 py-3 ${correct ? 'bg-growth/10 text-growth' : 'bg-destructive/10 text-destructive'}`}>
                  {correct ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  <span className="text-sm font-semibold flex-1">{correct ? 'Tepat sekali!' : 'Jawaban benar:'}</span>
                </div>
                <p className="mt-2 text-center text-sm font-medium text-foreground">“{item.text}”</p>
                <p className="text-center text-xs text-muted-foreground">{item.translation}</p>
                <button onClick={next} className="mt-4 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold">
                  {idx + 1 >= items.length ? 'Lihat Hasil' : 'Lanjut →'}
                </button>
              </motion.div>
            )}
          </div>
        </GlassCard>
      </div>
    </GameLayout>
  )
}
