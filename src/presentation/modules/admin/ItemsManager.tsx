import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ImageOff, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { api, ApiError, assetUrl } from '@/lib/api'
import { initials } from '@/lib/format'
import type { ColloqueItem } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '../../components/ui/Button'
import { Field, Input, Textarea } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'

interface Cfg {
  type: ColloqueItem['type']
  singular: string
  /** Libellés des champs (vide = champ masqué) */
  roleLabel?: string; rolePlaceholder?: string
  titreLabel?: string; titrePlaceholder?: string
  detailsLabel?: string; detailsPlaceholder?: string
  imageHelp: string
  /** Format d'aperçu : portrait pour les photos, large pour logos / signatures */
  shape: 'portrait' | 'wide'
}

/** Aperçu d'une image : publique (URL) ou privée (récupérée avec le jeton d'authentification). */
function Preview({ item, shape }: { item: Pick<ColloqueItem, 'imageUrl' | 'imageUuid' | 'nom'>; shape: Cfg['shape'] }) {
  const priv = useQuery({
    queryKey: ['item-image', item.imageUuid], enabled: !item.imageUrl && !!item.imageUuid,
    queryFn: () => api.blobUrl(`/fichiers/${item.imageUuid}`), staleTime: Infinity, gcTime: 60_000,
  })
  const src = item.imageUrl ? assetUrl(item.imageUrl) : priv.data?.url
  const box = shape === 'portrait' ? 'h-24 w-20' : 'h-20 w-32'
  return src
    ? <img src={src} alt={item.nom} className={cn('shrink-0 rounded-xl bg-white object-cover ring-1 ring-line', shape === 'wide' && 'object-contain p-1', box)} />
    : <div className={cn('flex shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line bg-surface-2 text-subtle', box)}>
        {shape === 'portrait' ? <span className="font-display text-xl font-extrabold">{initials(item.nom)}</span> : <ImageOff className="size-5" />}
        <span className="text-[10px] font-bold uppercase">Pas d'image</span>
      </div>
}

function ItemForm({ cfg, item, onClose }: { cfg: Cfg; item: ColloqueItem | null; onClose: () => void }) {
  const qc = useQueryClient()
  const toast = useToast()
  const [f, setF] = useState({ nom: item?.nom ?? '', role: item?.role ?? '', titre: item?.titre ?? '', details: item?.details ?? '', ordre: String(item?.ordre ?? 0) })
  const [file, setFile] = useState<File | null>(null)
  const [remove, setRemove] = useState(false)
  const local = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => { if (local) URL.revokeObjectURL(local) }, [local])
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF(s => ({ ...s, [k]: e.target.value }))

  const save = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      if (!item) fd.append('type', cfg.type)
      Object.entries(f).forEach(([k, v]) => fd.append(k, v))
      if (file) fd.append('image', file)
      if (remove && !file) fd.append('removeImage', '1')
      return api.post(item ? `/admin/colloque/items/${item.id}` : '/admin/colloque/items', fd)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-colloque'] }); qc.invalidateQueries({ queryKey: ['colloque'] }); toast.success(item ? 'Modifications enregistrées.' : `${cfg.singular} ajouté.`); onClose() },
  })
  const hasImage = !!(item?.imageUrl || item?.imageUuid) && !remove

  return (
    <form onSubmit={(e: FormEvent) => { e.preventDefault(); save.mutate() }} className="space-y-4">
      <Field label="Nom" required><Input required autoFocus value={f.nom} onChange={set('nom')} /></Field>
      {cfg.roleLabel && <Field label={cfg.roleLabel}><Input value={f.role} onChange={set('role')} placeholder={cfg.rolePlaceholder} /></Field>}
      {cfg.titreLabel && <Field label={cfg.titreLabel}><Textarea className="min-h-16" value={f.titre} onChange={set('titre')} placeholder={cfg.titrePlaceholder} /></Field>}
      {cfg.detailsLabel && <Field label={cfg.detailsLabel}><Input value={f.details} onChange={set('details')} placeholder={cfg.detailsPlaceholder} /></Field>}
      <Field label="Ordre d'affichage" hint="Le plus petit s'affiche en premier"><Input type="number" min={0} value={f.ordre} onChange={set('ordre')} className="w-28" /></Field>

      <div>
        <span className="mb-1.5 block text-xs font-bold">Image</span>
        <div className="flex items-center gap-4">
          {local
            ? <img src={local} alt="Aperçu" className={cn('rounded-xl bg-white object-cover ring-1 ring-line', cfg.shape === 'portrait' ? 'h-28 w-24' : 'h-20 w-32 object-contain p-1')} />
            : item && hasImage ? <Preview item={item} shape={cfg.shape} /> : <Preview item={{ nom: f.nom || '?', imageUrl: null, imageUuid: null }} shape={cfg.shape} />}
          <div className="min-w-0 flex-1">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2 text-sm font-bold hover:bg-surface-2">
              <Upload className="size-4 text-brand" />{file ? 'Changer le fichier' : 'Choisir une image'}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e => { setFile(e.target.files?.[0] ?? null); setRemove(false) }} />
            </label>
            {file && <div className="mt-1 truncate text-xs text-muted">{file.name}</div>}
            <p className="mt-1.5 text-xs text-muted">{cfg.imageHelp}</p>
            {item && hasImage && !file && <label className="mt-2 flex items-center gap-2 text-xs font-semibold text-bad"><input type="checkbox" checked={remove} onChange={e => setRemove(e.target.checked)} />Retirer l'image actuelle</label>}
          </div>
        </div>
      </div>

      {save.error instanceof ApiError && <div role="alert" className="rounded-xl bg-bad-soft px-4 py-2.5 text-sm font-semibold text-bad">{save.error.message}</div>}
      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button variant="ghost" onClick={onClose}>Annuler</Button>
        <Button type="submit" loading={save.isPending}>{item ? 'Enregistrer' : 'Ajouter'}</Button>
      </div>
    </form>
  )
}

