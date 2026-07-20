// Thin fetch wrapper around the Django JWT auth API.
// Access token lives in memory only (never localStorage — XSS-exfiltratable).
// Refresh token lives in an httpOnly cookie the browser attaches automatically;
// this module never reads or writes it directly. See docs/AUTH-PLAN.md.

export type Role = "guest" | "host" | "admin"

export interface AuthUser {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  full_name: string
  role: Role
  phone: string
  phone_verified: boolean
  avatar: string | null
  bio: string
  is_verified: boolean
  created_at: string
}

export class AuthError extends Error {
  status: number
  errors: Record<string, string[]> | null

  constructor(status: number, message: string, errors: Record<string, string[]> | null = null) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

function setAccessToken(token: string | null) {
  accessToken = token
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

async function rawFetch(path: string, opts: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...opts,
    credentials: "include", // sends the httpOnly refresh cookie
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...opts.headers,
    },
  })
}

async function throwAuthError(res: Response): Promise<never> {
  const body = await res.json().catch(() => null)
  const message =
    body?.detail ??
    body?.non_field_errors?.[0] ??
    "Something went wrong. Please try again."
  throw new AuthError(res.status, message, body ?? null)
}

let refreshInFlight: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await rawFetch("/api/v1/auth/token/refresh/", { method: "POST" })
        if (!res.ok) {
          setAccessToken(null)
          return false
        }
        const data = await res.json()
        setAccessToken(data.access)
        return true
      } catch {
        setAccessToken(null)
        return false
      }
    })().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

export async function apiFetch(path: string, opts: RequestInit = {}, allowRefresh = true) {
  const res = await rawFetch(path, opts)

  if (res.status === 401 && allowRefresh) {
    const refreshed = await refreshAccessToken()
    if (refreshed) return apiFetch(path, opts, false)
  }

  if (!res.ok) return throwAuthError(res)
  if (res.status === 204) return null
  return res.json()
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await apiFetch("/api/v1/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, false)
  setAccessToken(data.access)
  return data.user as AuthUser
}

export async function register(input: {
  email: string
  password1: string
  password2: string
  username: string
  first_name?: string
}): Promise<AuthUser> {
  const data = await apiFetch("/api/v1/auth/register/", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      username: input.username,
      first_name: input.first_name,
      password: input.password1,
      password2: input.password2,
    }),
  }, false)
  setAccessToken(data.access)
  return data.user as AuthUser
}

export async function loginWithGoogle(idToken: string): Promise<AuthUser> {
  const data = await apiFetch("/api/v1/auth/google/", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  }, false)
  setAccessToken(data.access)
  return data.user as AuthUser
}

export async function loginWithApple(idToken: string): Promise<AuthUser> {
  const data = await apiFetch("/api/v1/auth/apple/", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  }, false)
  setAccessToken(data.access)
  return data.user as AuthUser
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/api/v1/auth/logout/", { method: "POST" })
  } finally {
    setAccessToken(null)
  }
}

/** Silently restores the session after a page reload (access token is memory-only). Never throws. */
export async function restoreSession(): Promise<AuthUser | null> {
  const refreshed = await refreshAccessToken()
  if (!refreshed) return null
  try {
    return await getCurrentUser()
  } catch {
    return null
  }
}

export function getCurrentUser(): Promise<AuthUser> {
  return apiFetch("/api/v1/auth/me/")
}

export function requestPasswordReset(email: string): Promise<{ detail: string }> {
  return apiFetch("/api/v1/auth/password/reset/", {
    method: "POST",
    body: JSON.stringify({ email }),
  }, false)
}

export function confirmPasswordReset(input: {
  uid: string
  token: string
  new_password1: string
  new_password2: string
}): Promise<{ detail: string }> {
  return apiFetch("/api/v1/auth/password/reset/confirm/", {
    method: "POST",
    body: JSON.stringify(input),
  }, false)
}
