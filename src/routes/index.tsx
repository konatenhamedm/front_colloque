import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '@/presentation/modules/landing/LandingPage'

export const Route = createFileRoute('/')({ component: LandingPage })
