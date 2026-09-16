import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth'
import { useAudioStore } from '@/stores/audio'
import { sfx } from '@/lib/sound'
import { Sparkles, Droplets, Sun, HeartHandshake, Gamepad2, User } from 'lucide-react'

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
  const loginAsGuest = useAuthStore((s) => s.loginAsGuest)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const toggleMute = useAudioStore((s) => s.toggleMute)
  const muted = useAudioStore((s) => s.muted)

  const [showGuestInput, setShowGuestInput] = useState(false)
  const [guestName, setGuestName] = useState('')

  async function handleGoogleLogin() {
    sfx.click()
    await loginWithGoogle()
  }

  async function handleGuestLogin() {
    if (!guestName.trim()) {
      sfx.wrong()
      return
    }
    sfx.click()
    await loginAsGuest(guestName.trim())
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
        className="text-center max-w-md relative z-10 w-full"
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
          className="mx-auto w-24 h-24 bg-gradient-to-tr from-primary to-sun rounded-3xl shadow-glow grid place-items-center mb-8 relative"
        >
          <div className="absolute inset-1 bg-background/20 rounded-2xl backdrop-blur-sm" />
          <Sparkles className="w-12 h-12 text-white relative z-10" />
        </motion.div>

        <h1 className="font-display font-black text-5xl tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">
          DuoBloom
        </h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-[16rem] mx-auto leading-relaxed">
          Tumbuh bersama, belajar bersama.
        </p>

        {showGuestInput ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <input 
              type="text" 
              placeholder="Ketik namamu..." 
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGuestLogin()}
              className="w-full glass-strong rounded-2xl px-5 py-4 font-semibold text-center outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
            <motion.button
              onClick={handleGuestLogin}
              disabled={loading || !guestName.trim()}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-primary text-primary-foreground rounded-2xl px-5 py-4 flex items-center justify-center gap-3 font-semibold shadow-soft hover:shadow-glow transition-all disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memuat...
                </span>
              ) : (
                <>Mulai Main</>
              )}
            </motion.button>
            <button onClick={() => setShowGuestInput(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Kembali
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <motion.button
              onClick={handleGoogleLogin}
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full glass-strong rounded-2xl px-5 py-4 flex items-center justify-center gap-3 font-semibold shadow-soft hover:shadow-glow transition-all disabled:opacity-70"
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
            
            <motion.button
              onClick={() => { sfx.click(); setShowGuestInput(true) }}
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full border border-border/50 bg-background/40 backdrop-blur-sm rounded-2xl px-5 py-3.5 flex items-center justify-center gap-2 font-semibold hover:bg-background/60 transition-all disabled:opacity-70 text-sm text-muted-foreground hover:text-foreground"
            >
              <User className="w-4 h-4" />
              Atau masuk sebagai Tamu
            </motion.button>
          </motion.div>
        )}

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
