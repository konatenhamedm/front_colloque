import { createFileRoute } from '@tanstack/react-router'
import { PublicShell } from '@/presentation/layout/PublicLayout'
import { VerifyPage } from '@/presentation/modules/auth/VerifyPage'

export const Route = createFileRoute('/verification/$code')({ component: () => { const { code } = Route.useParams(); return <PublicShell><VerifyPage code={code} /></PublicShell> } })
