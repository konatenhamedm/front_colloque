import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Contact, CreditCard, Image as ImageIcon, Plus, Save, Settings2, Trash2, UserRound } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { api, ApiError } from '@/lib/api'
import type { Canal, Categorie, Colloque, ColloqueAdmin, MembreComite, Personne } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import { PageHeader, Skeleton } from '../../components/ui/misc'
import { PaymentLogo } from '../../components/ui/PaymentLogo'
import { useToast } from '../../components/ui/Toast'
import { ItemsManager } from './ItemsManager'

const CANAUX = [['ORANGE_MONEY', 'Orange Money'], ['WAVE', 'Wave'], ['MOOV_MONEY', 'Moov Money'], ['MTN_MONEY', 'MTN Money'], ['WESTERN_UNION', 'Western Union'], ['RIA', 'RIA'], ['MONEYGRAM', 'MoneyGram'], ['VIREMENT', 'Virement bancaire']] as const
const lines = (v: string) => v.split(/\n/).map(x => x.trim()).filter(Boolean)
const text = (a: string[] | undefined) => (a ?? []).join('\n')

/** Enregistre un morceau de la configuration (PUT partiel). */
function useSave() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.put<ColloqueAdmin>('/admin/colloque', payload),
    onSuccess: d => { qc.setQueryData(['admin-colloque'], d); qc.invalidateQueries({ queryKey: ['colloque'] }); toast.success('Configuration enregistrée.') },
  })
}
const errorOf = (e: unknown) => (e instanceof ApiError ? e.message : null)

function SaveBar({ pending, error }: { pending: boolean; error: string | null }) {
  return (
    <div className="sticky bottom-0 -mx-5 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface/95 px-5 py-3.5 backdrop-blur">
      <div role="alert" className="text-sm font-semibold text-bad">{error}</div>
      <Button type="submit" loading={pending} icon={<Save className="size-4" />}>Enregistrer</Button>
    </div>
  )
}

/** Liste de lignes éditables (ajout / suppression). */
function Rows<T extends object>({ rows, onChange, blank, addLabel, children }: { rows: T[]; onChange: (r: T[]) => void; blank: T; addLabel: string; children: (row: T, set: (patch: Partial<T>) => void, i: number) => ReactNode }) {
  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => (
        <div key={i} className="flex items-start gap-2 rounded-xl border border-line bg-surface-2/50 p-3">
          <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">{children(r, patch => onChange(rows.map((x, j) => (j === i ? { ...x, ...patch } : x))), i)}</div>
          <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} aria-label="Supprimer cette ligne" className="mt-1 rounded-lg p-2 text-muted hover:bg-bad-soft hover:text-bad"><Trash2 className="size-4" /></button>
        </div>
      ))}
      <Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => onChange([...rows, { ...blank }])}>{addLabel}</Button>
    </div>
  )
}

