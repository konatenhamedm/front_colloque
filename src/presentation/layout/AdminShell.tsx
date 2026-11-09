import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Banknote, BadgeCheck, LayoutDashboard, ListChecks, LogOut, Menu, Moon, ShieldCheck, Sun, Users, X, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { api } from '@/lib/api'
import { session, useSession } from '@/lib/auth'
import { useTheme } from '@/lib/theme'
import type { Stats } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Logo } from '../components/ui/Logo'
import { Avatar } from '../components/ui/misc'

interface Item { label: string; to: string; icon: LucideIcon; badge?: 'attente' }
const NAV: { title: string; items: Item[] }[] = [
  { title: 'Pilotage', items: [{ label: 'Tableau de bord', to: '/admin', icon: LayoutDashboard }, { label: 'Finances', to: '/admin/finances', icon: Banknote }] },
  { title: 'Inscriptions', items: [
    { label: 'Validations', to: '/admin/validations', icon: ShieldCheck, badge: 'attente' },
    { label: 'Liste des inscrits', to: '/admin/inscrits', icon: Users },
    { label: 'Attestations', to: '/admin/attestations', icon: BadgeCheck },
  ] },
]

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: () => api.get<Stats>('/admin/stats'), refetchInterval: 30_000 })
  return (
    <div className="flex h-full flex-col border-r border-sidebar-line bg-sidebar text-sidebar-fg">
      <div className="flex h-[70px] shrink-0 items-center border-b border-sidebar-line px-5"><Logo light /></div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label="Navigation principale">
        {NAV.map(g => (
          <div key={g.title}>
            <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-[.16em] text-[#f0932f]/80">{g.title}</div>
            <ul className="space-y-0.5">
              {g.items.map(i => {
                const n = i.badge === 'attente' ? stats?.inscrits.enAttente : 0
                return (
                  <li key={i.to}>
                    <Link to={i.to} onClick={onNavigate} activeOptions={{ exact: i.to === '/admin' }}
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition hover:bg-white/5 hover:text-white"
                      activeProps={{ className: 'bg-gradient-to-r from-[#2f55c4] to-[#1b2a6b] !text-white shadow-lg shadow-black/30' }}>
                      <i.icon className="size-[18px] shrink-0 text-[#8fa6ff] group-hover:scale-110" />
                      <span className="flex-1 truncate">{i.label}</span>
                      {!!n && <span className="rounded-full bg-[#d9730d] px-1.5 py-0.5 text-[10px] font-extrabold text-white">{n}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="m-3 rounded-xl border border-sidebar-line bg-white/5 p-3.5 text-xs">
        <div className="flex items-center gap-2 font-bold text-white"><ListChecks className="size-4 text-[#f0932f]" />{stats ? `${stats.inscrits.total} inscrits` : '…'}</div>
        <div className="mt-1 text-sidebar-fg/70">{stats ? `${stats.inscrits.valides} validés · ${stats.inscrits.enAttente} en attente` : ''}</div>
      </div>
    </div>
  )
}

export function AdminShell() {
  const user = useSession()?.user
  const nav = useNavigate()
  const [dark, toggle] = useTheme()
  const [drawer, setDrawer] = useState(false)
  return (
    <div className="flex min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:m-3 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-fg">Aller au contenu</a>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block"><Sidebar /></aside>
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside className="animate-rise absolute inset-y-0 left-0 w-72"><Sidebar onNavigate={() => setDrawer(false)} />
            <button onClick={() => setDrawer(false)} aria-label="Fermer le menu" className="absolute right-3 top-4 rounded-lg p-1.5 text-white/70 hover:bg-white/10"><X className="size-5" /></button></aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[60px] items-center gap-3 border-b border-line bg-surface px-4 lg:h-[70px] lg:px-6">
          <button className="rounded-xl border border-line p-2 text-muted lg:hidden" onClick={() => setDrawer(true)} aria-label="Ouvrir le menu"><Menu className="size-5" /></button>
          <Link to="/" className="hidden text-sm font-semibold text-muted hover:text-fg sm:block">← Voir le site public</Link>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggle} aria-label={dark ? 'Mode clair' : 'Mode sombre'} className="rounded-xl p-2 text-muted hover:bg-surface-2">{dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}</button>
            <div className="mx-1 h-6 w-px bg-line" />
            <Avatar name={user?.nomComplet ?? '?'} />
            <div className="hidden leading-tight md:block"><div className="text-xs font-bold">{user?.nomComplet}</div><div className="text-[11px] font-semibold text-accent">Organisateur</div></div>
            <button onClick={() => { session.logout(); nav({ to: '/connexion' }) }} aria-label="Se déconnecter" title="Se déconnecter" className="rounded-lg p-2 text-muted hover:bg-bad-soft hover:text-bad"><LogOut className="size-[18px]" /></button>
          </div>
        </header>
        <main id="main" className={cn('min-w-0 flex-1 p-4 lg:p-6 2xl:p-8')}><div className="animate-rise w-full"><Outlet /></div></main>
      </div>
    </div>
  )
}
