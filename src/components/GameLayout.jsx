import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { sfx } from '@/lib/sound'

export default function GameLayout({ title, children, right }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/games" onClick={() => sfx.click()} className="p-2 -ml-2 rounded-xl hover:bg-muted/60 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight flex-1 truncate">{title}</h1>
        {right}
      </div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {children}
      </motion.div>
    </div>
  )
}
