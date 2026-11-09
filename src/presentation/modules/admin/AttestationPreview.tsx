import { useQuery } from '@tanstack/react-query'
import { Download, ExternalLink, Eye, FileWarning, LayoutTemplate, Send, ShieldAlert, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { api } from '@/lib/api'
import type { Inscription } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '../../components/ui/Button'

export const MODELES = [
  { code: 'classique', label: 'Classique', hint: 'Cadre double, signatures' },
  { code: 'moderne', label: 'Moderne', hint: 'Bandeau latéral' },
] as const
export type ModeleCode = (typeof MODELES)[number]['code']

/** Mini-schéma de chaque modèle (pastille de sélection). */
function Thumb({ code }: { code: ModeleCode }) {
  return code === 'classique' ? (
    <svg viewBox="0 0 56 40" className="h-10 w-14 shrink-0 rounded-md bg-white shadow-sm ring-1 ring-black/10" aria-hidden>
      <rect x="0" y="0" width="56" height="3" fill="#1b2a6b" /><rect x="2.5" y="5" width="51" height="32" fill="none" stroke="#1b2a6b" strokeWidth="1" /><rect x="4" y="6.5" width="48" height="29" fill="none" stroke="#d9730d" strokeWidth=".5" />
      <rect x="18" y="12" width="20" height="3" rx="1" fill="#1b2a6b" /><rect x="22" y="19" width="12" height="2" rx="1" fill="#d9730d" /><rect x="14" y="24" width="28" height="1.5" rx=".7" fill="#9aa8d0" />
      <rect x="8" y="31" width="10" height=".8" fill="#1b2a6b" /><rect x="38" y="31" width="10" height=".8" fill="#1b2a6b" /><rect x="25" y="27" width="6" height="6" fill="#1b2a6b" />
    </svg>
  ) : (
    <svg viewBox="0 0 56 40" className="h-10 w-14 shrink-0 rounded-md bg-white shadow-sm ring-1 ring-black/10" aria-hidden>
      <rect x="0" y="0" width="19" height="40" fill="#1b2a6b" /><rect x="19" y="0" width="1.5" height="40" fill="#d9730d" /><rect x="20.5" y="0" width=".8" height="40" fill="#1f8a3b" />
      <rect x="3" y="12" width="12" height="1.5" fill="#aab6e4" /><rect x="3" y="16" width="10" height="1.5" fill="#aab6e4" /><rect x="3" y="20" width="11" height="1.5" fill="#aab6e4" />
      <rect x="26" y="9" width="24" height="4" rx="1" fill="#1b2a6b" /><rect x="26" y="16" width="9" height="1.5" fill="#d9730d" /><rect x="26" y="21" width="22" height="1.5" rx=".7" fill="#9aa8d0" />
      <rect x="26" y="31" width="6" height="6" fill="#1b2a6b" /><rect x="40" y="35" width="10" height=".8" fill="#1b2a6b" />
    </svg>
  )
}

export function AttestationPreview({ open, onClose, inscription, template, onTemplate, onEmit, emitting }: {
  open: boolean; onClose: () => void
  /** null = aperçu du modèle avec un exemple fictif */
  inscription: Inscription | null
  template: ModeleCode; onTemplate: (t: ModeleCode) => void
  onEmit?: (id: number) => void; emitting?: boolean
}) {
  const id = inscription?.id
  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ['attestation-apercu', id ?? 'exemple', template],
    queryFn: () => api.blobUrl(`/admin/attestations/apercu?template=${template}${id ? `&inscription=${id}` : ''}`),
    enabled: open, staleTime: 5 * 60_000, gcTime: 0, retry: false,
  })

  // URL blob : libérée quand on change de document / ferme la modale.
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => { setUrl(data?.url ?? null); return () => { if (data?.url) URL.revokeObjectURL(data.url) } }, [data])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null

  const name = inscription?.utilisateur.nomComplet
  const download = () => { if (!url) return; Object.assign(document.createElement('a'), { href: url, download: `attestation-${template}.pdf` }).click() }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-label="Aperçu de l'attestation">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />
      <div className="animate-rise relative z-10 flex h-full max-h-[100dvh] w-full max-w-6xl flex-col overflow-hidden bg-surface shadow-2xl sm:h-[92vh] sm:rounded-3xl sm:border sm:border-line">

        {/* En-tête */}
        <div className="relative flex shrink-0 items-center gap-4 bg-gradient-to-r from-[#0f1a4a] to-[#1b2a6b] px-5 py-4 text-white">
          <span aria-hidden className="absolute inset-x-0 top-0 flex h-1"><i className="w-2/5 bg-[#2f55c4]" /><i className="w-[30%] bg-[#d9730d]" /><i className="w-[30%] bg-[#1f8a3b]" /></span>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20"><Eye className="size-5 text-[#f0a35a]" /></span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-extrabold leading-tight">Aperçu de l'attestation</h2>
            <p className="truncate text-sm text-white/70">{name ? <>Pour <strong className="text-white">{name}</strong></> : 'Modèle avec un exemple fictif'}</p>
          </div>
          <button onClick={onClose} aria-label="Fermer l'aperçu" className="rounded-xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white"><X className="size-5" /></button>
        </div>

        {/* Choix du modèle */}
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-line bg-surface-2/70 px-5 py-3">
          <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-muted"><LayoutTemplate className="size-4" />Modèle</span>
          <div role="radiogroup" aria-label="Modèle d'attestation" className="flex flex-wrap gap-2">
            {MODELES.map(m => {
              const on = template === m.code
              return (
                <button key={m.code} role="radio" aria-checked={on} onClick={() => onTemplate(m.code)}
                  className={cn('flex items-center gap-2.5 rounded-2xl border-2 py-1.5 pl-1.5 pr-4 text-left transition', on ? 'border-brand bg-brand-soft shadow-sm' : 'border-line bg-surface hover:border-brand/40')}>
                  <Thumb code={m.code} />
                  <span><span className="block text-sm font-extrabold leading-tight">{m.label}</span><span className="block text-[11px] text-muted">{m.hint}</span></span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Visionneuse */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_0%,var(--surface-2),var(--line))] p-3 sm:p-6">
          <div style={{ aspectRatio: '297 / 210', width: 'min(100%, 1020px, calc((100dvh - 320px) * 1.414))' }} className="relative overflow-hidden rounded-lg bg-white shadow-[0_20px_50px_-12px_rgba(15,26,74,.45)] ring-1 ring-black/10">
            {url && !isError && <iframe key={url} title="Aperçu PDF de l'attestation" src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`} className="absolute inset-0 size-full border-0" />}
            {(isFetching || (!url && !isError)) && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/85 backdrop-blur-sm">
                <div className="skeleton h-3 w-48" /><div className="skeleton h-8 w-72" /><div className="skeleton h-3 w-56" />
                <p className="mt-2 text-sm font-semibold text-muted">Génération du document…</p>
              </div>
            )}
            {isError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <FileWarning className="size-10 text-bad" /><p className="font-bold">L'aperçu n'a pas pu être généré.</p>
                <Button variant="secondary" size="sm" onClick={() => refetch()}>Réessayer</Button>
              </div>
            )}
          </div>
        </div>

        {/* Pied */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line bg-surface px-5 py-3.5">
          <p className="flex max-w-md items-start gap-2 text-xs text-muted"><ShieldAlert className="mt-0.5 size-4 shrink-0 text-warn" />Aperçu uniquement : le numéro et le QR code définitifs sont générés à l'émission. Rien n'est enregistré.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={<ExternalLink className="size-4" />} disabled={!url} onClick={() => url && window.open(url, '_blank', 'noopener')}>Ouvrir</Button>
            <Button variant="secondary" icon={<Download className="size-4" />} disabled={!url} onClick={download}>Télécharger</Button>
            {onEmit && id && <Button variant="success" icon={<Send className="size-4" />} loading={emitting} onClick={() => onEmit(id)}>Émettre cette attestation</Button>}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
