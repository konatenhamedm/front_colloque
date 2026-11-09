import { useSyncExternalStore } from 'react'
import { api, ApiError, onSessionExpired, tokens } from './api'
import type { Session } from './types'

let current: Session | null = null
let ready = false
const listeners = new Set<() => void>()
const emit = () => listeners.forEach(l => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }

export const session = {
  get current() { return current },
  /** Restaure la session depuis le jeton stocké (une seule fois par chargement). */
  async restore() {
    if (ready) return current
    if (tokens.access) {
      try { current = await api.get<Session>('/auth/me') } catch (e) {
        if (!(e instanceof ApiError && e.status === 0)) tokens.clear()
        current = null
      }
    }
    ready = true
    emit()
    return current
  },
  async refresh() { current = await api.get<Session>('/auth/me'); emit(); return current },
  async login(email: string, password: string) {
    const r = await api.post<{ token: string }>('/auth/login', { email, password })
    tokens.set(r.token)
    ready = false
    return (await this.restore())!
  },
  /** Après inscription : l'API renvoie directement un jeton de session. */
  async adopt(token: string) { tokens.set(token); ready = false; return this.restore() },
  logout() { tokens.clear(); current = null; emit() },
}

onSessionExpired.handler = () => { current = null; emit(); if (!location.pathname.startsWith('/connexion')) location.assign('/connexion') }

export const useSession = () => useSyncExternalStore(subscribe, () => current)
export const isStaff = (s: Session | null) => !!s && (s.roles.includes('ROLE_ADMIN') || s.roles.includes('ROLE_COMITE'))
export const isAdmin = (s: Session | null) => !!s && s.roles.includes('ROLE_ADMIN')
