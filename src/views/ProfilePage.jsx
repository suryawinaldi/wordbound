import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Monitor, Volume2, VolumeX, Bell, LogOut, Flame, Droplets, Coins, Award, Edit2, X } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
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

const MLBB_RANKS = ['Warrior', 'Elite', 'Master', 'Grandmaster', 'Epic', 'Legend', 'Mythic', 'Mythical Honor', 'Mythical Glory', 'Mythical Immortal']

export default function ProfilePage() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.currentUser)
  const userData = useAuthStore((s) => s.userData)
  const logout = useAuthStore((s) => s.logout)
  const persistPatch = usePlayerStore((s) => s.persistPatch)
  
  const { theme, setTheme, soundEnabled, setSoundEnabled, notificationsEnabled, setNotificationsEnabled } = useSettingsStore()
  const muted = useAudioStore((s) => s.muted)

  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    gender: '',
    bio: '',
    mlbbRank: ''
  })
  const [saving, setSaving] = useState(false)

  async function handleLogout() {
    sfx.click()
    await logout()
    navigate('/')
  }

  function openEdit() {
    sfx.click()
    setFormData({
      displayName: userData?.displayName || currentUser?.displayName || '',
      gender: userData?.gender || '',
      bio: userData?.bio || '',
      mlbbRank: userData?.mlbbRank || '',
      mlbbStars: userData?.mlbbStars || ''
    })
    setEditMode(true)
  }

  async function saveProfile(e) {
    e.preventDefault()
    sfx.correct()
    setSaving(true)
    await persistPatch({
      displayName: formData.displayName,
      gender: formData.gender,
      bio: formData.bio,
      mlbbRank: formData.mlbbRank,
      mlbbStars: formData.mlbbStars
    })
    setSaving(false)
    setEditMode(false)
  }

  const cefr = getCefrEstimate(userData)

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Profil</h1>
        <button onClick={openEdit} className="p-2.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition">
          <Edit2 className="w-5 h-5" />
        </button>
      </div>

      {/* Identity */}
      <GlassCard strong className="p-6 flex items-center gap-4">
        <img src={currentUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${userData?.displayName || currentUser?.displayName}`} className="w-16 h-16 rounded-2xl object-cover shrink-0" alt="" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg truncate">{userData?.displayName || currentUser?.displayName || 'Pemain'}</p>
          <p className="text-xs text-muted-foreground truncate mb-1">
            {userData?.gender ? `${userData.gender} • ` : ''}{currentUser?.email}
          </p>
          
          {userData?.bio && (
            <p className="text-sm italic text-muted-foreground line-clamp-2 mt-1">"{userData.bio}"</p>
          )}

          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold px-2 py-0.5 rounded-full bg-couple/15 text-couple">
              <Award className="w-3 h-3" /> CEFR: {cefr}
            </span>
            {userData?.mlbbRank && (
              <span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400">
                <Flame className="w-3 h-3" /> {userData.mlbbRank} {userData.mlbbStars ? `★ ${userData.mlbbStars}` : ''}
              </span>
            )}
          </div>
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
            <p className="font-bold text-sm sm:text-base">{s.value}</p>
            <p className="text-[0.6rem] sm:text-[0.65rem] text-muted-foreground uppercase tracking-wider">{s.label}</p>
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

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editMode && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm grid place-items-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-card border border-border shadow-2xl rounded-3xl p-6 relative overflow-hidden"
            >
              <button onClick={() => { sfx.click(); setEditMode(false) }} className="absolute top-4 right-4 p-2 rounded-full bg-muted text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
              
              <h3 className="font-display text-xl font-bold mb-6">Edit Profil</h3>
              
              <form onSubmit={saveProfile} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground ml-1">Nama Panggilan</label>
                  <input 
                    value={formData.displayName} onChange={e => setFormData(d => ({ ...d, displayName: e.target.value }))}
                    className="w-full mt-1 bg-background rounded-xl px-4 py-3 outline-none border border-border focus:border-primary text-sm"
                    placeholder="Nama keren kamu"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-muted-foreground ml-1">Jenis Kelamin</label>
                  <select 
                    value={formData.gender} onChange={e => setFormData(d => ({ ...d, gender: e.target.value }))}
                    className="w-full mt-1 bg-background rounded-xl px-4 py-3 outline-none border border-border focus:border-primary text-sm appearance-none"
                  >
                    <option value="">Rahasia</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground ml-1">Rank Mobile Legends</label>
                  <select 
                    value={formData.mlbbRank} onChange={e => setFormData(d => ({ ...d, mlbbRank: e.target.value }))}
                    className="w-full mt-1 bg-background rounded-xl px-4 py-3 outline-none border border-border focus:border-primary text-sm appearance-none"
                  >
                    <option value="">Belum Punya Rank</option>
                    {MLBB_RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {formData.mlbbRank && formData.mlbbRank.includes('Mythic') && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="text-xs font-semibold text-muted-foreground ml-1 flex justify-between">
                      Jumlah Bintang
                      {formData.mlbbRank === 'Mythic' && <span className="text-[0.65rem] opacity-70">1 - 24 Bintang</span>}
                      {formData.mlbbRank === 'Mythical Honor' && <span className="text-[0.65rem] opacity-70">25 - 49 Bintang</span>}
                      {formData.mlbbRank === 'Mythical Glory' && <span className="text-[0.65rem] opacity-70">50 - 99 Bintang</span>}
                      {formData.mlbbRank === 'Mythical Immortal' && <span className="text-[0.65rem] opacity-70">100+ Bintang</span>}
                    </label>
                    <input 
                      type="number"
                      min="1"
                      value={formData.mlbbStars || ''} onChange={e => setFormData(d => ({ ...d, mlbbStars: parseInt(e.target.value) || '' }))}
                      className="w-full mt-1 bg-background rounded-xl px-4 py-3 outline-none border border-border focus:border-primary text-sm"
                      placeholder="Contoh: 25"
                    />
                  </motion.div>
                )}

                <div>
                  <label className="text-xs font-semibold text-muted-foreground ml-1">Bio / Status</label>
                  <textarea 
                    value={formData.bio} onChange={e => setFormData(d => ({ ...d, bio: e.target.value }))}
                    className="w-full mt-1 bg-background rounded-xl px-4 py-3 outline-none border border-border focus:border-primary text-sm resize-none"
                    placeholder="Tulis status galau/keren kamu di sini..."
                    rows={2}
                    maxLength={100}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={saving || !formData.displayName.trim()} 
                  className="w-full py-3.5 mt-2 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
