import { useState, useRef, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { QUIZ_BANK } from '@/data/quiz-bank'
import { sfx } from '@/lib/sound'
import { useCoopSession } from '@/lib/coop'
import AppShell from '@/layouts/AppShell'
import NavigationShell from '@/components/shared/NavigationShell'
import Button from '@/components/base/Button'
import './SpeedRoundPage.css'

const NAV_ITEMS = [
  { label: 'Beranda', to: '/dashboard', icon: '🏠' },
  { label: 'Profil', to: '/profile', icon: '👤' },
]

const ROUND_SECONDS = 60

function shuffledPool() {
  const arr = [...QUIZ_BANK, ...QUIZ_BANK]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function SpeedRoundPage() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.currentUser)
  const userData = useAuthStore((s) => s.userData)
  const partnerData = useAuthStore((s) => s.partnerData)
  const { recordActivity } = usePlayerStore()

  const me = currentUser?.uid
  const other = userData?.partnerUid
  const myName = userData?.displayName?.split(' ')[0] || 'Kamu'
  const otherName = partnerData?.displayName?.split(' ')[0] || 'Pasangan'

  const coop = useCoopSession('speed')

  const [mode, setMode] = useState(null)

  // Solo state
  const [phase, setPhase] = useState('intro')
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [pool, setPool] = useState([])
  const [qi, setQi] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [flash, setFlash] = useState('')
  const timerRef = useRef(null)

  // Refs to read latest values inside interval
  const timeLeftRef = useRef(ROUND_SECONDS)
  const phaseRef = useRef('intro')
  const scoreRef = useRef(0)

  const multiplier = Math.min(1 + Math.floor(combo / 3), 5)
  const current = pool[qi]
  const timePct = (timeLeft / ROUND_SECONDS) * 100

  function start() {
    sfx.click()
    const newPool = shuffledPool()
    setPool(newPool)
    setQi(0)
    setScore(0); scoreRef.current = 0
    setCombo(0)
    setBestCombo(0)
    setTimeLeft(ROUND_SECONDS); timeLeftRef.current = ROUND_SECONDS
    setPhase('playing'); phaseRef.current = 'playing'
    setAnswered(false)
    setFlash('')

    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1
      setTimeLeft(timeLeftRef.current)
      timeLeftRef.current <= 10 ? sfx.tickUrgent() : sfx.tick()
      if (timeLeftRef.current <= 0) endRound()
    }, 1000)
  }

  async function endRound() {
    clearInterval(timerRef.current)
    setPhase('finished'); phaseRef.current = 'finished'
    scoreRef.current > 0 ? sfx.win() : sfx.lose()
    const prevBest = userData?.speedHighScore || 0
    await recordActivity({
      speedHighScore: Math.max(prevBest, scoreRef.current),
      score: (userData?.score || 0) + scoreRef.current,
    })
  }

  function answer(i) {
    if (answered || phase !== 'playing') return
    setAnswered(true)
    const correct = i === current.a
    let newScore = score
    let newCombo = combo
    let newBestCombo = bestCombo

    if (correct) {
      newCombo = combo + 1
      newBestCombo = Math.max(bestCombo, newCombo)
      newScore = score + 10 * multiplier
      setCombo(newCombo)
      setBestCombo(newBestCombo)
      setScore(newScore); scoreRef.current = newScore
      setFlash('good')
      newCombo % 3 === 0 ? sfx.combo() : sfx.correct()
    } else {
      newCombo = 0
      setCombo(0)
      setFlash('bad')
      sfx.wrong()
    }

    setTimeout(() => {
      setFlash('')
      setAnswered(false)
      setQi((prev) => (prev + 1) % pool.length)
    }, 350)
  }

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  // Coop state
  const coopSession = coop?.session
  const isHost = coopSession?.hostId === me
  const coopCurrent = coopSession?.pool?.[coopSession?.qi]
  const coopMultiplier = Math.min(1 + Math.floor((coopSession?.combo || 0) / 3), 5)
  const coopTimePct = ((coopSession?.timeLeft ?? ROUND_SECONDS) / ROUND_SECONDS) * 100
  const [coopAnswered, setCoopAnswered] = useState(false)
  const [coopFlash, setCoopFlash] = useState('')
  const coopTimerRef = useRef(null)

  function stopCoopTimer() {
    if (coopTimerRef.current) {
      clearInterval(coopTimerRef.current)
      coopTimerRef.current = null
    }
  }

  useEffect(() => {
    return () => stopCoopTimer()
  }, [])

  useEffect(() => {
    if (!coop || !coopSession) return
    if (mode === 'coop' && coopSession.status === 'playing' && isHost && !coopTimerRef.current) {
      coopTimerRef.current = setInterval(async () => {
        if (!coopSession || coopSession.status !== 'playing') return stopCoopTimer()
        const t = coopSession.timeLeft - 1
        t <= 10 ? sfx.tickUrgent() : sfx.tick()
        if (t <= 0) {
          stopCoopTimer()
          sfx.lose()
          await coop.patchSession({ timeLeft: 0, status: 'finished' })
          await recordActivity({ score: (userData?.score || 0) + Math.floor((coopSession.score || 0) / 2) })
        } else {
          await coop.patchSession({ timeLeft: t })
        }
      }, 1000)
    }
    if (coopSession.status !== 'playing') stopCoopTimer()
  }, [coopSession?.status, coopSession?.hostId])

  async function startCoop() {
    sfx.click()
    await coop.createSession({
      pool: shuffledPool(), qi: 0, score: 0, combo: 0,
      bestCombo: 0, timeLeft: ROUND_SECONDS, status: 'playing', hostId: me,
    })
  }

  async function rematchCoop() {
    sfx.click()
    stopCoopTimer()
    await coop.endSession()
  }

  async function coopAnswer(i) {
    if (coopAnswered || !coopSession || coopSession.status !== 'playing') return
    setCoopAnswered(true)
    const qBefore = coopSession.qi
    const correct = i === coopCurrent.a
    const newCombo = correct ? (coopSession.combo || 0) + 1 : 0
    setCoopFlash(correct ? 'good' : 'bad')
    correct ? (newCombo % 3 === 0 ? sfx.combo() : sfx.correct()) : sfx.wrong()

    setTimeout(async () => {
      setCoopFlash('')
      setCoopAnswered(false)
      if (!coopSession || coopSession.qi !== qBefore || coopSession.status !== 'playing') return
      await coop.patchSession({
        qi: (qBefore + 1) % coopSession.pool.length,
        combo: newCombo,
        bestCombo: Math.max(coopSession.bestCombo || 0, newCombo),
        score: (coopSession.score || 0) + (correct ? 10 * coopMultiplier : 0),
      })
    }, 350)
  }

  function chooseMode(m) {
    sfx.click()
    setMode(m)
    if (m === 'coop') coop.watch?.()
  }

  function backToModeSelect() {
    sfx.click()
    stopCoopTimer()
    clearInterval(timerRef.current)
    setMode(null)
    setPhase('intro')
  }

  return (
    <AppShell navigation={<NavigationShell items={NAV_ITEMS} />}>
      <div className="speed-page">
        {/* Mode picker */}
        {!mode && (
          <div className="speed-mode-select">
            <div className="speed-header">
              <span className="speed-eyebrow">⚡ Speed Round</span>
              <h1 className="speed-title">Pilih Mode</h1>
            </div>
            <div className="speed-card speed-card--center">
              <p className="speed-hint">Main sendiri lawan waktu, atau balapan bareng {otherName}?</p>
              <div className="speed-btn-row">
                <Button variant="primary" block onClick={() => chooseMode('solo')}>
                  🧍 Solo<br /><span className="speed-btn-sub">Lawan waktu</span>
                </Button>
                <Button variant="secondary" block onClick={() => chooseMode('coop')}>
                  🤝 Bareng<br /><span className="speed-btn-sub">Balapan sama {otherName}</span>
                </Button>
              </div>
            </div>
            <Link to="/dashboard" className="speed-back-link" onClick={() => sfx.click()}>
              Kembali ke beranda
            </Link>
          </div>
        )}

        {/* Solo mode */}
        {mode === 'solo' && (
          <>
            {phase === 'intro' && (
              <div className="speed-card speed-card--center speed-card--padded">
                <div className="speed-emoji">⚡</div>
                <h2 className="speed-result-title">Speed Round Solo</h2>
                <p className="speed-hint">60 detik, jawab sebanyak mungkin.</p>
                <p className="speed-hint">3 jawaban benar beruntun = combo naik, poin makin gede!</p>
                <Button variant="primary" onClick={start}>Mulai!</Button>
                <button className="speed-back-link" onClick={backToModeSelect}>← Ganti mode</button>
              </div>
            )}

            {phase === 'playing' && (
              <div className={`speed-game flash-${flash}`}>
                <div className="speed-status-bar">
                  <span>⏱ {timeLeft}s</span>
                  <span>Skor: {score}</span>
                  <span className="speed-combo">Combo x{multiplier}</span>
                </div>
                <div className="speed-progress-bar">
                  <div
                    className="speed-progress-fill"
                    style={{ width: `${timePct}%`, background: timePct < 25 ? 'var(--state-error)' : 'var(--color-amber-500)' }}
                  />
                </div>
                <div className="speed-card">
                  <span className="speed-tag">{current?.tag}</span>
                  <div className="speed-question">{current?.q}</div>
                  {current?.opts?.map((opt, i) => (
                    <button key={i} className="speed-opt" onClick={() => answer(i)}>{opt}</button>
                  ))}
                </div>
              </div>
            )}

            {phase === 'finished' && (
              <div className="speed-card speed-card--center speed-card--padded">
                <div className="speed-emoji">🏁</div>
                <h2 className="speed-result-title">Waktu habis!</h2>
                <p className="speed-hint">
                  Skor: <strong>{score}</strong> · Combo terbaik: <strong>x{Math.min(1 + Math.floor(bestCombo / 3), 5)}</strong>
                </p>
                <div className="speed-btn-row">
                  <Button variant="secondary" onClick={backToModeSelect}>Ganti Mode</Button>
                  <Button variant="primary" onClick={start}>Main Lagi</Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Coop mode */}
        {mode === 'coop' && (
          <>
            {!coopSession ? (
              <div className="speed-card speed-card--center">
                <p className="speed-hint">Belum ada sesi jalan. Mulai, nanti {otherName} bisa langsung gabung dari HP-nya.</p>
                <Button variant="primary" block onClick={startCoop}>Mulai Sesi Bareng</Button>
                <button className="speed-back-link" onClick={backToModeSelect}>← Ganti mode</button>
              </div>
            ) : coopSession.status === 'finished' ? (
              <div className="speed-card speed-card--center speed-card--padded">
                <div className="speed-emoji">🏁</div>
                <h2 className="speed-result-title">Waktu habis!</h2>
                <p className="speed-hint">
                  Skor kalian berdua: <strong>{coopSession.score}</strong> · Combo terbaik: <strong>x{Math.min(1 + Math.floor((coopSession.bestCombo || 0) / 3), 5)}</strong>
                </p>
                <div className="speed-btn-row">
                  <Button variant="secondary" onClick={backToModeSelect}>Ganti Mode</Button>
                  <Button variant="primary" onClick={rematchCoop}>Main Lagi</Button>
                </div>
              </div>
            ) : (
              <div className={`speed-game flash-${coopFlash}`}>
                <div className="speed-status-bar">
                  <span>⏱ {coopSession.timeLeft}s</span>
                  <span>Skor bareng: {coopSession.score}</span>
                  <span className="speed-combo">Combo x{coopMultiplier}</span>
                </div>
                <div className="speed-progress-bar">
                  <div
                    className="speed-progress-fill"
                    style={{ width: `${coopTimePct}%`, background: coopTimePct < 25 ? 'var(--state-error)' : 'var(--color-amber-500)' }}
                  />
                </div>
                <p className="speed-coop-hint">Siapa cepat jawab benar, itu yang dapet poinnya!</p>
                <div className="speed-card">
                  <span className="speed-tag">{coopCurrent?.tag}</span>
                  <div className="speed-question">{coopCurrent?.q}</div>
                  {coopCurrent?.opts?.map((opt, i) => (
                    <button key={i} className="speed-opt" onClick={() => coopAnswer(i)}>{opt}</button>
                  ))}
                </div>
                <Link to="/dashboard" className="speed-back-link" onClick={() => sfx.click()}>Keluar</Link>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
