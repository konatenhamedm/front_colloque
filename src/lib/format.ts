import type { Statut } from './types'

export const fcfa = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n).replace(/ | /g, ' ')} FCFA`
export const fmtDate = (iso: string, o: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  new Intl.DateTimeFormat('fr-FR', o).format(new Date(iso))
export const fmtShort = (iso: string) => fmtDate(iso, { day: '2-digit', month: 'short' })

export type Tone = 'ok' | 'warn' | 'bad' | 'info' | 'pending' | 'brand' | 'neutral'
export const STATUT: Record<Statut, { label: string; tone: Tone }> = {
  PENDING_PAYMENT: { label: 'En attente de validation', tone: 'warn' },
  PAYMENT_VALIDATED: { label: 'Inscription validée', tone: 'ok' },
  ATTENDED_AND_VALIDATED: { label: 'Participation validée', tone: 'info' },
  CERTIFICATE_ISSUED: { label: 'Attestation émise', tone: 'brand' },
  REJECTED: { label: 'Inscription rejetée', tone: 'bad' },
}
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
