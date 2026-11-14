import type { Canal } from '@/lib/types'
import { cn } from '@/lib/utils'

/** Choix (facultatif) du numéro sur lequel le paiement a été déposé, quand le canal en propose plusieurs. */
export function NumeroDepotPicker({ canal, value, onChange }: { canal?: Canal; value: string; onChange: (n: string) => void }) {
  if (!canal || canal.numeros.length < 2) return null
  return (
    <div role="radiogroup" aria-label={`Numéro ${canal.libelle} utilisé`}>
      <span className="mb-2 block text-xs font-bold">Numéro {canal.libelle} sur lequel vous avez déposé</span>
      <div className="flex flex-wrap gap-2">
        {canal.numeros.map(n => (
          <button key={n} type="button" role="radio" aria-checked={value === n} onClick={() => onChange(value === n ? '' : n)}
            className={cn('rounded-xl px-3.5 py-2 font-mono text-sm font-bold ring-2 transition', value === n ? 'bg-brand-soft text-brand ring-brand' : 'bg-surface text-fg ring-line hover:ring-brand/50')}>
            {n}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-muted">Facultatif : cela aide les organisateurs à retrouver votre paiement.</p>
    </div>
  )
}
