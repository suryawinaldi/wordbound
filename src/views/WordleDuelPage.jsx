import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase-config'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { WORD_BANK, scoreGuess } from '@/data/word-bank'
import { sfx } from '@/lib/sound'
import AppShell from '@/layouts/AppShell'
import NavigationShell from '@/components/shared/NavigationShell'
import Button from '@/components/base/Button'
import './WordleDuelPage.css'

const NAV_ITEMS = [
  { label: 'Beranda', to: '/dashboard', icon: '🏠' },
  { label: 'Profil', to: '/profile', icon: '👤' },
]

const MAX_SOLO_ATTEMPTS = 6

export default function WordleDuelPage() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const userData = useAuthStore((s) => s.userData)
  const partnerData = useAuthStore((s) => s.partnerData)
  const { recordActivity } = usePlayerStore()

  const me = currentUser?.uid
  const other = userData?.partnerUid
  const myName = userData?.displayName?.split(' ')[0] || 'Kamu'
  const otherName = partnerData?.displayName?.split(' ')[0] || 'Pasangan'

  // mode: null | 'solo' | 'duel'
  const [mode, setMode] = useState(null)

  /* ——— Duel state ——— */
  const [duel, setDuel] = useState(null)
  const [duelInput, setDuelInput] = useState('')
  const [duelError, setDuelError] = useState('')
  const [duelShake, setDuelShake] = useState(false)
  const unsubRef = useRef(null)

  const myTurn = duel?.turn === me
  const duelAttemptsLeft = duel ? duel.maxAttempts - duel.guesses.length : 0

  function watchDuel() {
    if (unsubRef.current) return
    unsubRef.current = onSnapshot(doc(db, 'duels', 'current'), (snap) => {
      setDuel(snap.exists() ? snap.data() : null)
    })
  }

  useEffect(() => {
    return () => { if (unsubRef.current) unsubRef.current() }
  }, [])

  async function startDuel(maxAttempts) {
    const word = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]
    await setDoc(doc(db, 'duels', 'current'), {
      word, maxAttempts, guesses: [], turn: me, status: 'playing', winner: null,
    })
    sfx.click()
  }

  async function submitDuelGuess() {
    setDuelError('')
    const g = duelInput.trim().toUpperCase()
    if (g.length !== 5) {
      setDuelError('Kata harus 5 huruf.')
      triggerShake(setDuelShake)
      sfx.wrong()
      return
    }
    if (!/^[A-Z]{5}$/.test(g)) {
      setDuelError('Cuma huruf A-Z ya.')
      triggerShake(setDuelShake)
      sfx.wrong()
      return
    }

    const feedback = scoreGuess(g, duel.word)
    const newGuesses = [...duel.guesses, { player: me, word: g, feedback }]
    const won = g === duel.word
    const exhausted = newGuesses.length >= duel.maxAttempts

    await setDoc(doc(db, 'duels', 'current'), {
      guesses: newGuesses,
      turn: other,
      status: won || exhausted ? 'finished' : 'playing',
      winner: won ? me : null,
    }, { merge: true })

    if (won) {
      sfx.win()
      await recordActivity({ duelWins: (userData?.duelWins || 0) + 1 })
    } else if (exhausted) {
      sfx.lose()
    } else {
      sfx.correct()
    }
    setDuelInput('')
  }

  async function rematch() {
    sfx.click()
    await deleteDoc(doc(db, 'duels', 'current'))
    setDuel(null)
  }

  /* ——— Solo state ——— */
  const [soloWord, setSoloWord] = useState('')
  const [soloGuesses, setSoloGuesses] = useState([])
  const [soloInput, setSoloInput] = useState('')
  const [soloError, setSoloError] = useState('')
  const [soloShake, setSoloShake] = useState(false)
  const [soloStatus, setSoloStatus] = useState('playing')

  function startSolo() {
    setSoloWord(WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)])
    setSoloGuesses([])
    setSoloInput('')
    setSoloError('')
    setSoloStatus('playing')
    sfx.click()
  }

  async function submitSoloGuess() {
    setSoloError('')
    const g = soloInput.trim().toUpperCase()
    if (g.length !== 5) {
      setSoloError('Kata harus 5 huruf.')
      triggerShake(setSoloShake)
      sfx.wrong()
      return
    }
    if (!/^[A-Z]{5}$/.test(g)) {
      setSoloError('Cuma huruf A-Z ya.')
      triggerShake(setSoloShake)
      sfx.wrong()
      return
    }

    const feedback = scoreGuess(g, soloWord)
    const newGuesses = [...soloGuesses, { word: g, feedback }]
    setSoloGuesses(newGuesses)
    const won = g === soloWord
    const exhausted = newGuesses.length >= MAX_SOLO_ATTEMPTS

    if (won) {
      setSoloStatus('won')
      sfx.win()
      await recordActivity({ soloWordleWins: (userData?.soloWordleWins || 0) + 1 })
    } else if (exhausted) {
      setSoloStatus('lost')
      sfx.lose()
    } else {
      sfx.correct()
    }
    setSoloInput('')
  }

  const soloAttemptsLeft = MAX_SOLO_ATTEMPTS - soloGuesses.length

  function triggerShake(setter) {
    setter(true)
    setTimeout(() => setter(false), 400)
  }

  function chooseMode(m) {
    sfx.click()
    setMode(m)
    if (m === 'duel') watchDuel()
  }

  function backToModeSelect() {
    sfx.click()
    setMode(null)
  }

  const tileColor = { correct: 'wordle-correct', present: 'wordle-present', absent: 'wordle-absent' }

  return (
    <AppShell navigation={<NavigationShell items={NAV_ITEMS} />}>
      <div className="wordle-page">
        <div className="wordle-header">
          <span className="wordle-eyebrow">Wordle</span>
          <h1 className="wordle-title">
            {mode === 'duel' ? `${myName} vs ${otherName}` :
             mode === 'solo' ? 'Mode Solo' : 'Pilih Mode'}
          </h1>
        </div>

        {/* Mode picker */}
        {!mode && (
          <div className="wordle-card wordle-card--center">
            <p className="wordle-hint">Mau main sendiri langsung, atau duel gantian sama {otherName}?</p>
            <div className="wordle-btn-row">
              <Button variant="primary" block onClick={() => chooseMode('solo')}>
                🧍 Solo<br /><span className="wordle-btn-sub">Main instan, gak nunggu</span>
              </Button>
              <Button variant="secondary" block onClick={() => chooseMode('duel')}>
                ⚔️ Duel<br /><span className="wordle-btn-sub">Gantian lawan {otherName}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Solo mode */}
        {mode === 'solo' && (
          <>
            {!soloWord ? (
              <div className="wordle-card wordle-card--center">
                <p className="wordle-hint">Tebak kata 5 huruf sendirian — {MAX_SOLO_ATTEMPTS}x kesempatan!</p>
                <Button variant="primary" block onClick={startSolo}>Mulai Main</Button>
              </div>
            ) : (
              <>
                {soloStatus !== 'playing' ? (
                  <div className="wordle-card wordle-card--center wordle-card--result">
                    <div className="wordle-result-emoji">{soloStatus === 'won' ? '🎉' : '📖'}</div>
                    <h2 className="wordle-result-title">{soloStatus === 'won' ? 'Kamu menang!' : 'Kesempatan habis'}</h2>
                    <p className="wordle-hint">Kata rahasianya: <strong className="wordle-answer">{soloWord}</strong></p>
                    <div className="wordle-btn-row">
                      <Button variant="secondary" onClick={backToModeSelect}>Ganti Mode</Button>
                      <Button variant="primary" onClick={startSolo}>Main Lagi</Button>
                    </div>
                  </div>
                ) : (
                  <div className="wordle-card">
                    <div className="wordle-counter">Sisa {soloAttemptsLeft}x tebakan</div>
                    <div className="wordle-grid">
                      {soloGuesses.map((g, gi) => (
                        <div key={gi} className="wordle-row">
                          {g.word.split('').map((letter, li) => (
                            <div key={li} className={`wordle-tile wordle-tile--${g.feedback[li]}`}>{letter}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className={`wordle-input-row ${soloShake ? 'shake' : ''}`}>
                      <input
                        className="wordle-input"
                        value={soloInput}
                        maxLength={5}
                        placeholder="TEBAK5"
                        onChange={(e) => setSoloInput(e.target.value.toUpperCase())}
                        onKeyUp={(e) => e.key === 'Enter' && submitSoloGuess()}
                        onKeyDown={() => sfx.tick()}
                      />
                      <Button variant="primary" onClick={submitSoloGuess}>Tebak</Button>
                    </div>
                    {soloError && <p className="wordle-error">{soloError}</p>}
                  </div>
                )}
              </>
            )}
            <button className="wordle-back-link" onClick={backToModeSelect}>← Ganti mode</button>
          </>
        )}

        {/* Duel mode */}
        {mode === 'duel' && (
          <>
            {!duel ? (
              <div className="wordle-card wordle-card--center">
                <p className="wordle-hint">Mulai duel baru — pilih jumlah kesempatan tebak (dipakai gantian berdua):</p>
                <div className="wordle-btn-row">
                  <Button variant="secondary" onClick={() => startDuel(3)}>3x</Button>
                  <Button variant="secondary" onClick={() => startDuel(5)}>5x</Button>
                  <Button variant="secondary" onClick={() => startDuel(7)}>7x</Button>
                </div>
              </div>
            ) : (
              <>
                {duel.status === 'finished' ? (
                  <div className="wordle-card wordle-card--center wordle-card--result">
                    <div className="wordle-result-emoji">{duel.winner ? '🎉' : '📖'}</div>
                    <h2 className="wordle-result-title">
                      {duel.winner === me ? 'Kamu menang!' : duel.winner ? `${otherName} menang!` : 'Kesempatan habis'}
                    </h2>
                    <p className="wordle-hint">Kata rahasianya: <strong className="wordle-answer">{duel.word}</strong></p>
                    <div className="wordle-btn-row">
                      <Button variant="secondary" onClick={backToModeSelect}>Ganti Mode</Button>
                      <Button variant="primary" onClick={rematch}>Duel Lagi</Button>
                    </div>
                  </div>
                ) : (
                  <div className="wordle-card">
                    <div className={`wordle-counter ${myTurn ? 'wordle-counter--active' : ''}`}>
                      {myTurn ? 'Giliran kamu menebak' : `Menunggu ${otherName}...`} · sisa {duelAttemptsLeft}x
                    </div>
                    <div className="wordle-grid">
                      {duel.guesses.map((g, gi) => (
                        <div key={gi} className="wordle-row wordle-row--labeled">
                          <div className="wordle-player-label">{g.player === me ? myName : otherName}</div>
                          <div className="wordle-row">
                            {g.word.split('').map((letter, li) => (
                              <div key={li} className={`wordle-tile wordle-tile--${g.feedback[li]} wordle-tile--sm`}>{letter}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {myTurn && (
                      <div className={`wordle-input-row ${duelShake ? 'shake' : ''}`}>
                        <input
                          className="wordle-input"
                          value={duelInput}
                          maxLength={5}
                          placeholder="TEBAK5"
                          onChange={(e) => setDuelInput(e.target.value.toUpperCase())}
                          onKeyUp={(e) => e.key === 'Enter' && submitDuelGuess()}
                          onKeyDown={() => sfx.tick()}
                        />
                        <Button variant="primary" onClick={submitDuelGuess}>Tebak</Button>
                      </div>
                    )}
                    {duelError && <p className="wordle-error">{duelError}</p>}
                  </div>
                )}
              </>
            )}
            <button className="wordle-back-link" onClick={backToModeSelect}>← Ganti mode</button>
          </>
        )}

        <Link to="/dashboard" className="wordle-back-link" onClick={() => sfx.click()}>
          Kembali ke beranda
        </Link>
      </div>
    </AppShell>
  )
}
