import { useState } from 'react'
import { isMuted, toggleMuted, sfx } from '@/lib/sound'
import './MuteToggle.css'

export default function MuteToggle() {
  const [muted, setMuted] = useState(() => isMuted())

  function toggle() {
    const next = toggleMuted()
    setMuted(next)
    if (!next) sfx.click()
  }

  return (
    <button
      className="mute-btn"
      title={muted ? 'Bunyikan suara' : 'Matikan suara'}
      onClick={toggle}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
