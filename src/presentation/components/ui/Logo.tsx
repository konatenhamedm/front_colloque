import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Colloque } from '@/lib/types'
import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('size-9', className)} aria-hidden>
      <rect width="64" height="64" rx="16" fill="#1b2a6b" />
      <path d="M14 44V22l18-8 18 8v22" fill="none" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
      <path d="M22 44V30h20v14" fill="#d9730d" />
      <rect x="28" y="36" width="8" height="8" fill="#1f8a3b" />
    </svg>
  )
}

export function Logo({ light, compact }: { light?: boolean; compact?: boolean }) {
  // Nom court = sigle de l'événement (texte entre parenthèses du titre), partagé avec le cache de la landing.
  const { data } = useQuery({ queryKey: ['colloque'], queryFn: () => api.get<Colloque>('/public/colloque'), staleTime: 5 * 60_000 })
  const sigle = data?.sigle && data.sigle !== 'FORUM' ? data.sigle : null
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      {!compact && (
        <span className={cn('font-display text-lg font-extrabold tracking-tight', light ? 'text-white' : 'text-fg')}>
          Forum <span className="text-accent">{sigle ?? ''}</span>
        </span>
      )}
    </span>
  )
}
