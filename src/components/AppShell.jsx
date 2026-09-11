import { Outlet, NavLink, useLocation, useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Gamepad2, HeartHandshake, BarChart3, User, LogOut, Volume2, VolumeX, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useAudioStore } from '@/stores/audio'
import { sfx } from '@/lib/sound'
import Aurora from './Aurora'

const NAV = [
  { to: '/dashboard', label: 'Beranda', icon: Home },
  { to: '/games', label: 'Games', icon: Gamepad2 },
  { to: '/couple-link', label: 'Pasangan', icon: HeartHandshake },
  { to: '/stats', label: 'Statistik', icon: BarChart3 },
  { to: '/profile', label: 'Profil', icon: User },
]

function Logo({ compact }) {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5 group">
      <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-growth to-sky grid place-items-center shadow-glow">
        <Sparkles className="w-5 h-5 text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-sun animate-glow-pulse" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="font-display font-extrabold tracking-tight text-[1.05rem]">DuoQuest</p>
          <p className="text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">Life Estate</p>
        </div>
      )}
    </Link>
  )
}

function NavItem({ item, onNavigate }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
          isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="nav-active"
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-growth to-sky shadow-glow"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <Icon className={`relative w-[1.15rem] h-[1.15rem] ${isActive ? 'text-white' : ''}`} />
          <span className="relative">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 safe-bottom">
      <div className="mx-auto max-w-md px-3 pb-3 pt-1">
        <div className="glass-strong rounded-3xl px-2 py-2 flex items-center justify-between shadow-soft">
          {NAV.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center gap-1 rounded-2xl px-3.5 py-2 transition-all ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="bottom-nav-active"
                        className="absolute inset-0 rounded-2xl bg-primary/12"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className="relative w-[1.25rem] h-[1.25rem]" />
                    <span className="relative text-[0.62rem] font-semibold">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.currentUser)
  const userData = useAuthStore((s) => s.userData)
  const logout = useAuthStore((s) => s.logout)
  const applySettings = useSettingsStore((s) => s.applyFromPlayerData)
  const muted = useAudioStore((s) => s.muted)
  const toggleMute = useAudioStore((s) => s.toggleMute)

  useEffect(() => {
    if (userData) applySettings(userData)
  }, [userData, applySettings])

  async function handleLogout() {
    sfx.click()
    await logout()
    navigate('/')
  }

  return (
    <div className="relative min-h-[100dvh]">
      <Aurora />

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col p-5 z-30">
        <div className="glass rounded-3xl flex-1 flex flex-col p-4 shadow-soft">
          <div className="px-1.5 py-2">
            <Logo />
          </div>
          <nav className="mt-6 flex flex-col gap-1">
            {NAV.map((item) => (
              <NavItem key={item.to} item={item} onNavigate={() => sfx.click()} />
            ))}
          </nav>
          <div className="mt-auto space-y-3">
            <button
              onClick={toggleMute}
              className="w-full flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
            >
              {muted ? <VolumeX className="w-[1.15rem] h-[1.15rem]" /> : <Volume2 className="w-[1.15rem] h-[1.15rem]" />}
              {muted ? 'Suara Mati' : 'Suara Aktif'}
            </button>
            <div className="glass rounded-2xl p-3 flex items-center gap-3">
              <img
                src={currentUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.displayName || 'WB'}`}
                alt=""
                className="w-9 h-9 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{currentUser?.displayName || 'Pemain'}</p>
                <p className="text-[0.65rem] text-muted-foreground truncate">Level {Math.max(1, Math.floor((userData?.xp || 0) / 100) + 1)}</p>
              </div>
              <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition p-1.5" title="Keluar">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 px-4 pt-4">
        <div className="glass-strong rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-soft">
          <Logo compact />
          <button onClick={toggleMute} className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition">
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="lg:pl-64 relative z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-28 lg:pb-10 pt-4 lg:pt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
