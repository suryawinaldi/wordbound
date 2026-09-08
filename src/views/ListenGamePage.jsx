import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase-config'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { sfx, speak } from '@/lib/sound'
import { autoLevelFromScore, buildPool, buildChoices, judgeTyped } from '@/data/listen-bank'
import './ListenGamePage.css'

const ROUND_SIZE = 8

export default function ListenGamePage() {
  const userData = useAuthStore((s) => s.userData)
  const partnerData = useAuthStore((s) => s.partnerData)
  const currentUser = useAuthStore((s) => s.currentUser)
  const playerStore = usePlayerStore()
  const me = currentUser?.uid
  const other = userData?.partnerUid
  const myName = userData?.displayName?.split(' ')[0] || 'Kamu'
  const otherName = partnerData?.displayName?.split(' ')[0] || 'Pasangan'

  const myScore = useMemo(() => userData?.score || 0, [userData])
  const myLevel = useMemo(() => autoLevelFromScore(myScore), [myScore])

  // step: 'setup' -> 'solo' | 'battle'
  const [step, setStep] = useState('setup')
  const [mainMode, setMainMode] = useState('solo') // 'solo' | 'battle'
  const [contentType, setContentType] = useState('word') // 'word' | 'sentence'
  const [answerMode, setAnswerMode] = useState('type') // 'type' | 'choice'

  function pointsFor(result, plays) {
    if (result === 'correct') return plays === 1 ? 15 : 10
    if (result === 'close') return 4
    return 0
  }

  function goSetup() {
    sfx.click()
    setStep('setup')
  }

  /* ==================== SOLO ==================== */
  const [soloPhase, setSoloPhase] = useState('intro') // intro | playing | reveal | finished
  const [soloPool, setSoloPool] = useState([])
  const [soloQi, setSoloQi] = useState(0)
  const [soloInput, setSoloInput] = useState('')
  const [soloChoices, setSoloChoices] = useState([])
  const [soloPickedIdx, setSoloPickedIdx] = useState(null)
  const [soloScore, setSoloScore] = useState(0)
  const [soloCorrectCount, setSoloCorrectCount] = useState(0)
  const [soloStreak, setSoloStreak] = useState(0)
  const [soloLastResult, setSoloLastResult] = useState(null)
  const [soloPlays, setSoloPlays] = useState(0)

  const soloCurrent = useMemo(() => soloPool[soloQi], [soloPool, soloQi])
  const soloProgressPct = useMemo(() => Math.round((soloQi / ROUND_SIZE) * 100), [soloQi])

  function startSolo() {
    sfx.click()
    setMainMode('solo')
    const pool = buildPool(contentType, myLevel, ROUND_SIZE)
    setSoloPool(pool)
    setSoloQi(0)
    setSoloScore(0)
    setSoloCorrectCount(0)
    setSoloStreak(0)
    setSoloPlays(0)
    setStep('solo')
    setSoloPhase('playing')
    // prepSoloQuestion runs after pool is set via effect
    // We call playSolo after state updates, so we defer it
    setTimeout(() => {
      sfx.click()
      setSoloPlays(1)
      // speak is called in playSoloWith
    }, 0)
  }

  function prepSoloQuestion(pool, qi, mode) {
    setSoloInput('')
    setSoloPickedIdx(null)
    setSoloPlays(0)
    if (mode === 'choice' && pool[qi]) {
      setSoloChoices(buildChoices(contentType, pool[qi]))
    }
  }

  function playSolo() {
    if (!soloCurrent) return
    sfx.click()
    setSoloPlays((p) => p + 1)
    speak(soloCurrent.text)
  }

  function submitSoloType() {
    if (!soloInput.trim()) return
    applySoloResult(judgeTyped(contentType, soloInput, soloCurrent.text))
  }

  function submitSoloChoice(idx) {
    if (soloPickedIdx !== null) return
    setSoloPickedIdx(idx)
    const picked = soloChoices[idx]
    applySoloResult(picked.text === soloCurrent.text ? 'correct' : 'wrong')
  }

  function applySoloResult(result) {
    setSoloLastResult(result)
    const bonus = pointsFor(result, soloPlays)
    setSoloScore((s) => s + bonus)
    if (result === 'correct') {
      setSoloCorrectCount((c) => c + 1)
      setSoloStreak((streak) => {
        const next = streak + 1
        next % 3 === 0 ? sfx.combo() : sfx.correct()
        return next
      })
    } else if (result === 'close') {
      setSoloStreak(0)
      sfx.tick()
    } else {
      setSoloStreak(0)
      sfx.wrong()
    }
    setSoloPhase('reveal')
  }

  function nextSolo() {
    if (soloQi + 1 >= soloPool.length) {
      finishSolo()
    } else {
      const nextQi = soloQi + 1
      setSoloQi(nextQi)
      setSoloPhase('playing')
      prepSoloQuestion(soloPool, nextQi, answerMode)
      setTimeout(() => speak(soloPool[nextQi]?.text), 0)
    }
  }

  async function finishSolo() {
    setSoloPhase('finished')
    soloScore >= soloPool.length * 8 ? sfx.win() : sfx.lose()
    await playerStore.recordActivity({
      score: (userData?.score || 0) + soloScore,
      listenCorrect: (userData?.listenCorrect || 0) + soloCorrectCount,
    })
  }

  /* ==================== BATTLE (balapan real-time) ==================== */
  const BATTLE_DOC = useMemo(() => doc(db, 'listenbattles', 'current'), [])
  const [battle, setBattle] = useState(null)
  const battleUnsubRef = useRef(null)

  const [battlePhase, setBattlePhase] = useState('lobby') // lobby | playing | finished
  const [battleQi, setBattleQi] = useState(0)
  const [battleInput, setBattleInput] = useState('')
  const [battleChoices, setBattleChoices] = useState([])
  const [battlePickedIdx, setBattlePickedIdx] = useState(null)
  const [battleScore, setBattleScore] = useState(0)
  const [battleCorrectCount, setBattleCorrectCount] = useState(0)
  const [battlePlays, setBattlePlays] = useState(0)
  const [battleLastResult, setBattleLastResult] = useState(null)
  const [battleFinished, setBattleFinished] = useState(false)
  const [battleSavedResult, setBattleSavedResult] = useState(false)

  const battlePool = useMemo(() => battle?.pool || [], [battle])
  const battleCurrent = useMemo(() => battlePool[battleQi], [battlePool, battleQi])
  const myBattleProgress = useMemo(() => battle?.players?.[me] || { qi: 0, score: 0, correct: 0, finished: false }, [battle, me])
  const otherBattleProgress = useMemo(() => battle?.players?.[other] || { qi: 0, score: 0, correct: 0, finished: false }, [battle, other])
  const bothFinished = useMemo(() => !!(battle && myBattleProgress.finished && otherBattleProgress.finished), [battle, myBattleProgress, otherBattleProgress])

  function watchBattle() {
    if (battleUnsubRef.current) return
    battleUnsubRef.current = onSnapshot(BATTLE_DOC, (snap) => {
      setBattle(snap.exists() ? snap.data() : null)
    })
  }

  function stopWatchBattle() {
    if (battleUnsubRef.current) {
      battleUnsubRef.current()
      battleUnsubRef.current = null
    }
  }

  async function createBattle() {
    sfx.click()
    const pool = buildPool(contentType, myLevel, ROUND_SIZE)
    await setDoc(BATTLE_DOC, {
      contentType,
      answerMode,
      pool,
      status: 'playing',
      createdBy: me,
      players: {
        Surya: { qi: 0, score: 0, correct: 0, finished: false },
        Almira: { qi: 0, score: 0, correct: 0, finished: false },
      },
    })
    enterBattlePlay()
  }

  function joinBattle() {
    sfx.click()
    enterBattlePlay()
  }

  function enterBattlePlay() {
    setBattleQi(0)
    setBattleScore(0)
    setBattleCorrectCount(0)
    setBattleFinished(false)
    setBattleSavedResult(false)
    setStep('battle')
    setBattlePhase('playing')
  }

  function prepBattleQuestion(bBattle, qi) {
    setBattleInput('')
    setBattlePickedIdx(null)
    setBattlePlays(0)
    if (bBattle?.answerMode === 'choice' && bBattle?.pool?.[qi]) {
      setBattleChoices(buildChoices(bBattle.contentType, bBattle.pool[qi]))
    }
  }

  function playBattle() {
    if (!battleCurrent) return
    sfx.click()
    setBattlePlays((p) => p + 1)
    speak(battleCurrent.text)
  }

  function submitBattleType() {
    if (!battleInput.trim()) return
    applyBattleResult(judgeTyped(battle.contentType, battleInput, battleCurrent.text))
  }

  function submitBattleChoice(idx) {
    if (battlePickedIdx !== null) return
    setBattlePickedIdx(idx)
    const picked = battleChoices[idx]
    applyBattleResult(picked.text === battleCurrent.text ? 'correct' : 'wrong')
  }

  async function applyBattleResult(result) {
    setBattleLastResult(result)
    const bonus = pointsFor(result, battlePlays)
    const newScore = battleScore + bonus
    let newCorrect = battleCorrectCount
    if (result === 'correct') {
      newCorrect += 1
      setBattleCorrectCount(newCorrect)
      sfx.correct()
    } else if (result === 'close') {
      sfx.tick()
    } else {
      sfx.wrong()
    }
    setBattleScore(newScore)
    setBattlePhase('reveal')
    await patchMyBattleProgress({ qi: battleQi + 1, score: newScore, correct: newCorrect })
  }

  async function patchMyBattleProgress(patch) {
    await setDoc(BATTLE_DOC, { players: { [me]: patch } }, { merge: true })
  }

  async function nextBattle() {
    if (battleQi + 1 >= battlePool.length) {
      await finishBattle()
    } else {
      const nextQi = battleQi + 1
      setBattleQi(nextQi)
      setBattlePhase('playing')
      prepBattleQuestion(battle, nextQi)
      setTimeout(() => speak(battle?.pool?.[nextQi]?.text), 0)
    }
  }

  async function finishBattle() {
    setBattlePhase('finished')
    setBattleFinished(true)
    sfx.win()
    await patchMyBattleProgress({ qi: battlePool.length, score: battleScore, correct: battleCorrectCount, finished: true })
  }

  async function saveBattleResult(won) {
    if (battleSavedResult) return
    setBattleSavedResult(true)
    await playerStore.recordActivity({
      score: (userData?.score || 0) + battleScore,
      listenCorrect: (userData?.listenCorrect || 0) + battleCorrectCount,
      listenBattleWins: (userData?.listenBattleWins || 0) + (won ? 1 : 0),
    })
  }

  async function rematchBattle() {
    sfx.click()
    await deleteDoc(BATTLE_DOC)
    setBattle(null)
    setBattlePhase('lobby')
  }

  function leaveBattleLobby() {
    sfx.click()
    stopWatchBattle()
    setStep('setup')
  }

  const battleWinner = useMemo(() => {
    if (!bothFinished) return null
    const mine = myBattleProgress
    const theirs = otherBattleProgress
    if (mine.score === theirs.score) {
      if (mine.correct === theirs.correct) return 'draw'
      return mine.correct > theirs.correct ? me : other
    }
    return mine.score > theirs.score ? me : other
  }, [bothFinished, myBattleProgress, otherBattleProgress, me, other])

  // Save battle result when both finish
  useEffect(() => {
    if (bothFinished && battleWinner) {
      saveBattleResult(battleWinner === me)
    }
  }, [bothFinished, battleWinner])

  function chooseMainMode(m) {
    sfx.click()
    setMainMode(m)
    if (m === 'battle') watchBattle()
  }

  // Cleanup Firestore listener on unmount
  useEffect(() => {
    return () => stopWatchBattle()
  }, [])

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
        <span className="eyebrow">🎧 Dengar &amp; Tulis</span>
        {step === 'setup' && <h1 style={{ fontSize: 'var(--text-display-sm-size)' }}>Atur Rondemu</h1>}
        {step === 'solo' && <h1 style={{ fontSize: 'var(--text-display-sm-size)' }}>Mode Solo</h1>}
        {step === 'battle' && (
          <h1 style={{ fontSize: 'var(--text-display-sm-size)' }}>
            {myName} <span style={{ fontSize: 'var(--text-body-lg-size)', color: '#B9C2C2' }}>vs</span> {otherName}
          </h1>
        )}
      </div>

      {/* ===================== SETUP WIZARD ===================== */}
      {step === 'setup' && (
        <div className="card setup-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-5)' }}>
            <span className="pill" style={{ background: 'var(--color-gold)', color: 'var(--color-ink)' }}>Level otomatis: {myLevel}</span>
          </div>

          <div className="setup-block">
            <p className="setup-label">1. Apa yang mau kamu dengar?</p>
            <div className="choice-row">
              <button className={`choice-btn${contentType === 'word' ? ' active' : ''}`} onClick={() => { sfx.click(); setContentType('word') }}>
                <span style={{ fontSize: '1.25rem' }}>🔤</span><span>Per Kata</span>
              </button>
              <button className={`choice-btn${contentType === 'sentence' ? ' active' : ''}`} onClick={() => { sfx.click(); setContentType('sentence') }}>
                <span style={{ fontSize: '1.25rem' }}>📝</span><span>Per Kalimat</span>
              </button>
            </div>
          </div>

          <div className="setup-block">
            <p className="setup-label">2. Cara jawabnya?</p>
            <div className="choice-row">
              <button className={`choice-btn${answerMode === 'type' ? ' active' : ''}`} onClick={() => { sfx.click(); setAnswerMode('type') }}>
                <span style={{ fontSize: '1.25rem' }}>⌨️</span><span>Ketik Sendiri</span>
              </button>
              <button className={`choice-btn${answerMode === 'choice' ? ' active' : ''}`} onClick={() => { sfx.click(); setAnswerMode('choice') }}>
                <span style={{ fontSize: '1.25rem' }}>🔘</span><span>Pilihan Ganda</span>
              </button>
            </div>
          </div>

          <div className="setup-block">
            <p className="setup-label">3. Main sendiri atau balapan?</p>
            <div className="choice-row">
              <button className={`choice-btn${mainMode === 'solo' ? ' active' : ''}`} onClick={() => chooseMainMode('solo')}>
                <span style={{ fontSize: '1.25rem' }}>🧍</span><span>Solo</span>
              </button>
              <button className={`choice-btn${mainMode === 'battle' ? ' active' : ''}`} onClick={() => chooseMainMode('battle')}>
                <span style={{ fontSize: '1.25rem' }}>🏁</span><span>Balapan vs {otherName}</span>
              </button>
            </div>
          </div>

          {mainMode === 'solo' ? (
            <button className="btn btn-primary w-full mt-2" onClick={startSolo}>🔊 Mulai Dengarkan</button>
          ) : (
            <>
              {!battle ? (
                <div className="lobby-box" style={{ marginTop: 'var(--space-2)' }}>
                  <p style={{ fontSize: 'var(--text-body-sm-size)', marginBottom: 'var(--space-3)', textAlign: 'center', color: '#6b675c' }}>
                    Belum ada balapan jalan. Mulai sekarang — {otherName} bisa langsung gabung dari HP-nya dengan pengaturan yang sama.
                  </p>
                  <button className="btn btn-primary w-full" onClick={createBattle}>🏁 Mulai Balapan Baru</button>
                </div>
              ) : battle.status === 'playing' && !myBattleProgress.finished ? (
                <div className="lobby-box" style={{ marginTop: 'var(--space-2)' }}>
                  <p style={{ fontSize: 'var(--text-body-sm-size)', marginBottom: 'var(--space-3)', textAlign: 'center', color: '#6b675c' }}>
                    Ada balapan jalan ({battle.contentType === 'sentence' ? 'Kalimat' : 'Kata'} · {battle.answerMode === 'choice' ? 'Pilihan Ganda' : 'Ketik Sendiri'}), dibuat oleh {battle.createdBy}.
                  </p>
                  <button className="btn btn-primary w-full" onClick={joinBattle}>🏁 Gabung &amp; Mulai</button>
                </div>
              ) : (
                <div className="lobby-box" style={{ marginTop: 'var(--space-2)', textAlign: 'center' }}>
                  <p style={{ fontSize: 'var(--text-body-sm-size)', marginBottom: 'var(--space-3)', color: '#6b675c' }}>
                    Balapan sebelumnya masih menunggu {otherName} selesai.
                  </p>
                  <button className="btn btn-outline w-full" onClick={rematchBattle}>Hapus &amp; Buat Baru</button>
                </div>
              )}
            </>
          )}

          <Link to="/dashboard" className="block text-center text-sm mt-4 underline" style={{ color: '#9aa4a4' }} onClick={() => sfx.click()}>
            Kembali ke beranda
          </Link>
        </div>
      )}

      {/* ===================== SOLO PLAY ===================== */}
      {step === 'solo' && (
        <>
          {soloPhase === 'finished' ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>{soloScore >= soloPool.length * 8 ? '🏆' : '🎧'}</div>
              <h2 style={{ fontSize: 'var(--text-display-sm-size)' }}>Selesai!</h2>
              <p style={{ margin: 'var(--space-3) 0', color: '#6b675c' }}>Skor kamu: <strong>{soloScore}</strong> · Benar {soloCorrectCount}/{soloPool.length}</p>
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={goSetup}>Ganti Pengaturan</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={startSolo}>Main Lagi</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: soloProgressPct + '%' }} />
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)', flexWrap: 'wrap' }}>
                  <span className="pill">Soal {soloQi + 1}/{soloPool.length}</span>
                  <span className="pill" style={{ color: 'var(--color-gold)' }}>Skor {soloScore}</span>
                  {soloStreak > 1 && <span className="pill glow-gold">🔥 x{soloStreak}</span>}
                </div>
                <div className="speaker-wrap" style={{ margin: 'var(--space-6) 0' }}>
                  <button className="speaker-btn" onClick={playSolo} title="Putar lagi">🔊</button>
                  <p style={{ fontSize: 'var(--text-caption-size)', marginTop: 'var(--space-2)', color: '#8a8578' }}>Tap untuk dengar ulang ({soloPlays}x diputar)</p>
                </div>

                {soloPhase === 'playing' ? (
                  answerMode === 'type' ? (
                    <>
                      <input
                        value={soloInput}
                        onChange={(e) => setSoloInput(e.target.value)}
                        type="text"
                        autoComplete="off"
                        autoCapitalize="off"
                        placeholder={contentType === 'sentence' ? 'Ketik kalimat yang kamu dengar...' : 'Ketik kata yang kamu dengar...'}
                        className="listen-input"
                        onKeyUp={(e) => e.key === 'Enter' && submitSoloType()}
                        onKeyDown={() => sfx.tick()}
                      />
                      <button className="btn btn-primary w-full" onClick={submitSoloType}>Cek Jawaban</button>
                    </>
                  ) : (
                    <div className="choice-grid">
                      {soloChoices.map((c, i) => (
                        <button key={i} className="mc-btn" onClick={() => submitSoloChoice(i)}>{c.text}</button>
                      ))}
                    </div>
                  )
                ) : (
                  <>
                    <div className={`result-box ${soloLastResult}`}>
                      <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-1)' }}>
                        {soloLastResult === 'correct' ? '✅' : soloLastResult === 'close' ? '🤏' : '❌'}
                      </div>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-heading-md-size)', marginBottom: 'var(--space-1)' }}>{soloCurrent?.text}</p>
                      <p style={{ fontSize: 'var(--text-body-sm-size)', marginBottom: 'var(--space-1)', color: '#6b675c' }}>{soloCurrent?.meaning}</p>
                      {answerMode === 'type'
                        ? <p style={{ fontSize: 'var(--text-caption-size)', color: '#8a8578' }}>Jawabanmu: "{soloInput}"</p>
                        : <p style={{ fontSize: 'var(--text-caption-size)', color: '#8a8578' }}>Pilihanmu: "{soloChoices[soloPickedIdx]?.text}"</p>
                      }
                    </div>
                    <button className="btn btn-primary w-full" style={{ marginTop: 'var(--space-4)' }} onClick={nextSolo}>Lanjut →</button>
                  </>
                )}
              </div>
              <a className="block text-center text-sm" style={{ marginTop: 'var(--space-3)', textDecoration: 'underline', cursor: 'pointer', color: '#9aa4a4' }} onClick={goSetup}>← Keluar</a>
            </div>
          )}
        </>
      )}

      {/* ===================== BATTLE PLAY ===================== */}
      {step === 'battle' && (
        <>
          {bothFinished ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>{battleWinner === 'draw' ? '🤝' : battleWinner === me ? '🏆' : '🎧'}</div>
              <h2 style={{ fontSize: 'var(--text-display-sm-size)' }}>
                {battleWinner === 'draw' ? 'Seri!' : battleWinner === me ? 'Kamu menang!' : `${other} menang!`}
              </h2>
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)', marginBottom: 'var(--space-2)' }}>
                <div className="race-result-card" style={{ boxShadow: battleWinner === me ? '0 0 0 2px var(--color-gold) inset' : 'none' }}>
                  <div style={{ fontSize: 'var(--text-caption-size)', fontWeight: 'var(--font-weight-semibold)', color: '#8a8578' }}>{myName} (kamu)</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 'var(--font-weight-semibold)', margin: 'var(--space-1) 0' }}>{myBattleProgress.score}</div>
                  <div style={{ fontSize: 'var(--text-caption-size)', color: '#8a8578' }}>Benar {myBattleProgress.correct}/{battlePool.length}</div>
                </div>
                <div className="race-result-card" style={{ boxShadow: battleWinner === other ? '0 0 0 2px var(--color-gold) inset' : 'none' }}>
                  <div style={{ fontSize: 'var(--text-caption-size)', fontWeight: 'var(--font-weight-semibold)', color: '#8a8578' }}>{otherName}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 'var(--font-weight-semibold)', margin: 'var(--space-1) 0' }}>{otherBattleProgress.score}</div>
                  <div style={{ fontSize: 'var(--text-caption-size)', color: '#8a8578' }}>Benar {otherBattleProgress.correct}/{battlePool.length}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={goSetup}>Ganti Pengaturan</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={rematchBattle}>Balapan Lagi</button>
              </div>
            </div>
          ) : battleFinished ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem var(--space-4)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }} className="pulse-wait">⏳</div>
              <p style={{ color: '#6b675c' }}>Kamu sudah selesai! Skor kamu: <strong>{battleScore}</strong></p>
              <p style={{ fontSize: 'var(--text-body-sm-size)', marginTop: 'var(--space-1)', color: '#8a8578' }}>Menunggu {otherName} menyelesaikan balapannya...</p>
              <div className="race-track" style={{ marginTop: 'var(--space-5)' }}>
                <div className="race-lane">
                  <span className="race-label" style={{ color: 'var(--color-gold)' }}>{otherName}</span>
                  <div className="race-bar"><div className="race-bar-fill" style={{ width: (otherBattleProgress.qi / battlePool.length * 100) + '%' }} /></div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="race-track" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="race-lane">
                  <span className="race-label">{myName} (kamu)</span>
                  <div className="race-bar"><div className="race-bar-fill mine" style={{ width: (battleQi / battlePool.length * 100) + '%' }} /></div>
                </div>
                <div className="race-lane">
                  <span className="race-label">{otherName}</span>
                  <div className="race-bar"><div className="race-bar-fill theirs" style={{ width: (otherBattleProgress.qi / battlePool.length * 100) + '%' }} /></div>
                </div>
              </div>

              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)', flexWrap: 'wrap' }}>
                  <span className="pill">Soal {battleQi + 1}/{battlePool.length}</span>
                  <span className="pill" style={{ color: 'var(--color-gold)' }}>Skor {battleScore}</span>
                </div>
                <div className="speaker-wrap" style={{ margin: 'var(--space-6) 0' }}>
                  <button className="speaker-btn" onClick={playBattle} title="Putar lagi">🔊</button>
                  <p style={{ fontSize: 'var(--text-caption-size)', marginTop: 'var(--space-2)', color: '#8a8578' }}>Tap untuk dengar ulang ({battlePlays}x diputar)</p>
                </div>

                {battlePhase === 'playing' ? (
                  battle?.answerMode === 'type' ? (
                    <>
                      <input
                        value={battleInput}
                        onChange={(e) => setBattleInput(e.target.value)}
                        type="text"
                        autoComplete="off"
                        autoCapitalize="off"
                        placeholder={battle.contentType === 'sentence' ? 'Ketik kalimat yang kamu dengar...' : 'Ketik kata yang kamu dengar...'}
                        className="listen-input"
                        onKeyUp={(e) => e.key === 'Enter' && submitBattleType()}
                        onKeyDown={() => sfx.tick()}
                      />
                      <button className="btn btn-primary w-full" onClick={submitBattleType}>Cek Jawaban</button>
                    </>
                  ) : (
                    <div className="choice-grid">
                      {battleChoices.map((c, i) => (
                        <button key={i} className="mc-btn" onClick={() => submitBattleChoice(i)}>{c.text}</button>
                      ))}
                    </div>
                  )
                ) : (
                  <>
                    <div className={`result-box ${battleLastResult}`}>
                      <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-1)' }}>
                        {battleLastResult === 'correct' ? '✅' : battleLastResult === 'close' ? '🤏' : '❌'}
                      </div>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-heading-md-size)', marginBottom: 'var(--space-1)' }}>{battleCurrent?.text}</p>
                      <p style={{ fontSize: 'var(--text-body-sm-size)', color: '#6b675c' }}>{battleCurrent?.meaning}</p>
                    </div>
                    <button className="btn btn-primary w-full" style={{ marginTop: 'var(--space-4)' }} onClick={nextBattle}>Lanjut →</button>
                  </>
                )}
              </div>
            </div>
          )}

          <a className="block text-center text-sm" style={{ marginTop: 'var(--space-3)', textDecoration: 'underline', cursor: 'pointer', color: '#9aa4a4' }} onClick={leaveBattleLobby}>← Keluar</a>
        </>
      )}
    </>
  )
}
