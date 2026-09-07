// Procedural sound effects via Web Audio API — no asset files needed.
// A mute toggle is persisted in localStorage so it's remembered between sessions.

const MUTE_KEY = 'wordbound_muted'

let ctx = null
function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function isMuted() {
  return localStorage.getItem(MUTE_KEY) === '1'
}

export function setMuted(val) {
  localStorage.setItem(MUTE_KEY, val ? '1' : '0')
}

export function toggleMuted() {
  const next = !isMuted()
  setMuted(next)
  return next
}

function tone({ freq, duration = 0.12, type = 'sine', gain = 0.18, delay = 0, glideTo = null }) {
  if (isMuted()) return
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const amp = c.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, c.currentTime + delay)
    if (glideTo) {
      osc.frequency.exponentialRampToValueAtTime(glideTo, c.currentTime + delay + duration)
    }
    amp.gain.setValueAtTime(gain, c.currentTime + delay)
    amp.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration)
    osc.connect(amp).connect(c.destination)
    osc.start(c.currentTime + delay)
    osc.stop(c.currentTime + delay + duration + 0.02)
  } catch (e) {
    // Audio can fail silently on some browsers/permissions — never break the game for it.
  }
}

export const sfx = {
  click: () => tone({ freq: 440, duration: 0.06, type: 'square', gain: 0.08 }),
  correct: () => {
    tone({ freq: 523.25, duration: 0.1, type: 'sine' })
    tone({ freq: 659.25, duration: 0.16, delay: 0.08, type: 'sine' })
    tone({ freq: 783.99, duration: 0.2, delay: 0.16, type: 'sine' })
  },
  wrong: () => {
    tone({ freq: 220, duration: 0.22, type: 'sawtooth', gain: 0.14, glideTo: 110 })
  },
  tick: () => tone({ freq: 880, duration: 0.04, type: 'square', gain: 0.05 }),
  tickUrgent: () => tone({ freq: 1046, duration: 0.06, type: 'square', gain: 0.09 }),
  win: () => {
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone({ freq: f, duration: 0.22, delay: i * 0.1, type: 'triangle' }))
  },
  lose: () => {
    ;[392, 349.23, 293.66].forEach((f, i) => tone({ freq: f, duration: 0.3, delay: i * 0.14, type: 'sawtooth', gain: 0.1 }))
  },
  combo: () => tone({ freq: 1200, duration: 0.08, type: 'sine', gain: 0.12 }),
}

// Speaks a word/sentence out loud using the browser's built-in TTS engine (free, no files).
export function speak(text, { lang = 'en-US', rate = 0.95 } = {}) {
  if (isMuted()) return
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = lang
  utter.rate = rate
  window.speechSynthesis.speak(utter)
}
