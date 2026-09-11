import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Droplets, Sun, Coins, Gamepad2, Plus, TrendingUp, HeartHandshake, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore, levelFromXp, xpToNextLevel } from '@/stores/player'
import { sfx } from '@/lib/sound'
import LifeTree from '@/components/LifeTree'
import GlassCard from '@/components/GlassCard'
import StatPill from '@/components/StatPill'
import ProgressBar from '@/components/ProgressBar'

export default function DashboardPage() {
  const userData = useAuthStore((s) => s.userData)
  const partnerData = useAuthStore((s) => s.partnerData)
  const { addSavings } = usePlayerStore()
  const [savingOpen, setSavingOpen] = useState(false)
  const [amount, setAmount] = useState('')

  const xp = userData?.xp || 0
  const level = levelFromXp(xp)
  const { current, needed } = xpToNextLevel(xp)
  const streak = userData?.streak || 0
  const coins = userData?.coins || 0
  const savings = userData?.savings || 0
  const firstName = userData?.displayName?.split(' ')[0] || 'Pemain'

  // Evolution metadata — stage driven by XP, fruits by savings
  const STAGE_NAMES = ['Bibit', 'Tunas', 'Ranting Muda', 'Daun Lebat', 'Berbunga', 'Mekar Penuh']
  const stage = Math.max(0, Math.min(5, level - 1))
  const stageName = STAGE_NAMES[stage]
  const FRUIT_STEP = 50000
  const savingsToNextFruit = FRUIT_STEP - (savings % FRUIT_STEP)
  const savingsProgress = (savings % FRUIT_STEP) / FRUIT_STEP
  const STAGE_HINTS = [
    'Kumpulkan XP untuk menumbuhkan tunas pertama 🌱',
    'Terus bermain agar daun mulai merimbun 🍃',
    'Tabungan membuat buah pertama muncul 🍊',
    'Matahari penuh membuat pohon berbunga 🌸',
    'Kerja kerasmu menghasilkan pohon yang megah 🌳',
    'Pohonmu dalam bentuk sempurna — jaga terus! 🌟',
  ]
  const stageHint = STAGE_HINTS[stage]

  async function handleSave(e) {
    e.preventDefault()
    const n = Number(amount)
    if (!n || n <= 0) return
    sfx.correct()
    await addSavings(n)
    setAmount('')
    setSavingOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-sm text-muted-foreground">Selamat datang kembali,</p>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
          Hai, {firstName} 👋
        </h1>
      </div>

      {/* Life Tree centerpiece */}
      <GlassCard strong className="p-6 sm:p-8 relative overflow-hidden">
        <motion.span
          className="pointer-events-none absolute -top-16 -left-10 w-56 h-56 rounded-full bg-growth/20 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="pointer-events-none absolute -bottom-16 -right-8 w-52 h-52 rounded-full bg-sun/20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <div className="absolute top-5 left-5 z-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-growth/15 text-growth">
            <TrendingUp className="w-3.5 h-3.5" /> Level {level}
          </span>
        </div>
        <div className="absolute top-5 right-5 z-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-sun/15 text-sun">
            🌱 {stageName}
          </span>
        </div>
        <div className="text-center mb-2 relative">
          <h2 className="font-display text-lg font-bold">Pohon Kehidupan</h2>
          <p className="text-xs text-muted-foreground">Tumbuh dengan Air (XP) & Matahari (Tabungan)</p>
        </div>
        <LifeTree xp={xp} savings={savings} streak={streak} />
        <div className="max-w-sm mx-auto mt-4 space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground flex items-center gap-1"><Droplets className="w-3 h-3 text-sky" /> Air (XP) → Level {level + 1}</span>
              <span className="font-semibold">{current} / {needed} XP</span>
            </div>
            <ProgressBar value={current} max={needed} tone="growth" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground flex items-center gap-1"><Sun className="w-3 h-3 text-sun" /> Matahari → Buah berikutnya</span>
              <span className="font-semibold">{savingsToNextFruit.toLocaleString('id')} / {FRUIT_STEP.toLocaleString('id')}</span>
            </div>
            <ProgressBar value={savingsProgress} max={1} tone="sun" />
          </div>
          <p className="text-center text-[0.7rem] text-muted-foreground pt-1">
            {stageHint}
          </p>
        </div>
      </GlassCard>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill icon={Droplets} label="XP (Air)" value={xp.toLocaleString('id')} tone="sky" />
        <StatPill icon={Flame} label="Streak" value={`${streak} hari`} tone="sun" />
        <StatPill icon={Sun} label="Tabungan" value={`Rp${savings.toLocaleString('id')}`} tone="sun" />
        <StatPill icon={Coins} label="Koin" value={coins.toLocaleString('id')} tone="growth" />
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/games" onClick={() => sfx.click()}>
          <GlassCard className="p-5 flex items-center gap-4 hover:shadow-glow transition-all cursor-pointer h-full" glow="primary">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-growth to-sky text-white">
              <Gamepad2 className="w-6 h-6" />
            </span>
            <div className="flex-1">
              <p className="font-bold">Main & Dapatkan XP</p>
              <p className="text-xs text-muted-foreground">6 mini game seru menunggu</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </GlassCard>
        </Link>

        <motion.button onClick={() => { sfx.click(); setSavingOpen((v) => !v) }} className="text-left">
          <GlassCard className="p-5 flex items-center gap-4 hover:shadow-glow transition-all cursor-pointer h-full" glow="sun">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-sun to-[#ff9d3c] text-white">
              <Plus className="w-6 h-6" />
            </span>
            <div className="flex-1">
              <p className="font-bold">Tambah Tabungan</p>
              <p className="text-xs text-muted-foreground">Beri Matahari pada pohonmu</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </GlassCard>
        </motion.button>
      </div>

      {/* Savings form */}
      {savingOpen && (
        <motion.form
          onSubmit={handleSave}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass rounded-2xl p-4 flex gap-3 items-end"
        >
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Jumlah tabungan (Rp)</label>
            <input
              type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="50000"
              className="w-full bg-background/60 rounded-xl px-3 py-2.5 text-sm outline-none border border-border focus:border-primary"
              autoFocus
            />
          </div>
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sun to-[#ff9d3c] text-white font-semibold text-sm">
            Simpan
          </button>
        </motion.form>
      )}

      {/* Couple comparison */}
      {userData?.partnerUid && partnerData && (
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-couple" /> Pasanganmu
            </h3>
            <Link to="/couple-link" className="text-xs text-primary font-semibold">Lihat ›</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <img src={userData?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${userData?.displayName}`} className="w-12 h-12 rounded-2xl mx-auto object-cover" alt="" />
              <p className="mt-2 text-sm font-semibold truncate">{firstName}</p>
              <div className="flex justify-center gap-3 mt-1.5 text-xs">
                <span className="text-sky font-bold">{userData?.xp || 0} XP</span>
                <span className="text-sun font-bold">🔥 {userData?.streak || 0}</span>
              </div>
            </div>
            <div className="text-center">
              <img src={partnerData?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${partnerData?.displayName}`} className="w-12 h-12 rounded-2xl mx-auto object-cover" alt="" />
              <p className="mt-2 text-sm font-semibold truncate">{partnerData?.displayName?.split(' ')[0] || 'Pasangan'}</p>
              <div className="flex justify-center gap-3 mt-1.5 text-xs">
                <span className="text-sky font-bold">{partnerData?.xp || 0} XP</span>
                <span className="text-sun font-bold">🔥 {partnerData?.streak || 0}</span>
              </div>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
