import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTheme } from '@/lib/theme'
import { useScrollSpy } from '@/lib/useScrollSpy'
import { cn } from '@/lib/utils'
import type { Personne } from '@/lib/types'
import { isAdmin, useSession } from '@/lib/auth'
import { Logo } from '../components/ui/Logo'
import { buttonClass } from '../components/ui/Button'

const SECTIONS: [string, string][] = [['intervenants', 'Animateurs'], ['tarifs', 'Tarifs'], ['programme', 'Programme'], ['comite', 'Comité'], ['paiement', 'Paiement']]

/** Lien de section avec indicateur animé (la pastille glisse d'un lien à l'autre). */
function NavLink({ id, label, active, group }: { id: string; label: string; active: boolean; group: string }) {
  return (
    <a href={`#${id}`} aria-current={active ? 'true' : undefined}
      className={cn('relative whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-colors', active ? 'text-brand' : 'text-muted hover:text-fg')}>
      {active && (
        <motion.span layoutId={`spy-${group}`} transition={{ type: 'spring', stiffness: 400, damping: 34 }}
          className="absolute inset-0 -z-0 rounded-full bg-brand-soft ring-1 ring-brand/15">
          <span className="absolute inset-x-4 -bottom-[7px] h-[3px] rounded-full bg-accent" />
        </motion.span>
      )}
      <span className="relative z-10">{label}</span>
    </a>
  )
}

export function PublicHeader({ nav = false }: { nav?: boolean }) {
  const activeId = useScrollSpy(nav ? SECTIONS.map(([id]) => id) : [])
  const [dark, toggle] = useTheme()
  const session = useSession()
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link to="/" aria-label="Accueil"><Logo /></Link>
        {nav && (
          <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Sections">
            {SECTIONS.map(([id, label]) => <NavLink key={id} id={id} label={label} active={activeId === id} group="d" />)}
          </nav>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={toggle} aria-label={dark ? 'Mode clair' : 'Mode sombre'} className="rounded-xl p-2 text-muted hover:bg-surface-2">{dark ? <Sun className="size-5" /> : <Moon className="size-5" />}</button>
          {session
            ? <Link to={isAdmin(session) ? '/admin' : '/espace'} className={buttonClass('secondary', 'sm')}>Mon espace</Link>
            : <Link to="/connexion" className={buttonClass('ghost', 'sm', 'hidden sm:inline-flex')}>Se connecter</Link>}
          {!session && <Link to="/inscription" className={buttonClass('accent', 'sm')}>S'inscrire</Link>}
        </div>
      </div>
      {nav && (
        <nav className="flex gap-1 overflow-x-auto border-t border-line/60 px-3 py-1.5 [scrollbar-width:none] md:hidden" aria-label="Sections">
          {SECTIONS.map(([id, label]) => <NavLink key={id} id={id} label={label} active={activeId === id} group="m" />)}
        </nav>
      )}
    </header>
  )
}

export function PublicFooter({ email, phones, personnes, organisateurs }: { email?: string; phones?: string[]; personnes?: Personne[]; organisateurs?: string[] }) {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-muted md:grid-cols-[1fr_auto]">
        <div>
          <Logo />
          {organisateurs && organisateurs.length > 0 && <p className="mt-3 max-w-md text-xs">Organisé par {organisateurs.join(' · ')}</p>}
        </div>
        <div className="space-y-1.5 md:text-right">
          <div className="text-xs font-extrabold uppercase tracking-wider text-fg">Contacts</div>
          {personnes && personnes.length > 0
            ? personnes.map(p => <div key={p.nom}><strong className="text-fg">{p.nom}</strong> · {p.telephone}{p.email && <> · <a className="font-semibold text-brand hover:underline" href={`mailto:${p.email}`}>{p.email}</a></>}</div>)
            : <>{email && <div><a className="font-semibold text-brand hover:underline" href={`mailto:${email}`}>{email}</a></div>}{phones && phones.length > 0 && <div>{phones.join(' · ')}</div>}</>}
        </div>
      </div>
    </footer>
  )
}

/** Page centrée (connexion, inscription, vérification). */
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-12">{children}</main>
      <PublicFooter />
    </div>
  )
}
