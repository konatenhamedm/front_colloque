import { useQuery } from '@tanstack/react-query'
import { Banknote, Clock, TrendingUp, Users } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '@/lib/api'
import { fcfa, fmtShort } from '@/lib/format'
import type { Stats } from '@/lib/types'
import { Card, CardHeader, KpiCard } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/misc'

const axis = { stroke: 'var(--subtle)', fontSize: 11, tickLine: false, axisLine: false } as const

function Tip({ active, payload, label, unit }: { active?: boolean; payload?: { value: number }[]; label?: string; unit?: (n: number) => string }) {
  if (!active || !payload?.length) return null
  return <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-card"><div className="font-bold">{label}</div><div className="text-muted">{unit ? unit(payload[0].value) : payload[0].value}</div></div>
}

export function Dashboard() {
  const { data: s, isLoading } = useQuery({ queryKey: ['stats'], queryFn: () => api.get<Stats>('/admin/stats'), refetchInterval: 30_000 })
  const jours = s?.inscriptionsParJour.map(j => ({ ...j, label: fmtShort(j.jour) })) ?? []
  const max = Math.max(1, ...(s?.parStatut.map(x => x.total) ?? [1]))

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble des inscriptions et des paiements en temps réel." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard loading={isLoading} tone="brand" icon={<Users className="size-5" />} label="Inscrits" value={s?.inscrits.total} hint={`${s?.inscrits.valides ?? 0} validés`} />
        <KpiCard loading={isLoading} tone="warn" icon={<Clock className="size-5" />} label="En attente de validation" value={s?.inscrits.enAttente} hint={s ? `${fcfa(s.finances.montantEnAttente)} à vérifier` : ''} />
        <KpiCard loading={isLoading} tone="ok" icon={<TrendingUp className="size-5" />} label="Taux de conversion" value={s ? `${s.tauxConversion} %` : ''} hint="Inscrits payés / total" />
        <KpiCard loading={isLoading} tone="accent" icon={<Banknote className="size-5" />} label="Total collecté" value={s ? fcfa(s.finances.totalCollecte) : ''} hint="Paiements validés" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Inscriptions par jour" subtitle="30 derniers jours" />
          <div className="h-80 p-4" role="img" aria-label="Courbe des inscriptions par jour">
            <ResponsiveContainer>
              <AreaChart data={jours} margin={{ left: -20, right: 8, top: 8 }}>
                <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--chart-2)" stopOpacity={0.35} /><stop offset="1" stopColor="var(--chart-2)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" {...axis} /><YAxis allowDecimals={false} {...axis} />
                <Tooltip content={<Tip />} cursor={{ stroke: 'var(--line)' }} />
                <Area type="monotone" dataKey="total" stroke="var(--chart-2)" strokeWidth={2} fill="url(#g)" dot={{ r: 3, fill: 'var(--chart-2)', stroke: 'var(--surface)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Répartition par statut" />
          <ul className="space-y-3.5 p-5">
            {s?.parStatut.map(x => (
              <li key={x.statut}>
                <div className="mb-1 flex justify-between text-xs"><span className="font-semibold">{x.libelle}</span><span className="font-extrabold tabular-nums">{x.total}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-[var(--chart-2)] transition-all" style={{ width: `${(x.total / max) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Encaissements par canal" subtitle="Paiements validés (FCFA)" />
          <div className="h-64 p-4" role="img" aria-label="Montants encaissés par canal de paiement">
            <ResponsiveContainer>
              <BarChart data={s?.finances.parCanal} margin={{ left: 0, right: 8, top: 8 }}>
                <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="libelle" {...axis} /><YAxis {...axis} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip content={<Tip unit={fcfa} />} cursor={{ fill: 'var(--surface-2)' }} />
                <Bar dataKey="montant" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Par catégorie de participant" />
          <ul className="divide-y divide-line">
            {s?.parCategorie.map(c => <li key={c.categorie} className="flex items-center justify-between px-5 py-3.5 text-sm"><span className="font-semibold">{c.categorie}</span><span className="font-extrabold tabular-nums">{c.total}</span></li>)}
          </ul>
        </Card>
      </div>
    </>
  )
}
