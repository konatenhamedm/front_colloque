import { createFileRoute } from '@tanstack/react-router'
import { redirectIfAuthenticated } from '@/lib/guards'
import { PublicShell } from '@/presentation/layout/PublicLayout'
import { RegisterPage } from '@/presentation/modules/auth/RegisterPage'

export const Route = createFileRoute('/inscription')({
  beforeLoad: redirectIfAuthenticated,
  component: () => <PublicShell><RegisterPage /></PublicShell>,
})
