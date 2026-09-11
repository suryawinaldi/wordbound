import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function ProgressBar({ value, max = 100, tone = 'growth', className, height = 'h-3' }) {
  const pct = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0))
  const grad = {
    growth: 'from-growth to-sky',
    sun: 'from-sun to-[#ffd98a]',
    couple: 'from-couple to-sky',
  }[tone] || 'from-growth to-sky'

  return (
    <div className={cn('w-full rounded-full bg-muted/70 overflow-hidden', height, className)}>
      <motion.div
        className={cn('h-full rounded-full bg-gradient-to-r', grad)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
