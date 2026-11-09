import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { initials } from '@/lib/format'

export function Avatar({ name, src, className }: { name: string; src?: string | null; className?: string }) {
  return src
    ? <img src={src} alt={name} className={cn('size-9 rounded-full object-cover', className)} />
    : <span aria-hidden className={cn('inline-flex size-9 items-center justify-center rounded-full bg-brand-soft text-xs font-extrabold text-brand', className)}>{initials(name)}</span>
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <div className="rounded-2xl bg-surface-2 p-4 text-subtle">{icon}</div>
      <div className="font-display text-base font-extrabold">{title}</div>
      {text && <p className="max-w-sm text-sm text-muted">{text}</p>}
      {action}
    </div>
  )
}

export const Skeleton = ({ className }: { className?: string }) => <div className={cn('skeleton', className)} />

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="font-display text-2xl font-extrabold tracking-tight">{title}</h1>{subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}</div>
      {action}
    </div>
  )
}
