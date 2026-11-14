import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { CheckCircle2, FileUp, ShieldCheck, Wallet } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { api, ApiError } from '@/lib/api'
import { session } from '@/lib/auth'
import { COUNTRIES, DEFAULT_COUNTRY } from '@/lib/countries'
import { fcfa } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Colloque } from '@/lib/types'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, Input, Select } from '../../components/ui/Field'
import { NumeroDepotPicker } from '../../components/ui/NumeroDepot'
import { PaymentChip, PaymentPicker } from '../../components/ui/PaymentLogo'
import { useToast } from '../../components/ui/Toast'

/** Inscription directe : e-mail, informations, paiement et mot de passe sur une seule page (plus de lien envoyé par e-mail). */
export function RegisterPage() {
  const nav = useNavigate()
  const toast = useToast()
  const { data: c } = useQuery({ queryKey: ['colloque'], queryFn: () => api.get<Colloque>('/public/colloque') })

  const [f, setF] = useState({ email: '', nom: '', prenom: '', telephone: '', institution: '', pays: DEFAULT_COUNTRY, categorieId: '', typeParticipation: 'AUDITEUR', canal: '', numeroDepot: '', reference: '', repas: false, password: '', password2: '' })
  const [file, setFile] = useState<File | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF(s => ({ ...s, [k]: e.target.value }))

  const submit = useMutation({
    mutationFn: async () => {
      const fd = new FormData()
      Object.entries(f).forEach(([k, v]) => k !== 'password2' && fd.append(k, String(v)))
      if (file) fd.append('justificatif', file)
      return api.post<{ token: string }>('/auth/inscription', fd)
    },
    onSuccess: async r => { await session.adopt(r.token); toast.success('Inscription enregistrée !'); nav({ to: '/espace' }) },
  })

  const categorie = c?.categories.find(x => String(x.id) === f.categorieId)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    if (!f.canal) return setLocalError('Choisissez le mode de paiement que vous avez utilisé.')
    if (f.password.length < 8) return setLocalError('Le mot de passe doit contenir au moins 8 caractères.')
    if (f.password !== f.password2) return setLocalError('Les mots de passe ne correspondent pas.')
    if (!f.reference.trim() && !file) return setLocalError('Indiquez la référence de la transaction ou joignez le reçu de votre paiement.')
    submit.mutate()
  }
  const err = localError ?? (submit.error instanceof ApiError ? submit.error.message : null)

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Inscription au forum</h1>
        <p className="mt-1 text-sm text-muted">Remplissez ce formulaire en une seule fois. Déjà inscrit ? <a href="/connexion" className="font-bold text-brand hover:underline">Se connecter</a></p>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-base font-extrabold"><span className="flex size-6 items-center justify-center rounded-full bg-brand text-xs text-brand-fg">1</span>Vos informations</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label="Adresse e-mail" required hint="Elle servira d'identifiant pour vous connecter"><Input type="email" required autoFocus autoComplete="email" value={f.email} onChange={set('email')} placeholder="vous@exemple.com" /></Field></div>
          <Field label="Nom" required><Input required value={f.nom} onChange={set('nom')} autoComplete="family-name" /></Field>
          <Field label="Prénoms" required><Input required value={f.prenom} onChange={set('prenom')} autoComplete="given-name" /></Field>
          <Field label="Téléphone"><Input type="tel" value={f.telephone} onChange={set('telephone')} autoComplete="tel" placeholder="07 00 00 00 00" /></Field>
          <Field label="Pays"><Select value={f.pays} onChange={set('pays')}>{COUNTRIES.map(x => <option key={x} value={x}>{x}</option>)}</Select></Field>
          <div className="sm:col-span-2"><Field label="Institution / Organisation" required><Input required value={f.institution} onChange={set('institution')} placeholder="Université, entreprise, structure…" /></Field></div>
          <Field label="Catégorie" required>
            <Select required value={f.categorieId} onChange={set('categorieId')}>
              <option value="">Choisir…</option>
              {c?.categories.map(x => <option key={x.id} value={x.id}>{x.libelle} — {fcfa(x.montant)}</option>)}
            </Select>
          </Field>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-base font-extrabold"><span className="flex size-6 items-center justify-center rounded-full bg-brand text-xs text-brand-fg">2</span>Paiement</h2>

        <div className="rounded-xl border border-accent/30 bg-accent-soft p-4 text-sm">
          <div className="flex items-center gap-2 font-extrabold text-accent"><Wallet className="size-5" />Effectuez d'abord votre paiement</div>
          {!!c?.prixRepas && (
            <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl bg-surface p-3 ring-1 ring-line has-[:checked]:ring-2 has-[:checked]:ring-brand">
              <input type="checkbox" className="mt-0.5 size-4 accent-[var(--brand)]" checked={f.repas} onChange={e => setF(s => ({ ...s, repas: e.target.checked }))} />
              <span><strong>Je souhaite prendre le déjeuner</strong> <span className="text-muted">(facultatif, +{fcfa(c.prixRepas)})</span></span>
            </label>
          )}
          {categorie
            ? <p className="mt-2">Montant à payer : <strong className="text-base">{fcfa(categorie.montant + (f.repas ? c?.prixRepas ?? 0 : 0))}</strong>{f.repas && !!c?.prixRepas && <span className="text-muted"> ({fcfa(categorie.montant)} + déjeuner {fcfa(c.prixRepas)})</span>}</p>
            : <p className="mt-2 text-muted">Choisissez votre catégorie ci-dessus pour voir le montant à payer.</p>}
          <p className="mt-2 text-muted">Envoyez ce montant à l'un des numéros suivants, selon le moyen de paiement choisi :</p>
          <ul className="mt-3 space-y-2">
            {c?.canauxPaiement.map(x => (
              <li key={x.code} className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-surface p-2.5 ring-2 transition', f.canal === x.code ? 'ring-brand' : 'ring-transparent')}>
                <PaymentChip code={x.code} label={x.libelle} />
                <span className="flex flex-wrap gap-2">{x.numeros.map(n => <span key={n} className="rounded-lg bg-brand-soft px-2.5 py-1 font-mono text-sm font-bold text-brand">{n}</span>)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Les frais de participation ne sont pas remboursables.</p>
        </div>

        <p className="mb-3 mt-6 text-sm font-extrabold">Puis renseignez votre paiement ci-dessous</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <span className="mb-2 block text-xs font-bold">Mode de paiement utilisé <span className="text-bad">*</span></span>
            <PaymentPicker options={c?.canauxPaiement ?? []} value={f.canal} onChange={code => setF(s => ({ ...s, canal: code, numeroDepot: '' }))} />
          </div>
          <div className="sm:col-span-2"><NumeroDepotPicker canal={c?.canauxPaiement.find(x => x.code === f.canal)} value={f.numeroDepot} onChange={n => setF(s => ({ ...s, numeroDepot: n }))} /></div>
          <div className="sm:col-span-2"><Field label="Référence de la transaction" hint="ID visible dans le SMS ou le reçu"><Input value={f.reference} onChange={set('reference')} /></Field></div>
        </div>
        <div className="mt-4">
          <Field label="Reçu ou capture d'écran du paiement" hint="Image (JPG, PNG, WebP) ou PDF — 10 Mo max">
            <span className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-line bg-surface-2/40 px-4 py-4 text-sm transition hover:border-brand">
              <FileUp className="size-6 shrink-0 text-brand" />
              <span className="min-w-0 flex-1 truncate font-semibold">{file ? file.name : 'Choisir un fichier…'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </span>
          </Field>
        </div>
        <p className="mt-3 text-xs font-semibold text-muted">Renseignez <strong className="text-fg">au moins l'un des deux</strong> : la référence de la transaction ou le reçu. Les organisateurs vérifieront la réception du paiement avant de valider votre inscription.</p>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-base font-extrabold"><span className="flex size-6 items-center justify-center rounded-full bg-brand text-xs text-brand-fg">3</span>Votre accès</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mot de passe" required hint="8 caractères minimum"><Input type="password" required minLength={8} autoComplete="new-password" value={f.password} onChange={set('password')} /></Field>
          <Field label="Confirmer le mot de passe" required><Input type="password" required autoComplete="new-password" value={f.password2} onChange={set('password2')} /></Field>
        </div>
      </Card>

      {err && <div role="alert" className="rounded-xl border border-bad/30 bg-bad-soft px-4 py-3 text-sm font-semibold text-bad">{err}</div>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs text-muted"><ShieldCheck className="size-4 text-ok" />Vos données ne sont utilisées que pour la gestion de l'événement.</p>
        <Button type="submit" size="lg" loading={submit.isPending} icon={<CheckCircle2 className="size-5" />}>Valider mon inscription</Button>
      </div>
    </form>
  )
}
