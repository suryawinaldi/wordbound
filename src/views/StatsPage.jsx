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
    </div>
  )
}

function cefrLabel(c) {
  return ({
    A1: 'Pemula', A2: 'Dasar', B1: 'Menengah', B2: 'Menengah Atas', C1: 'Mahir', C2: 'Sangat Mahir',
  })[c] || c
}
