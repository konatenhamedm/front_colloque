import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { ApiError } from '@/lib/api'
import { isAdmin, session } from '@/lib/auth'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, Input } from '../../components/ui/Field'

export function LoginPage() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const m = useMutation({
    mutationFn: () => session.login(email, password),
    onSuccess: s => nav({ to: isAdmin(s) ? '/admin' : '/espace' }),
  })
  return (
    <Card className="mx-auto max-w-md p-8">
      <h1 className="font-display text-2xl font-extrabold">Connexion</h1>
      <p className="mt-2 text-sm text-muted">Accédez à votre espace pour suivre votre inscription, télécharger votre reçu et votre attestation.</p>
      <form className="mt-6 space-y-4" onSubmit={(e: FormEvent) => { e.preventDefault(); m.mutate() }}>
        <Field label="Adresse e-mail"><Input type="email" required autoComplete="email" autoFocus value={email} onChange={e => setEmail(e.target.value)} /></Field>
        <Field label="Mot de passe"><Input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></Field>
        {m.error instanceof ApiError && <div role="alert" className="rounded-xl bg-bad-soft px-4 py-2.5 text-sm font-semibold text-bad">{m.error.message}</div>}
        <Button type="submit" size="lg" loading={m.isPending} className="w-full">Se connecter</Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">Pas encore inscrit ? <Link to="/inscription" className="font-bold text-brand hover:underline">S'inscrire</Link></p>
    </Card>
  )
}
