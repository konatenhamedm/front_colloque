import { createFileRoute } from '@tanstack/react-router'
import { redirectIfAuthenticated } from '@/lib/guards'
import { PublicShell } from '@/presentation/layout/PublicLayout'
import { RegisterPage } from '@/presentation/modules/auth/RegisterPage'

export const Route = createFileRoute('/inscription')({
  validateSearch: (s: Record<string, unknown>): { token?: string } => ({ token: typeof s.token === 'string' ? s.token : undefined }),
  beforeLoad: redirectIfAuthenticated,
  component: () => { const { token } = Route.useSearch(); return <PublicShell><RegisterPage token={token} /></PublicShell> },
})
