import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Stepper({ steps, current, failed }: { steps: string[]; current: number; failed?: boolean }) {
  return (
    <ol className="flex w-full items-start">
      {steps.map((label, i) => {
        const done = i < current, active = i === current
        return (
          <li key={label} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && <span className={cn('absolute right-1/2 top-4 -z-0 h-0.5 w-full', i <= current ? 'bg-ok' : 'bg-line')} />}
            <span className={cn('relative z-10 flex size-8 items-center justify-center rounded-full border-2 text-xs font-extrabold',
              done ? 'border-ok bg-ok text-white' : active ? (failed ? 'border-bad bg-bad text-white' : 'border-accent bg-accent-soft text-accent') : 'border-line bg-surface text-subtle')}>
              {done ? <Check className="size-4" /> : i + 1}
            </span>
            <span className={cn('mt-2 px-1 text-[11px] font-bold leading-tight', active || done ? 'text-fg' : 'text-subtle')}>{label}</span>
          </li>
        )
      })}
    </ol>
  )
}