function General({ c }: { c: Colloque }) {
  const save = useSave()
  const [f, setF] = useState({ titre: c.titre, sousTitre: c.sousTitre ?? '', theme: c.theme, dateDebut: c.dateDebut, dateFin: c.dateFin, heures: c.heures ?? '', lieu: c.lieu, dateLimitePaiement: c.dateLimitePaiement, cibles: text(c.cibles), avantages: text(c.avantages) })
  const [cal, setCal] = useState(c.calendrier.map(x => ({ libelle: x.libelle, date: x.date })))
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF(s => ({ ...s, [k]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); save.mutate({ ...f, cibles: lines(f.cibles), avantages: lines(f.avantages), calendrier: cal }) }}>
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <Field label="Nom de l'événement" required><Input required value={f.titre} onChange={set('titre')} /></Field>
        <Field label="Édition / sous-titre" hint="Ex. : 3ᵉ édition"><Input value={f.sousTitre} onChange={set('sousTitre')} /></Field>
        <div className="sm:col-span-2"><Field label="Thème" required><Textarea required className="min-h-20" value={f.theme} onChange={set('theme')} /></Field></div>
        <Field label="Date de début" required><Input type="date" required value={f.dateDebut} onChange={set('dateDebut')} /></Field>
        <Field label="Date de fin" required hint="Identique à la date de début pour un événement d'un jour"><Input type="date" required value={f.dateFin} onChange={set('dateFin')} /></Field>
        <Field label="Horaires" hint="Ex. : 08h00 – 16h00"><Input value={f.heures} onChange={set('heures')} /></Field>
        <Field label="Date limite de paiement" required><Input type="date" required value={f.dateLimitePaiement} onChange={set('dateLimitePaiement')} /></Field>
        <div className="sm:col-span-2"><Field label="Lieu" required><Input required value={f.lieu} onChange={set('lieu')} /></Field></div>
        <Field label="Publics ciblés" hint="Un par ligne"><Textarea value={f.cibles} onChange={set('cibles')} /></Field>
        <Field label="Les frais donnent droit à…" hint="Un par ligne (ex. : Déjeuner)"><Textarea value={f.avantages} onChange={set('avantages')} /></Field>
        <div className="sm:col-span-2">
          <span className="mb-2 block text-xs font-bold">Dates à retenir (page d'accueil)</span>
          <Rows rows={cal} onChange={setCal} blank={{ libelle: '', date: '' }} addLabel="Ajouter une date">
            {(r, set2) => <><Input placeholder="Intitulé" value={r.libelle} onChange={e => set2({ libelle: e.target.value })} /><Input placeholder="Date (ex. 25 novembre 2026)" value={r.date} onChange={e => set2({ date: e.target.value })} /></>}
          </Rows>
        </div>
      </div>
      <div className="px-5"><SaveBar pending={save.isPending} error={errorOf(save.error)} /></div>
    </form>
  )
}

