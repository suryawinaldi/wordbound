import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function GlassCard({ children, className, strong, glow, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        strong ? 'glass-strong' : 'glass',
        'rounded-3xl shadow-soft',
        glow === 'primary' && 'glow-primary',
        glow === 'sun' && 'glow-sun',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
