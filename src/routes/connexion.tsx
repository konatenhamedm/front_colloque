import { createFileRoute } from '@tanstack/react-router'
import { redirectIfAuthenticated } from '@/lib/guards'
import { PublicShell } from '@/presentation/layout/PublicLayout'
import { LoginPage } from '@/presentation/modules/auth/LoginPage'

export const Route = createFileRoute('/connexion')({ beforeLoad: redirectIfAuthenticated, component: () => <PublicShell><LoginPage /></PublicShell> })
