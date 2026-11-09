import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type Kind = 'success' | 'error' | 'info'
interface T { id: number; kind: Kind; text: string }
const Ctx = createContext<{ success: (t: string) => void; error: (t: string) => void; info: (t: string) => void } | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<T[]>([])
  const push = useCallback((kind: Kind, text: string) => {
    const id = Date.now() + Math.random()
    setItems(i => [...i, { id, kind, text }])
    setTimeout(() => setItems(i => i.filter(x => x.id !== id)), 5000)
  }, [])
  const api = { success: (t: string) => push('success', t), error: (t: string) => push('error', t), info: (t: string) => push('info', t) }
  const icon = { success: <CheckCircle2 className="size-5 text-ok" />, error: <XCircle className="size-5 text-bad" />, info: <Info className="size-5 text-info" /> }
  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
        {items.map(t => (
          <div key={t.id} className="animate-rise pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-semibold shadow-card">{icon[t.kind]}<span>{t.text}</span></div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
export const useToast = () => { const c = useContext(Ctx); if (!c) throw new Error('ToastProvider manquant'); return c }
