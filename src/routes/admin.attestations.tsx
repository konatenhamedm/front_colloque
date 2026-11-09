import { createFileRoute } from '@tanstack/react-router'
import { Attestations } from '@/presentation/modules/admin/Attestations'

export const Route = createFileRoute('/admin/attestations')({ component: Attestations })
