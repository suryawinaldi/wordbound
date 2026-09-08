import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { CEFR_LEVELS, questionsForLevel } from '@/data/quiz-bank'
import { sfx } from '@/lib/sound'
import { useCoopSession } from '@/lib/coop'
import AppShell from '@/layouts/AppShell'
import NavigationShell from '@/components/shared/NavigationShell'
import Button from '@/components/base/Button'
import './LevelTestPage.css'

const NAV_ITEMS = [
  { label: 'Beranda', to: '/dashboard', icon: '🏠' },
  { label: 'Profil', to: '/profile', icon: '👤' },
]

const PER_LEVEL = 3

function buildQueue(tally) {
  const q = []
  CEFR_LEVELS.forEach((lvl) => {
    tally[lvl] = 0
    const pool = questionsForLevel(lvl)
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, PER_LEVEL)
    shuffled.forEach((item) => q.push({ ...item, level: lvl }))
  })
  return q
}

function estimateFrom(tally) {
  let est = 'A1'
  for (const lvl of CEFR_LEVELS) {
    if ((tally[lvl] || 0) >= Math.ceil(PER_LEVEL * 0.6)) est = lvl
    else break
  }
  return est
}

export default function LevelTestPage() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const userData = useAuthStore((s) => s.userData)
  const partnerData = useAuthStore((s) => s.partnerData)
  const { recordActivity } = usePlayerStore()

  const me = currentUser?.uid
  const other = userData?.partnerUid
  const myName = userData?.displayName?.split(' ')[0] || 'Kamu'
  const otherName = partnerData?.displayName?.split(' ')[0] || 'Pasangan'

  const coop = useCoopSession('leveltest')

  const [mode, setMode] = useState(null)

  // Solo state
  const [phase, setPhase] = useState('intro')
  const [queue, setQueue] = useState([])
  const [idx, setIdx] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState(null)
  const [correctByLevel, setCorrectByLevel] = useState({})
  const [estimatedLevel, setEstimatedLevel] = useState('')

  const current = queue[idx]
  const progressPct = Math.round((idx / Math.max(queue.length, 1)) * 100)

  function start() {
    sfx.click()
    const tally = {}
    const q = buildQueue(tally)
    setQueue(q)
    setCorrectByLevel(tally)
    setIdx(0)
    setAnswered(false)
    setSelected(null)
    setPhase('playing')
  }

  function answer(i) {
    if (answered) return
    setAnswered(true)
    setSelected(i)
    const newTally = { ...correctByLevel }
    if (i === current.a) {
      newTally[current.level] = (newTally[current.level] || 0) + 1
      sfx.correct()
    } else {
      sfx.wrong()
    }
    setCorrectByLevel(newTally)
    setTimeout(() => {
      if (idx + 1 >= queue.length) {
        finish(newTally)
      } else {
        setIdx((p) => p + 1)
        setAnswered(false)
        setSelected(null)
      }
    }, 700)
  }

  async function finish(tally = correctByLevel) {
    const est = estimateFrom(tally)
    setEstimatedLevel(est)
    setPhase('result')
    sfx.win()
    await recordActivity({ cefrLevel: est })
  }

  // Coop state
  const coopSession = coop?.session
  const myTurn = coopSession?.turn === me
  const coopCurrent = coopSession?.queue?.[coopSession?.idx]
  const coopProgress = coopSession
    ? Math.round((coopSession.idx / coopSession.queue.length) * 100)
    : 0
  const myTally = coopSession?.correctByLevel?.[me] || {}
  const otherTally = coopSession?.correctByLevel?.[other] || {}
  const myEstimate = estimateFrom(myTally)
  const otherEstimate = estimateFrom(otherTally)

  const [coopAnswered, setCoopAnswered] = useState(false)
  const [coopSelected, setCoopSelected] = useState(null)
  const [savedMine, setSavedMine] = useState(false)

  // Save level when coop session finishes
  useEffect(() => {
    if (mode === 'coop' && coopSession?.status === 'finished' && !savedMine) {
      setSavedMine(true)
      recordActivity({ cefrLevel: myEstimate })
    }
  }, [coopSession?.status])

  async function startCoop() {
    sfx.click()
    const tallyTemplate = {}
    const q = buildQueue(tallyTemplate)
    setSavedMine(false)
    await coop.createSession({
      queue: q, idx: 0, turn: me, status: 'playing',
      correctByLevel: { [me]: { ...tallyTemplate }, [other]: { ...tallyTemplate } },
    })
  }

  async function rematchCoop() {
    sfx.click()
    setSavedMine(false)
    await coop.endSession()
  }

  async function coopAnswer(i) {
    if (coopAnswered || !myTurn || !coopSession) return
    setCoopAnswered(true)
    setCoopSelected(i)
    const sess = coopSession
    const q = coopCurrent
    const tally = { ...(sess.correctByLevel[me] || {}) }
    if (i === q.a) {
      tally[q.level] = (tally[q.level] || 0) + 1
      sfx.correct()
    } else {
      sfx.wrong()
    }
    setTimeout(async () => {
      const nextIdx = sess.idx + 1
      const isFinished = nextIdx >= sess.queue.length
      await coop.patchSession({
        idx: nextIdx, turn: other,
        status: isFinished ? 'finished' : 'playing',
        correctByLevel: { ...sess.correctByLevel, [me]: tally },
      })
      setCoopAnswered(false)
      setCoopSelected(null)
    }, 700)
  }

  function chooseMode(m) {
    sfx.click()
    setMode(m)
    if (m === 'coop') coop.watch?.()
  }

  function backToModeSelect() {
    sfx.click()
    setMode(null)
    setPhase('intro')
  }

  return (
    <AppShell navigation={<NavigationShell items={NAV_ITEMS} />}>
      <div className="leveltest-page">
        <div className="leveltest-header">
          <span className="leveltest-eyebrow">📈 Tes Level CEFR</span>
          <h1 className="leveltest-title">{mode ? 'Kamu ada di level mana?' : 'Pilih Mode'}</h1>
        </div>

        {/* Mode picker */}
        {!mode && (
          <div className="leveltest-card leveltest-card--center">
            <p className="leveltest-hint">
              Tes sendiri, atau bareng {otherName} gantian jawab — hasil level kalian tetap dihitung sendiri-sendiri.
            </p>
            <div className="leveltest-btn-row">
              <Button variant="primary" block onClick={() => chooseMode('solo')}>
                🧍 Solo<br /><span className="leveltest-btn-sub">Tes sendiri</span>
              </Button>
              <Button variant="secondary" block onClick={() => chooseMode('coop')}>
                🤝 Bareng<br /><span className="leveltest-btn-sub">Gantian sama {otherName}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Solo mode */}
        {mode === 'solo' && (
          <>
            {phase === 'intro' && (
              <div className="leveltest-card leveltest-card--center leveltest-card--padded">
                <p className="leveltest-hint">{CEFR_LEVELS.length * PER_LEVEL} soal, makin ke belakang makin susah (A1 → C2).</p>
                <p className="leveltest-hint">Di akhir, kamu dapat estimasi level CEFR kamu sekarang.</p>
                <Button variant="primary" onClick={start}>Mulai Tes</Button>
                <button className="leveltest-back-link" onClick={backToModeSelect}>← Ganti mode</button>
              </div>
            )}

            {phase === 'result' && (
              <div className="leveltest-card leveltest-card--center leveltest-card--padded">
                <div className="leveltest-emoji">🎓</div>
                <h2 className="leveltest-result-title">Level kamu: <span className="leveltest-level-badge">{estimatedLevel}</span></h2>
                <p className="leveltest-hint leveltest-hint--sm">Ini estimasi kasar berdasarkan tes singkat — makin sering latihan, makin akurat trackingnya.</p>
                <div className="leveltest-cefr-pills">
                  {CEFR_LEVELS.map((lvl) => (
                    <span
                      key={lvl}
                      className={`leveltest-cefr-pill ${lvl === estimatedLevel ? 'leveltest-cefr-pill--active' : ''}`}
                    >
                      {lvl}: {correctByLevel[lvl] || 0}/{PER_LEVEL}
                    </span>
                  ))}
                </div>
                <div className="leveltest-btn-row">
                  <Button variant="secondary" onClick={backToModeSelect}>Ganti Mode</Button>
                  <Button variant="primary" onClick={start}>Tes Ulang</Button>
                </div>
              </div>
            )}

            {phase === 'playing' && current && (
              <div className="leveltest-card">
                <div className="leveltest-progress-bar">
                  <div className="leveltest-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="leveltest-level-tag">{current.level}</span>
                <div className="leveltest-question">{current.q}</div>
                {current.opts.map((opt, i) => (
                  <button
                    key={i}
                    className={[
                      'leveltest-opt',
                      selected === i ? 'leveltest-opt--selected' : '',
                      answered && i === current.a ? 'leveltest-opt--correct' : '',
                      answered && selected === i && i !== current.a ? 'leveltest-opt--wrong' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => answer(i)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Coop mode */}
        {mode === 'coop' && (
          <>
            {!coopSession ? (
              <div className="leveltest-card leveltest-card--center">
                <p className="leveltest-hint">Belum ada sesi jalan. Mulai, nanti {otherName} bisa langsung gabung.</p>
                <Button variant="primary" block onClick={startCoop}>Mulai Sesi Bareng</Button>
                <button className="leveltest-back-link" onClick={backToModeSelect}>← Ganti mode</button>
              </div>
            ) : coopSession.status === 'finished' ? (
              <div className="leveltest-card leveltest-card--center leveltest-card--padded">
                <div className="leveltest-emoji">🎓</div>
                <h2 className="leveltest-result-title">Hasil Kalian Berdua</h2>
                <div className="leveltest-result-grid">
                  <div className="leveltest-result-pill">
                    <div className="leveltest-result-name">{myName} (kamu)</div>
                    <div className="leveltest-level-badge">{myEstimate}</div>
                  </div>
                  <div className="leveltest-result-pill">
                    <div className="leveltest-result-name">{otherName}</div>
                    <div className="leveltest-level-badge">{otherEstimate}</div>
                  </div>
                </div>
                <p className="leveltest-hint leveltest-hint--sm">Estimasi kasar dari tes bareng ini — jawabnya gantian, tapi levelnya dihitung sendiri-sendiri.</p>
                <div className="leveltest-btn-row">
                  <Button variant="secondary" onClick={backToModeSelect}>Ganti Mode</Button>
                  <Button variant="primary" onClick={rematchCoop}>Tes Ulang</Button>
                </div>
              </div>
            ) : coopCurrent ? (
              <div className="leveltest-card">
                <div className="leveltest-progress-bar">
                  <div className="leveltest-progress-fill" style={{ width: `${coopProgress}%` }} />
                </div>
                <div className={`leveltest-turn-badge ${myTurn ? 'leveltest-turn-badge--active' : ''}`}>
                  {myTurn ? 'Giliran kamu jawab' : `Giliran ${otherName}...`}
                </div>
                <span className="leveltest-level-tag">{coopCurrent.level}</span>
                <div className="leveltest-question">{coopCurrent.q}</div>

                {myTurn ? (
                  coopCurrent.opts.map((opt, i) => (
                    <button
                      key={i}
                      className={[
                        'leveltest-opt',
                        coopSelected === i ? 'leveltest-opt--selected' : '',
                        coopAnswered && i === coopCurrent.a ? 'leveltest-opt--correct' : '',
                        coopAnswered && coopSelected === i && i !== coopCurrent.a ? 'leveltest-opt--wrong' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => coopAnswer(i)}
                    >
                      {opt}
                    </button>
                  ))
                ) : (
                  <div className="leveltest-waiting">✋ Menunggu {otherName} jawab...</div>
                )}
              </div>
            ) : null}

            <Link to="/dashboard" className="leveltest-back-link" onClick={() => sfx.click()}>Keluar</Link>
          </>
        )}
      </div>
    </AppShell>
  )
}
