import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth'
import { useAudioStore } from '@/stores/audio'
import { sfx } from '@/lib/sound'
import { Sparkles, Droplets, Sun, HeartHandshake, Gamepad2 } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.5-2.1 14.3-5.5l-6.6-5.6C29.6 34.7 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.1 4.1-3.9 5.5l6.6 5.6C41.5 36.5 44 30.8 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  )
}

export default function SplashPage() {
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const toggleMute = useAudioStore((s) => s.toggleMute)
  const muted = useAudioStore((s) => s.muted)

  async function handleLogin() {
    sfx.click()
    await loginWithGoogle()
  }

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="aurora-blob w-[36rem] h-[36rem] -top-32 -left-24 bg-growth animate-aurora-drift" />
        <div className="aurora-blob w-[32rem] h-[32rem] top-1/4 -right-24 bg-couple animate-aurora-drift" style={{ animationDelay: '-7s' }} />
        <div className="aurora-blob w-[28rem] h-[28rem] -bottom-24 left-1/3 bg-sun animate-aurora-drift" style={{ animationDelay: '-12s' }} />
      </div>

      <motion.button
        onClick={toggleMute}
        className="absolute top-6 right-6 glass-strong rounded-full p-3 text-muted-foreground hover:text-foreground transition z-20"
        whileTap={{ scale: 0.9 }}
      >
        {muted ? '🔇' : '🔊'}
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-md relative z-10"
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
          className="relative mx-auto w-20 h-20 rounded-[1.75rem] bg-gradient-to-br from-growth via-sky to-couple grid place-items-center shadow-glow mb-6"
        >
          <Sparkles className="w-10 h-10 text-white" />
          <span className="absolute inset-0 rounded-[1.75rem] bg-growth/40 blur-2xl -z-10" />
        </motion.div>

        <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight">
          <span className="text-gradient">DuoQuest</span>
        </h1>
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground mt-1.5">Life Estate</p>

        <p className="mt-5 text-muted-foreground text-[0.95rem] leading-relaxed">
          Belajar bahasa Inggris & tracker keuangan dalam satu petualangan. Tumbuhkan
          <span className="text-growth font-semibold"> Pohon Kehidupan</span>mu dengan Air (XP) & Matahari (Tabungan) —
          main <span className="text-couple font-semibold">solo atau berpasangan</span>.
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3">
          {[
            { icon: Droplets, label: 'Air = XP', tone: 'text-sky' },
            { icon: Sun, label: 'Matahari = Tabungan', tone: 'text-sun' },
            { icon: Gamepad2, label: '6 Mini Games', tone: 'text-growth' },
            { icon: HeartHandshake, label: 'Mode Pasangan', tone: 'text-couple' },
          ].map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="glass rounded-2xl px-3.5 py-3 flex items-center gap-2.5 text-left"
            >
              <f.icon className={`w-5 h-5 ${f.tone}`} />
              <span className="text-xs font-semibold">{f.label}</span>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={handleLogin}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className="mt-8 w-full glass-strong rounded-2xl px-5 py-4 flex items-center justify-center gap-3 font-semibold shadow-soft hover:shadow-glow transition-all disabled:opacity-70"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Memuat...
            </span>
          ) : (
            <>
              <GoogleIcon />
              Masuk dengan Google
            </>
          )}
        </motion.button>

        {error && (
          <p className="mt-4 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2.5">{error}</p>
        )}

        <p className="mt-6 text-[0.7rem] text-muted-foreground/70">
          Dengan masuk, kamu menumbuhkan pohon belajarmu sendiri 🌱
        </p>
      </motion.div>
    </div>
  )
}
