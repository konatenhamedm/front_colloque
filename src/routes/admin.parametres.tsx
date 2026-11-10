import { createFileRoute } from '@tanstack/react-router'
import { Parametres } from '@/presentation/modules/admin/Parametres'

export const Route = createFileRoute('/admin/parametres')({ component: Parametres })
