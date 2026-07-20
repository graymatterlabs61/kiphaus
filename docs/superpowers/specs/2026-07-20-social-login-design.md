# Social login (Google + Apple) + auth hardening — design

Status: approved by user ("you decide" — Approach B from brainstorming, full scope).

## Goal

Add "Continue with Google" and "Continue with Apple" to login/signup, without disturbing the
existing hand-rolled JWT auth (`djangorestframework-simplejwt`, access-in-memory + httpOnly
rotating refresh cookie). Also close two concrete gaps found in the prior audit:
`AUTH_PASSWORD_VALIDATORS` unset, and `production.py`'s `LOCAL_APPS` missing `"verification"`.

## Architecture

No new auth framework. Both Google and Apple's client-side SDKs hand the browser a signed JWT
(`id_token`) directly — no server-side redirect dance needed for a SPA. Frontend sends that raw
token to a new backend endpoint; backend verifies its signature against the provider's public
keys, resolves it to a local `User`, and mints a token pair through the *same* code path
`LoginView`/`RegisterView` already use (`_set_refresh_cookie` + simplejwt `RefreshToken.for_user`).
Response shape (`{user, access}` + refresh cookie) is identical to existing login/register, so
`web/hooks/use-auth.tsx` needs additive changes only.

## Backend (`api/`)

**New model** — `users/models.py`: `SocialAccount(user FK, provider: "google"|"apple", provider_user_id, email, created_at)`, unique together `(provider, provider_user_id)`. Needed because Apple only
sends the `email` claim on a user's *first* authorization ever — every later "Continue with
Apple" click has to be re-recognized by Apple's opaque `sub` id, not email. One migration.

**Verification helpers** — `users/social.py`:
- `verify_google_token(id_token_str) -> {sub, email, email_verified}` via `google.oauth2.id_token.verify_oauth2_token`, audience = `GOOGLE_CLIENT_ID`.
- `verify_apple_token(id_token_str) -> {sub, email}` via `PyJWT`'s `PyJWKClient` against Apple's
  JWKS endpoint (`https://appleid.apple.com/auth/keys`), audience = `APPLE_CLIENT_ID`, issuer
  `https://appleid.apple.com`. `PyJWT` is already a transitive dep of simplejwt; the RS256 backend
  needs `cryptography` added explicitly (not currently installed).
- Both raise a single `SocialAuthError` on any failure (bad signature, expired, wrong audience) →
  view returns 400 with a generic message. No provider-specific error detail leaks to the client.

**Resolution logic** (shared by both providers, one function `resolve_social_user(provider, sub, email)`):
1. `SocialAccount` matching `(provider, sub)` exists → return its `user`. (Returning-user path.)
2. Else, `email` present and a `User` with that email exists → create the `SocialAccount` row
   linking to that existing user, return it. (Linking path — e.g. existing password account.)
3. Else, `email` present and no matching `User` → create a new `User` (`role="guest"`,
   `is_verified=True` since the provider vouched for the email, `set_unusable_password()`), create
   the `SocialAccount` row, return it. (New-signup path.) `username` is required + unique on
   `User` (inherited from `AbstractUser`, not overridden) but social providers don't supply one —
   derive it from the email local-part, appending `-2`, `-3`, ... on collision.
4. Else (no email, no existing `SocialAccount` match — only possible for a Apple edge case that
   shouldn't occur in practice since step 1 covers returning users) → 400, ask them to use
   email/password or try again.

**Views** — `POST /api/v1/auth/google/`, `POST /api/v1/auth/apple/`, both `AllowAny`,
`AuthRateThrottle`, body `{id_token}`. Verify → resolve → mint tokens → same response contract as
`LoginView`. Wired in `users/urls/auth.py` next to the existing auth routes.

**Settings** (`base.py` + `production.py`):
- `GOOGLE_CLIENT_ID = env("GOOGLE_CLIENT_ID", default="")`
- `APPLE_CLIENT_ID = env("APPLE_CLIENT_ID", default="")` (the Service ID, used as JWT audience)
- `AUTH_PASSWORD_VALIDATORS` — add the standard four (min length 8, common password, numeric,
  user-attribute similarity). Currently unset in both files → no password strength enforced at all.
- `production.py` `LOCAL_APPS` — add `"verification"` (present in `base.py`, missing here; the
  host-trust-badge feature is currently not installed under production settings).

**New deps** (`requirements.txt`): `google-auth`, `cryptography` (PyJWT needs it for RS256/Apple).

## Frontend (`web/`)

- `lib/auth.ts`: add `loginWithGoogle(idToken)` / `loginWithApple(idToken)`, mirroring
  `login()`/`register()` — POST to the new endpoints, `setAccessToken`, return `AuthUser`.
- `hooks/use-auth.tsx`: expose both through the context, same pattern as `login`.
- Two small SDK-loader components, no new npm dependency (both providers ship a plain `<script>`
  SDK — a wrapper package buys little and Apple has no equivalently-maintained React wrapper
  anyway, so a bespoke script-loader is used for both for consistency):
  - `components/features/auth/google-signin-button.tsx` — loads Google Identity Services, renders
    its button, callback receives `credential` (the id_token), calls `loginWithGoogle`.
  - `components/features/auth/apple-signin-button.tsx` — loads Apple's `appleid.auth.js`, custom
    styled button per Apple HIG, `AppleID.auth.signIn()` returns `authorization.id_token`, calls
    `loginWithApple`.
- Both buttons added to `app/(auth)/login/page.tsx` and `app/(auth)/signup/page.tsx` above the
  existing form, with a divider ("or continue with email").
- New env vars: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_APPLE_CLIENT_ID` (+ `.env.example`).

## Error handling

- Invalid/expired/wrong-audience token → 400, generic "Sign-in failed, please try again."
  (mirrors the no-enumeration posture of the existing password-reset endpoint).
- Network/SDK-load failure client-side → button shows inline error text, same
  `AuthError`-catch pattern already used on the login form.
- Apple's email-only-on-first-consent behavior is handled entirely server-side (the `SocialAccount`
  row), so the frontend doesn't need special-case logic for it.

## Rollout / testability

- Google: end-to-end testable now once a real `GOOGLE_CLIENT_ID` is created and dropped into
  `.env.local` / `.env`.
- Apple: wired completely (backend verification, frontend button, resolution logic) but not
  end-to-end testable until a paid Apple Developer account exists to issue a real Service ID —
  known and accepted per your answer above.
- `AUTH_PASSWORD_VALIDATORS` and the `production.py` app-list fix are independent one-line changes,
  no migration, no rollout risk.

## Testing

- Backend: new `users/tests/test_social_auth.py` — mocks `verify_google_token`/`verify_apple_token`
  to exercise all four `resolve_social_user` branches (new user, link-to-existing, returning user,
  no-email-no-match) without needing real provider credentials in CI.
- Frontend: `tsc --noEmit` clean; manual browser check of the Google button once a real client ID
  is in place (Apple manual check deferred per above).
