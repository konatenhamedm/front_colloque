/** Logique pure du compte à rebours (testable sans navigateur). */

export type Phase = 'avant' | 'en-cours' | 'termine'
export interface Remaining { jours: number; heures: number; minutes: number; secondes: number }

/** Extrait les heures d'un texte libre : « 08h00 – 16h00 » -> [[8,0],[16,0]]. */
export function parseHeures(texte?: string | null): [number, number][] {
  return [...(texte ?? '').matchAll(/(\d{1,2})\s*[hH:]\s*(\d{2})?/g)]
    .map(m => [Math.min(23, Number(m[1])), Math.min(59, Number(m[2] ?? 0))] as [number, number])
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Début et fin du forum en millisecondes. L'événement est à Abidjan (UTC+0, pas d'heure d'été) :
 * on raisonne en UTC pour que le compte à rebours soit identique quel que soit le fuseau du visiteur.
 */
export function bornes(dateDebut: string, dateFin: string, heures?: string | null): { debut: number; fin: number } {
  const [h1, h2] = parseHeures(heures)
  const [dh, dm] = h1 ?? [0, 0]
  const [fh, fm] = h2 ?? [23, 59]
  return {
    debut: Date.parse(`${dateDebut.slice(0, 10)}T${pad(dh)}:${pad(dm)}:00Z`),
    fin: Date.parse(`${dateFin.slice(0, 10)}T${pad(fh)}:${pad(fm)}:59Z`),
  }
}

export function phaseA(now: number, debut: number, fin: number): Phase {
  return now < debut ? 'avant' : now <= fin ? 'en-cours' : 'termine'
}

export function decouper(ms: number): Remaining {
  const total = Math.max(0, Math.floor(ms / 1000))
  return { jours: Math.floor(total / 86_400), heures: Math.floor((total % 86_400) / 3_600), minutes: Math.floor((total % 3_600) / 60), secondes: total % 60 }
}
