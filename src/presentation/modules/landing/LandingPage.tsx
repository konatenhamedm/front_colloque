import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarDays, CheckCircle2, Gift, Laptop, MapPin, Smartphone, Ticket, Users } from 'lucide-react'
import { api } from '@/lib/api'
import type { Colloque } from '@/lib/types'
import { fcfa, fmtDate, initials } from '@/lib/format'
import { PublicFooter, PublicHeader } from '../../layout/PublicLayout'
import { buttonClass } from '../../components/ui/Button'
import { PaymentChip } from '../../components/ui/PaymentLogo'
import { Skeleton } from '../../components/ui/misc'

const reveal = { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.45, ease: 'easeOut' as const } }

function Countdown({ iso }: { iso: string }) {
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
  if (days < 0) return null
  return (
    <div className="inline-flex items-baseline gap-2 rounded-2xl bg-white/10 px-4 py-2 ring-1 ring-white/20 backdrop-blur">
      <span className="font-display text-3xl font-extrabold tabular-nums text-white">{days}</span>
      <span className="text-sm font-semibold text-white/80">{days <= 1 ? 'jour restant' : 'jours restants'}</span>
    </div>
  )
}

function SectionTitle({ kicker, title, text }: { kicker: string; title: string; text?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <div className="text-xs font-extrabold uppercase tracking-[.18em] text-accent">{kicker}</div>
      <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-muted">{text}</p>}
    </div>
  )
}

