import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { STATUT, type Tone } from '@/lib/format'
import type { Statut } from '@/lib/types'

const tones: Record<Tone, string> = {
  ok: 'bg-ok-soft text-ok', warn: 'bg-warn-soft text-warn', bad: 'bg-bad-soft text-bad', info: 'bg-info-soft text-info',
  pending: 'bg-pending-soft text-pending', brand: 'bg-brand-soft text-brand', neutral: 'border border-line bg-surface-2 text-muted',
}

export function Badge({ tone = 'neutral', children, className, dot }: { tone?: Tone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold', tones[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}{children}
    </span>
  )
}

export const StatutBadge = ({ statut }: { statut: Statut }) => <Badge tone={STATUT[statut].tone} dot>{STATUT[statut].label}</Badge>
