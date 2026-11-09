export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8011/api'

const TOKEN = 'co_token'
export const tokens = {
  get access() { try { return localStorage.getItem(TOKEN) } catch { return null } },
  set(t: string) { try { localStorage.setItem(TOKEN, t) } catch { /* stockage indisponible */ } },
  clear() { try { localStorage.removeItem(TOKEN) } catch { /* noop */ } },
}

/** Erreur normalisée : l'API renvoie toujours { code, message, errors[] }. */
export class ApiError extends Error {
  status: number
  constructor(status: number, message?: string) {
    super(status === 0 ? 'Impossible de joindre le serveur.' : (message ?? 'Une erreur est survenue.'))
    this.status = status
  }
}

export const onSessionExpired = { handler: () => {} }

export interface Meta { page: number; limit: number; total: number; pages: number }
export interface Paged<T> { data: T[]; meta: Meta }

async function raw(path: string, init: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) }
  if (!(init.body instanceof FormData) && init.body) headers['Content-Type'] = 'application/json'
  if (tokens.access) headers.Authorization = `Bearer ${tokens.access}`
  let res: Response
  try { res = await fetch(`${API_URL}${path}`, { ...init, headers }) } catch { throw new ApiError(0) }
  if (res.status === 401 && tokens.access && !path.startsWith('/auth/login')) {
    tokens.clear()
    onSessionExpired.handler()
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, body?.message)
  }
  return res
}

async function json<T>(path: string, init?: RequestInit): Promise<{ data: T; meta?: Meta }> {
  const res = await raw(path, init)
  return res.json()
}

export type Params = Record<string, string | number | boolean | null | undefined>
export const qs = (p?: Params) => {
  const e = Object.entries(p ?? {}).filter(([, v]) => v !== undefined && v !== null && v !== '')
  return e.length ? '?' + new URLSearchParams(e.map(([k, v]) => [k, String(v)])).toString() : ''
}

export const api = {
  get: async <T>(path: string, params?: Params) => (await json<T>(path + qs(params))).data,
  page: async <T>(path: string, params?: Params): Promise<Paged<T>> => {
    const r = await json<T[]>(path + qs(params))
    return { data: r.data, meta: r.meta ?? { page: 1, limit: r.data.length, total: r.data.length, pages: 1 } }
  },
  post: async <T>(path: string, body?: unknown) =>
    (await json<T>(path, { method: 'POST', body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body) })).data,
  /** Télécharge un fichier protégé (Authorization) puis le propose à l'enregistrement. */
  async download(path: string, filename: string) {
    const blob = await (await raw(path)).blob()
    const url = URL.createObjectURL(blob)
    Object.assign(document.createElement('a'), { href: url, download: filename }).click()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  },
  /** Récupère un fichier protégé pour l'afficher (aperçu du justificatif). */
  async blobUrl(path: string): Promise<{ url: string; type: string }> {
    const blob = await (await raw(path)).blob()
    return { url: URL.createObjectURL(blob), type: blob.type }
  },
}
