import { useQuery } from '@tanstack/react-query'
import { Banknote, Clock, Download, Receipt } from 'lucide-react'
import { api } from '@/lib/api'
import { fcfa } from '@/lib/format'
import type { Stats } from '@/lib/types'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, KpiCard } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/misc'
import { useToast } from '../../components/ui/Toast'

export function Finances() {
  const toast = useToast()
  const { data: s, isLoading } = useQuery({ queryKey: ['stats'], queryFn: () => api.get<Stats>('/admin/stats') })
  const exp = (fmt: 'xlsx' | 'csv') => api.download(`/admin/exports/finances?format=${fmt}`, `finances.${fmt}`).catch(() => toast.error('Export impossible.'))
  const f = s?.finances
  const nb = f?.parCanal.reduce((a, c) => a + c.total, 0)

  return (
    <>
      <PageHeader title="Finances" subtitle="Suivi des encaissements par canal de paiement."
        action={<div className="flex gap-2"><Button variant="secondary" size="sm" icon={<Download className="size-4" />} onClick={() => exp('xlsx')}>Rapport Excel</Button><Button variant="secondary" size="sm" icon={<Download className="size-4" />} onClick={() => exp('csv')}>CSV</Button></div>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard loading={isLoading} tone="ok" icon={<Banknote className="size-5" />} label="Total collecté" value={f ? fcfa(f.totalCollecte) : ''} />
        <KpiCard loading={isLoading} tone="warn" icon={<Clock className="size-5" />} label="En attente de vérification" value={f ? fcfa(f.montantEnAttente) : ''} />
        <KpiCard loading={isLoading} tone="brand" icon={<Receipt className="size-5" />} label="Paiements validés" value={nb} />
      </div>
      <Card className="mt-6">
        <CardHeader title="Répartition par canal" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead><tr className="border-b-[3px] border-accent bg-[#1b2a6b] text-[11px] font-bold uppercase tracking-wide text-white dark:bg-[#1a2760]"><th className="px-5 py-3">Canal</th><th className="px-5 py-3">Paiements</th><th className="px-5 py-3">Montant</th><th className="w-1/3 px-5 py-3">Part</th></tr></thead>
            <tbody>
              {f?.parCanal.map(c => (
                <tr key={c.canal} className="border-b border-line/70 last:border-0">
                  <td className="px-5 py-3.5 font-bold">{c.libelle}</td>
                  <td className="px-5 py-3.5 tabular-nums">{c.total}</td>
                  <td className="px-5 py-3.5 font-extrabold tabular-nums">{fcfa(c.montant)}</td>
                  <td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-[var(--chart-1)]" style={{ width: `${c.part}%` }} /></div><span className="w-12 text-right text-xs font-bold tabular-nums">{c.part} %</span></div></td>
                </tr>
              ))}
              {f && f.parCanal.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-muted">Aucun paiement validé pour le moment.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
