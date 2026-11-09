import { createFileRoute } from '@tanstack/react-router'
import { MemberHome } from '@/presentation/modules/member/MemberHome'

export const Route = createFileRoute('/espace/')({ component: MemberHome })
