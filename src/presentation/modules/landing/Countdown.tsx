import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { PartyPopper, Radio } from 'lucide-react'
import { useEffect, useState } from 'react'
import { bornes, decouper, parseHeures, phaseA } from '@/lib/countdown'
import { fmtDate } from '@/lib/format'

/** Une tuile « horloge à volets » : chiffre sur deux positions, ligne médiane, et le chiffre qui change glisse. */
function Tile({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  const reduce = useReducedMotion()
  const text = String(value).padStart(2, '0')
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative flex h-[72px] min-w-[64px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-white/[.17] to-white/[.06] px-3 shadow-lg shadow-black/20 ring-1 sm:h-[92px] sm:min-w-[88px] ${accent ? 'ring-[#f0932f]/60' : 'ring-white/20'}`}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={text} className="font-display text-4xl font-extrabold tabular-nums text-white sm:text-6xl"
            initial={reduce ? false : { y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduce ? undefined : { y: -18, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
            {text}
          </motion.span>
        </AnimatePresence>
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/25" />
        {accent && <span aria-hidden className="absolute right-2 top-2 size-1.5 rounded-full bg-[#f0932f] shadow-[0_0_8px_2px_#f0932f99]" />}
      </div>
      <span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-white/60 sm:text-xs">{label}</span>
    </div>
  )
}

/** Compte à rebours en direct jusqu'à l'ouverture du forum, puis « en cours », puis « terminé ». */
export function Countdown({ dateDebut, dateFin, heures }: { dateDebut: string; dateFin: string; heures: string | null }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const { debut, fin } = bornes(dateDebut, dateFin, heures)
  const phase = phaseA(now, debut, fin)
  const [[hDebut, mDebut] = [0, 0]] = parseHeures(heures)
  const finTexte = parseHeures(heures)[1] ? heures!.split(/[–-]/).pop()!.trim() : null

  if (phase === 'en-cours') {
    return (
      <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-3.5 ring-1 ring-white/20 backdrop-blur">
        <span className="relative flex size-3"><span className="absolute inline-flex size-full animate-ping rounded-full bg-[#4cc36b] opacity-70" /><span className="relative inline-flex size-3 rounded-full bg-[#4cc36b]" /></span>
        <span className="font-display text-lg font-extrabold">Le forum est en cours</span>
        {finTexte && <span className="text-sm font-semibold text-white/70">· jusqu'à {finTexte}</span>}
        <Radio className="size-5 text-[#f0a35a]" />
      </div>
    )
  }
  if (phase === 'termine') {
    return (
      <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-3.5 ring-1 ring-white/20 backdrop-blur">
        <PartyPopper className="size-5 text-[#f0a35a]" />
        <span className="font-display text-lg font-extrabold">Le forum est terminé</span>
        <span className="text-sm font-semibold text-white/70">· merci à toutes et à tous</span>
      </div>
    )
  }

  const r = decouper(debut - now)
  return (
    <div role="timer" aria-label={`Ouverture du forum dans ${r.jours} jours et ${r.heures} heures`}>
      <div className="mb-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span className="text-xs font-extrabold uppercase tracking-[.18em] text-[#f0a35a]">Ouverture du forum dans</span>
        <span className="text-xs font-semibold text-white/60">{fmtDate(dateDebut, { weekday: 'long', day: 'numeric', month: 'long' })} à {String(hDebut).padStart(2, '0')}h{String(mDebut).padStart(2, '0')}</span>
      </div>
      <div className="flex items-start justify-center gap-2 sm:gap-3">
        <Tile value={r.jours} label={r.jours > 1 ? 'Jours' : 'Jour'} />
        <span aria-hidden className="pt-5 font-display text-3xl font-extrabold text-white/30 sm:pt-7 sm:text-4xl">:</span>
        <Tile value={r.heures} label="Heures" />
        <span aria-hidden className="pt-5 font-display text-3xl font-extrabold text-white/30 sm:pt-7 sm:text-4xl">:</span>
        <Tile value={r.minutes} label="Minutes" />
        <span aria-hidden className="pt-5 font-display text-3xl font-extrabold text-white/30 sm:pt-7 sm:text-4xl">:</span>
        <Tile value={r.secondes} label="Secondes" accent />
      </div>
    </div>
  )
}
