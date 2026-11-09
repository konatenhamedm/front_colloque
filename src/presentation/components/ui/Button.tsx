import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'success' | 'light'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-brand-fg shadow-sm hover:bg-brand-hover',
  accent: 'bg-accent text-white shadow-sm hover:brightness-110',
  secondary: 'border border-line bg-surface text-fg hover:bg-surface-2',
  ghost: 'text-muted hover:bg-surface-2 hover:text-fg',
  danger: 'bg-bad text-white shadow-sm hover:brightness-110',
  success: 'bg-ok text-white shadow-sm hover:brightness-110',
  light: 'bg-white text-[#1b2a6b] shadow-sm hover:bg-white/90',
}
const sizes: Record<Size, string> = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3.5 text-base' }

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; loading?: boolean; icon?: ReactNode }

export function Button({ variant = 'primary', size = 'md', loading, icon, className, children, disabled, type = 'button', ...rest }: Props) {
  return (
    <button type={type} disabled={disabled || loading}
      className={cn('inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-150 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50', sizes[size], variants[variant], className)} {...rest}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  )
}

/** Variante lien : même rendu qu'un bouton, pour <Link>. */
export const buttonClass = (variant: Variant = 'primary', size: Size = 'md', className?: string) =>
  cn('inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-150 active:scale-[.98]', sizes[size], variants[variant], className)
