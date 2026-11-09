import { useEffect, useState } from 'react'

export function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try { localStorage.setItem('co_theme', dark ? 'dark' : 'light') } catch { /* noop */ }
  }, [dark])
  return [dark, () => setDark(d => !d)] as const
}
