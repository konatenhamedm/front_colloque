import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, ShieldX } from 'lucide-react'
import { api } from '@/lib/api'
import { fmtDate } from '@/lib/format'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/misc'

interface Verif { numero: string; participant: string; institution: string; qualite: string; colloque: string; lieu: string; dateDebut: string; dateFin: string; emiseLe: string }

/** Page publique ciblée par le QR code de l'attestation : n'expose ni e-mail ni téléphone. */
export function VerifyPage({ code }: { code: string }) {
  const { data, isLoading, isError } = useQuery({ queryKey: ['verif', code], queryFn: () => api.get<Verif>(`/public/attestations/${code}`), retry: false })
  if (isLoading) return <Card className="mx-auto max-w-lg p-8"><Skeleton className="h-40 w-full" /></Card>
  if (isError || !data) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-bad-soft text-bad"><ShieldX className="size-7" /></span>
        <h1 className="mt-5 font-display text-2xl font-extrabold">Attestation introuvable</h1>
        <p className="mt-2 text-sm text-muted">Aucune attestation ne correspond à ce code. Ce document n'est peut-être pas authentique.</p>
      </Card>
    )
  }
  const rows: [string, string][] = [['Numéro', data.numero], ['Participant', data.participant], ['Institution', data.institution], ['Qualité', data.qualite], ['Événement', data.colloque], ['Lieu', data.lieu], ['Date', fmtDate(data.dateDebut)], ['Délivrée le', fmtDate(data.emiseLe)]]
  return (
    <Card className="mx-auto max-w-lg overflow-hidden">
      <div className="bg-ok-soft p-6 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-ok text-white"><BadgeCheck className="size-7" /></span>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-ok">Attestation authentique</h1>
      </div>
      <dl className="divide-y divide-line px-6">
        {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-3 text-sm"><dt className="text-muted">{k}</dt><dd className="text-right font-bold">{v}</dd></div>)}
      </dl>
    </Card>
  )
}
