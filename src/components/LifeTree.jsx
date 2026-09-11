import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, Sun } from 'lucide-react'
import { levelFromXp, xpToNextLevel } from '@/stores/player'
import { sfx } from '@/lib/sound'

// Stage 0 (seed) → 5 (blossoming). Driven by level (XP).
function stageFromLevel(level) {
  return Math.max(0, Math.min(5, level - 1))
}

// Canopy leaf clusters positioned around the treetop.
function canopyClusters(stage) {
  const count = 3 + stage * 2
  const clusters = []
  const cx = 150, cy = 130
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (i % 2 ? 0.2 : -0.1)
    const r = 42 + (i % 3) * 12
    clusters.push({
      id: i,
      x: cx + Math.cos(angle) * r * 0.9,
      y: cy + Math.sin(angle) * r * 0.7 - stage * 4,
      rx: 26 + stage * 3,
      ry: 22 + stage * 2,
      delay: i * 0.06,
    })
  }
  return clusters
}

function fruitPositions(count, clusters) {
  const fruits = []
  for (let i = 0; i < count; i++) {
    const c = clusters[i % clusters.length]
    const a = (i * 1.7) % (Math.PI * 2)
    fruits.push({
      id: i,
      x: c.x + Math.cos(a) * c.rx * 0.6,
      y: c.y + Math.sin(a) * c.ry * 0.6,
      delay: 0.3 + i * 0.08,
    })
  }
  return fruits
}

