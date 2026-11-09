import { createFileRoute } from '@tanstack/react-router'
import { requireMember } from '@/lib/guards'
import { MemberShell } from '@/presentation/layout/MemberShell'

export const Route = createFileRoute('/espace')({ beforeLoad: requireMember, component: MemberShell })
