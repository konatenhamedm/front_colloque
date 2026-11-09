import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Award, CalendarDays, Clock, Download, FileUp, MapPin, Receipt } from 'lucide-react'
import { useState } from 'react'
import { api, ApiError } from '@/lib/api'
import { session, useSession } from '@/lib/auth'
import { fcfa, fmtDate } from '@/lib/format'
import type { Colloque, Statut } from '@/lib/types'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { StatutBadge } from '../../components/ui/Badge'
import { Field, Input } from '../../components/ui/Field'
import { PaymentPicker } from '../../components/ui/PaymentLogo'
import { Stepper } from '../../components/ui/Stepper'
import { useToast } from '../../components/ui/Toast'

const STEPS = ['Inscription envoyée', 'Paiement validé', 'Participation validée', 'Attestation']
const STEP_INDEX: Record<Statut, number> = { PENDING_PAYMENT: 1, REJECTED: 1, PAYMENT_VALIDATED: 2, ATTENDED_AND_VALIDATED: 3, CERTIFICATE_ISSUED: 4 }

function Correction() {
  const toast = useToast()
  const { data: c } = useQuery({ queryKey: ['colloque'], queryFn: () => api.get<Colloque>('/public/colloque') })
  const [canal, setCanal] = useState('')
  const [reference, setReference] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const m = useMutation({
    mutationFn: () => { if (!canal) throw new ApiError(400, 'Choisissez le mode de paiement.'); const fd = new FormData(); fd.append('canal', canal); fd.append('reference', reference); if (file) fd.append('justificatif', file); return api.post('/espace/paiement/corriger', fd) },
    onSuccess: async () => { await session.refresh(); toast.success('Nouvelle preuve envoyée.') },
  })
  return (
    <Card>
      <CardHeader title="Corriger mon paiement" subtitle="Renvoyez une preuve de paiement valide." />
      <form className="grid gap-4 p-5 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); m.mutate() }}>
        <div className="sm:col-span-2"><span className="mb-2 block text-xs font-bold">Mode de paiement <span className="text-bad">*</span></span><PaymentPicker options={c?.canauxPaiement ?? []} value={canal} onChange={setCanal} /></div>
        <div className="sm:col-span-2"><Field label="Référence de la transaction" hint="Facultative si vous joignez le reçu"><Input value={reference} onChange={e => setReference(e.target.value)} /></Field></div>
        <div className="sm:col-span-2">
          <Field label="Reçu ou capture" hint="Facultatif si vous indiquez la référence">
            <span className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-line px-4 py-3 text-sm hover:border-brand"><FileUp className="size-5 text-brand" /><span className="truncate font-semibold">{file ? file.name : 'Choisir un fichier…'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={e => setFile(e.target.files?.[0] ?? null)} /></span>
          </Field>
        </div>
        {m.error instanceof ApiError && <div role="alert" className="text-sm font-semibold text-bad sm:col-span-2">{m.error.message}</div>}
        <div className="sm:col-span-2"><Button type="submit" loading={m.isPending}>Envoyer la nouvelle preuve</Button></div>
      </form>
    </Card>
  )
}

