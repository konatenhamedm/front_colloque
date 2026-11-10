import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowRight, LogIn, Play, Quote, CalendarDays, CheckCircle2, Clock, Gift, Utensils, GraduationCap, MapPin, Smartphone, Ticket, Users } from 'lucide-react'
import { api, assetUrl } from '@/lib/api'
import type { Colloque } from '@/lib/types'
import { fcfa, fmtDate, initials } from '@/lib/format'
import { PublicFooter, PublicHeader } from '../../layout/PublicLayout'
import { buttonClass } from '../../components/ui/Button'
import { PaymentChip } from '../../components/ui/PaymentLogo'
import { Skeleton } from '../../components/ui/misc'
import { Countdown } from './Countdown'
import { useState } from 'react'

/** Interview d'un doyen (YouTube Shorts, format vertical). */
const INTERVIEW_VIDEO_ID = 'Z3CMiZOXd2c'

function InterviewVideo() {
  const [play, setPlay] = useState(false)
  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-[28px] border-4 border-white/15 bg-black shadow-2xl shadow-black/50 ring-1 ring-white/10">
      {play ? (
        <iframe className="absolute inset-0 size-full" title="Interview d'un doyen — FJCG 2026"
          src={`https://www.youtube-nocookie.com/embed/${INTERVIEW_VIDEO_ID}?autoplay=1&rel=0&playsinline=1`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      ) : (
        <button type="button" onClick={() => setPlay(true)} aria-label="Lire l'interview"
          className="group absolute inset-0 size-full cursor-pointer">
          <img src={`https://i.ytimg.com/vi/${INTERVIEW_VIDEO_ID}/hq720.jpg`}
            onError={e => { e.currentTarget.src = `https://i.ytimg.com/vi/${INTERVIEW_VIDEO_ID}/hqdefault.jpg` }}
            alt="" loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
          <span className="absolute left-1/2 top-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-white shadow-xl transition group-hover:scale-110">
            <Play className="ml-1 size-8 fill-current" />
          </span>
        </button>
      )}
    </div>
  )
}

