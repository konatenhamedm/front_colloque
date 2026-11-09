import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Meta } from '@/lib/api'
import { Skeleton } from './misc'

export interface Column<T> { key: string; header: string; cell: (row: T) => ReactNode; className?: string }

export function DataTable<T>({ columns, rows, loading, meta, onPage, empty, rowKey }: {
  columns: Column<T>[]; rows: T[] | undefined; loading?: boolean; meta?: Meta; onPage?: (p: number) => void; empty?: ReactNode; rowKey: (r: T) => string | number
}) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b-[3px] border-accent bg-[#1b2a6b] text-[11px] font-bold uppercase tracking-wide text-white dark:bg-[#1a2760]">
              {columns.map(c => <th key={c.key} scope="col" className={cn('px-4 py-3', c.className)}>{c.header}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }, (_, i) => <tr key={i}>{columns.map(c => <td key={c.key} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td>)}</tr>)}
            {!loading && rows?.map(r => (
              <tr key={rowKey(r)} className="border-b border-line/70 last:border-0 hover:bg-surface-2/50">
                {columns.map(c => <td key={c.key} className={cn('px-4 py-3 align-middle', c.className)}>{c.cell(r)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && rows?.length === 0 && empty}
      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-between border-t border-line px-4 py-3 text-xs text-muted">
          <span>{meta.total} résultats · page {meta.page}/{meta.pages}</span>
          <div className="flex gap-1">
            <button disabled={meta.page <= 1} onClick={() => onPage?.(meta.page - 1)} aria-label="Page précédente" className="rounded-lg border border-line p-1.5 hover:bg-surface-2 disabled:opacity-40"><ChevronLeft className="size-4" /></button>
            <button disabled={meta.page >= meta.pages} onClick={() => onPage?.(meta.page + 1)} aria-label="Page suivante" className="rounded-lg border border-line p-1.5 hover:bg-surface-2 disabled:opacity-40"><ChevronRight className="size-4" /></button>
          </div>
        </div>
      )}
    </div>
  )
}