export function MemberHome() {
  const s = useSession()
  const toast = useToast()
  const qc = useQueryClient()
  const ins = s?.inscription
  const { data: c } = useQuery({ queryKey: ['colloque'], queryFn: () => api.get<Colloque>('/public/colloque') })
  // Rafraîchit le statut à l'ouverture : l'admin a pu valider entre-temps.
  useQuery({ queryKey: ['me-refresh'], queryFn: async () => { await session.refresh(); return true }, staleTime: 0 })

  const dl = useMutation({
    mutationFn: ({ path, name }: { path: string; name: string }) => api.download(path, name),
    onError: e => toast.error(e instanceof ApiError ? e.message : 'Téléchargement impossible.'),
  })

  if (!ins) return <Card className="p-8 text-center text-muted">Aucune inscription associée à ce compte.</Card>
  const pay = ins.dernierPaiement
  const active = ['PAYMENT_VALIDATED', 'ATTENDED_AND_VALIDATED', 'CERTIFICATE_ISSUED'].includes(ins.statut)
  void qc

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Bonjour {s?.user.prenom} 👋</h1>
        <p className="mt-1 text-sm text-muted">{ins.categorie.libelle} · {ins.institution}</p>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2"><h2 className="font-display text-base font-extrabold">Suivi de mon inscription</h2><StatutBadge statut={ins.statut} /></div>
        <Stepper steps={STEPS} current={STEP_INDEX[ins.statut]} failed={ins.statut === 'REJECTED'} />

        {ins.statut === 'PENDING_PAYMENT' && (
          <div className="mt-6 flex items-start gap-3 rounded-xl bg-warn-soft p-4 text-sm"><Clock className="mt-0.5 size-5 shrink-0 text-warn" />
            <p><strong>Votre paiement est en cours de vérification.</strong> Dès validation par les organisateurs, vous recevrez votre reçu par e-mail et pourrez le télécharger ici.</p></div>
        )}
        {ins.statut === 'REJECTED' && (
          <div role="alert" className="mt-6 flex items-start gap-3 rounded-xl bg-bad-soft p-4 text-sm"><AlertTriangle className="mt-0.5 size-5 shrink-0 text-bad" />
            <div><strong>Votre paiement n'a pas pu être validé.</strong><p className="mt-1">Motif : {ins.motifRejet}</p></div></div>
        )}
      </Card>

      {ins.statut === 'REJECTED' && <Correction />}

      {pay && (
        <Card>
          <CardHeader title="Mon paiement" />
          <dl className="grid gap-4 p-5 text-sm sm:grid-cols-3">
            <div><dt className="text-xs text-muted">Montant</dt><dd className="font-extrabold">{fcfa(pay.montant)}</dd></div>
            <div><dt className="text-xs text-muted">Mode</dt><dd className="font-bold">{pay.canalLabel}</dd></div>
            <div><dt className="text-xs text-muted">Référence</dt><dd className="font-mono text-xs font-bold">{pay.reference ?? (pay.justificatif ? "Reçu joint" : "—")}</dd></div>
          </dl>
        </Card>
      )}

      {active && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <Receipt className="size-6 text-accent" /><h3 className="mt-3 font-display text-base font-extrabold">Reçu de paiement</h3>
            <p className="mt-1 text-sm text-muted">À imprimer et à présenter à l'accueil le jour de l'événement.</p>
            <Button className="mt-4" variant="accent" icon={<Download className="size-4" />} loading={dl.isPending && dl.variables?.name.startsWith('recu')} onClick={() => dl.mutate({ path: '/espace/recu/telecharger', name: 'recu-paiement.pdf' })}>Télécharger le reçu</Button>
          </Card>
          <Card className="p-5">
            <Award className="size-6 text-ok" /><h3 className="mt-3 font-display text-base font-extrabold">Attestation de participation</h3>
            {ins.statut === 'CERTIFICATE_ISSUED'
              ? <><p className="mt-1 text-sm text-muted">Votre attestation est disponible. Vous pouvez l'imprimer.</p>
                  <Button className="mt-4" variant="success" icon={<Download className="size-4" />} loading={dl.isPending && dl.variables?.name.startsWith('attestation')} onClick={() => dl.mutate({ path: '/espace/attestation/telecharger', name: 'attestation.pdf' })}>Télécharger l'attestation</Button></>
              : <p className="mt-1 text-sm text-muted">Elle sera envoyée par e-mail après l'événement et téléchargeable ici.</p>}
          </Card>
        </div>
      )}

      {c && (
        <Card>
          <CardHeader title="L'événement" />
          <div className="space-y-2 p-5 text-sm">
            <p className="font-bold">{c.theme}</p>
            <p className="flex items-center gap-2 text-muted"><CalendarDays className="size-4" />{fmtDate(c.dateDebut)}</p>
            <p className="flex items-center gap-2 text-muted"><MapPin className="size-4" />{c.lieu}</p>
          </div>
        </Card>
      )}
    </div>
  )
}
