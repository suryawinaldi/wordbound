import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HelpCircle, Headphones, Swords, Zap, Repeat, GraduationCap, ArrowLeft, Grid, Brain } from 'lucide-react'
import GlassCard from '@/components/GlassCard'
import { sfx } from '@/lib/sound'

const GAMES = [
  { to: '/quiz', title: 'English Quiz', desc: 'Soal pilihan ganda seputar kosakata & grammar.', icon: HelpCircle, grad: 'from-growth to-sky', xp: '+20 XP', tag: 'Duo/Solo' },
  { to: '/listen', title: 'Listen & Type', desc: 'Dengarkan kalimat, lalu ketik ulang dengan tepat.', icon: Headphones, grad: 'from-sky to-couple', xp: '+25 XP', tag: 'Duo/Solo' },
  { to: '/ml-guess', title: 'Tebak Hero ML', desc: 'Tebak hero Mobile Legends dari petunjuk (clue).', icon: Swords, grad: 'from-couple to-sun', xp: '+50 XP', tag: 'Duo/Solo' },
  { to: '/rps', title: 'Suit Batu Gunting Kertas', desc: 'Duel adu hoki secara Real-Time dengan temanmu.', icon: Zap, grad: 'from-orange-500 to-rose-500', xp: '+15 XP', tag: 'Duo Real-Time' },
  { to: '/xoxo', title: 'XOXO Gomoku', desc: 'Main Tic-Tac-Toe versi hardcore (10x10). Sambung 5 menang!', icon: Repeat, grad: 'from-fuchsia-500 to-purple-500', xp: '+30 XP', tag: 'Duo Real-Time' },
  { to: '/wordle', title: 'Wordle Duel Racing', desc: 'Balapan menebak kata bahasa Inggris 5 huruf. Siapa cepat dia menang!', icon: Zap, grad: 'from-emerald-400 to-cyan-500', xp: '+40 XP', tag: 'Duo Real-Time' },
  { to: '/connect4', title: 'Connect 4', desc: 'Jatuhkan koinmu dan jejerkan 4 warna berturut-turut untuk menang.', icon: Grid, grad: 'from-blue-500 to-indigo-500', xp: '+30 XP', tag: 'Duo Real-Time' },
  { to: '/memory-match', title: 'Memory Match', desc: 'Uji ingatanmu! Balik kartu dan temukan pasangan kata bahasa Inggris.', icon: Brain, grad: 'from-amber-400 to-orange-500', xp: '+35 XP', tag: 'Duo Real-Time' },
]

export default function GamesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" onClick={() => sfx.click()} className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-muted/60">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Pilih Petualangan</h1>
          <p className="text-sm text-muted-foreground">Setiap game menumbuhkan pohonmu dengan Air (XP) ✨</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {GAMES.map((g, i) => {
          const Icon = g.icon
          return (
            <motion.div
              key={g.to}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="h-full"
            >
              <Link to={g.to} onClick={() => sfx.whoosh()} className="group relative block h-full rounded-3xl">
                {/* Gradient glow that blooms on hover */}
                <span className={`pointer-events-none absolute -inset-1 rounded-[1.6rem] bg-gradient-to-br ${g.grad} opacity-0 blur-xl transition-all duration-500 group-hover:opacity-40 group-hover:scale-105`} />
                <span className={`pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br ${g.grad} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} style={{ mixBlendMode: 'overlay' }} />

                <GlassCard className="relative p-5 h-full flex flex-col gap-4 overflow-hidden">
                  {/* Shimmer sweep on hover */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/10" />

                  <div className="relative flex items-start justify-between">
                    <motion.span
                      whileHover={{ rotate: [0, -12, 8, 0], scale: 1.12 }}
                      transition={{ duration: 0.6 }}
                      className={`grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br ${g.grad} text-white shadow-soft`}
                    >
                      <Icon className="w-7 h-7" strokeWidth={2.2} />
                    </motion.span>
                    <span className="text-[0.62rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
                      {g.tag}
                    </span>
                  </div>

                  <div className="relative flex-1">
                    <h3 className="font-display font-bold text-lg group-hover:text-primary transition-colors duration-300">{g.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{g.desc}</p>
                  </div>

                  <div className="relative flex items-center justify-between pt-1">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-growth/10 text-growth">{g.xp}</span>
                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition flex items-center gap-1">
                      Main
                      <span className="inline-block group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300">→</span>
                    </span>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
