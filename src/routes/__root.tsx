import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { buttonClass } from '@/presentation/components/ui/Button'

export const Route = createRootRoute({
  component: Outlet,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="font-display text-7xl font-extrabold text-brand">404</div>
      <p className="text-muted">Cette page n'existe pas.</p>
      <Link to="/" className={buttonClass('primary')}>Retour à l'accueil</Link>
    </div>
  ),
})