const reveal = { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.45, ease: 'easeOut' as const } }

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
  const dateLabel = c ? (single ? fmtDate(c.dateDebut, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : `${fmtDate(c.dateDebut, { day: 'numeric' })} au ${fmtDate(c.dateFin)}`) : ''
  const montants = c ? [...new Set(c.categories.map(x => x.montant))] : []
  const fraisUniques = montants.length === 1 ? montants[0] : null
  const logos = c?.partenaires.filter(p => p.photo) ?? []

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
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-4xl text-center">
              <span className="inline-flex flex-wrap items-center gap-x-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider ring-1 ring-white/20">
                {c.titre}{c.sousTitre && <span className="text-[#f0a35a]">· {c.sousTitre}</span>}
              </span>
              <h1 className="mt-5 font-display text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">{c.theme}</h1>
              <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-semibold">
                <span className="inline-flex items-center gap-2 capitalize"><CalendarDays className="size-5 text-[#f0932f]" />{dateLabel}</span>
                {c.heures && <span className="inline-flex items-center gap-2"><Clock className="size-5 text-[#f0932f]" />{c.heures}</span>}
                <span className="inline-flex items-center gap-2"><MapPin className="size-5 text-[#f0932f]" />{c.lieu}</span>
              </div>
              {c.cibles.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wide text-white/60"><GraduationCap className="size-4" />Pour</span>
                  {c.cibles.map(t => <span key={t} className="rounded-full bg-white/10 px-3 py-1 font-semibold ring-1 ring-white/15">{t}</span>)}
                </div>
              )}
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Link to="/inscription" className={buttonClass('accent', 'lg', 'shadow-lg shadow-orange-900/30')}>S'inscrire maintenant <ArrowRight className="size-5" /></Link>
                <a href="#paiement" className={buttonClass('light', 'lg', '!bg-white/10 !text-white ring-1 ring-white/25 hover:!bg-white/15')}>
                  {fraisUniques !== null ? `Frais : ${fcfa(fraisUniques)}` : 'Voir les tarifs'}
                </a>
              </div>
              <p className="mt-5 text-sm text-white/75">
                Déjà inscrit ?{' '}
                <Link to="/connexion" className="inline-flex items-center gap-1.5 font-bold text-white underline decoration-[#f0932f] decoration-2 underline-offset-4 hover:text-[#f0a35a]"><LogIn className="size-4" />Accéder à mon espace</Link>
              </p>
              <div className="mt-10 flex justify-center"><Countdown dateDebut={c.dateDebut} dateFin={c.dateFin} heures={c.heures} /></div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ───── Organisateurs (logos) ───── */}
      {logos.length > 0 && (
        <section className="border-b border-line bg-surface" aria-label="Organisateurs">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 py-5">
            <span className="text-[11px] font-extrabold uppercase tracking-[.18em] text-muted">Organisé par</span>
            {logos.map(l => <img key={l.id} src={assetUrl(l.photo)!} alt={l.role ?? l.nom} title={l.nom} className="h-12 w-auto object-contain" loading="lazy" />)}
          </div>
        </section>
      )}

      {/* ───── Étapes ───── */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-px px-4 py-8 sm:grid-cols-4">
          {[
            { i: Ticket, t: '1. Payez vos frais', d: 'Par Orange Money ou Wave, aux numéros indiqués plus bas.' },
            { i: Smartphone, t: '2. Inscrivez-vous', d: 'Avec votre e-mail, la référence ou le reçu du paiement.' },
            { i: CheckCircle2, t: '3. Recevez votre reçu', d: 'Après vérification, par e-mail, à imprimer.' },
            { i: Gift, t: '4. Récupérez l\'attestation', d: 'Envoyée par e-mail après le forum.' },
          ].map(s => (
            <div key={s.t} className="flex items-start gap-3 p-4">
              <span className="rounded-xl bg-brand-soft p-2.5 text-brand"><s.i className="size-5" /></span>
              <div><div className="text-sm font-extrabold">{s.t}</div><p className="mt-0.5 text-xs text-muted">{s.d}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── Animateurs ───── */}
      {c && c.intervenants.length > 0 && (
        <section id="intervenants" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-20 md:scroll-mt-20">
          <SectionTitle kicker="Au programme" title="Les animateurs de session" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {c.intervenants.map((p, i) => (
              <motion.article key={p.id} {...reveal} transition={{ ...reveal.transition, delay: i * 0.07 }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface text-center shadow-card">
                <div className="aspect-[4/5] overflow-hidden bg-brand-soft">
                  {p.photo
                    ? <img src={assetUrl(p.photo)!} alt={p.nom} loading="lazy" className="size-full object-cover object-top transition duration-500 group-hover:scale-105" />
                    : <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#1b2a6b] to-[#2f55c4] font-display text-5xl font-extrabold text-white/90">{initials(p.nom)}</div>}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  {p.role && <span className="mx-auto mb-2 rounded-full bg-accent-soft px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-accent">{p.role}</span>}
                  <h3 className="font-display text-base font-extrabold leading-tight">{p.nom}</h3>
                  {p.titre && <p className="mt-1.5 text-xs leading-snug text-muted">{p.titre}</p>}
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {/* ───── Interview ───── */}
      <section id="interview" className="relative scroll-mt-28 overflow-hidden bg-[#0f1a4a] py-20 text-white md:scroll-mt-20" aria-label="Interview">
        <div className="pointer-events-none absolute -left-32 top-0 size-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 size-96 rounded-full bg-[#2f55c4]/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-4 md:grid-cols-[1fr_auto] md:gap-16">
          <motion.div {...reveal} className="text-center md:text-left">
            <div className="text-xs font-extrabold uppercase tracking-[.18em] text-accent">Ils soutiennent le forum</div>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">L'interview d'un doyen</h2>
            <Quote className="mx-auto mt-6 size-8 text-accent md:mx-0" />
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/80">
              Pourquoi la recherche des jeunes géographes compte, et pourquoi ce forum est une occasion à ne pas manquer. Découvrez le message d'un doyen en quelques secondes.
            </p>
            <Link to="/inscription" className={buttonClass('accent', 'lg', 'mt-8 shadow-lg shadow-orange-900/30')}>S'inscrire maintenant <ArrowRight className="size-5" /></Link>
          </motion.div>
          <motion.div {...reveal} className="w-full"><InterviewVideo /></motion.div>
        </div>
      </section>

      {/* ───── Tarifs ───── */}
      {c && (
        <section id="tarifs" className="scroll-mt-28 bg-surface py-20 md:scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle kicker="Frais de participation" title={fraisUniques !== null ? fcfa(fraisUniques) : 'Choisissez votre catégorie'}
              text={`Payables avant le ${fmtDate(c.dateLimitePaiement)}. Les frais ne sont pas remboursables.`} />
            {!!c.prixRepas && (
              <div className="mx-auto mb-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl border border-accent/30 bg-accent-soft px-5 py-3 text-center text-sm font-semibold">
                <Utensils className="size-5 text-accent" />
                <span>Déjeuner en option : <strong>{fcfa(c.prixRepas)}</strong> pour celles et ceux qui le désirent (à cocher à l'inscription).</span>
              </div>
            )}
            {fraisUniques === null && (
              <div className="mx-auto mb-8 grid max-w-4xl gap-4 sm:grid-cols-3">
                {c.categories.map((cat, i) => (
                  <motion.div key={cat.id} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} className="rounded-2xl border border-line bg-surface p-6 text-center shadow-card">
                    <div className="text-sm font-bold text-muted">{cat.libelle}</div>
                    <div className="mt-3 font-display text-3xl font-extrabold text-brand">{fcfa(cat.montant)}</div>
                  </motion.div>
                ))}
              </div>
            )}
            <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
              {c.cibles.length > 0 && (
                <div className="rounded-2xl border border-line bg-surface-2/50 p-6">
                  <div className="flex items-center gap-2 text-sm font-extrabold"><Users className="size-5 text-brand" />Ouvert à</div>
                  <ul className="mt-3 space-y-2 text-sm">{c.cibles.map(t => <li key={t} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ok" />{t}</li>)}</ul>
                </div>
              )}
              {c.avantages.length > 0 && (
                <div className="rounded-2xl border border-line bg-surface-2/50 p-6">
                  <div className="flex items-center gap-2 text-sm font-extrabold"><Gift className="size-5 text-accent" />Avantages de participation</div>
                  <ul className="mt-3 space-y-2 text-sm">{c.avantages.map(a => <li key={a} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ok" />{a}</li>)}</ul>
                </div>
              )}
            </div>
            <div className="mt-8 text-center"><Link to="/inscription" className={buttonClass('primary', 'lg')}>S'inscrire <ArrowRight className="size-5" /></Link></div>
          </div>
        </section>
      )}

      {/* ───── Comité d'organisation ───── */}
      {c && c.comite.length > 0 && (
        <section id="comite" className="scroll-mt-28 bg-surface py-20 md:scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle kicker="L'équipe" title="Comité d'organisation" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {c.comite.map((m, i) => (
                <motion.div key={m.role + m.nom} {...reveal} transition={{ ...reveal.transition, delay: (i % 3) * 0.05 }} className="rounded-2xl border border-line bg-surface-2/50 p-4">
                  <div className="text-[11px] font-extrabold uppercase tracking-wide text-accent">{m.role}</div>
                  <div className="mt-1 font-bold leading-snug">{m.nom}</div>
                  {m.details && <div className="mt-0.5 text-xs text-muted">{m.details}</div>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───── Paiement ───── */}
      {c && (
        <section id="paiement" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-20 md:scroll-mt-20">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b2a6b] to-[#0f1a4a] p-8 text-white shadow-card sm:p-12">
            <div className="grid items-start gap-8 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-3xl font-extrabold tracking-tight">Prêt à vous inscrire ?</h2>
                <p className="mt-3 text-white/75">Payez d'abord vos frais{fraisUniques !== null && <> ({fcfa(fraisUniques)}{!!c.prixRepas && <>, + {fcfa(c.prixRepas)} si vous prenez le déjeuner</>})</>} avant le {fmtDate(c.dateLimitePaiement)}, puis inscrivez-vous avec la référence de la transaction ou le reçu.</p>
                <Link to="/inscription" className={buttonClass('accent', 'lg', 'mt-6')}>Commencer mon inscription <ArrowRight className="size-5" /></Link>
              </div>
              <div className="space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#f0a35a]">Envoyez votre paiement à</div>
                {c.canauxPaiement.map(p => (
                  <div key={p.code} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                    <PaymentChip code={p.code} label={p.libelle} onDark />
                    <ul className="mt-3 flex flex-wrap gap-2">{p.numeros.map(n => <li key={n} className="rounded-lg bg-white/10 px-3 py-1.5 font-mono text-sm font-bold">{n}</li>)}</ul>
                  </div>
                ))}
                <div className="rounded-2xl bg-white/5 p-4 text-sm ring-1 ring-white/15">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#f0a35a]">Montant à payer</div>
                  <dl className="mt-2 space-y-1.5">
                    {fraisUniques !== null && <div className="flex justify-between gap-4"><dt className="text-white/75">Frais de participation</dt><dd className="font-bold tabular-nums">{fcfa(fraisUniques)}</dd></div>}
                    {!!c.prixRepas && <div className="flex justify-between gap-4"><dt className="text-white/75">Déjeuner (facultatif)</dt><dd className="font-bold tabular-nums">+ {fcfa(c.prixRepas)}</dd></div>}
                    {fraisUniques !== null && !!c.prixRepas && <div className="flex justify-between gap-4 border-t border-white/15 pt-2"><dt className="font-bold">Total avec déjeuner</dt><dd className="font-extrabold tabular-nums text-[#f0a35a]">{fcfa(fraisUniques + c.prixRepas)}</dd></div>}
                  </dl>
                </div>
                <p className="text-xs text-white/70">Frais non remboursables.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ───── Slogan ───── */}
      {c?.slogan && (
        <section aria-label="Slogan" className="px-4 pb-16 pt-2 text-center">
          <p className="mx-auto max-w-3xl font-display text-2xl font-extrabold leading-snug tracking-tight text-brand sm:text-3xl">{c.slogan}</p>
          <div aria-hidden className="mx-auto mt-5 flex h-1.5 w-40 overflow-hidden rounded-full"><i className="w-2/5 bg-[#2f55c4]" /><i className="w-[30%] bg-[#d9730d]" /><i className="w-[30%] bg-[#1f8a3b]" /></div>
        </section>
      )}

      <PublicFooter email={c?.contacts.email} phones={c?.contacts.telephones} personnes={c?.contacts.personnes} organisateurs={c?.contacts.organisateurs} />
    </div>
  )
}
