import { useEffect, useState } from 'react'

/**
 * Renvoie l'id de la section actuellement visible.
 * La « ligne de lecture » est placée à ~35 % de la hauteur de l'écran : la section qui la traverse est l'active.
 * Au sommet de la page (hero), aucune section n'est active.
 * Les sections sont re-cherchées à chaque calcul : elles peuvent apparaître après un chargement de données.
 */
export function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    if (!ids.length) return
    let raf = 0
    const compute = () => {
      raf = 0
      const els = ids.map(id => document.getElementById(id)).filter((e): e is HTMLElement => !!e)
      if (!els.length) return setActive(null)
      const line = window.innerHeight * 0.35
      let current: string | null = null
      for (const el of els) {
        const r = el.getBoundingClientRect()
        if (r.top <= line && r.bottom > line) current = el.id
      }
      // Tout en bas de page : la dernière section reste active même si elle est courte.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = els[els.length - 1].id
      setActive(current)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute) }
    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    // Les sections se montent après le chargement de l'API : on surveille aussi les changements du DOM.
    const mo = new MutationObserver(onScroll)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); mo.disconnect(); if (raf) cancelAnimationFrame(raf) }
  }, [ids.join('|')]) // eslint-disable-line react-hooks/exhaustive-deps
  return active
}
