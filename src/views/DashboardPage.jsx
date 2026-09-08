import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { sfx } from '@/lib/sound'
import { autoLevelFromScore } from '@/data/listen-bank'
import AppShell from '@/layouts/AppShell'
import DashboardLayout from '@/layouts/DashboardLayout'
import NavigationShell from '@/components/shared/NavigationShell'
import Avatar from '@/components/base/Avatar'
import Badge from '@/components/base/Badge'
import Button from '@/components/base/Button'
import './DashboardPage.css'

export default function DashboardPage() {
  const navigate = useNavigate()
  const userData = useAuthStore((s) => s.userData)
  const partnerData = useAuthStore((s) => s.partnerData)

  const meData = useMemo(() => userData || {}, [userData])
  const otherData = useMemo(() => partnerData || {}, [partnerData])
  const me = useMemo(() => meData.displayName?.split(' ')[0] || 'Kamu', [meData])
  const other = useMemo(() => otherData.displayName?.split(' ')[0] || 'Pasangan', [otherData])

  // Data kedua pemain sudah di-watch secara global sejak login (lihat stores/auth.js),
  // jadi tetap live walau pindah-pindah halaman — tidak perlu di-refresh manual.

  function menuClick() {
    sfx.click()
  }

  const menu = useMemo(() => [
    { to: 'listen', icon: '🎧', title: 'Dengar & Tulis', desc: 'Solo atau balapan bareng — dengar kata/kalimat, lalu ketik atau pilih ganda' },
    { to: 'duel', icon: '⚔️', title: 'Wordle', desc: `Solo, atau duel lawan ${other}` },
  ], [other])

  // NavigationShell items point only at routes that actually exist today
  // (see router/index.js) — no placeholder destinations for pages not
  // built yet (Games Hub, Garden, Couple, etc. are later milestones).
  const navItems = useMemo(() => [
    { label: 'Beranda', to: '/dashboard' },
    { label: 'Dengar', to: '/listen' },
    { label: 'Wordle', to: '/duel' },
    { label: 'Rekor', to: '/stats' },
    { label: 'Profil', to: '/profile' },
  ], [])

  return (
    <AppShell
      navigation={
        <NavigationShell items={navItems}>
          <div className="dashboard-nav-player" onClick={() => navigate('/profile')}>
            <Avatar
              src={meData.photoURL}
              initials={me?.[0]}
              alt={me}
              size="sm"
              variant={meData.streak > 0 ? 'online' : 'default'}
            />
            <span className="dashboard-nav-player__name">{me}</span>
          </div>
        </NavigationShell>
      }
    >
      <DashboardLayout
        primary={
          <>
            {/* Header */}
            <div className="dashboard-header">
              <span className="dashboard-eyebrow">Halo, {me} 👋</span>
              <h1 className="dashboard-title">Siap belajar hari ini?</h1>
            </div>

            {/* Optional Partner Connection Card */}
            {!userData?.partnerUid && (
              <div className="partner-card" onClick={() => navigate('/couple-link')}>
                <div className="partner-card-content">
                  <h3 className="partner-card-title">Cari Pasangan Belajar 👩‍❤️‍👨</h3>
                  <p className="partner-card-desc">Hubungkan akunmu dengan pacar atau teman agar belajar jadi lebih seru!</p>
                </div>
                <Button variant="primary" className="partner-btn">Hubungkan</Button>
              </div>
            )}

            {/* Continue Learning (Hero Card) */}
            <div className="hero-card" onClick={() => { menuClick(); navigate('/listen') }}>
              <div className="hero-card-bg">🎧</div>
              <div className="hero-card-content">
                <span className="hero-card-badge">Lanjutkan Belajar</span>
                <h2 className="hero-card-title">Dengar &amp; Tulis</h2>
                <p className="hero-card-desc">Pertajam pendengaranmu. Dengar kata atau kalimat, lalu ketik jawabannya.</p>
                <Button className="hero-card-btn">Mulai Main</Button>
              </div>
            </div>

            {/* Games Grid */}
            <h3 className="games-header">Semua Permainan</h3>
            <div className="games-grid">
              {menu.map((item) => (
                <div
                  key={item.to}
                  onClick={() => { menuClick(); navigate('/' + item.to) }}
                  className="game-card"
                >
                  <div className="game-card-icon">{item.icon}</div>
                  <h4 className="game-card-title">{item.title}</h4>
                  <p className="game-card-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </>
        }
        secondary={
          /* Stats Sidebar */
          <div className="stats-sidebar">
            <h3 className="stats-header">Pencapaian</h3>

            <div className="stats-list">
              {/* My Stats */}
              <div className="stat-row">
                <Avatar
                  src={meData.photoURL}
                  initials={me?.[0]}
                  alt={me}
                  size="md"
                  variant={meData.streak > 0 ? 'online' : 'default'}
                />
                <div className="stat-info">
                  <p className="stat-name">{me} (Kamu)</p>
                  <div className="stat-badges">
                    <span className="stat-streak">🔥 {meData.streak || 0} hari</span>
                    <span className="stat-xp">✨ {meData.xp || 0} XP</span>
                  </div>
                </div>
                <Badge variant="primary">{autoLevelFromScore(meData.score) || 'A1'}</Badge>
              </div>

              {/* Partner Stats */}
              {userData?.partnerUid ? (
                <div className="stat-row">
                  <Avatar
                    src={otherData.photoURL}
                    initials={other?.[0]}
                    alt={other}
                    size="md"
                    variant={otherData.streak > 0 ? 'online' : 'default'}
                  />
                  <div className="stat-info">
                    <p className="stat-name">{other}</p>
                    <div className="stat-badges">
                      <span className="stat-streak">🔥 {otherData.streak || 0} hari</span>
                      <span className="stat-xp">✨ {otherData.xp || 0} XP</span>
                    </div>
                  </div>
                  <Badge variant="default">{autoLevelFromScore(otherData.score) || 'A1'}</Badge>
                </div>
              ) : (
                <div className="empty-partner">
                  <p className="empty-partner-desc">Belum ada teman bersaing.</p>
                  <Button variant="ghost" onClick={() => navigate('/couple-link')}>Undang Pasangan</Button>
                </div>
              )}
            </div>

            <hr className="stats-divider" />

            <Button variant="secondary" block className="stats-full-btn" onClick={() => navigate('/stats')}>
              🏅 Lihat Rekor Lengkap
            </Button>
          </div>
        }
      />
    </AppShell>
  )
}
