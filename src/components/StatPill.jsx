import { cn } from '@/lib/utils'

const TONES = {
  growth: 'from-growth/15 to-growth/5 text-growth border-growth/20',
  sun: 'from-sun/15 to-sun/5 text-sun border-sun/20',
  couple: 'from-couple/15 to-couple/5 text-couple border-couple/20',
  sky: 'from-sky/15 to-sky/5 text-sky border-sky/20',
  muted: 'from-muted to-muted/40 text-muted-foreground border-border',
}

export default function StatPill({ icon: Icon, label, value, tone = 'muted', className }) {
  return (
    <div className={cn('flex items-center gap-2.5 rounded-2xl border bg-gradient-to-br px-3.5 py-2.5', TONES[tone], className)}>
      {Icon && (
        <span className="grid place-items-center w-8 h-8 rounded-xl bg-background/60">
          <Icon className="w-4 h-4" />
        </span>
      )}
      <div className="leading-tight">
        <p className="text-[0.62rem] uppercase tracking-wider opacity-70 font-semibold">{label}</p>
        <p className="text-base font-bold text-foreground">{value}</p>
      </div>
    </div>
  )
}
