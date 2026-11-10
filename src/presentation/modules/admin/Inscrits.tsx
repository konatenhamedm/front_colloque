import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCheck, Download, Search, Trash2, UserCheck, Users } from 'lucide-react'
import { useState } from 'react'
import { api, ApiError } from '@/lib/api'
import { fcfa } from '@/lib/format'
import type { Inscription } from '@/lib/types'
import { Badge, StatutBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Input, Select } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { Avatar, EmptyState, PageHeader } from '../../components/ui/misc'
import { useToast } from '../../components/ui/Toast'

export function Inscrits() {
  const qc = useQueryClient()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [statut, setStatut] = useState('')
  const [page, setPage] = useState(1)
  const [confirmAll, setConfirmAll] = useState(false)
  const [aSupprimer, setASupprimer] = useState<Inscription | null>(null)

  const { data, isLoading } = useQuery({ queryKey: ['inscrits', q, statut, page], queryFn: () => api.page<Inscription>('/admin/inscriptions', { q, statut, page, limit: 15 }), placeholderData: p => p })

  const refresh = () => { qc.invalidateQueries({ queryKey: ['inscrits'] }); qc.invalidateQueries({ queryKey: ['stats'] }) }
  const valider = useMutation({
    mutationFn: (ids: number[] | null) => api.post<{ valides: number[]; ignores: { id: number; raison: string }[] }>('/admin/participations/valider', ids ? { ids } : {}),
    onSuccess: r => { refresh(); setConfirmAll(false); toast.success(`${r.valides.length} participation(s) validée(s)${r.ignores.length ? ` · ${r.ignores.length} ignorée(s)` : ''}.`) },
    onError: e => toast.error(e instanceof ApiError ? e.message : 'Action impossible.'),
  })
  const supprimer = useMutation({
    mutationFn: (id: number) => api.del(`/admin/inscriptions/${id}`),
    onSuccess: () => { refresh(); qc.invalidateQueries({ queryKey: ['liens'] }); qc.invalidateQueries({ queryKey: ['queue'] }); toast.success(`Inscription de ${aSupprimer?.utilisateur.nomComplet ?? 'l\'inscrit'} supprimée.`); setASupprimer(null) },
    onError: e => toast.error(e instanceof ApiError ? e.message : 'Suppression impossible.'),
  })
  const exp = (fmt: 'xlsx' | 'csv') => api.download(`/admin/exports/emargement?format=${fmt}`, `emargement.${fmt}`).catch(() => toast.error('Export impossible.'))

  const cols: Column<Inscription>[] = [
    { key: 'p', header: 'Participant', cell: r => <div className="flex items-center gap-3"><Avatar name={r.utilisateur.nomComplet} className="size-8" /><div className="min-w-0"><div className="truncate font-bold">{r.utilisateur.nomComplet}</div><div className="truncate text-xs text-muted">{r.utilisateur.email}</div></div></div> },
    { key: 'i', header: 'Institution', cell: r => <span className="text-muted">{r.institution}</span> },
    { key: 'c', header: 'Catégorie', cell: r => <div><div className="text-xs font-semibold">{r.categorie.libelle}</div><div className="text-[11px] text-muted">{fcfa(r.montantTotal)}{r.repas && ' · avec déjeuner'}</div></div> },
    { key: 's', header: 'Statut', cell: r => <StatutBadge statut={r.statut} /> },
    { key: 'pr', header: 'Présence', cell: r => r.presence ? <Badge tone="ok" dot>Présent</Badge> : <span className="text-subtle">—</span> },
    { key: 'a', header: '', className: 'text-right', cell: r => (
        <div className="flex items-center justify-end gap-2">
          {r.statut === 'PAYMENT_VALIDATED' && <Button size="sm" variant="secondary" icon={<UserCheck className="size-3.5" />} loading={valider.isPending && valider.variables?.[0] === r.id} onClick={() => valider.mutate([r.id])}>Valider la présence</Button>}
          <Button size="sm" variant="ghost" className="!px-2 text-bad hover:!bg-bad-soft" aria-label={`Supprimer ${r.utilisateur.nomComplet}`} title="Supprimer cet inscrit" onClick={() => setASupprimer(r)}><Trash2 className="size-4" /></Button>
        </div>
      ) },
  ]

  return (
    <>
      <PageHeader title="Liste des inscrits" subtitle="Faites le point des participants, exportez la liste d'émargement et validez la présence."
        action={<div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" icon={<Download className="size-4" />} onClick={() => exp('xlsx')}>Émargement Excel</Button>
          <Button variant="secondary" size="sm" icon={<Download className="size-4" />} onClick={() => exp('csv')}>CSV</Button>
          <Button size="sm" icon={<CheckCheck className="size-4" />} onClick={() => setConfirmAll(true)}>Valider tous les présents</Button>
        </div>} />
      <Card>
        <div className="flex flex-wrap gap-3 border-b border-line p-4">
          <div className="relative min-w-52 flex-1"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-subtle" /><Input className="pl-9" placeholder="Rechercher nom, e-mail, institution…" value={q} onChange={e => { setQ(e.target.value); setPage(1) }} aria-label="Rechercher" /></div>
          <Select className="w-auto" value={statut} onChange={e => { setStatut(e.target.value); setPage(1) }} aria-label="Filtrer par statut">
            <option value="">Tous les statuts</option><option value="PENDING_PAYMENT">En attente</option><option value="PAYMENT_VALIDATED">Inscription validée</option>
            <option value="ATTENDED_AND_VALIDATED">Participation validée</option><option value="CERTIFICATE_ISSUED">Attestation émise</option><option value="REJECTED">Rejetée</option>
          </Select>
        </div>
        <DataTable columns={cols} rows={data?.data} loading={isLoading && !data} meta={data?.meta} onPage={setPage} rowKey={r => r.id}
          empty={<EmptyState icon={<Users className="size-8" />} title="Aucun inscrit" text="Aucun résultat pour ces critères." />} />
      </Card>

      <Modal open={!!aSupprimer} onClose={() => setASupprimer(null)} title="Supprimer cet inscrit ?"
        footer={<><Button variant="ghost" onClick={() => setASupprimer(null)}>Annuler</Button><Button variant="danger" loading={supprimer.isPending} icon={<Trash2 className="size-4" />} onClick={() => aSupprimer && supprimer.mutate(aSupprimer.id)}>Supprimer définitivement</Button></>}>
        <p className="text-sm text-muted"><strong className="text-fg">{aSupprimer?.utilisateur.nomComplet}</strong> ({aSupprimer?.utilisateur.email}) sera supprimé avec son compte, ses paiements, ses justificatifs et son attestation éventuelle. Cette action est <strong className="text-fg">irréversible</strong> ; l'adresse e-mail pourra ensuite être réutilisée pour une nouvelle inscription.</p>
      </Modal>

      <Modal open={confirmAll} onClose={() => setConfirmAll(false)} title="Valider la participation de tous ?"
        footer={<><Button variant="ghost" onClick={() => setConfirmAll(false)}>Annuler</Button><Button loading={valider.isPending} onClick={() => valider.mutate(null)}>Confirmer</Button></>}>
        <p className="text-sm text-muted">Tous les inscrits dont le paiement est validé seront marqués <strong className="text-fg">présents</strong>, puis pourront recevoir leur attestation. À faire à la fin de l'événement.</p>
      </Modal>
    </>
  )
}
