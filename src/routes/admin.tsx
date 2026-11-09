import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '@/lib/guards'
import { AdminShell } from '@/presentation/layout/AdminShell'

export const Route = createFileRoute('/admin')({ beforeLoad: requireAdmin, component: AdminShell })
