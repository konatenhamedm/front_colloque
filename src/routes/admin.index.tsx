import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/presentation/modules/admin/Dashboard'

export const Route = createFileRoute('/admin/')({ component: Dashboard })