export default function LifeTree({ xp = 0, savings = 0, streak = 0, onWater }) {
  const [burst, setBurst] = useState(0)
  const [xpBurst, setXpBurst] = useState(0)
  const [saveBurst, setSaveBurst] = useState(0)
  const [levelUp, setLevelUp] = useState(0)
  const prevXp = useRef(xp)
  const prevSavings = useRef(savings)
  const prevLevel = useRef(levelFromXp(xp))
  const level = levelFromXp(xp)
  const stage = stageFromLevel(level)
  const { current, needed } = xpToNextLevel(xp)
  const waterPct = needed ? current / needed : 0
  const fruitCount = Math.min(12, Math.floor((savings || 0) / 50000))
  const sunPower = Math.min(1, (savings || 0) / 500000)

  const clusters = useMemo(() => canopyClusters(stage), [stage])
  const fruits = useMemo(() => fruitPositions(fruitCount, clusters), [fruitCount, clusters])

  const trunkTop = 150 - stage * 22
  const trunkH = 150 - trunkTop

  // React to XP gains
  useEffect(() => {
    if (xp > prevXp.current) {
      setXpBurst((b) => b + 1)
      sfx.pop()
    }
    const newLevel = levelFromXp(xp)
    if (newLevel > prevLevel.current) {
      setLevelUp((l) => l + 1)
    }
    prevXp.current = xp
    prevLevel.current = newLevel
  }, [xp])

  // React to savings gains
  useEffect(() => {
    if (savings > prevSavings.current) {
      setSaveBurst((b) => b + 1)
    }
    prevSavings.current = savings
  }, [savings])

  function handleWater() {
    sfx.pop()
    setBurst((b) => b + 1)
    onWater?.()
  }

  return (
    <div className="relative w-full select-none">
      {/* Vitality chips */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-1 z-20 flex items-center gap-2">
        <div className="glass-strong rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-sky shadow-soft">
          <Droplets className="w-3.5 h-3.5" />
          {Math.round(waterPct * 100)}%
        </div>
        <div className="glass-strong rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-sun shadow-soft">
          <Sun className="w-3.5 h-3.5" />
          {fruitCount} 🪙
        </div>
      </div>

      <motion.svg
        viewBox="0 0 300 360"
        className="w-full max-w-[22rem] mx-auto block"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        onClick={handleWater}
        role="button"
        aria-label="Siram pohon kehidupan"
      >
        <defs>
          <radialGradient id="sky" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="hsl(var(--sun) / 0.35)" />
            <stop offset="60%" stopColor="hsl(var(--couple) / 0.12)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff7d6" />
            <stop offset="60%" stopColor="hsl(var(--sun))" />
            <stop offset="100%" stopColor="#ff9d3c" />
          </radialGradient>
          <linearGradient id="trunk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8a5a3b" />
            <stop offset="100%" stopColor="#5e3a23" />
          </linearGradient>
          <radialGradient id="leaf" cx="40%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#7af0a8" />
            <stop offset="55%" stopColor="hsl(var(--growth))" />
            <stop offset="100%" stopColor="#1f8a52" />
          </radialGradient>
          <radialGradient id="fruit" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffe9a8" />
            <stop offset="55%" stopColor="hsl(var(--sun))" />
            <stop offset="100%" stopColor="#f59322" />
          </radialGradient>
          <radialGradient id="ground" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--growth) / 0.5)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Sky glow */}
        <rect x="0" y="0" width="300" height="360" fill="url(#sky)" />

        {/* Magical aura breathing behind the tree */}
        <motion.ellipse
          cx="150" cy="180" rx="70" ry="90"
          fill="hsl(var(--growth) / 0.18)"
          initial={{ scale: 0.95, opacity: 0.25 }}
          animate={{ scale: [0.95, 1.08, 0.95], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '150px 180px' }}
          filter="url(#soft)"
        />

        {/* Sun */}
        <motion.g
          style={{ transformOrigin: '245px 70px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        >
          <motion.circle
            cx="245" cy="70" r="26" fill="url(#sunGrad)"
            animate={{ opacity: 0.55 + sunPower * 0.45, scale: 1 + sunPower * 0.12 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            style={{ transformOrigin: '245px 70px' }}
          />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2
            return (
              <motion.line
                key={i}
                x1={245 + Math.cos(a) * 30} y1={70 + Math.sin(a) * 30}
                x2={245 + Math.cos(a) * 38} y2={70 + Math.sin(a) * 38}
                stroke="hsl(var(--sun))" strokeWidth="3" strokeLinecap="round"
                animate={{ opacity: 0.4 + sunPower * 0.6 }}
                transition={{ duration: 1.6, repeat: Infinity, repeatType: 'reverse', delay: i * 0.1 }}
              />
            )
          })}
        </motion.g>

        {/* Ground mound */}
        <ellipse cx="150" cy="312" rx="120" ry="34" fill="url(#ground)" />
        <ellipse cx="150" cy="306" rx="92" ry="20" fill="hsl(var(--growth) / 0.28)" />
        <path d="M58 306 Q150 286 242 306 L242 360 L58 360 Z" fill="hsl(var(--growth) / 0.18)" />

        {/* Tree group with sway */}
        <motion.g
          style={{ transformOrigin: '150px 306px' }}
          animate={{ rotate: [-1.2, 1.2, -1.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Trunk */}
          <motion.path
            d={`M150 306 Q146 ${250 - stage * 6} 150 ${trunkTop + 8} Q154 ${250 - stage * 6} 150 306 Z`}
            fill="url(#trunk)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />

          {/* Branches appear from stage 1+ */}
          {stage >= 1 && (
            <motion.path
              d={`M150 ${trunkTop + 30} Q120 ${trunkTop + 10} 104 ${trunkTop - 6}`}
              stroke="#6b4429" strokeWidth="6" strokeLinecap="round" fill="none"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            />
          )}
          {stage >= 2 && (
            <motion.path
              d={`M150 ${trunkTop + 26} Q180 ${trunkTop + 4} 198 ${trunkTop - 10}`}
              stroke="#6b4429" strokeWidth="6" strokeLinecap="round" fill="none"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
            />
          )}
          {stage >= 3 && (
            <motion.path
              d={`M150 ${trunkTop + 14} Q132 ${trunkTop - 6} 120 ${trunkTop - 22}`}
              stroke="#6b4429" strokeWidth="5" strokeLinecap="round" fill="none"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.35 }}
            />
          )}
          {stage >= 4 && (
            <motion.path
              d={`M150 ${trunkTop + 10} Q170 ${trunkTop - 10} 184 ${trunkTop - 26}`}
              stroke="#6b4429" strokeWidth="5" strokeLinecap="round" fill="none"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.4 }}
            />
          )}

          {/* Seed/sprout for stage 0 */}
          {stage === 0 && (
            <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}>
              <ellipse cx="150" cy="296" rx="10" ry="7" fill="#8a5a3b" />
              <path d="M150 296 Q144 286 150 278 Q156 286 150 296" fill="url(#leaf)" />
            </motion.g>
          )}

          {/* Canopy foliage */}
          {stage > 0 && clusters.map((c) => (
            <motion.ellipse
              key={c.id}
              cx={c.x} cy={c.y} rx={c.rx} ry={c.ry}
              fill="url(#leaf)"
              filter="url(#soft)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25 + c.delay, type: 'spring', stiffness: 180, damping: 14 }}
              style={{ transformOrigin: `${c.x}px ${c.y}px` }}
            />
          ))}

          {/* Leaf highlights */}
          {stage > 0 && clusters.map((c) => (
            <motion.ellipse
              key={`hl-${c.id}`}
              cx={c.x - c.rx * 0.3} cy={c.y - c.ry * 0.4} rx={c.rx * 0.35} ry={c.ry * 0.3}
              fill="#9ff7c2" opacity={0.5}
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 + c.delay, duration: 0.5 }}
            />
          ))}

          {/* Fruits (from savings / sun) */}
          {fruits.map((f) => (
            <motion.circle
              key={f.id}
              cx={f.x} cy={f.y} r="5.5"
              fill="url(#fruit)"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: f.delay, type: 'spring', stiffness: 240, damping: 12 }}
              style={{ transformOrigin: `${f.x}px ${f.y}px` }}
            />
          ))}
        </motion.g>

        {/* Floating water drops (intensity from water progress) */}
        {Array.from({ length: 3 + Math.round(waterPct * 5) }).map((_, i) => (
          <motion.circle
            key={`drop-${i}`}
            cx={120 + i * 22} cy={300}
            r="3.2"
            fill="#5cc6ff"
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -60 - i * 10, opacity: [0, 1, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.3, ease: 'easeOut' }}
          />
        ))}

        {/* Fireflies */}
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.circle
            key={`ff-${i}`}
            cx={60 + i * 45} cy={120 + (i % 2) * 80}
            r="2"
            fill="#fff3a0"
            animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.6, 1] }}
            transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}

        {/* Watering burst on tap */}
        {burst > 0 && (
          <motion.g key={`w-${burst}`}>
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i / 8) * Math.PI * 2
              return (
                <motion.circle
                  key={i}
                  cx={150} cy={200} r="3"
                  fill="#5cc6ff"
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{ x: Math.cos(a) * 40, y: Math.sin(a) * 40 - 10, opacity: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              )
            })}
          </motion.g>
        )}

        {/* XP gain burst — rising green sparks + expanding aura ring */}
        <AnimatePresence>
          {xpBurst > 0 && (
            <motion.g key={`xp-${xpBurst}`} initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.circle
                cx="150" cy="200" r="20"
                fill="none" stroke="hsl(var(--growth))" strokeWidth="3"
                initial={{ scale: 0.4, opacity: 0.9 }}
                animate={{ scale: 2.6, opacity: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ transformOrigin: '150px 200px' }}
              />
              {Array.from({ length: 10 }).map((_, i) => {
                const a = (i / 10) * Math.PI * 2 + 0.3
                return (
                  <motion.circle
                    key={i}
                    cx={150 + Math.cos(a) * 18} cy={200 + Math.sin(a) * 18}
                    r="3.2"
                    fill="#7af0a8"
                    initial={{ y: 0, opacity: 1, scale: 1 }}
                    animate={{ y: -70 - (i % 3) * 18, x: Math.cos(a) * 12, opacity: 0, scale: 0.4 }}
                    transition={{ duration: 1.1, ease: 'easeOut', delay: i * 0.02 }}
                  />
                )
              })}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Savings gain burst — golden sun flare + falling fruit sparkle */}
        <AnimatePresence>
          {saveBurst > 0 && (
            <motion.g key={`sv-${saveBurst}`} initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.circle
                cx="245" cy="70" r="26"
                fill="none" stroke="hsl(var(--sun))" strokeWidth="4"
                initial={{ scale: 1, opacity: 0.9 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ transformOrigin: '245px 70px' }}
              />
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i / 12) * Math.PI * 2
                return (
                  <motion.circle
                    key={i}
                    cx={150 + Math.cos(a) * 14} cy={150 + Math.sin(a) * 10}
                    r="3"
                    fill="url(#fruit)"
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                    animate={{ x: Math.cos(a) * 46, y: Math.sin(a) * 36 + 20, opacity: 0, scale: 1.4 }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.03 }}
                  />
                )
              })}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Level-up celebration — radiant rings + bloom */}
        <AnimatePresence>
          {levelUp > 0 && (
            <motion.g key={`lu-${levelUp}`} initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {[0, 0.18, 0.36].map((delay, idx) => (
                <motion.circle
                  key={idx}
                  cx="150" cy="180" r="14"
                  fill="none" stroke="hsl(var(--sun))" strokeWidth="3.5"
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 4 + idx, opacity: [0, 0.9, 0] }}
                  transition={{ duration: 1.4, ease: 'easeOut', delay }}
                  style={{ transformOrigin: '150px 180px' }}
                />
              ))}
              {Array.from({ length: 14 }).map((_, i) => {
                const a = (i / 14) * Math.PI * 2
                return (
                  <motion.circle
                    key={i}
                    cx={150} cy={180} r="2.6"
                    fill="#fff3a0"
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{ x: Math.cos(a) * 80, y: Math.sin(a) * 70, opacity: 0 }}
                    transition={{ duration: 1.3, ease: 'easeOut', delay: i * 0.02 }}
                  />
                )
              })}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Ambient magic motes drifting up */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.circle
            key={`mote-${i}`}
            cx={70 + i * 32} cy={330}
            r={1.6 + (i % 2)}
            fill={i % 2 ? '#fff3a0' : '#9ff7c2'}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -220 - (i % 3) * 30, x: [0, (i % 2 ? 12 : -12), 0], opacity: [0, 0.8, 0] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }}
          />
        ))}
      </motion.svg>

      <p className="text-center text-xs text-muted-foreground mt-1">Pohon magismu hidup — tap untuk menyiram ✨🌿</p>
    </div>
  )
}
