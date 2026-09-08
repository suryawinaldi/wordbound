import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { sfx } from '@/lib/sound'
import AppShell from '@/layouts/AppShell'
import DashboardLayout from '@/layouts/DashboardLayout'
import NavigationShell from '@/components/shared/NavigationShell'
import Avatar from '@/components/base/Avatar'
import Button from '@/components/base/Button'
import './ProfilePage.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const userData = useAuthStore((s) => s.userData)
  const currentUser = useAuthStore((s) => s.currentUser)
  const partnerData = useAuthStore((s) => s.partnerData)
  const logout = useAuthStore((s) => s.logout)
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const soundEnabled = useSettingsStore((s) => s.soundEnabled)
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled)

  const myName = useMemo(() => userData?.displayName || 'Unknown', [userData])
  const myPhoto = useMemo(() => currentUser?.photoURL, [currentUser])
  const myEmail = useMemo(() => currentUser?.email, [currentUser])
  const partnerName = useMemo(() => partnerData?.displayName || 'Belum Terhubung', [partnerData])

  const navItems = useMemo(() => [
    { label: 'Beranda', to: '/dashboard' },
    { label: 'Dengar', to: '/listen' },
    { label: 'Wordle', to: '/duel' },
    { label: 'Rekor', to: '/stats' },
    { label: 'Profil', to: '/profile' },
  ], [])

  async function handleLogout() {
    sfx.click()
    await logout()
    navigate('/')
  }

  return (
    <AppShell
      navigation={
        <NavigationShell items={navItems}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Avatar src={myPhoto} initials={myName[0]} size="sm" variant="online" />
            <span style={{ fontSize: 'var(--text-body-sm-size)', fontWeight: 'var(--font-weight-medium)' }}>
              {myName.split(' ')[0]}
            </span>
          </div>
        </NavigationShell>
      }
    >
      <DashboardLayout
        primary={
          <>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <span className="profile-eyebrow">Profil &amp; Pengaturan</span>
              <h1 style={{ fontSize: 'var(--text-display-sm-size)' }}>Akun Kamu</h1>
            </div>

            <div className="profile-card profile-card--center">
              <Avatar src={myPhoto} initials={myName[0]} size="xl" />
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: 'var(--text-heading-lg-size)', fontWeight: 'var(--font-weight-semibold)' }}>{myName}</h2>
                <p style={{ fontSize: 'var(--text-body-sm-size)', color: 'var(--text-secondary)' }}>{myEmail}</p>
              </div>
            </div>

            <div className="profile-card">
              <h3 style={{ fontSize: 'var(--text-heading-md-size)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>Pasangan</h3>
              <p style={{ fontSize: 'var(--text-body-sm-size)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                Terhubung dengan: <strong>{partnerName}</strong>
              </p>
              {!userData?.partnerUid && (
                <Button variant="primary" block onClick={() => navigate('/couple-link')}>
                  Hubungkan Pasangan
                </Button>
              )}
            </div>

            <div className="profile-card">
              <h3 style={{ fontSize: 'var(--text-heading-md-size)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>Pengaturan</h3>

              <div className="profile-setting-row profile-setting-row--bordered">
                <div>
                  <p style={{ fontWeight: 'var(--font-weight-medium)' }}>Tema Gelap</p>
                  <p style={{ fontSize: 'var(--text-caption-size)', color: 'var(--text-secondary)' }}>Ubah tampilan aplikasi</p>
                </div>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="profile-select"
                >
                  <option value="system">Otomatis</option>
                  <option value="light">Terang</option>
                  <option value="dark">Gelap</option>
                </select>
              </div>

              <div className="profile-setting-row">
                <div>
                  <p style={{ fontWeight: 'var(--font-weight-medium)' }}>Efek Suara</p>
                  <p style={{ fontSize: 'var(--text-caption-size)', color: 'var(--text-secondary)' }}>Suara tombol dan jawaban</p>
                </div>
                <label className="profile-toggle">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                  />
                  <div className="profile-toggle__track" data-checked={soundEnabled} />
                </label>
              </div>
            </div>

            <Button variant="ghost" block onClick={handleLogout} className="profile-logout-btn">
              Keluar dari Akun
            </Button>
          </>
        }
        secondary={<></>}
      />
    </AppShell>
  )
}
