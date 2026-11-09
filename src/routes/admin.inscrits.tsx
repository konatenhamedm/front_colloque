import { createFileRoute } from '@tanstack/react-router'
import { Inscrits } from '@/presentation/modules/admin/Inscrits'

export const Route = createFileRoute('/admin/inscrits')({ component: Inscrits })
