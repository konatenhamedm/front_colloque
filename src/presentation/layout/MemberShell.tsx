import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { LogOut, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme'
import { session, useSession } from '@/lib/auth'
import { Logo } from '../components/ui/Logo'
import { Avatar } from '../components/ui/misc'

export function MemberShell() {
  const user = useSession()?.user
  const nav = useNavigate()
  const [dark, toggle] = useTheme()
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-3 px-4">
          <Link to="/" aria-label="Page d'accueil"><Logo /></Link>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggle} aria-label={dark ? 'Mode clair' : 'Mode sombre'} className="rounded-xl p-2 text-muted hover:bg-surface-2">{dark ? <Sun className="size-5" /> : <Moon className="size-5" />}</button>
            <div className="hidden items-center gap-2 sm:flex"><Avatar name={user?.nomComplet ?? '?'} /><span className="text-sm font-bold">{user?.nomComplet}</span></div>
            <button onClick={() => { session.logout(); nav({ to: '/' }) }} aria-label="Se déconnecter" title="Se déconnecter" className="rounded-xl p-2 text-muted hover:bg-bad-soft hover:text-bad"><LogOut className="size-5" /></button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8"><div className="animate-rise"><Outlet /></div></main>
    </div>
  )
}
