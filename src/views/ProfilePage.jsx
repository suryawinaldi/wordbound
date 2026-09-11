import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sun, Moon, Monitor, Volume2, VolumeX, Bell, LogOut, Flame, Droplets, Sun as SunIcon, Coins, Award } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useAudioStore } from '@/stores/audio'
import { sfx } from '@/lib/sound'
import GlassCard from '@/components/GlassCard'
import { getCefrEstimate } from '@/stores/progress'

const THEMES = [
  { value: 'dark', label: 'Gelap', icon: Moon },
  { value: 'light', label: 'Terang', icon: Sun },
  { value: 'system', label: 'Sistem', icon: Monitor },
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.currentUser)
  const userData = useAuthStore((s) => s.userData)
  const logout = useAuthStore((s) => s.logout)
  const { theme, setTheme, soundEnabled, setSoundEnabled, notificationsEnabled, setNotificationsEnabled } = useSettingsStore()
  const muted = useAudioStore((s) => s.muted)

  async function handleLogout() {
    sfx.click()
    await logout()
    navigate('/')
  }

  const cefr = getCefrEstimate(userData)

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Profil</h1>

      {/* Identity */}
      <GlassCard strong className="p-6 flex items-center gap-4">
        <img src={currentUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.displayName}`} className="w-16 h-16 rounded-2xl object-cover" alt="" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg truncate">{currentUser?.displayName || 'Pemain'}</p>
          <p className="text-sm text-muted-foreground truncate">{currentUser?.email}</p>
          <span className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-couple/15 text-couple">
            <Award className="w-3.5 h-3.5" /> Level CEFR: {cefr}
          </span>
        </div>
      </GlassCard>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Droplets, label: 'XP', value: (userData?.xp || 0).toLocaleString('id'), tone: 'text-sky' },
          { icon: Flame, label: 'Streak', value: `${userData?.streak || 0}h`, tone: 'text-sun' },
          { icon: Coins, label: 'Koin', value: (userData?.coins || 0).toLocaleString('id'), tone: 'text-growth' },
        ].map((s) => (
          <GlassCard key={s.label} className="p-4 text-center">
            <s.icon className={`w-5 h-5 mx-auto mb-1.5 ${s.tone}`} />
            <p className="font-bold">{s.value}</p>
            <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Settings */}
      <GlassCard className="p-5 space-y-5">
        <h3 className="font-bold">Pengaturan</h3>

        {/* Theme */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Tema</p>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.value}
                onClick={() => { sfx.click(); setTheme(t.value) }}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition ${
                  theme === t.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted/60'
                }`}
              >
                <t.icon className="w-5 h-5" />
                <span className="text-xs font-semibold">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sound */}
        <ToggleRow
          icon={muted ? VolumeX : Volume2}
          label="Efek Suara"
          desc="Suara game & feedback"
          value={soundEnabled}
          onChange={(v) => { setSoundEnabled(v); if (v) sfx.correct() }}
        />
        <ToggleRow
          icon={Bell}
          label="Notifikasi"
          desc="Pengingat streak harian"
          value={notificationsEnabled}
          onChange={setNotificationsEnabled}
        />
      </GlassCard>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full glass rounded-2xl px-5 py-3.5 flex items-center justify-center gap-2 text-destructive font-semibold hover:bg-destructive/10 transition">
        <LogOut className="w-4 h-4" /> Keluar
      </button>
    </div>
  )
}

function ToggleRow({ icon: Icon, label, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center w-10 h-10 rounded-xl bg-muted text-muted-foreground">
          <Icon className="w-5 h-5" />
        </span>
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-7 rounded-full transition ${value ? 'bg-primary' : 'bg-muted'}`}
      >
        <motion.span
          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
          animate={{ left: value ? '1.6rem' : '0.25rem' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  )
}
