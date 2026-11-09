import { redirect } from '@tanstack/react-router'
import { isAdmin, session } from './auth'

export async function requireAuth() {
  const s = await session.restore()
  if (!s) throw redirect({ to: '/connexion' })
  return s
}
export async function requireMember() {
  const s = await requireAuth()
  if (isAdmin(s)) throw redirect({ to: '/admin' })
  return s
}
export async function requireAdmin() {
  const s = await requireAuth()
  if (!isAdmin(s)) throw redirect({ to: '/espace' })
  return s
}
export async function redirectIfAuthenticated() {
  const s = await session.restore()
  if (s) throw redirect({ to: isAdmin(s) ? '/admin' : '/espace' })
}
