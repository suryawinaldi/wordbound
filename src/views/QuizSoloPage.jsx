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
import './QuizSoloPage.css'

const NAV_ITEMS = [
  { label: 'Beranda', to: '/dashboard', icon: '🏠' },
  { label: 'Profil', to: '/profile', icon: '👤' },
]

const AUTO_SKIP_MS = 6500
const POSITIONS = ['6%', '32%', '58%', '80%']
const DELAYS = ['0s', '0.9s', '0.4s', '1.3s']

export default function QuizSoloPage() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.currentUser)
  const userData = useAuthStore((s) => s.userData)
  const partnerData = useAuthStore((s) => s.partnerData)
  const { recordActivity } = usePlayerStore()

  const me = currentUser?.uid
  const other = userData?.partnerUid
  const myName = userData?.displayName?.split(' ')[0] || 'Kamu'
  const otherName = partnerData?.displayName?.split(' ')[0] || 'Pasangan'

  const coop = useCoopSession('quiz')

  const [mode, setMode] = useState(null)
  const [idx, setIdx] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [finished, setFinished] = useState(false)
  const fieldRef = useRef(null)
  const [balloonStates, setBalloonStates] = useState({})
  const [confetti, setConfetti] = useState([])
  const [toast, setToast] = useState('')
  const autoSkipTimerRef = useRef(null)

  const [soloQuestions, setSoloQuestions] = useState([])
  const [soloScore, setSoloScore] = useState(0)

  const coopSession = coop?.session
  const current = mode === 'coop'
    ? coopSession?.questions?.[coopSession?.idx]
    : soloQuestions[idx]

  const totalQuestions = mode === 'coop'
    ? (coopSession?.questions?.length || 0)
    : soloQuestions.length

  const activeIdx = mode === 'coop' ? (coopSession?.idx || 0) : idx
  const progressPct = totalQuestions ? Math.round((activeIdx / totalQuestions) * 100) : 0
  const myTurn = mode !== 'coop' || coopSession?.turn === me

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  function spawnConfetti(x, y) {
    const colors = ['var(--color-amber-500)', 'var(--state-success)', 'var(--brand-primary)', 'var(--brand-secondary)']
    const newItems = []
    for (let i = 0; i < 10; i++) {
      const id = Math.random().toString(36).slice(2)
      newItems.push({
        id,
        left: x + (Math.random() * 40 - 20),
        top: y + (Math.random() * 20 - 10),
        color: colors[i % colors.length],
        round: Math.random() > 0.5,
      })
      setTimeout(() => {
        setConfetti((prev) => prev.filter((c) => c.id !== id))
      }, 900)
    }
    setConfetti((prev) => [...prev, ...newItems])
  }

  function clearAutoSkip() {
    if (autoSkipTimerRef.current) {
      clearTimeout(autoSkipTimerRef.current)
      autoSkipTimerRef.current = null
    }
  }

  function scheduleAutoSkip() {
    clearAutoSkip()
    autoSkipTimerRef.current = setTimeout(() => {
      handleAnswer(-1, null)
    }, AUTO_SKIP_MS)
  }

  useEffect(() => {
    return () => clearAutoSkip()
  }, [])

  function startSolo() {
    sfx.click()
    const questions = [...QUIZ_BANK].sort(() => Math.random() - 0.5).slice(0, 5)
    setSoloQuestions(questions)
    setIdx(0)
    setSoloScore(0)
    setFinished(false)
    setAnswered(false)
    setBalloonStates({})
    scheduleAutoSkip()
  }

  async function startCoop() {
    sfx.click()
    const questions = [...QUIZ_BANK].sort(() => Math.random() - 0.5).slice(0, 5)
    await coop.createSession({ questions, idx: 0, score: 0, turn: me, status: 'playing' })
  }

  async function rematchCoop() {
    sfx.click()
    await coop.endSession()
  }

  async function handleAnswer(i, event) {
    if (answered) return
    if (mode === 'coop' && !myTurn) return
    setAnswered(true)
    clearAutoSkip()

    const q = current
    if (!q) { setAnswered(false); return }

    const timedOut = i === -1
    const correct = !timedOut && i === q.a

    const newBalloonStates = { ...balloonStates }
    if (timedOut) {
      newBalloonStates[q.a] = 'glow'
      showToast('Waktu habis, lanjut ⏰')
      sfx.wrong()
    } else if (correct) {
      sfx.correct()
      if (event && fieldRef.current) {
        const rect = event.currentTarget.getBoundingClientRect()
        const fieldRect = fieldRef.current.getBoundingClientRect()
        newBalloonStates[i] = 'popped'
        spawnConfetti(rect.left - fieldRect.left + rect.width / 2, rect.top - fieldRect.top + rect.height / 2)
      }
      showToast('Betul! 🎉')
    } else {
      newBalloonStates[i] = 'sunk'
      newBalloonStates[q.a] = 'glow'
      showToast('Kurang tepat, ini jawabannya ✨')
      sfx.wrong()
    }
    setBalloonStates(newBalloonStates)

    await new Promise((r) => setTimeout(r, 1000))

    if (mode === 'coop') {
      const sess = coopSession
      const nextIdx = sess.idx + 1
      const isFinished = nextIdx >= sess.questions.length
      await coop.patchSession({
        idx: nextIdx,
        score: (sess.score || 0) + (correct ? 1 : 0),
        turn: other,
        status: isFinished ? 'finished' : 'playing',
      })
      setAnswered(false)
      setBalloonStates({})
      if (isFinished) {
        (sess.score + (correct ? 1 : 0)) >= sess.questions.length / 2 ? sfx.win() : sfx.lose()
      }
    } else {
      const newScore = soloScore + (correct ? 1 : 0)
      if (correct) setSoloScore(newScore)
      const nextIdx = idx + 1
      setIdx(nextIdx)
      setAnswered(false)
      setBalloonStates({})
      if (nextIdx >= soloQuestions.length) {
        setFinished(true)
        newScore >= soloQuestions.length / 2 ? sfx.win() : sfx.lose()
        await recordActivity({ score: (userData?.score || 0) + newScore, quizzes: (userData?.quizzes || 0) + 1 })
      } else {
        scheduleAutoSkip()
      }
    }
  }

  function chooseMode(m) {
    sfx.click()
    setMode(m)
    if (m === 'coop') coop.watch?.()
  }

  function backToModeSelect() {
    sfx.click()
    clearAutoSkip()
    setMode(null)
  }

  return (
    <AppShell navigation={<NavigationShell items={NAV_ITEMS} />}>
      <div className="quiz-page">

        {/* Mode picker */}
        {!mode && (
          <div className="quiz-mode-select">
            <div className="quiz-header">
              <span className="quiz-eyebrow">🎈 Kuis Solo</span>
              <h1 className="quiz-title">Pilih Mode</h1>
            </div>
            <div className="quiz-card quiz-card--center">
              <p className="quiz-hint">Main sendiri, atau bareng {otherName} gantian jawab?</p>
              <div className="quiz-btn-row">
                <Button variant="primary" block onClick={() => chooseMode('solo')}>
                  🧍 Solo<br /><span className="quiz-btn-sub">Main sendiri</span>
                </Button>
                <Button variant="secondary" block onClick={() => chooseMode('coop')}>
                  🤝 Bareng<br /><span className="quiz-btn-sub">Gantian sama {otherName}</span>
                </Button>
              </div>
            </div>
            <Link to="/dashboard" className="quiz-back-link" onClick={() => sfx.click()}>
              Kembali ke beranda
            </Link>
          </div>
        )}

        {/* Solo mode */}
        {mode === 'solo' && (
          <>
            {soloQuestions.length === 0 ? (
              <div className="quiz-card quiz-card--center">
                <p className="quiz-hint">5 soal vocab & grammar — pecahin balon jawaban yang benar 🎈</p>
                <Button variant="primary" block onClick={startSolo}>Mulai</Button>
              </div>
            ) : finished ? (
              <div className="quiz-card quiz-card--center quiz-card--result">
                <div className="quiz-result-emoji">{soloScore >= 4 ? '🏆' : soloScore >= 2 ? '👍' : '🌱'}</div>
                <h2 className="quiz-result-title">Selesai!</h2>
                <p className="quiz-hint">Skor kamu: <strong>{soloScore} / {soloQuestions.length}</strong></p>
                <div className="quiz-btn-row">
                  <Button variant="secondary" onClick={backToModeSelect}>Ganti Mode</Button>
                  <Button variant="primary" onClick={() => navigate('/dashboard')}>Ke Beranda</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="quiz-progress-bar">
                  <div className="quiz-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="quiz-tag">{current?.tag}</span>
                <div className="quiz-question">{current?.q}</div>
                <p className="quiz-balloon-hint">Pecahin balon dengan jawaban yang benar 🎈</p>

                <div ref={fieldRef} className="balloon-field">
                  {current?.opts?.map((opt, i) => (
                    <div
                      key={`${idx}-${i}`}
                      className={`balloon c${i % 4} ${balloonStates[i] || ''}`}
                      style={{ left: POSITIONS[i], animationDelay: `${DELAYS[i]}, ${DELAYS[i]}` }}
                      onClick={(e) => handleAnswer(i, e)}
                    >
                      {opt}
                    </div>
                  ))}
                  {confetti.map((c) => (
                    <div
                      key={c.id}
                      className="quiz-confetti"
                      style={{ left: c.left, top: c.top, background: c.color, borderRadius: c.round ? '50%' : '2px' }}
                    />
                  ))}
                </div>

                <Link to="/dashboard" className="quiz-back-link" onClick={() => sfx.click()}>
                  Keluar dari kuis
                </Link>
              </>
            )}
          </>
        )}

        {/* Coop mode */}
        {mode === 'coop' && (
          <>
            <div className="quiz-header">
              <span className="quiz-eyebrow">🤝 Main Bareng</span>
              <h1 className="quiz-title">{myName} & {otherName}</h1>
            </div>

            {!coopSession ? (
              <div className="quiz-card quiz-card--center">
                <p className="quiz-hint">Belum ada sesi jalan. Mulai, nanti {otherName} bisa langsung gabung dari HP-nya.</p>
                <Button variant="primary" block onClick={startCoop}>Mulai Sesi Bareng</Button>
              </div>
            ) : coopSession.status === 'finished' ? (
              <div className="quiz-card quiz-card--center quiz-card--result">
                <div className="quiz-result-emoji">{(coopSession.score >= coopSession.questions.length / 2) ? '🏆' : '🌱'}</div>
                <h2 className="quiz-result-title">Selesai!</h2>
                <p className="quiz-hint">Skor kalian berdua: <strong>{coopSession.score} / {coopSession.questions.length}</strong></p>
                <div className="quiz-btn-row">
                  <Button variant="secondary" onClick={backToModeSelect}>Ganti Mode</Button>
                  <Button variant="primary" onClick={rematchCoop}>Main Lagi</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="quiz-progress-bar">
                  <div className="quiz-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <div className={`quiz-turn-badge ${myTurn ? 'quiz-turn-badge--active' : ''}`}>
                  {myTurn ? 'Giliran kamu jawab' : `Giliran ${otherName}...`} · Skor bareng {coopSession.score}
                </div>
                <span className="quiz-tag">{current?.tag}</span>
                <div className="quiz-question">{current?.q}</div>

                <div ref={fieldRef} className={`balloon-field ${!myTurn ? 'balloon-field--disabled' : ''}`}>
                  {current?.opts?.map((opt, i) => (
                    <div
                      key={`${activeIdx}-${i}`}
                      className={`balloon c${i % 4} ${balloonStates[i] || ''}`}
                      style={{ left: POSITIONS[i], animationDelay: `${DELAYS[i]}, ${DELAYS[i]}` }}
                      onClick={(e) => myTurn && handleAnswer(i, e)}
                    >
                      {opt}
                    </div>
                  ))}
                  {confetti.map((c) => (
                    <div
                      key={c.id}
                      className="quiz-confetti"
                      style={{ left: c.left, top: c.top, background: c.color, borderRadius: c.round ? '50%' : '2px' }}
                    />
                  ))}
                </div>
                <Link to="/dashboard" className="quiz-back-link" onClick={() => sfx.click()}>Keluar dari kuis</Link>
              </>
            )}

            {!coopSession && (
              <button className="quiz-back-link" onClick={backToModeSelect}>← Ganti mode</button>
            )}
          </>
        )}

        {toast && <div className="quiz-toast">{toast}</div>}
      </div>
    </AppShell>
  )
}
