import { Check } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Brand { bg: string; fg: string; glyph: ReactNode }

/** Pastille aux couleurs de chaque opérateur. Pour utiliser un logo officiel : déposer public/payments/<CODE>.svg (ex. WAVE.svg), il remplace automatiquement la pastille. */
const mono = (t: string, size = 15) => <span style={{ fontSize: size, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1 }}>{t}</span>

const BRANDS: Record<string, Brand> = {
  WAVE: { bg: '#1DC8FF', fg: '#fff', glyph: <svg viewBox="0 0 32 32" className="size-7" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round"><path d="M3 11c3.5-4 7-4 10.5 0s7 4 10.5 0 3.5-1 5-1" /><path d="M3 21c3.5-4 7-4 10.5 0s7 4 10.5 0 3.5-1 5-1" /></svg> },
  ORANGE_MONEY: { bg: '#FF7900', fg: '#000', glyph: <span className="flex flex-col items-center leading-none text-black">{mono('orange', 11)}<span style={{ fontSize: 9, fontWeight: 700 }}>money</span></span> },
  MOOV_MONEY: { bg: '#0B6FB8', fg: '#fff', glyph: <span className="flex flex-col items-center leading-none text-white">{mono('moov', 14)}<span style={{ fontSize: 9, fontWeight: 700, color: '#FFB347' }}>money</span></span> },
  MTN_MONEY: { bg: '#FFCC00', fg: '#000', glyph: <span className="text-black">{mono('MTN', 16)}</span> },
  WESTERN_UNION: { bg: '#FFDD00', fg: '#000', glyph: <span className="flex flex-col items-center leading-none text-black">{mono('WU', 17)}<span style={{ fontSize: 7, fontWeight: 800 }}>WESTERN UNION</span></span> },
  RIA: { bg: '#E8731D', fg: '#fff', glyph: <span className="text-white">{mono('ria', 20)}</span> },
  MONEYGRAM: { bg: '#D9232D', fg: '#fff', glyph: <span className="text-white">{mono('MG', 18)}</span> },
  VIREMENT: { bg: '#1b2a6b', fg: '#fff', glyph: <span className="text-white">{mono('🏦', 18)}</span> },
}

/** Tuile logo (carré arrondi). */
export function PaymentLogo({ code, className }: { code: string; className?: string }) {
  const [official, setOfficial] = useState(true)
  const b = BRANDS[code] ?? { bg: '#5a6788', fg: '#fff', glyph: mono(code.slice(0, 2)) }
  return (
    <span className={cn('relative inline-flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5', className)} style={{ background: b.bg }} aria-hidden>
      {official && <img src={`/payments/${code}.svg`} alt="" className="absolute inset-0 size-full bg-white object-contain p-1" onError={() => setOfficial(false)} />}
      {!official && b.glyph}
    </span>
  )
}

/** Pastille informative (logo + nom), pour les affichages simples. */
export function PaymentChip({ code, label, onDark }: { code: string; label: string; onDark?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 rounded-2xl py-1.5 pl-1.5 pr-4 text-sm font-bold', onDark ? 'bg-white text-[#101a3d] shadow-md' : 'border border-line bg-surface')}>
      <PaymentLogo code={code} className="h-9 w-12" />{label}
    </span>
  )
}

/** Sélecteur : cartes cliquables (radio) avec logo. */
export function PaymentPicker({ options, value, onChange, name = 'canal' }: { options: { code: string; libelle: string }[]; value: string; onChange: (code: string) => void; name?: string }) {
  return (
    <div role="radiogroup" aria-label="Mode de paiement utilisé" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {options.map(o => {
        const on = value === o.code
        return (
          <label key={o.code} className={cn('relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-2.5 transition',
            on ? 'border-brand bg-brand-soft shadow-sm' : 'border-line bg-surface hover:border-brand/40 hover:bg-surface-2')}>
            <input type="radio" name={name} value={o.code} checked={on} onChange={() => onChange(o.code)} className="sr-only" />
            <PaymentLogo code={o.code} className="h-10 w-12" />
            <span className="min-w-0 flex-1 text-xs font-extrabold leading-tight">{o.libelle}</span>
            {on && <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-brand text-brand-fg"><Check className="size-3.5" /></span>}
          </label>
        )
      })}
    </div>
  )
}
