import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('overflow-hidden rounded-2xl border border-line bg-surface shadow-card', className)} {...rest} />
}

export function CardHeader({ title, subtitle, action }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-2/60 px-5 py-3.5">
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-extrabold">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

const ACCENT = { brand: 'var(--brand)', ok: 'var(--ok)', warn: 'var(--warn)', bad: 'var(--bad)', info: 'var(--info)', accent: 'var(--accent)' }

export function KpiCard({ label, value, hint, icon, tone = 'brand', loading }: {
  label: string; value: ReactNode; hint?: ReactNode; icon: ReactNode; tone?: keyof typeof ACCENT; loading?: boolean
}) {
  return (
    <Card className="relative p-5">
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: ACCENT[tone] }} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wide text-muted">{label}</div>
          <div className="mt-2 font-display text-3xl font-extrabold tabular-nums">{loading ? <span className="skeleton inline-block h-8 w-20" /> : value}</div>
          {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
        </div>
        <div className="rounded-xl bg-surface-2 p-2.5" style={{ color: ACCENT[tone] }}>{icon}</div>
      </div>
    </Card>
  )
}
