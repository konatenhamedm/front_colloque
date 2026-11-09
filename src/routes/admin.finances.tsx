import { createFileRoute } from '@tanstack/react-router'
import { Finances } from '@/presentation/modules/admin/Finances'

export const Route = createFileRoute('/admin/finances')({ component: Finances })
