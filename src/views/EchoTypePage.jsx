import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { echoWordsUpToLevel } from '@/data/echo-bank'
import { sfx, speak } from '@/lib/sound'
import AppShell from '@/layouts/AppShell'
import NavigationShell from '@/components/shared/NavigationShell'
import Button from '@/components/base/Button'
import './EchoTypePage.css'

const NAV_ITEMS = [
  { label: 'Beranda', to: '/dashboard', icon: '🏠' },
  { label: 'Profil', to: '/profile', icon: '👤' },
]

const ROUND_SIZE = 8

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[a.length][b.length]
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function EchoTypePage() {
  const userData = useAuthStore((s) => s.userData)
  const { recordActivity } = usePlayerStore()

  const myLevel = userData?.cefrLevel || 'B1'

  const [phase, setPhase] = useState('intro')
  const [pool, setPool] = useState([])
  const [qi, setQi] = useState(0)
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [lastResult, setLastResult] = useState(null)
  const [playsUsed, setPlaysUsed] = useState(0)

  const current = pool[qi]
  const progressPct = Math.round((qi / ROUND_SIZE) * 100)

  function start() {
    sfx.click()
    const words = shuffle(echoWordsUpToLevel(myLevel))
    const newPool = words.slice(0, ROUND_SIZE)
    setPool(newPool)
    setQi(0)
    setScore(0)
    setStreak(0)
    setPhase('playing')
    setPlaysUsed(0)
    setInput('')
    setLastResult(null)
    setTimeout(() => speak(newPool[0].word), 100)
  }

  function playCurrent() {
    sfx.click()
    setPlaysUsed((p) => p + 1)
    speak(current.word)
  }

  function submit() {
    if (!input.trim()) return
    const guess = input.trim().toLowerCase()
    const answer = current.word.toLowerCase()
    const dist = levenshtein(guess, answer)

    if (dist === 0) {
      setLastResult('correct')
      const bonus = playsUsed === 1 ? 15 : 10
      setScore((s) => s + bonus)
      setStreak((st) => {
        const newStreak = st + 1
        newStreak % 3 === 0 ? sfx.combo() : sfx.correct()
        return newStreak
      })
    } else if (dist <= 2) {
      setLastResult('close')
      setScore((s) => s + 4)
      setStreak(0)
      sfx.tick()
    } else {
      setLastResult('wrong')
      setStreak(0)
      sfx.wrong()
    }
    setPhase('reveal')
  }

  function next() {
    setInput('')
    setLastResult(null)
    setPlaysUsed(0)
    if (qi + 1 >= pool.length) {
      finish()
    } else {
      setQi(qi + 1)
      setPhase('playing')
      setTimeout(() => speak(pool[qi + 1].word), 100)
    }
  }

  async function finish() {
    setPhase('finished')
    score >= pool.length * 8 ? sfx.win() : sfx.lose()
    await recordActivity({ score: (userData?.score || 0) + score })
  }

  return (
    <AppShell navigation={<NavigationShell items={NAV_ITEMS} />}>
      <div className="echo-page">
        <div className="echo-header">
          <span className="echo-eyebrow">🎧 Echo Type</span>
          <h1 className="echo-title">Dengar, lalu ketik</h1>
        </div>

        {phase === 'intro' && (
          <div className="echo-card echo-card--center echo-card--padded">
            <p className="echo-hint">Aku akan mengucapkan kata Inggris pakai suara asli.</p>
            <p className="echo-hint">Dengarkan baik-baik, lalu ketik kata yang kamu dengar!</p>
            <p className="echo-level-note">Soal disesuaikan sekitar level <strong>{myLevel}</strong> kamu.</p>
            <Button variant="primary" onClick={start}>🔊 Mulai Dengarkan</Button>
            <Link to="/dashboard" className="echo-back-link">Batal</Link>
          </div>
        )}

        {phase === 'finished' && (
          <div className="echo-card echo-card--center echo-card--padded">
            <div className="echo-emoji">{score >= pool.length * 8 ? '🏆' : '🎧'}</div>
            <h2 className="echo-result-title">Selesai!</h2>
            <p className="echo-hint">Skor kamu: <strong>{score}</strong></p>
            <div className="echo-btn-row">
              <Button variant="secondary" onClick={() => { /* navigate */ }}>
                <Link to="/dashboard" className="echo-btn-link">Beranda</Link>
              </Button>
              <Button variant="primary" onClick={start}>Main Lagi</Button>
            </div>
          </div>
        )}

        {(phase === 'playing' || phase === 'reveal') && (
          <div>
            <div className="echo-progress-bar">
              <div className="echo-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>

            <div className="echo-card echo-card--center">
              <div className="echo-pills-row">
                <span className="echo-pill">Soal {qi + 1}/{pool.length}</span>
                <span className="echo-pill echo-pill--gold">Skor {score}</span>
                {streak > 1 && <span className="echo-pill echo-pill--glow">🔥 x{streak}</span>}
              </div>

              <div className="echo-speaker-wrap">
                <button className="echo-speaker-btn" onClick={playCurrent} title="Putar lagi">
                  🔊
                </button>
                <p className="echo-speaker-note">Tap untuk dengar ulang ({playsUsed}x diputar)</p>
              </div>

              {phase === 'playing' && (
                <>
                  <input
                    type="text"
                    autoComplete="off"
                    autoCapitalize="off"
                    placeholder="Ketik kata yang kamu dengar..."
                    className="echo-input"
                    value={input}
                    onChange={(e) => { setInput(e.target.value); sfx.tick() }}
                    onKeyUp={(e) => e.key === 'Enter' && submit()}
                  />
                  <Button variant="primary" block onClick={submit}>Cek Jawaban</Button>
                </>
              )}

              {phase === 'reveal' && (
                <>
                  <div className={`echo-result-box echo-result-box--${lastResult}`}>
                    <div className="echo-result-emoji">
                      {lastResult === 'correct' ? '✅' : lastResult === 'close' ? '🤏' : '❌'}
                    </div>
                    <p className="echo-result-word">{current?.word}</p>
                    <p className="echo-result-meaning">{current?.meaning}</p>
                    <p className="echo-result-your">Jawabanmu: "{input}"</p>
                  </div>
                  <Button variant="primary" block onClick={next} className="echo-next-btn">Lanjut →</Button>
                </>
              )}
            </div>

            <Link to="/dashboard" className="echo-back-link" onClick={() => sfx.click()}>Keluar</Link>
          </div>
        )}
      </div>
    </AppShell>
  )
}
