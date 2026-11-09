import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Award, Eye, LayoutTemplate, MailCheck, Send } from 'lucide-react'
import { useState } from 'react'
import { api, ApiError } from '@/lib/api'
import type { Inscription, Stats } from '@/lib/types'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, KpiCard } from '../../components/ui/Card'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Modal } from '../../components/ui/Modal'
import { EmptyState, PageHeader } from '../../components/ui/misc'
import { useToast } from '../../components/ui/Toast'
import { AttestationPreview, MODELES, type ModeleCode } from './AttestationPreview'

export function Attestations() {
  const qc = useQueryClient()
  const toast = useToast()
  const [confirm, setConfirm] = useState(false)
  const [preview, setPreview] = useState<{ open: boolean; inscription: Inscription | null }>({ open: false, inscription: null })
  const [template, setTemplate] = useState<ModeleCode | null>(() => { try { return (localStorage.getItem('co_att_tpl') as ModeleCode) || null } catch { return null } })
  const modeles = useQuery({ queryKey: ['att-modeles'], queryFn: () => api.get<{ defaut: ModeleCode }>('/admin/attestations/modeles'), staleTime: Infinity })
  const tpl: ModeleCode = template ?? modeles.data?.defaut ?? 'classique'
  const chooseTemplate = (t: ModeleCode) => { setTemplate(t); try { localStorage.setItem('co_att_tpl', t) } catch { /* noop */ } }
  const stats = useQuery({ queryKey: ['stats'], queryFn: () => api.get<Stats>('/admin/stats') })
  const list = useQuery({ queryKey: ['inscrits', 'attestations'], queryFn: () => api.page<Inscription>('/admin/inscriptions', { statut: 'ATTENDED_AND_VALIDATED', limit: 100 }) })

  const emettre = useMutation({
    mutationFn: (ids: number[] | null) => api.post<{ emises: number[]; ignorees: { id: number; raison: string }[] }>('/admin/attestations/emettre', { ...(ids ? { ids } : {}), template: tpl }),
    onSuccess: r => { qc.invalidateQueries({ queryKey: ['inscrits'] }); qc.invalidateQueries({ queryKey: ['stats'] }); setConfirm(false); setPreview({ open: false, inscription: null }); toast.success(`${r.emises.length} attestation(s) générée(s) et envoyée(s) par e-mail.`) },
    onError: e => toast.error(e instanceof ApiError ? e.message : 'Génération impossible.'),
  })
  const aEmettre = list.data?.meta.total ?? 0
  const cols: Column<Inscription>[] = [
    { key: 'n', header: 'Participant', cell: r => <div><div className="font-bold">{r.utilisateur.nomComplet}</div><div className="text-xs text-muted">{r.utilisateur.email}</div></div> },
    { key: 'i', header: 'Institution', cell: r => <span className="text-muted">{r.institution}</span> },
    { key: 'a', header: '', className: 'text-right', cell: r => (
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" icon={<Eye className="size-3.5" />} onClick={() => setPreview({ open: true, inscription: r })}>Aperçu</Button>
        <Button size="sm" variant="secondary" icon={<Send className="size-3.5" />} loading={emettre.isPending && emettre.variables?.[0] === r.id} onClick={() => emettre.mutate([r.id])}>Émettre</Button>
      </div>) },
  ]

  return (
    <>
      <PageHeader title="Attestations" subtitle="Générez les attestations à la fin de l'événement : chaque participant la reçoit par e-mail et l'imprime lui-même."
        action={<div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={<LayoutTemplate className="size-4" />} onClick={() => setPreview({ open: true, inscription: null })}>Aperçu du modèle · {MODELES.find(m => m.code === tpl)?.label}</Button>
          <Button icon={<Award className="size-4" />} disabled={aEmettre === 0} onClick={() => setConfirm(true)}>Générer et envoyer à tous ({aEmettre})</Button>
        </div>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <KpiCard tone="accent" icon={<Award className="size-5" />} label="À émettre" value={aEmettre} hint="Présence validée, attestation non générée" loading={list.isLoading} />
        <KpiCard tone="ok" icon={<MailCheck className="size-5" />} label="Déjà émises" value={stats.data?.inscrits.attestationsEmises} hint="Envoyées par e-mail" loading={stats.isLoading} />
      </div>
      <Card>
        <CardHeader title="Prêts pour l'attestation" subtitle="Validez d'abord la présence dans « Liste des inscrits »." />
        <DataTable columns={cols} rows={list.data?.data} loading={list.isLoading} rowKey={r => r.id}
          empty={<EmptyState icon={<Award className="size-8" />} title="Rien à émettre" text="Aucun participant n'est en attente d'attestation." />} />
      </Card>
      <AttestationPreview open={preview.open} onClose={() => setPreview({ open: false, inscription: null })} inscription={preview.inscription}
        template={tpl} onTemplate={chooseTemplate} onEmit={id => emettre.mutate([id])} emitting={emettre.isPending} />
      <Modal open={confirm} onClose={() => setConfirm(false)} title={`Envoyer ${aEmettre} attestation(s) ?`}
        footer={<><Button variant="ghost" onClick={() => setConfirm(false)}>Annuler</Button><Button loading={emettre.isPending} onClick={() => emettre.mutate(null)}>Générer et envoyer</Button></>}>
        <p className="text-sm text-muted">Un PDF nominatif avec QR code de vérification est généré pour chaque participant et envoyé à son adresse e-mail. Cette action ne peut pas être annulée.</p>
      </Modal>
    </>
  )
}