export function ItemsManager({ cfg, items }: { cfg: Cfg; items: ColloqueItem[] }) {
  const qc = useQueryClient()
  const toast = useToast()
  const [editing, setEditing] = useState<ColloqueItem | null | 'new'>(null)
  const [toDelete, setToDelete] = useState<ColloqueItem | null>(null)
  const list = items.filter(i => i.type === cfg.type)

  const del = useMutation({
    mutationFn: (id: number) => api.del(`/admin/colloque/items/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-colloque'] }); qc.invalidateQueries({ queryKey: ['colloque'] }); setToDelete(null); toast.success(`${cfg.singular} supprimé.`) },
    onError: e => toast.error(e instanceof ApiError ? e.message : 'Suppression impossible.'),
  })

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map(i => (
          <div key={i.id} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-3.5">
            <Preview item={i} shape={cfg.shape} />
            <div className="min-w-0 flex-1">
              {i.role && <span className="mb-1 inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-accent">{i.role}</span>}
              <div className="font-bold leading-tight">{i.nom}</div>
              {i.titre && <div className="mt-0.5 line-clamp-2 text-xs text-muted">{i.titre}</div>}
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button onClick={() => setEditing(i)} aria-label={`Modifier ${i.nom}`} title="Modifier" className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-brand"><Pencil className="size-4" /></button>
              <button onClick={() => setToDelete(i)} aria-label={`Supprimer ${i.nom}`} title="Supprimer" className="rounded-lg p-2 text-muted hover:bg-bad-soft hover:text-bad"><Trash2 className="size-4" /></button>
            </div>
          </div>
        ))}
        <button onClick={() => setEditing('new')} className="flex min-h-28 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line text-sm font-bold text-muted transition hover:border-brand hover:bg-brand-soft hover:text-brand">
          <Plus className="size-5" />Ajouter un {cfg.singular}
        </button>
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? `Ajouter un ${cfg.singular}` : `Modifier : ${editing?.nom ?? ''}`}>
        {editing !== null && <ItemForm key={editing === 'new' ? 'new' : editing.id} cfg={cfg} item={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      </Modal>
      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Supprimer cet élément ?"
        footer={<><Button variant="ghost" onClick={() => setToDelete(null)}>Annuler</Button><Button variant="danger" loading={del.isPending} onClick={() => toDelete && del.mutate(toDelete.id)}>Supprimer</Button></>}>
        <p className="text-sm text-muted"><strong className="text-fg">{toDelete?.nom}</strong> sera retiré, ainsi que son image. Cette action est définitive.</p>
      </Modal>
    </div>
  )
}
