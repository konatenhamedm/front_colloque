import { createFileRoute } from '@tanstack/react-router'
import { Validations } from '@/presentation/modules/admin/Validations'

export const Route = createFileRoute('/admin/validations')({ component: Validations })
