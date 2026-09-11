import { useState } from 'react'
import { motion } from 'framer-motion'
import { HeartHandshake, Copy, Check, Link2, Unlink, Droplets, Flame, Sun, Trophy } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { sfx } from '@/lib/sound'
import GlassCard from '@/components/GlassCard'
import StatPill from '@/components/StatPill'

export default function CoupleLinkPage() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const userData = useAuthStore((s) => s.userData)
  const partnerData = useAuthStore((s) => s.partnerData)
  const generateInviteCode = useAuthStore((s) => s.generateInviteCode)
  const linkWithCode = useAuthStore((s) => s.linkWithCode)
  const unlinkPartner = useAuthStore((s) => s.unlinkPartner)
  const loading = useAuthStore((s) => s.loading)

  const [code, setCode] = useState('')
  const [myCode, setMyCode] = useState(null)
  const [copied, setCopied] = useState(false)
  const [err, setErr] = useState('')

  const connected = !!userData?.partnerUid && !!partnerData

  async function handleGenerate() {
    sfx.click()
    setErr('')
    try {
      const c = await generateInviteCode()
      setMyCode(c)
    } catch (e) {
      console.error(e)
      setErr(e.message || 'Gagal membuat kode. Pastikan Firestore rules diizinkan.')
    }
  }

  async function handleLink(e) {
    e.preventDefault()
    setErr('')
    sfx.click()
    try {
      await linkWithCode(code.trim())
      setCode('')
      sfx.win()
    } catch (e2) {
      setErr(e2.message || 'Gagal terhubung')
      sfx.wrong()
    }
  }

  async function handleUnlink() {
    sfx.click()
    await unlinkPartner()
  }

  function copyCode() {
    navigator.clipboard?.writeText(myCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (connected) {
    const me = { name: userData?.displayName?.split(' ')[0] || 'Kamu', xp: userData?.xp || 0, streak: userData?.streak || 0, savings: userData?.savings || 0, photo: userData?.photoURL }
    const p = { name: partnerData?.displayName?.split(' ')[0] || 'Pasangan', xp: partnerData?.xp || 0, streak: partnerData?.streak || 0, savings: partnerData?.savings || 0, photo: partnerData?.photoURL }
    const xpLead = me.xp >= p.xp ? 'me' : 'partner'
    const streakLead = me.streak >= p.streak ? 'me' : 'partner'

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-couple to-sky text-white shadow-glow mb-3">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl font-extrabold">Kalian Terhubung! 💞</h1>
          <p className="text-sm text-muted-foreground">Bandingkan progres & saling memacu</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[me, p].map((who, idx) => (
            <GlassCard key={idx} className="p-5 text-center">
              <img src={who.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${who.name}`} className="w-16 h-16 rounded-2xl mx-auto object-cover" alt="" />
              <p className="mt-2 font-bold truncate">{who.name}</p>
              <div className="mt-3 space-y-2 text-left">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Droplets className="w-4 h-4 text-sky" /> XP</span>
                  <span className="font-bold">{who.xp.toLocaleString('id')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Flame className="w-4 h-4 text-sun" /> Streak</span>
                  <span className="font-bold">{who.streak} hari</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Sun className="w-4 h-4 text-sun" /> Tabungan</span>
                  <span className="font-bold">Rp{who.savings.toLocaleString('id')}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-5">
          <h3 className="font-bold flex items-center gap-2 mb-3"><Trophy className="w-5 h-5 text-sun" /> Papan Perbandingan</h3>
          <div className="space-y-3">
            <CompareRow label="Total XP" me={me.xp} partner={p.xp} lead={xpLead} tone="sky" />
            <CompareRow label="Streak Harian" me={me.streak} partner={p.streak} lead={streakLead} tone="sun" />
          </div>
        </GlassCard>

        <button onClick={handleUnlink} className="w-full glass rounded-2xl px-5 py-3.5 flex items-center justify-center gap-2 text-destructive font-semibold hover:bg-destructive/10 transition">
          <Unlink className="w-4 h-4" /> Putuskan Koneksi
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-couple to-sky text-white shadow-glow mb-3">
          <HeartHandshake className="w-8 h-8" />
        </div>
        <h1 className="font-display text-2xl font-extrabold">Hubungkan Pasanganmu</h1>
        <p className="text-sm text-muted-foreground">Main berdua, bandingkan progres, tumbuhkan pohon bersama</p>
      </div>

      {/* Generate code */}
      <GlassCard className="p-5">
        <h3 className="font-bold mb-1">Bagikan Kode Undangan</h3>
        <p className="text-xs text-muted-foreground mb-4">Minta pasanganmu memasukkan kode ini</p>
        {myCode ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 text-center text-3xl font-display font-extrabold tracking-[0.3em] py-4 glass-strong rounded-2xl">
              {myCode}
            </div>
            <button onClick={copyCode} className="grid place-items-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground">
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        ) : (
          <div className="w-full">
            <button onClick={handleGenerate} disabled={loading} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-couple to-sky text-white font-semibold disabled:opacity-60">
              {loading ? 'Membuat...' : 'Buat Kode Undangan'}
            </button>
            {err && <p className="mt-3 text-sm text-center text-destructive bg-destructive/10 rounded-xl px-3 py-2">{err}</p>}
          </div>
        )}
      </GlassCard>

      {/* Enter code */}
      <GlassCard className="p-5">
        <h3 className="font-bold mb-1 flex items-center gap-2"><Link2 className="w-4 h-4" /> Punya Kode?</h3>
        <p className="text-xs text-muted-foreground mb-4">Masukkan kode dari pasanganmu</p>
        <form onSubmit={handleLink} className="flex gap-3">
          <input
            value={code} onChange={(e) => setCode(e.target.value)}
            placeholder="000000" inputMode="numeric" maxLength={6}
            className="flex-1 bg-background/60 rounded-2xl px-4 py-3 text-center text-xl font-display font-bold tracking-[0.25em] outline-none border border-border focus:border-primary"
          />
          <button type="submit" disabled={loading || code.length < 6} className="px-6 rounded-2xl bg-primary text-primary-foreground font-semibold disabled:opacity-50">
            Hubungkan
          </button>
        </form>
        {err && <p className="mt-3 text-sm text-destructive bg-destructive/10 rounded-xl px-3 py-2">{err}</p>}
      </GlassCard>
    </div>
  )
}

function CompareRow({ label, me, partner, lead, tone }) {
  const total = me + partner || 1
  const mePct = (me / total) * 100
  const color = tone === 'sun' ? 'hsl(var(--sun))' : 'hsl(var(--sky))'
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-semibold">{label}</span>
        <span className="text-muted-foreground">{me.toLocaleString('id')} vs {partner.toLocaleString('id')}</span>
      </div>
      <div className="h-3 rounded-full bg-muted overflow-hidden flex">
        <motion.div initial={{ width: 0 }} animate={{ width: `${mePct}%` }} transition={{ duration: 0.7 }} style={{ background: color }} />
        <div className="flex-1 bg-couple/40" />
      </div>
      <p className="text-[0.68rem] mt-1 text-muted-foreground">
        {lead === 'me' ? 'Kamu memimpin 🎉' : 'Pasangan memimpin 👀'}
      </p>
    </div>
  )
}
