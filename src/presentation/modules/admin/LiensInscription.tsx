import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, Link2, Mail, Plus, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/api'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Field'
import { EmptyState, PageHeader } from '../../components/ui/misc'
import { useToast } from '../../components/ui/Toast'

interface Lien { email: string; lien: string; creeLe: string; expireLe: string }

function reste(expireLe: string, now: number) {
  const s = Math.max(0, Math.floor((new Date(expireLe).getTime() - now) / 1000))
  return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`
}

async function copier(texte: string) {
  try { await navigator.clipboard.writeText(texte); return true } catch {
    const t = document.createElement('textarea'); t.value = texte; document.body.appendChild(t); t.select()
    const ok = document.execCommand('copy'); t.remove(); return ok
  }
}

export function LiensInscription() {
  const qc = useQueryClient()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const [copie, setCopie] = useState<string | null>(null)
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])

  const { data = [], isLoading, refetch, isFetching } = useQuery({ queryKey: ['liens'], queryFn: () => api.get<Lien[]>('/admin/liens-inscription'), refetchInterval: 20_000 })
  const actifs = data.filter(l => new Date(l.expireLe).getTime() > now)

  const generer = useMutation({
    mutationFn: (envoyer: boolean) => api.post<Lien>('/admin/liens-inscription', { email, envoyer }),
    onSuccess: async (l, envoyer) => {
      qc.invalidateQueries({ queryKey: ['liens'] }); setEmail('')
      const ok = await copier(l.lien)
      toast.success(envoyer ? 'Lien généré et envoyé par e-mail.' : ok ? 'Lien généré et copié dans le presse-papiers.' : 'Lien généré.')
    },
    onError: e => toast.error(e instanceof ApiError ? e.message : 'Génération impossible.'),
  })
  const onCopy = async (l: Lien) => { if (await copier(l.lien)) { setCopie(l.lien); setTimeout(() => setCopie(null), 1800) } else toast.error('Copie impossible : sélectionnez le lien manuellement.') }

  return (
    <div className="space-y-5">
      <PageHeader title="Liens d'inscription" subtitle="Liens envoyés par e-mail, valables 1 heure puis supprimés. Utile si un participant n'a pas reçu son e-mail." action={<Button variant="light" onClick={() => refetch()} disabled={isFetching}><RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />Actualiser</Button>} />

      <Card className="p-5">
        <h2 className="text-sm font-extrabold">Générer un lien pour une adresse</h2>
        <form className="mt-3 flex flex-col gap-3 sm:flex-row" onSubmit={e => { e.preventDefault(); if (email.trim()) generer.mutate(false) }}>
          <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="participant@exemple.com" className="sm:max-w-sm" aria-label="Adresse e-mail du participant" />
          <div className="flex gap-2">
            <Button type="submit" disabled={generer.isPending || !email.trim()}><Plus className="size-4" />Générer et copier</Button>
            <Button type="button" variant="light" disabled={generer.isPending || !email.trim()} onClick={() => generer.mutate(true)}><Mail className="size-4" />Générer et envoyer</Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? <div className="p-6 text-sm text-muted">Chargement…</div> : actifs.length === 0 ? (
          <EmptyState icon={<Link2 className="size-6" />} title="Aucun lien en cours" text="Les liens apparaissent ici dès qu'un visiteur saisit son e-mail, et disparaissent après 1 heure ou une fois utilisés." />
        ) : (
          <ul className="divide-y divide-line">
            {actifs.map(l => (
              <li key={l.lien} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{l.email}</div>
                  <div className="mt-1 truncate rounded-lg bg-surface-2 px-2.5 py-1.5 font-mono text-[11px] text-muted" title={l.lien}>{l.lien}</div>
                </div>
                <div className="flex items-center gap-3 sm:shrink-0">
                  <span className="whitespace-nowrap text-xs font-semibold tabular-nums text-muted">expire dans {reste(l.expireLe, now)}</span>
                  <Button variant="light" onClick={() => onCopy(l)}>{copie === l.lien ? <><Check className="size-4" />Copié</> : <><Copy className="size-4" />Copier</>}</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