function TarifsPaiement({ c }: { c: Colloque }) {
  const save = useSave()
  const [cats, setCats] = useState<{ id?: number; libelle: string; montant: string }[]>(c.categories.map((x: Categorie) => ({ id: x.id, libelle: x.libelle, montant: String(x.montant) })))
  const [canaux, setCanaux] = useState(c.canauxPaiement.map((x: Canal) => ({ code: x.code, numeros: text(x.numeros), instructions: x.instructions })))
  return (
    <form onSubmit={e => { e.preventDefault(); save.mutate({ categories: cats.map(x => ({ ...x, montant: x.montant === '' ? null : Number(x.montant) })), canauxPaiement: canaux.map(x => ({ ...x, numeros: lines(x.numeros) })) }) }}>
      <div className="space-y-8 p-5">
        <section>
          <h3 className="mb-1 text-sm font-extrabold">Catégories et tarifs</h3>
          <p className="mb-3 text-xs text-muted">Le montant est en FCFA. Une catégorie utilisée par des inscrits ne peut pas être supprimée.</p>
          <Rows rows={cats} onChange={setCats} blank={{ libelle: '', montant: '' }} addLabel="Ajouter une catégorie">
            {(r, set) => <><Input required placeholder="Libellé (ex. Étudiant)" value={r.libelle} onChange={e => set({ libelle: e.target.value })} /><Input required type="number" min={0} placeholder="Montant en FCFA" value={r.montant} onChange={e => set({ montant: e.target.value })} /></>}
          </Rows>
        </section>
        <section>
          <h3 className="mb-1 text-sm font-extrabold">Moyens de paiement et numéros</h3>
          <p className="mb-3 text-xs text-muted">Seuls les moyens listés ici sont proposés aux participants. Un numéro par ligne.</p>
          <Rows rows={canaux} onChange={setCanaux} blank={{ code: 'WAVE', numeros: '', instructions: '' }} addLabel="Ajouter un moyen de paiement">
            {(r, set) => (
              <>
                <div className="flex items-center gap-3"><PaymentLogo code={r.code} className="h-10 w-12" /><Select value={r.code} onChange={e => set({ code: e.target.value })}>{CANAUX.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</Select></div>
                <Textarea className="min-h-14" placeholder={'Numéros (un par ligne)\n07 00 00 00 00'} value={r.numeros} onChange={e => set({ numeros: e.target.value })} />
                <div className="sm:col-span-2"><Input placeholder="Instructions affichées au participant (facultatif)" value={r.instructions} onChange={e => set({ instructions: e.target.value })} /></div>
              </>
            )}
          </Rows>
        </section>
      </div>
      <div className="px-5"><SaveBar pending={save.isPending} error={errorOf(save.error)} /></div>
    </form>
  )
}

function ContactsComite({ c }: { c: Colloque }) {
  const save = useSave()
  const [email, setEmail] = useState(c.contacts.email)
  const [tels, setTels] = useState(text(c.contacts.telephones))
  const [orgs, setOrgs] = useState(text(c.contacts.organisateurs))
  const [pers, setPers] = useState<Personne[]>(c.contacts.personnes ?? [])
  const [comite, setComite] = useState<MembreComite[]>(c.comite)
  return (
    <form onSubmit={e => { e.preventDefault(); save.mutate({ contacts: { email, telephones: lines(tels), organisateurs: lines(orgs), personnes: pers }, comite }) }}>
      <div className="space-y-8 p-5">
        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="E-mail de contact principal"><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></Field>
          <Field label="Organisé par" hint="Un organisme par ligne (affiché en bas de page et sur l'attestation)"><Textarea className="min-h-16" value={orgs} onChange={e => setOrgs(e.target.value)} /></Field>
          <div className="sm:col-span-2"><Field label="Téléphones" hint="Un par ligne"><Textarea className="min-h-16" value={tels} onChange={e => setTels(e.target.value)} /></Field></div>
        </section>
        <section>
          <h3 className="mb-1 text-sm font-extrabold">Personnes à contacter</h3>
          <p className="mb-3 text-xs text-muted">Affichées dans le pied de page de l'accueil.</p>
          <Rows rows={pers} onChange={setPers} blank={{ nom: '', telephone: '', email: '' }} addLabel="Ajouter un contact">
            {(r, set) => <><Input required placeholder="Nom" value={r.nom} onChange={e => set({ nom: e.target.value })} /><Input placeholder="Téléphone" value={r.telephone} onChange={e => set({ telephone: e.target.value })} /><div className="sm:col-span-2"><Input type="email" placeholder="E-mail" value={r.email} onChange={e => set({ email: e.target.value })} /></div></>}
          </Rows>
        </section>
        <section>
          <h3 className="mb-1 text-sm font-extrabold">Comité d'organisation</h3>
          <p className="mb-3 text-xs text-muted">L'ordre de la liste est l'ordre d'affichage sur la page d'accueil.</p>
          <Rows rows={comite} onChange={setComite} blank={{ role: '', nom: '', details: '' }} addLabel="Ajouter un membre">
            {(r, set) => <><Input placeholder="Fonction (ex. Trésorière)" value={r.role} onChange={e => set({ role: e.target.value })} /><Input required placeholder="Nom" value={r.nom} onChange={e => set({ nom: e.target.value })} /><div className="sm:col-span-2"><Input placeholder="Précisions (institution, grade…)" value={r.details} onChange={e => set({ details: e.target.value })} /></div></>}
          </Rows>
        </section>
      </div>
      <div className="px-5"><SaveBar pending={save.isPending} error={errorOf(save.error)} /></div>
    </form>
  )
}

const TABS = [
  { id: 'general', label: 'Général', icon: Settings2 },
  { id: 'tarifs', label: 'Tarifs & paiement', icon: CreditCard },
  { id: 'contacts', label: 'Contacts & comité', icon: Contact },
  { id: 'animateurs', label: 'Animateurs', icon: UserRound },
  { id: 'signatures', label: 'Signatures & logos', icon: ImageIcon },
] as const
type Tab = (typeof TABS)[number]['id']

export function Parametres() {
  const [tab, setTab] = useState<Tab>('general')
  const { data, isLoading, error } = useQuery({ queryKey: ['admin-colloque'], queryFn: () => api.get<ColloqueAdmin>('/admin/colloque') })

  return (
    <>
      <PageHeader title="Paramètres du forum" subtitle="Tout ce qui s'affiche sur la page d'accueil, sur le reçu et sur l'attestation se modifie ici." />
      <div role="tablist" aria-label="Sections" className="mb-5 flex gap-1 overflow-x-auto rounded-2xl border border-line bg-surface p-1.5 shadow-card [scrollbar-width:none]">
        {TABS.map(t => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={cn('flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition', tab === t.id ? 'bg-brand text-brand-fg shadow-sm' : 'text-muted hover:bg-surface-2 hover:text-fg')}>
            <t.icon className="size-4" />{t.label}
          </button>
        ))}
      </div>

      {isLoading && <Card className="p-6"><Skeleton className="h-64 w-full" /></Card>}
      {error && <Card className="p-6 text-sm font-semibold text-bad">{errorOf(error) ?? 'Chargement impossible.'}</Card>}
      {data && (
        <Card>
          {tab === 'general' && <><CardHeader title="Informations générales" subtitle="Nom, date, horaires, lieu et publics ciblés." action={<CalendarDays className="size-5 text-subtle" />} /><General c={data.colloque} /></>}
          {tab === 'tarifs' && <><CardHeader title="Tarifs et moyens de paiement" subtitle="Montants à payer et numéros affichés aux participants." /><TarifsPaiement c={data.colloque} /></>}
          {tab === 'contacts' && <><CardHeader title="Contacts et comité d'organisation" /><ContactsComite c={data.colloque} /></>}
          {tab === 'animateurs' && (
            <><CardHeader title="Animateurs de session" subtitle="Affichés sur la page d'accueil avec leur photo et leur rôle (leçon inaugurale, axes…)." />
              <div className="p-5"><ItemsManager items={data.items} cfg={{ type: 'INTERVENANT', singular: 'animateur', roleLabel: 'Rôle dans le programme', rolePlaceholder: 'Leçon inaugurale, Axe 1…', titreLabel: 'Titre / fonction', titrePlaceholder: 'Ex. : Directeur de l\'École doctorale…', imageHelp: 'Photo JPG, PNG ou WebP (10 Mo max). De préférence en portrait.', shape: 'portrait' }} /></div></>
          )}
          {tab === 'signatures' && (
            <>
              <CardHeader title="Signatures du reçu et de l'attestation" subtitle="Les images de signature sont privées : visibles uniquement ici et sur les PDF générés." />
              <div className="p-5"><ItemsManager items={data.items} cfg={{ type: 'SIGNATAIRE', singular: 'signataire', roleLabel: 'Fonction sur le document', rolePlaceholder: 'Le Responsable, La Trésorière…', titreLabel: 'Titre', titrePlaceholder: 'Ex. : Maître de Conférences, UFHB-IGT', detailsLabel: 'Contact (facultatif)', detailsPlaceholder: 'Téléphone, e-mail…', imageHelp: 'Scan de la signature (et cachet) sur fond clair. JPG, PNG ou WebP.', shape: 'wide' }} /></div>
              <CardHeader title="Logos des organisateurs" subtitle="Affichés sous l'en-tête de la page d'accueil, sur le reçu et sur l'attestation." />
              <div className="p-5"><ItemsManager items={data.items} cfg={{ type: 'PARTENAIRE', singular: 'logo', roleLabel: 'Sigle', rolePlaceholder: 'UFHB, IGT…', imageHelp: 'Logo JPG, PNG ou WebP, de préférence sur fond blanc.', shape: 'wide' }} /></div>
            </>
          )}
        </Card>
      )}
    </>
  )
}
