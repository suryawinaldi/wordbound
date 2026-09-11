import { useEffect, useState } from 'react'

const COLORS = ['#3ddc84', '#ffb627', '#a78bfa', '#38bdf8', '#fb7185']

export default function Confetti({ fire, count = 28 }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (!fire) return
    const next = Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.25,
      dur: 0.8 + Math.random() * 0.6,
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 8,
      round: Math.random() > 0.5,
      drift: (Math.random() - 0.5) * 60,
    }))
    setPieces(next)
    const t = setTimeout(() => setPieces([]), 1800)
    return () => clearTimeout(t)
  }, [fire, count])

  if (!pieces.length) return null
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible z-50">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.round ? '9999px' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            transform: `translateX(${p.drift}px)`,
          }}
        />
      ))}
    </div>
  )
}
