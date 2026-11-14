import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Banknote, Clock, Download, Receipt } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { fcfa } from '@/lib/format'
import type { Colloque, PaiementQueue, Stats } from '@/lib/types'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, KpiCard } from '../../components/ui/Card'
import { Select } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/misc'
import { useToast } from '../../components/ui/Toast'

/** Paiements validés : l'administrateur peut corriger le numéro de dépôt de chacun. */
function PaiementsValides() {
  const qc = useQueryClient()
  const toast = useToast()
  const [page, setPage] = useState(1)
  const { data: c } = useQuery({ queryKey: ['colloque'], queryFn: () => api.get<Colloque>('/public/colloque') })
  const list = useQuery({ queryKey: ['paiements-valides', page], queryFn: () => api.page<PaiementQueue>('/admin/paiements/valides', { page, limit: 15 }), placeholderData: p => p })
  const save = useMutation({
    mutationFn: ({ id, numeroDepot }: { id: number; numeroDepot: string }) => api.patch(`/admin/paiements/${id}/numero-depot`, { numeroDepot }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['paiements-valides'] }); qc.invalidateQueries({ queryKey: ['stats'] }); toast.success('Numéro de dépôt mis à jour.') },
    onError: e => toast.error(e instanceof ApiError ? e.message : 'Modification impossible.'),
  })
  const rows = list.data?.data ?? []
  const meta = list.data?.meta
  return (
    <Card className="mt-6">
      <CardHeader title="Paiements validés" subtitle="Corrigez le numéro de dépôt si le participant s'est trompé ou ne l'a pas précisé." />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead><tr className="border-b border-line text-[11px] font-bold uppercase tracking-wide text-muted"><th className="px-5 py-3">Participant</th><th className="px-5 py-3">Canal</th><th className="px-5 py-3">N° de téléphone</th><th className="px-5 py-3 text-right">Montant</th></tr></thead>
          <tbody>
            {rows.map(p => {
              const numeros = c?.canauxPaiement.find(x => x.code === p.canal)?.numeros ?? []
              return (
                <tr key={p.id} className="border-b border-line/70 last:border-0">
                  <td className="px-5 py-3"><div className="font-bold">{p.participant}</div><div className="text-xs text-muted">{p.participantEmail}</div></td>
                  <td className="px-5 py-3 font-semibold">{p.canalLabel}</td>
                  <td className="px-5 py-3">
                    <Select aria-label={`Numéro de dépôt de ${p.participant}`} className="max-w-[13rem] font-mono" value={p.numeroDepot ?? ''} disabled={save.isPending && save.variables?.id === p.id}
                      onChange={e => save.mutate({ id: p.id, numeroDepot: e.target.value })}>
                      <option value="">Non précisé</option>
                      {numeros.map(n => <option key={n} value={n}>{n}</option>)}
                    </Select>
                  </td>
                  <td className="px-5 py-3 text-right font-extrabold tabular-nums">{fcfa(p.montant)}</td>
                </tr>
              )
            })}
            {!list.isLoading && rows.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-muted">Aucun paiement validé pour le moment.</td></tr>}
          </tbody>
        </table>
      </div>
      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Précédent</Button>
          <span className="text-muted">Page {meta.page} / {meta.pages}</span>
          <Button variant="secondary" size="sm" disabled={page >= meta.pages} onClick={() => setPage(p => p + 1)}>Suivant</Button>
        </div>
      )}
    </Card>
  )
}

export function Finances() {
  const toast = useToast()
  const { data: s, isLoading } = useQuery({ queryKey: ['stats'], queryFn: () => api.get<Stats>('/admin/stats') })
  const exp = (fmt: 'xlsx' | 'csv') => api.download(`/admin/exports/finances?format=${fmt}`, `finances.${fmt}`).catch(() => toast.error('Export impossible.'))
  const f = s?.finances
  const lignes = f?.parCanalNumero ?? []
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
        <CardHeader title="Répartition par canal et numéro de dépôt" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead><tr className="border-b-[3px] border-accent bg-[#1b2a6b] text-[11px] font-bold uppercase tracking-wide text-white dark:bg-[#1a2760]"><th className="px-5 py-3">Canal</th><th className="px-5 py-3">N° de téléphone</th><th className="px-5 py-3">Paiements</th><th className="px-5 py-3">Montant</th><th className="w-1/3 px-5 py-3">Part</th></tr></thead>
            <tbody>
              {lignes.map(c => (
                <tr key={`${c.canal}-${c.numero ?? ''}`} className="border-b border-line/70 last:border-0">
                  <td className="px-5 py-3.5 font-bold">{c.libelle}</td>
                  <td className="px-5 py-3.5 font-mono tabular-nums">{c.numero ?? <span className="font-sans text-muted">Non précisé</span>}</td>
                  <td className="px-5 py-3.5 tabular-nums">{c.total}</td>
                  <td className="px-5 py-3.5 font-extrabold tabular-nums">{fcfa(c.montant)}</td>
                  <td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-[var(--chart-1)]" style={{ width: `${c.part}%` }} /></div><span className="w-12 text-right text-xs font-bold tabular-nums">{c.part} %</span></div></td>
                </tr>
              ))}
              {f && lignes.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-muted">Aucun paiement validé pour le moment.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
      <PaiementsValides />
    </>
  )
}
