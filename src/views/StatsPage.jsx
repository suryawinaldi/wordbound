import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { Award, TrendingUp, Droplets, Flame, Sun } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { getMastery, getCefrEstimate, MASTERY_TRACKS } from '@/stores/progress'
import GlassCard from '@/components/GlassCard'
import StatPill from '@/components/StatPill'

const TRACK_LABELS = {
  vocabulary: 'Kosakata',
  grammar: 'Tata Bahasa',
  listening: 'Menyimak',
  reading: 'Membaca',
  writing: 'Menulis',
  speaking: 'Berbicara',
}

export default function StatsPage() {
  const userData = useAuthStore((s) => s.userData)
  const mastery = getMastery(userData)
  const cefr = getCefrEstimate(userData)

  const chartData = MASTERY_TRACKS.map((t) => ({ track: TRACK_LABELS[t], score: mastery[t] || 0 }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Statistik</h1>
        <p className="text-sm text-muted-foreground">Perkembangan belajar bahasa Inggrismu</p>
      </div>

      {/* CEFR badge */}
      <GlassCard strong className="p-6 flex items-center gap-5" glow="primary">
        <div className="grid place-items-center w-20 h-20 rounded-3xl bg-gradient-to-br from-growth to-sky text-white shadow-glow">
          <span className="font-display font-extrabold text-3xl">{cefr}</span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Estimasi Level CEFR</p>
          <p className="font-display text-xl font-bold">{cefrLabel(cefr)}</p>
          <p className="text-xs text-muted-foreground mt-1">Diperbarui otomatis dari mastery tracks</p>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill icon={Droplets} label="Total XP" value={(userData?.xp || 0).toLocaleString('id')} tone="sky" />
        <StatPill icon={Flame} label="Streak" value={`${userData?.streak || 0} hari`} tone="sun" />
        <StatPill icon={Sun} label="Tabungan" value={`Rp${(userData?.savings || 0).toLocaleString('id')}`} tone="sun" />
        <StatPill icon={Award} label="Koin" value={(userData?.coins || 0).toLocaleString('id')} tone="growth" />
      </div>

      {/* Mastery radar */}
      <GlassCard className="p-5">
        <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-growth" /> Mastery Tracks</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} outerRadius="72%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="track" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Mastery bars */}
      <GlassCard className="p-5 space-y-3">
        <h3 className="font-bold">Rincian per Track</h3>
        {MASTERY_TRACKS.map((t) => {
          const v = mastery[t] || 0
          return (
            <div key={t}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold">{TRACK_LABELS[t]}</span>
                <span className="text-muted-foreground">{v}/100</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-growth to-sky" style={{ width: `${v}%` }} />
              </div>
            </div>
          )
        })}
      </GlassCard>

      {/* Statistik Mabar */}
      <GlassCard className="p-5 space-y-4">
        <h3 className="font-bold flex items-center gap-2">⚔️ Statistik Mabar (Duo)</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background/50 p-4 rounded-xl text-center border border-border">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Menang RPS</p>
            <p className="text-2xl font-black text-rose-500">{userData?.stats?.rpsWins || 0}</p>
          </div>
          <div className="bg-background/50 p-4 rounded-xl text-center border border-border">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Menang XOXO</p>
            <p className="text-2xl font-black text-sky-500">{userData?.stats?.xoxoWins || 0}</p>
          </div>
          <div className="bg-background/50 p-4 rounded-xl text-center border border-border">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Menang Wordle</p>
            <p className="text-2xl font-black text-growth">{userData?.stats?.wordleWins || 0}</p>
          </div>
        </div>
      </GlassCard>

      {/* Rekor Tebak Hero */}
      <GlassCard className="p-5 space-y-4">
        <h3 className="font-bold flex items-center gap-2">🛡️ Rekor Tebak Hero ML</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-growth/10 p-4 rounded-xl flex items-center justify-between border border-growth/20">
            <div>
              <p className="text-xs text-growth font-bold uppercase tracking-wider">Easy</p>
              <p className="text-xs text-muted-foreground">Max Streak</p>
            </div>
            <p className="text-2xl font-black text-growth">{userData?.stats?.mlGuessMaxStreak?.easy || 0}</p>
          </div>
          <div className="bg-sun/10 p-4 rounded-xl flex items-center justify-between border border-sun/20">
            <div>
              <p className="text-xs text-sun font-bold uppercase tracking-wider">Medium</p>
              <p className="text-xs text-muted-foreground">Max Streak</p>
            </div>
            <p className="text-2xl font-black text-sun">{userData?.stats?.mlGuessMaxStreak?.medium || 0}</p>
          </div>
          <div className="bg-orange-500/10 p-4 rounded-xl flex items-center justify-between border border-orange-500/20">
            <div>
              <p className="text-xs text-orange-500 font-bold uppercase tracking-wider">Hard</p>
              <p className="text-xs text-muted-foreground">Max Streak</p>
            </div>
            <p className="text-2xl font-black text-orange-500">{userData?.stats?.mlGuessMaxStreak?.hard || 0}</p>
          </div>
          <div className="bg-rose-500/10 p-4 rounded-xl flex items-center justify-between border border-rose-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-10"></div>
            <div className="relative">
              <p className="text-xs text-rose-500 font-black uppercase tracking-wider">Nightmare</p>
              <p className="text-xs text-rose-500/70">Max Streak</p>
            </div>
            <p className="text-2xl font-black text-rose-500 relative">{userData?.stats?.mlGuessMaxStreak?.nightmare || 0}</p>
          </div>
        </div>
      </GlassCard>

      {/* Papan Prestasi / Badges */}
      <GlassCard className="p-5">
        <h3 className="font-bold flex items-center gap-2 mb-4">🏆 Papan Prestasi</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <BadgeItem 
            id="ml-streak30-easy" 
            title="Savage (Easy)" 
            desc="Streak 30 di kesulitan Easy" 
            emoji="🟢" 
            color="bg-growth/20 text-growth border-growth/30" 
            userData={userData} 
          />
          <BadgeItem 
            id="ml-streak30-medium" 
            title="Savage (Medium)" 
            desc="Streak 30 di kesulitan Medium" 
            emoji="🟡" 
            color="bg-sun/20 text-sun border-sun/30" 
            userData={userData} 
          />
          <BadgeItem 
            id="ml-streak30-hard" 
            title="Savage (Hard)" 
            desc="Streak 30 di kesulitan Hard" 
            emoji="🔴" 
            color="bg-orange-500/20 text-orange-500 border-orange-500/30" 
            userData={userData} 
          />
          <BadgeItem 
            id="ml-streak30-nightmare" 
            title="Maniac (Nightmare)" 
            desc="Streak 30 di kesulitan Nightmare" 
            emoji="💀" 
            color="bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)] bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]" 
            userData={userData} 
          />
          <BadgeItem 
            id="ml-perfect-nightmare" 
            title="GOD OF MLBB" 
            desc="Menebak 133 Hero di Nightmare!" 
            emoji="👑" 
            color="bg-gradient-to-br from-rose-600 via-orange-500 to-yellow-500 text-white border-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.6)]" 
            userData={userData} 
          />
        </div>
      </GlassCard>
    </div>
  )
}

function BadgeItem({ id, title, desc, emoji, color, userData }) {
  const count = userData?.achievements?.[id] || 0
  const isUnlocked = count > 0

  return (
    <div className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${isUnlocked ? color : 'bg-muted/50 border-border opacity-50 grayscale'}`}>
      <div className="text-3xl mb-2 relative">
        {emoji}
        {count > 1 && (
          <span className="absolute -top-2 -right-3 bg-primary text-primary-foreground text-[0.6rem] font-black px-1.5 py-0.5 rounded-full">
            x{count}
          </span>
        )}
      </div>
      <p className={`text-xs font-bold leading-tight mb-1 ${isUnlocked && color.includes('text-white') ? 'text-white' : ''}`}>{title}</p>
      <p className={`text-[0.6rem] leading-tight ${isUnlocked && color.includes('text-white') ? 'text-white/80' : 'text-muted-foreground'}`}>{desc}</p>
    </div>
  )
}

function cefrLabel(c) {
  return ({
    A1: 'Pemula', A2: 'Dasar', B1: 'Menengah', B2: 'Menengah Atas', C1: 'Mahir', C2: 'Sangat Mahir',
  })[c] || c
}
