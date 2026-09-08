import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { sfx } from '@/lib/sound'
import { autoLevelFromScore } from '@/data/listen-bank'
import './StatsPage.css'

// Definisi badge — dievaluasi per orang, jadi tidak ada perbandingan "menang/kalah".
const BADGES = [
  { key: 'streak3', icon: '🔥', title: 'Mulai Panas', test: (p) => (p.streak || 0) >= 3 },
  { key: 'streak7', icon: '🌋', title: 'Seminggu Beruntun', test: (p) => (p.streak || 0) >= 7 },
  { key: 'streak30', icon: '💎', title: 'Sebulan Konsisten', test: (p) => (p.streak || 0) >= 30 },
  { key: 'listen50', icon: '🎧', title: 'Telinga Tajam', test: (p) => (p.listenCorrect || 0) >= 50 },
  { key: 'listen200', icon: '👂', title: 'Master Dengar', test: (p) => (p.listenCorrect || 0) >= 200 },
  { key: 'duel3', icon: '⚔️', title: 'Petarung Kata', test: (p) => (p.duelWins || 0) >= 3 },
  { key: 'solo3', icon: '🧩', title: 'Solois Wordle', test: (p) => (p.soloWordleWins || 0) >= 3 },
  { key: 'battle3', icon: '🏁', title: 'Juara Balapan', test: (p) => (p.listenBattleWins || 0) >= 3 },
  { key: 'levelC1', icon: '🎓', title: 'Level C1+', test: (p) => ['C1', 'C2'].includes(autoLevelFromScore(p.score)) },
]

function getPlayerCardData(userData) {
  if (!userData) return null
  const p = userData || {}
  const badges = BADGES.filter((b) => b.test(p))
  return { name: p.displayName?.split(' ')[0] || 'Unknown', p, badges }
}

function levelLabel(score) {
  return Math.floor((score || 0) / 100) + 1
}

export default function StatsPage() {
  const userData = useAuthStore((s) => s.userData)
  const partnerData = useAuthStore((s) => s.partnerData)

  const cards = useMemo(() => {
    const list = []
    if (userData) list.push(getPlayerCardData(userData))
    if (partnerData) list.push(getPlayerCardData(partnerData))
    return list
  }, [userData, partnerData])

  const together = useMemo(() => {
    const a = userData || {}
    const b = partnerData || {}
    return {
      combinedStreak: (a.streak || 0) + (b.streak || 0),
      totalListenCorrect: (a.listenCorrect || 0) + (b.listenCorrect || 0),
      totalDuels: (a.duelWins || 0) + (b.duelWins || 0),
    }
  }, [userData, partnerData])

  const me = userData?.displayName?.split(' ')[0] || 'Kamu'

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <span className="stats-eyebrow">🏆 Rekor &amp; Pencapaian</span>
        <h1 style={{ fontSize: 'var(--text-display-sm-size)' }}>Progres Kalian Berdua</h1>
        <p style={{ fontSize: 'var(--text-body-sm-size)', marginTop: 'var(--space-2)', color: '#B9C2C2' }}>
          Bukan lomba — ini rekor pribadi &amp; momen yang udah kalian capai bareng.
        </p>
      </div>

      {/* Bareng-bareng */}
      <div className="card together-card" style={{ marginBottom: 'var(--space-4)' }}>
        <h3 style={{ fontSize: 'var(--text-heading-md-size)', marginBottom: 'var(--space-3)', textAlign: 'center' }}>✨ Dicapai Bareng</h3>
        <div className="stats-together-grid">
          <div>
            <div style={{ fontSize: '1.5rem' }}>🔥</div>
            <div className="stats-together-number">{together.combinedStreak}</div>
            <div className="stats-together-label">total hari streak</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem' }}>🎧</div>
            <div className="stats-together-number">{together.totalListenCorrect}</div>
            <div className="stats-together-label">jawaban dengar benar</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem' }}>⚔️</div>
            <div className="stats-together-number">{together.totalDuels}</div>
            <div className="stats-together-label">duel dimainkan</div>
          </div>
        </div>
      </div>

      {/* Kartu per orang */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {cards.map((c) => (
          <div key={c.name} className="card player-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <h3 style={{
                fontSize: 'var(--text-heading-md-size)',
                color: c.name === 'Surya' ? 'var(--color-surya)' : 'var(--color-almira)',
              }}>
                {c.name}{c.name === me ? ' (kamu)' : ''}
              </h3>
              <span className="pill" style={{ background: 'var(--color-gold)', color: 'var(--color-ink)' }}>
                {autoLevelFromScore(c.p.score)}
              </span>
            </div>

            <div className="stats-player-grid">
              <div>🔥 Streak: <strong>{c.p.streak || 0}</strong></div>
              <div>⭐ Skor: <strong>{c.p.score || 0}</strong> (Lv.{levelLabel(c.p.score)})</div>
              <div>⚔️ Menang duel: <strong>{c.p.duelWins || 0}</strong></div>
              <div>🏁 Menang balapan: <strong>{c.p.listenBattleWins || 0}</strong></div>
            </div>

            {c.badges.length > 0 ? (
              <div className="badge-row">
                {c.badges.map((b) => (
                  <span key={b.key} className="badge" title={b.title}>
                    {b.icon} <span style={{ fontSize: '10px' }}>{b.title}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 'var(--text-caption-size)', color: '#8a8578' }}>Belum ada badge — ayo main lagi! 🌱</p>
            )}
          </div>
        ))}
      </div>

      <Link to="/dashboard" className="stats-back-link" onClick={() => sfx.click()}>
        Kembali ke beranda
      </Link>
    </>
  )
}
