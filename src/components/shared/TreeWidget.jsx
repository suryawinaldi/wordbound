import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sfx } from '@/lib/sound'
import Button from '@/components/base/Button'
import './TreeWidget.css'

export default function TreeWidget() {
  const [waterXP, setWaterXP] = useState(10)
  const [sunlightCoins, setSunlightCoins] = useState(10)

  // Level pohon dihitung dari status terkecil antara XP(Air) & Tabungan(Matahari)
  const treeStage = useMemo(() => {
    const score = Math.min(waterXP, sunlightCoins)
    if (score < 40) return 1  // Seed
    if (score < 80) return 2  // Sprout
    if (score < 130) return 3 // Small Tree
    return 4                  // Big Tree
  }, [waterXP, sunlightCoins])

  const treeMessage = useMemo(() => {
    if (waterXP > sunlightCoins + 40) return "Pohonmu butuh pupuk (Tabungan)!"
    if (sunlightCoins > waterXP + 40) return "Pohonmu kehausan (Butuh XP)!"
    if (treeStage === 1) return "Bibit baru ditanam. Rawat bersama!"
    if (treeStage === 2) return "Tunas mulai tumbuh! Terus semangat!"
    if (treeStage === 3) return "Pohonmu makin kuat dan berdaun lebat!"
    return "Luar Biasa! Pohon Raksasa Kehidupan!"
  }, [waterXP, sunlightCoins, treeStage])

  function addWater() {
    sfx.correct()
    setWaterXP(prev => prev + 20)
  }

  function addSunlight() {
    sfx.combo()
    setSunlightCoins(prev => prev + 20)
  }

  const leafVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 10 } },
    exit: { scale: 0, opacity: 0 }
  }

  return (
    <div className="tree-widget-container">
      <div className="tree-widget-header">
        <h2 className="tree-widget-title">Pohon Kehidupan (Demo)</h2>
        <p className="tree-widget-subtitle">{treeMessage}</p>
      </div>

      {/* SVG Canvas for Tree (Natural Code-based SVG) */}
      <div className="tree-canvas-wrapper">
        <svg viewBox="0 0 200 250" className="tree-svg">
          {/* Ground */}
          <path d="M60,230 Q100,210 140,230 L130,250 L70,250 Z" fill="#8B5A2B" />
          <ellipse cx="100" cy="230" rx="45" ry="12" fill="#5C3A21" />

          {/* STAGE 1: Benih */}
          <AnimatePresence>
            {treeStage === 1 && (
              <motion.ellipse 
                cx="100" cy="230" rx="6" ry="4" fill="#E6C287"
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }}
              />
            )}
          </AnimatePresence>

          {/* STAGE 2: Tunas */}
          <AnimatePresence>
            {treeStage >= 2 && (
              <motion.g variants={leafVariants} initial="initial" animate="animate" exit="exit" style={{ originX: "100px", originY: "230px" }}>
                {/* Batang kecil */}
                <motion.path d="M100,230 Q95,200 100,180" fill="none" stroke="#2E8B5F" strokeWidth="4" strokeLinecap="round" />
                {/* Daun */}
                <motion.path d="M100,200 Q80,200 85,180 Q100,180 100,200" fill="#8FD1AE" className="sway-left" />
                <motion.path d="M100,190 Q120,190 115,170 Q100,170 100,190" fill="#8FD1AE" className="sway-right" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* STAGE 3: Pohon Kecil */}
          <AnimatePresence>
            {treeStage >= 3 && (
              <motion.g variants={leafVariants} initial="initial" animate="animate" exit="exit" style={{ originX: "100px", originY: "180px" }}>
                {/* Batang besar */}
                <path d="M100,180 Q105,140 100,110" fill="none" stroke="#17694A" strokeWidth="8" strokeLinecap="round"/>
                <path d="M100,140 Q85,130 80,115" fill="none" stroke="#17694A" strokeWidth="5" strokeLinecap="round"/>
                <path d="M100,150 Q115,140 120,120" fill="none" stroke="#17694A" strokeWidth="5" strokeLinecap="round"/>
                {/* Rimbun */}
                <circle cx="100" cy="100" r="25" fill="#2E8B5F" className="sway-left" />
                <circle cx="80" cy="115" r="20" fill="#2E8B5F" className="sway-right" />
                <circle cx="120" cy="115" r="20" fill="#2E8B5F" className="sway-left" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* STAGE 4: Kanopi Raksasa */}
          <AnimatePresence>
            {treeStage >= 4 && (
              <motion.g variants={leafVariants} initial="initial" animate="animate" exit="exit" style={{ originX: "100px", originY: "110px" }}>
                <circle cx="100" cy="70" r="50" fill="#8FD1AE" opacity="0.95" className="sway-right" />
                <circle cx="60" cy="85" r="40" fill="#2E8B5F" className="sway-left" />
                <circle cx="140" cy="85" r="40" fill="#2E8B5F" className="sway-right" />
                <circle cx="100" cy="40" r="30" fill="#17694A" className="sway-left" />
                <circle cx="70" cy="50" r="25" fill="#17694A" />
                <circle cx="130" cy="50" r="25" fill="#17694A" />
                
                {/* Glow Effect */}
                <motion.circle 
                  cx="100" cy="80" r="100" fill="url(#glow)" 
                  animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.g>
            )}
          </AnimatePresence>

          <defs>
            <radialGradient id="glow">
              <stop offset="0%" stopColor="#D9A441" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#D9A441" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Kontrol Panel Simulasi */}
      <div className="tree-controls">
        <div className="tree-control-box bg-blue-50 border-blue-200">
          <p className="tree-control-label text-blue-800">XP Belajar 💧</p>
          <p className="tree-control-value text-blue-600">{waterXP}</p>
          <Button size="sm" onClick={addWater} style={{backgroundColor: '#3b82f6', color: 'white', border: 'none'}}>+ Belajar</Button>
        </div>
        <div className="tree-control-box bg-amber-50 border-amber-200">
          <p className="tree-control-label text-amber-800">Tabungan ☀️</p>
          <p className="tree-control-value text-amber-600">Rp {sunlightCoins}K</p>
          <Button size="sm" onClick={addSunlight} style={{backgroundColor: '#f59e0b', color: 'white', border: 'none'}}>+ Nabung</Button>
        </div>
      </div>
    </div>
  )
}
