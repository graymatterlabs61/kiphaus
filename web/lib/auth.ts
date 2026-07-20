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

/** Like apiFetch, but for multipart bodies (file uploads) — must NOT set
 * Content-Type: application/json, the browser sets the multipart boundary itself. */
export async function apiFetchForm(
  path: string,
  formData: FormData,
  method: "POST" | "PATCH" = "POST",
  allowRefresh = true
): Promise<unknown> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    body: formData,
  })

  if (res.status === 401 && allowRefresh) {
    const refreshed = await refreshAccessToken()
    if (refreshed) return apiFetchForm(path, formData, method, false)
  }

  if (!res.ok) return throwAuthError(res)
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

/** Updates the signed-in user's editable profile fields (name/phone/bio — email and role are read-only). */
export function updateProfile(input: { first_name?: string; last_name?: string; phone?: string; bio?: string }): Promise<AuthUser> {
  return apiFetch("/api/v1/users/me/", { method: "PATCH", body: JSON.stringify(input) })
}

export function changePassword(input: { old_password: string; new_password: string }): Promise<{ detail: string }> {
  return apiFetch("/api/v1/auth/change-password/", { method: "PATCH", body: JSON.stringify(input) })
}

/** Updates the signed-in user's avatar (multipart — MeView's avatar_upload field). */
export async function updateAvatar(file: File): Promise<AuthUser> {
  const formData = new FormData()
  formData.append("avatar_upload", file)
  return apiFetchForm("/api/v1/users/me/", formData, "PATCH") as Promise<AuthUser>
}

/** Upgrades the signed-in guest to a host (role=host + HostProfile), idempotent. */
export function becomeHost(input: { phone?: string; bio?: string } = {}): Promise<AuthUser> {
  return apiFetch("/api/v1/users/me/become-host/", {
    method: "POST",
    body: JSON.stringify(input),
  })
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

/** Signed-in only — resends to the current user's own email. */
export function resendVerificationEmail(): Promise<{ detail: string }> {
  return apiFetch("/api/v1/auth/verify-email/resend/", { method: "POST" })
}

/** No session required — reachable from a cold email-link click. */
export function confirmVerificationEmail(input: { uid: string; token: string }): Promise<{ detail: string }> {
  return apiFetch("/api/v1/auth/verify-email/confirm/", {
    method: "POST",
    body: JSON.stringify(input),
  }, false)
}
