import { createFileRoute } from '@tanstack/react-router'
import { LiensInscription } from '@/presentation/modules/admin/LiensInscription'

export const Route = createFileRoute('/admin/liens')({ component: LiensInscription })
