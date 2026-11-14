import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, FileWarning, Inbox, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/api'
import { fcfa, fmtDate } from '@/lib/format'
import type { PaiementQueue } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { Field, Textarea } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { PaymentChip } from '../../components/ui/PaymentLogo'
import { Avatar, EmptyState, PageHeader, Skeleton } from '../../components/ui/misc'
import { useToast } from '../../components/ui/Toast'

/** Aperçu du justificatif : le fichier est privé, on le récupère avec le jeton puis on l'affiche en blob. */
function Proof({ uuid }: { uuid: string }) {
  const { data, isLoading, isError } = useQuery({ queryKey: ['proof', uuid], queryFn: () => api.blobUrl(`/fichiers/${uuid}`), staleTime: Infinity, gcTime: 60_000 })
  useEffect(() => () => { if (data) URL.revokeObjectURL(data.url) }, [data])
  if (isLoading) return <Skeleton className="h-80 w-full" />
  if (isError || !data) return <div className="flex h-40 items-center justify-center gap-2 text-sm text-bad"><FileWarning className="size-5" />Justificatif illisible</div>
  return data.type === 'application/pdf'
    ? <iframe title="Justificatif de paiement" src={data.url} className="h-96 w-full rounded-xl border border-line" />
    : <a href={data.url} target="_blank" rel="noreferrer"><img src={data.url} alt="Justificatif de paiement" className="max-h-96 w-full rounded-xl border border-line bg-surface-2 object-contain" /></a>
}

export function Validations() {
  const qc = useQueryClient()
  const toast = useToast()
  const [selected, setSelected] = useState<number | null>(null)
  const [rejecting, setRejecting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [motif, setMotif] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['queue'], queryFn: () => api.page<PaiementQueue>('/admin/paiements/en-attente', { limit: 50 }) })
  const items = data?.data ?? []
  const current = items.find(p => p.id === selected) ?? items[0]

  const done = (msg: string) => { qc.invalidateQueries({ queryKey: ['queue'] }); qc.invalidateQueries({ queryKey: ['stats'] }); qc.invalidateQueries({ queryKey: ['inscrits'] }); setRejecting(false); setDeleting(false); setMotif(''); setSelected(null); toast.success(msg) }
  const fail = (e: unknown) => toast.error(e instanceof ApiError ? e.message : 'Action impossible.')
  const valider = useMutation({ mutationFn: (id: number) => api.post(`/admin/paiements/${id}/valider`), onSuccess: () => done('Paiement validé — le reçu a été envoyé par e-mail.'), onError: fail })
  const rejeter = useMutation({ mutationFn: (id: number) => api.post(`/admin/paiements/${id}/rejeter`, { motif }), onSuccess: () => done('Paiement rejeté, le participant a été notifié.'), onError: fail })

  const supprimer = useMutation({ mutationFn: (id: number) => api.del(`/admin/inscriptions/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['liens'] }); done('Inscription supprimée.') }, onError: fail })

  return (
    <>
      <PageHeader title="Validations en attente" subtitle="Vérifiez que le paiement a bien été reçu, puis validez l'inscription. Le participant reçoit son reçu par e-mail." />
      {!isLoading && items.length === 0 ? (
        <Card><EmptyState icon={<Inbox className="size-8" />} title="Tout est à jour" text="Aucune inscription n'attend de validation." /></Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader title={`File d'attente (${data?.meta.total ?? '…'})`} subtitle="Les plus anciennes d'abord" />
            <ul className="max-h-[70vh] divide-y divide-line overflow-y-auto">
              {isLoading && Array.from({ length: 4 }, (_, i) => <li key={i} className="p-4"><Skeleton className="h-12 w-full" /></li>)}
              {items.map(p => (
                <li key={p.id}>
                  <button onClick={() => setSelected(p.id)} className={cn('flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-surface-2', current?.id === p.id && 'bg-brand-soft')}>
                    <Avatar name={p.participant} />
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{p.participant}</span><span className="block truncate text-xs text-muted">{p.canalLabel}{p.numeroDepot ? ` ${p.numeroDepot}` : ''} · {p.reference ?? 'reçu joint'}</span></span>
                    <span className="text-xs font-extrabold tabular-nums">{fcfa(p.montant)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          {current && (
            <Card className="lg:col-span-3">
              <CardHeader title={current.participant} subtitle={current.participantEmail} />
              <div className="space-y-5 p-5">
                <dl className="grid gap-4 text-sm sm:grid-cols-3">
                  <div><dt className="text-xs text-muted">Catégorie</dt><dd className="font-bold">{current.categorieLibelle}</dd></div>
                  <div><dt className="text-xs text-muted">Montant attendu</dt><dd className="font-extrabold text-accent">{fcfa(current.montant)}</dd></div>
                  <div><dt className="text-xs text-muted">Soumis le</dt><dd className="font-bold">{current.createdAt ? fmtDate(current.createdAt) : '—'}</dd></div>
                  <div><dt className="text-xs text-muted">Canal</dt><dd><PaymentChip code={current.canal} label={current.canalLabel} />{current.numeroDepot && <span className="ml-2 font-mono text-sm font-bold">{current.numeroDepot}</span>}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-xs text-muted">Référence déclarée</dt><dd className="font-mono text-sm font-bold">{current.reference ?? <span className="font-sans text-muted">Non renseignée (voir le reçu)</span>}</dd></div>
                </dl>
                {current.justificatif ? <Proof uuid={current.justificatif.uuid} /> : <p className="rounded-xl bg-warn-soft p-3 text-sm font-semibold text-warn">Aucun reçu joint : vérifiez la référence ci-dessus dans votre relevé {current.canalLabel}.</p>}
                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
                  <Button variant="ghost" className="mr-auto text-bad hover:!bg-bad-soft" icon={<Trash2 className="size-4" />} onClick={() => setDeleting(true)}>Supprimer l'inscrit</Button>
                  <Button variant="secondary" icon={<X className="size-4" />} onClick={() => setRejecting(true)}>Rejeter</Button>
                  <Button variant="success" icon={<Check className="size-4" />} loading={valider.isPending} onClick={() => valider.mutate(current.id)}>Valider le paiement</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      <Modal open={deleting} onClose={() => setDeleting(false)} title="Supprimer cet inscrit ?"
        footer={<><Button variant="ghost" onClick={() => setDeleting(false)}>Annuler</Button><Button variant="danger" icon={<Trash2 className="size-4" />} loading={supprimer.isPending} onClick={() => current && supprimer.mutate(current.inscriptionId)}>Supprimer définitivement</Button></>}>
        <p className="text-sm text-muted"><strong className="text-fg">{current?.participant}</strong> ({current?.participantEmail}) sera supprimé avec son compte, son paiement et son justificatif. Action <strong className="text-fg">irréversible</strong> ; l'adresse e-mail pourra être réutilisée pour une nouvelle inscription.</p>
      </Modal>

      <Modal open={rejecting} onClose={() => setRejecting(false)} title="Rejeter le paiement"
        footer={<><Button variant="ghost" onClick={() => setRejecting(false)}>Annuler</Button><Button variant="danger" disabled={motif.trim().length < 3} loading={rejeter.isPending} onClick={() => current && rejeter.mutate(current.id)}>Confirmer le rejet</Button></>}>
        <Field label="Motif (envoyé au participant)" required><Textarea autoFocus value={motif} onChange={e => setMotif(e.target.value)} placeholder="Ex. : le montant du reçu ne correspond pas aux frais de participation." /></Field>
      </Modal>
    </>
  )
}