export function LandingPage() {
  const { data: c, isLoading } = useQuery({ queryKey: ['colloque'], queryFn: () => api.get<Colloque>('/public/colloque') })

  const single = c && c.dateDebut === c.dateFin
  const dateLabel = c ? (single ? fmtDate(c.dateDebut) : `${fmtDate(c.dateDebut, { day: 'numeric' })} au ${fmtDate(c.dateFin)}`) : ''

  return (
    <div className="min-h-screen">
      <PublicHeader nav />

      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden bg-[#0f1a4a] text-white">
        <div aria-hidden className="absolute inset-0 opacity-60" style={{ background: 'radial-gradient(900px 400px at 85% -10%, #d9730d55, transparent 60%), radial-gradient(700px 400px at -10% 110%, #1f8a3b44, transparent 60%)' }} />
        <div aria-hidden className="absolute inset-x-0 top-0 flex h-1.5"><i className="w-2/5 bg-[#2f55c4]" /><i className="w-[30%] bg-[#d9730d]" /><i className="w-[30%] bg-[#1f8a3b]" /></div>
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          {isLoading || !c ? (
            <div className="space-y-4"><Skeleton className="h-6 w-40 !bg-white/10" /><Skeleton className="h-24 w-full max-w-3xl !bg-white/10" /></div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider ring-1 ring-white/20">
                {c.sousTitre ?? 'Inscriptions ouvertes'}
              </span>
              <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                {c.theme}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-white/75 sm:text-lg">{c.titre}</p>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
                <span className="inline-flex items-center gap-2"><CalendarDays className="size-5 text-[#f0932f]" />{dateLabel}</span>
                <span className="inline-flex items-center gap-2"><MapPin className="size-5 text-[#f0932f]" />{c.lieu}</span>
                {c.modalite && <span className="inline-flex items-center gap-2"><Laptop className="size-5 text-[#f0932f]" />{c.modalite}</span>}
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link to="/inscription" className={buttonClass('accent', 'lg', 'shadow-lg shadow-orange-900/30')}>S'inscrire maintenant <ArrowRight className="size-5" /></Link>
                <a href="#tarifs" className={buttonClass('light', 'lg', '!bg-white/10 !text-white ring-1 ring-white/25 hover:!bg-white/15')}>Voir les tarifs</a>
                <Countdown iso={c.dateDebut} />
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ───── Étapes ───── */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-px px-4 py-8 sm:grid-cols-4">
          {[
            { i: Ticket, t: '1. Payez par Mobile Money', d: 'Vers les numéros indiqués plus bas (Wave, Orange Money…).' },
            { i: Smartphone, t: '2. Inscrivez-vous', d: 'Avec votre e-mail, la référence ou le reçu du paiement.' },
            { i: CheckCircle2, t: '3. Recevez votre reçu', d: 'Après vérification, par e-mail, à imprimer.' },
            { i: Gift, t: '4. Récupérez l\'attestation', d: 'Envoyée par e-mail après l\'événement.' },
          ].map(s => (
            <div key={s.t} className="flex items-start gap-3 p-4">
              <span className="rounded-xl bg-brand-soft p-2.5 text-brand"><s.i className="size-5" /></span>
              <div><div className="text-sm font-extrabold">{s.t}</div><p className="mt-0.5 text-xs text-muted">{s.d}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── Intervenants ───── */}
      {c && c.intervenants.length > 0 && (
        <section id="intervenants" className="mx-auto max-w-6xl scroll-mt-28 md:scroll-mt-20 px-4 py-20">
          <SectionTitle kicker="Ils interviennent" title="Nos intervenants" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {c.intervenants.map((p, i) => (
              <motion.article key={p.nom + i} {...reveal} transition={{ ...reveal.transition, delay: i * 0.07 }}
                className="group overflow-hidden rounded-2xl border border-line bg-surface text-center shadow-card">
                <div className="aspect-[4/5] overflow-hidden bg-brand-soft">
                  {p.photo
                    ? <img src={p.photo} alt={p.nom} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
                    : <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#1b2a6b] to-[#2f55c4] font-display text-5xl font-extrabold text-white/90">{initials(p.nom)}</div>}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-base font-extrabold leading-tight">{p.nom}</h3>
                  <p className="mt-1 text-xs text-muted">{p.titre}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {/* ───── Thèmes ───── */}
      {c && c.axes.length > 0 && (
        <section id="themes" className="scroll-mt-28 md:scroll-mt-20 bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle kicker="Au programme" title="Thèmes abordés" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {c.axes.map((a, i) => (
                <motion.div key={a.id} {...reveal} transition={{ ...reveal.transition, delay: i * 0.05 }} className="flex items-center gap-4 rounded-2xl border border-line bg-surface-2/50 p-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand font-display text-sm font-extrabold text-brand-fg">{a.code}</span>
                  <span className="font-bold leading-snug">{a.libelle}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───── Tarifs ───── */}
      {c && (
        <section id="tarifs" className="mx-auto max-w-6xl scroll-mt-28 md:scroll-mt-20 px-4 py-20">
          <SectionTitle kicker="Frais de participation" title="Choisissez votre catégorie" text="Paiement par Mobile Money ou transfert. Les frais ne sont pas remboursables." />
          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
            {c.categories.map((cat, i) => (
              <motion.div key={cat.id} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }}
                className="flex flex-col rounded-2xl border border-line bg-surface p-6 text-center shadow-card">
                <div className="text-sm font-bold text-muted">{cat.libelle}</div>
                <div className="mt-3 font-display text-3xl font-extrabold text-brand">{fcfa(cat.montant)}</div>
                <Link to="/inscription" className={buttonClass('primary', 'md', 'mt-6')}>S'inscrire</Link>
              </motion.div>
            ))}
          </div>
          {c.avantages.length > 0 && (
            <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2">
              {c.avantages.map(a => <li key={a} className="inline-flex items-center gap-2 rounded-full bg-ok-soft px-3.5 py-1.5 text-xs font-bold text-ok"><CheckCircle2 className="size-4" />{a}</li>)}
            </ul>
          )}
        </section>
      )}

      {/* ───── Calendrier ───── */}
      {c && c.calendrier.length > 0 && (
        <section id="programme" className="scroll-mt-28 md:scroll-mt-20 bg-surface py-20">
          <div className="mx-auto max-w-3xl px-4">
            <SectionTitle kicker="Planning" title="Calendrier des activités" />
            <ol className="relative space-y-6 border-l-2 border-line pl-8">
              {c.calendrier.map(s => (
                <motion.li key={s.ordre} {...reveal} className="relative">
                  <span className="absolute -left-[calc(2rem+9px)] top-0.5 flex size-4 items-center justify-center rounded-full border-2 border-accent bg-surface" />
                  <div className="text-xs font-extrabold uppercase tracking-wide text-accent">{s.date}</div>
                  <div className="mt-0.5 font-semibold">{s.libelle}</div>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ───── Paiement + CTA ───── */}
      {c && (
        <section id="paiement" className="mx-auto max-w-6xl scroll-mt-28 md:scroll-mt-20 px-4 py-20">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b2a6b] to-[#0f1a4a] p-8 text-white shadow-card sm:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-3xl font-extrabold tracking-tight">Prêt à vous inscrire ?</h2>
                <p className="mt-3 text-white/75">Cela prend moins de 3 minutes. Vous aurez besoin de la capture ou du reçu de votre paiement.</p>
                <Link to="/inscription" className={buttonClass('accent', 'lg', 'mt-6')}>Commencer mon inscription <ArrowRight className="size-5" /></Link>
              </div>
              <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/15">
                <div className="mb-3 flex items-center gap-2 text-sm font-extrabold"><Users className="size-5 text-[#f0932f]" />Moyens de paiement acceptés</div>
                <ul className="flex flex-wrap gap-2.5">
                  {c.canauxPaiement.map(p => <li key={p.code}><PaymentChip code={p.code} label={p.libelle} onDark /></li>)}
                </ul>
                <div className="mt-5 border-t border-white/15 pt-4">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#f0a35a]">Envoyez votre paiement à</div>
                  <ul className="mt-2 space-y-2">
                    {c.contacts.beneficiaires.map(b => <li key={b.nom} className="rounded-xl bg-white/10 px-3.5 py-2.5"><div className="text-sm font-bold">{b.nom}</div><div className="mt-0.5 font-mono text-sm text-white/85">{b.telephones.join(' / ')}</div></li>)}
                  </ul>
                  <p className="mt-3 text-xs text-white/70">Puis inscrivez-vous avec la référence de la transaction ou le reçu. Frais non remboursables.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <PublicFooter email={c?.contacts.email} phones={c?.contacts.telephones} />
    </div>
  )
}
