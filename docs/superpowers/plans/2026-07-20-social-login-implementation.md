# Social Login (Google + Apple) + Auth Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "Continue with Google" and "Continue with Apple" to Kiphaus's login/signup pages, and close two auth gaps (no password strength enforcement, `verification` app missing from production) — without disturbing the existing hand-rolled JWT auth.

**Architecture:** Both providers' client SDKs hand the browser a signed `id_token` (JWT) directly — no server-side OAuth redirect dance needed. Frontend sends that token to a new DRF endpoint; backend verifies the signature against the provider's public keys, resolves it to a local `User` via a new `SocialAccount` mapping table, and mints a token pair through the exact same helper (`_set_refresh_cookie` + `RefreshToken.for_user`) that `LoginView`/`RegisterView` already use. Response shape is identical to existing login, so the frontend auth context changes additively only.

**Tech Stack:** Django 4.2 / DRF / `djangorestframework-simplejwt` (backend, unchanged), new deps `google-auth` + `cryptography`; Next.js 16 / React (frontend, unchanged), `next/script` for provider SDKs, no new npm packages.

## Global Constraints

- No `django-allauth` / `dj-rest-auth` — verify ID tokens directly (see spec's Approach B).
- Backend has zero existing tests; introduce plain Django `TestCase` in `api/users/tests.py` (no pytest — not installed, don't add it).
- Frontend has zero existing test framework; verification is `tsc --noEmit` + manual browser check, matching how the header auth-state fix was verified earlier this session.
- Social endpoints must return the exact same response contract as `LoginView`/`RegisterView`: `{"user": <UserSerializer>, "access": <str>}` + `kh_refresh` httpOnly cookie.
- New user default role on social signup: `"guest"` (matches `User.Role.GUEST`), `is_verified=True` (provider vouched for the email), unusable password (`create_user(..., password=None)` already does this — don't call `set_unusable_password()` redundantly).
- `username` is required + unique on `User` (inherited from `AbstractUser`, not overridden) — social signups must generate one (email local-part + numeric suffix on collision).
- Full spec: `docs/superpowers/specs/2026-07-20-social-login-design.md`.

---

## Task 1: Backend settings hardening

**Files:**
- Modify: `api/core/settings/base.py`
- Modify: `api/core/settings/production.py`
- Create: `api/users/tests.py`

**Interfaces:**
- Produces: nothing consumed by later tasks — fully independent.

- [ ] **Step 1: Write the failing test**

Create `api/users/tests.py`:

```python
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.test import TestCase


class PasswordValidationTests(TestCase):
    def test_weak_password_is_rejected(self):
        with self.assertRaises(ValidationError):
            validate_password("1")

    def test_reasonable_password_is_accepted(self):
        # Should not raise.
        validate_password("correct-horse-battery-staple-9")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.venv/Scripts/python.exe manage.py test users.tests.PasswordValidationTests -v 2`
Expected: `test_weak_password_is_rejected` FAILS (no `ValidationError` raised — `AUTH_PASSWORD_VALIDATORS` is currently unset, so `validate_password("1")` currently accepts everything).

- [ ] **Step 3: Add `AUTH_PASSWORD_VALIDATORS` to `base.py`**

In `api/core/settings/base.py`, insert this new section right after the `# ── Database ──` block (after line 76, before the `# ── Cache / Redis ──` block):

```python
# ── Password validation ───────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
```

- [ ] **Step 4: Add the same block to `production.py`**

In `api/core/settings/production.py`, insert the identical block right after the `DATABASES` block (after the `else: raise Exception(...)` for `DATABASE_URL`, before the `# ── Redis ──` block):

```python
# ── Password validation ───────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
```

- [ ] **Step 5: Fix `production.py`'s `LOCAL_APPS` — add missing `"verification"`**

In `api/core/settings/production.py`, `LOCAL_APPS` currently reads:

```python
LOCAL_APPS = [
    "users",
    "properties",
    "bookings",
    "payments",
    "reviews",
    "notifications",
    "wishlist",
    "analytics",
    "channels",
    "chat"
]
```

Change to (inserting `"verification"` between `"analytics"` and `"channels"`, matching `base.py`'s ordering):

```python
LOCAL_APPS = [
    "users",
    "properties",
    "bookings",
    "payments",
    "reviews",
    "notifications",
    "wishlist",
    "analytics",
    "verification",
    "channels",
    "chat"
]
```

- [ ] **Step 6: Run test to verify it passes**

Run: `.venv/Scripts/python.exe manage.py test users.tests.PasswordValidationTests -v 2`
Expected: both tests PASS.

- [ ] **Step 7: Verify settings still load cleanly under production settings module**

Run: `.venv/Scripts/python.exe manage.py check --settings=core.settings.production`
Expected: `System check identified no issues` (this will fail loudly if `production.py`'s `LOCAL_APPS` fix introduced an app-loading error, and confirms `DJANGO_SETTINGS_MODULE`/env vars needed by `production.py` are satisfiable — if it errors on missing `DATABASE_URL`/`ALLOWED_HOSTS`/`SECRET_KEY` env vars rather than an app error, that's expected in a dev shell with no prod env and not a regression; note it and move on).

- [ ] **Step 8: Commit**

```bash
git add api/core/settings/base.py api/core/settings/production.py api/users/tests.py
git commit -m "fix: enforce password strength rules; add missing verification app to prod settings"
```

---

## Task 2: `SocialAccount` model

**Files:**
- Modify: `api/users/models.py`
- Modify: `api/users/admin.py`
- Create: migration via `makemigrations` (will be named `api/users/migrations/0003_socialaccount.py`)

**Interfaces:**
- Produces: `SocialAccount` model with fields `user` (FK to `User`), `provider` (`"google"|"apple"`), `provider_user_id` (str), `email` (str), `created_at`. `unique_together = [("provider", "provider_user_id")]`. Consumed by Task 3's `resolve_social_user`.

- [ ] **Step 1: Add the model**

In `api/users/models.py`, append after the `HostProfile` class:

```python
class SocialAccount(models.Model):
    class Provider(models.TextChoices):
        GOOGLE = "google", "Google"
        APPLE  = "apple",  "Apple"

    user             = models.ForeignKey(User, on_delete=models.CASCADE, related_name="social_accounts")
    provider         = models.CharField(max_length=10, choices=Provider.choices)
    provider_user_id = models.CharField(max_length=255)
    email            = models.EmailField(blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "social_accounts"
        unique_together = [("provider", "provider_user_id")]

    def __str__(self):
        return f"{self.provider}:{self.user.email}"
```

- [ ] **Step 2: Register it in the admin**

In `api/users/admin.py`, change the import line and add an admin class:

```python
from .models import User, HostProfile, SocialAccount
```

Append at the end of the file:

```python
@admin.register(SocialAccount)
class SocialAccountAdmin(admin.ModelAdmin):
    list_display  = ["user", "provider", "email", "created_at"]
    list_filter   = ["provider"]
    search_fields = ["user__email", "email", "provider_user_id"]
```

- [ ] **Step 3: Generate the migration**

Run: `.venv/Scripts/python.exe manage.py makemigrations users`
Expected: `Migrations for 'users': users/migrations/0003_socialaccount.py - Create model SocialAccount`

- [ ] **Step 4: Write a model test**

Append to `api/users/tests.py`:

```python
from django.db import IntegrityError
from .models import SocialAccount, User


class SocialAccountModelTests(TestCase):
    def test_provider_and_provider_user_id_must_be_unique_together(self):
        user = User.objects.create_user(username="alice", email="alice@example.com")
        SocialAccount.objects.create(user=user, provider="google", provider_user_id="sub-123", email="alice@example.com")
        with self.assertRaises(IntegrityError):
            SocialAccount.objects.create(user=user, provider="google", provider_user_id="sub-123", email="alice@example.com")
```

- [ ] **Step 5: Apply the migration and run the test**

Requires Postgres reachable (see plan header — `docker compose up -d db redis` from repo root if not already running).

Run: `.venv/Scripts/python.exe manage.py migrate`
Expected: `Applying users.0003_socialaccount... OK`

Run: `.venv/Scripts/python.exe manage.py test users.tests.SocialAccountModelTests -v 2`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add api/users/models.py api/users/admin.py api/users/migrations/0003_socialaccount.py api/users/tests.py
git commit -m "feat: add SocialAccount model for Google/Apple login mapping"
```

---

## Task 3: Token verification helpers

**Files:**
- Create: `api/users/social.py`
- Modify: `api/requirements.txt`
- Modify: `api/core/settings/base.py`
- Modify: `api/core/settings/production.py`
- Modify: `api/.env.example`

**Interfaces:**
- Consumes: `SocialAccount`, `User` from `api/users/models.py` (Task 2).
- Produces: `SocialAuthError` (exception), `verify_google_token(id_token_str: str) -> dict` (returns `{"sub": str, "email": str | None}`), `verify_apple_token(id_token_str: str) -> dict` (same shape), `resolve_social_user(provider: str, sub: str, email: str | None) -> User`. All consumed by Task 4's views.

- [ ] **Step 1: Add new dependencies**

Append to `api/requirements.txt`:

```
google-auth==2.56.0
cryptography==49.0.0
PyJWT==2.13.0
requests==2.34.2
```

`PyJWT` is already installed transitively (via `djangorestframework-simplejwt`) but `users/social.py` (next step) imports it directly — pin it explicitly since it's a direct dependency now, not just incidental. `requests` is needed by `google.auth.transport.requests` (discovered when Step 5's tests errored with `ModuleNotFoundError: No module named 'requests'` — not bundled by `google-auth` itself, has to be installed alongside).

Run: `.venv/Scripts/python.exe -m pip install google-auth==2.56.0 cryptography==49.0.0 PyJWT==2.13.0 requests==2.34.2`
Expected: `Successfully installed google-auth-2.56.0 cryptography-49.0.0` (`PyJWT` already satisfied) plus `requests` and its own transitive deps (`urllib3`, `idna`, `charset_normalizer`, `certifi`).

- [ ] **Step 2: Add client ID settings**

In `api/core/settings/base.py`, add next to the existing `FRONTEND_URL` line in the `# ── Auth cookie / frontend link config ──` section:

```python
GOOGLE_CLIENT_ID = env("GOOGLE_CLIENT_ID", default="")
APPLE_CLIENT_ID  = env("APPLE_CLIENT_ID", default="")
```

In `api/core/settings/production.py`, add next to the existing `FRONTEND_URL` line in its `# ── Auth cookie / frontend link config ──` section:

```python
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
APPLE_CLIENT_ID  = os.environ.get("APPLE_CLIENT_ID", "")
```

- [ ] **Step 3: Document the new env vars**

Append to `api/.env.example`:

```
# Google/Apple sign-in — leave blank to disable social login in this env.
# Google: Google Cloud Console -> APIs & Services -> Credentials -> OAuth client ID (Web application).
# Apple: Apple Developer -> Certificates, IDs & Profiles -> Identifiers -> Services ID.
GOOGLE_CLIENT_ID=
APPLE_CLIENT_ID=
```

- [ ] **Step 4: Write the failing tests**

Append to `api/users/tests.py`:

```python
from unittest.mock import patch

from .social import SocialAuthError, resolve_social_user, verify_apple_token, verify_google_token


class ResolveSocialUserTests(TestCase):
    def test_creates_new_user_when_no_match_exists(self):
        user = resolve_social_user("google", "sub-1", "new@example.com")
        self.assertEqual(user.email, "new@example.com")
        self.assertEqual(user.role, User.Role.GUEST)
        self.assertTrue(user.is_verified)
        self.assertFalse(user.has_usable_password())
        self.assertTrue(SocialAccount.objects.filter(provider="google", provider_user_id="sub-1", user=user).exists())

    def test_links_to_existing_user_by_email(self):
        existing = User.objects.create_user(username="bob", email="bob@example.com")
        user = resolve_social_user("google", "sub-2", "bob@example.com")
        self.assertEqual(user.pk, existing.pk)
        self.assertTrue(SocialAccount.objects.filter(provider="google", provider_user_id="sub-2", user=existing).exists())

    def test_returning_user_is_recognized_by_provider_id_without_email(self):
        existing = User.objects.create_user(username="carol", email="carol@example.com")
        SocialAccount.objects.create(user=existing, provider="apple", provider_user_id="sub-3", email="carol@example.com")
        # Apple omits the email claim on repeat logins.
        user = resolve_social_user("apple", "sub-3", None)
        self.assertEqual(user.pk, existing.pk)

    def test_no_email_and_no_existing_mapping_raises(self):
        with self.assertRaises(SocialAuthError):
            resolve_social_user("apple", "sub-unknown", None)

    def test_generated_username_deduplicates_on_collision(self):
        User.objects.create_user(username="dave", email="dave@old.com")
        user = resolve_social_user("google", "sub-4", "dave@example.com")
        self.assertEqual(user.username, "dave-2")


class VerifyGoogleTokenTests(TestCase):
    @patch("users.social.google_id_token.verify_oauth2_token")
    def test_valid_token_returns_sub_and_email(self, mock_verify):
        mock_verify.return_value = {"sub": "g-1", "email": "x@example.com", "email_verified": True}
        claims = verify_google_token("fake-token")
        self.assertEqual(claims, {"sub": "g-1", "email": "x@example.com"})

    @patch("users.social.google_id_token.verify_oauth2_token")
    def test_invalid_token_raises(self, mock_verify):
        mock_verify.side_effect = ValueError("bad token")
        with self.assertRaises(SocialAuthError):
            verify_google_token("fake-token")

    @patch("users.social.google_id_token.verify_oauth2_token")
    def test_unverified_email_raises(self, mock_verify):
        mock_verify.return_value = {"sub": "g-1", "email": "x@example.com", "email_verified": False}
        with self.assertRaises(SocialAuthError):
            verify_google_token("fake-token")


class VerifyAppleTokenTests(TestCase):
    @patch("users.social._get_apple_jwks_client")
    @patch("users.social.pyjwt.decode")
    def test_valid_token_returns_sub_and_email(self, mock_decode, mock_jwks):
        mock_decode.return_value = {"sub": "a-1", "email": "y@example.com"}
        claims = verify_apple_token("fake-token")
        self.assertEqual(claims, {"sub": "a-1", "email": "y@example.com"})

    @patch("users.social._get_apple_jwks_client")
    @patch("users.social.pyjwt.decode")
    def test_invalid_token_raises(self, mock_decode, mock_jwks):
        import jwt as pyjwt_module
        mock_decode.side_effect = pyjwt_module.PyJWTError("bad token")
        with self.assertRaises(SocialAuthError):
            verify_apple_token("fake-token")
```

- [ ] **Step 5: Run tests to verify they fail**

Run: `.venv/Scripts/python.exe manage.py test users.tests -v 2`
Expected: FAIL with `ModuleNotFoundError: No module named 'users.social'` (module doesn't exist yet).

- [ ] **Step 6: Write `api/users/social.py`**

```python
from django.conf import settings
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
import jwt as pyjwt
from jwt import PyJWKClient

from .models import SocialAccount, User

APPLE_JWKS_URL = "https://appleid.apple.com/auth/keys"
APPLE_ISSUER = "https://appleid.apple.com"

_apple_jwks_client = None


class SocialAuthError(Exception):
    """Raised whenever a provider id_token fails verification or can't be resolved to a user."""


def verify_google_token(id_token_str: str) -> dict:
    try:
        payload = google_id_token.verify_oauth2_token(
            id_token_str, google_requests.Request(), settings.GOOGLE_CLIENT_ID,
        )
    except ValueError as exc:
        raise SocialAuthError("Invalid Google token.") from exc

    if not payload.get("email_verified"):
        raise SocialAuthError("Google account email is not verified.")

    return {"sub": payload["sub"], "email": payload.get("email")}


def _get_apple_jwks_client() -> PyJWKClient:
    global _apple_jwks_client
    if _apple_jwks_client is None:
        _apple_jwks_client = PyJWKClient(APPLE_JWKS_URL)
    return _apple_jwks_client


def verify_apple_token(id_token_str: str) -> dict:
    try:
        signing_key = _get_apple_jwks_client().get_signing_key_from_jwt(id_token_str)
        payload = pyjwt.decode(
            id_token_str,
            signing_key.key,
            algorithms=["RS256"],
            audience=settings.APPLE_CLIENT_ID,
            issuer=APPLE_ISSUER,
        )
    except pyjwt.PyJWTError as exc:
        raise SocialAuthError("Invalid Apple token.") from exc

    return {"sub": payload["sub"], "email": payload.get("email")}


def _generate_unique_username(email: str) -> str:
    base = email.split("@")[0] or "user"
    username = base
    suffix = 2
    while User.objects.filter(username=username).exists():
        username = f"{base}-{suffix}"
        suffix += 1
    return username


def resolve_social_user(provider: str, sub: str, email: str | None) -> User:
    social_account = (
        SocialAccount.objects.select_related("user")
        .filter(provider=provider, provider_user_id=sub)
        .first()
    )
    if social_account:
        return social_account.user

    if not email:
        raise SocialAuthError("This account has no email on file. Please use email/password sign-in.")

    user = User.objects.filter(email__iexact=email).first()
    if user is None:
        user = User.objects.create_user(
            username=_generate_unique_username(email),
            email=email,
            role=User.Role.GUEST,
            is_verified=True,
        )

    SocialAccount.objects.create(user=user, provider=provider, provider_user_id=sub, email=email)
    return user
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `.venv/Scripts/python.exe manage.py test users.tests -v 2`
Expected: all tests PASS (12 tests total across the file so far).

- [ ] **Step 8: Commit**

```bash
git add api/users/social.py api/requirements.txt api/core/settings/base.py api/core/settings/production.py api/.env.example api/users/tests.py
git commit -m "feat: add Google/Apple id_token verification and user-resolution logic"
```

---

## Task 4: Social login views, serializer, URLs

**Files:**
- Modify: `api/users/serializers.py`
- Modify: `api/users/views.py`
- Modify: `api/users/urls/auth.py`

**Interfaces:**
- Consumes: `SocialAuthError`, `resolve_social_user`, `verify_google_token`, `verify_apple_token` from `api/users/social.py` (Task 3); `_set_refresh_cookie`, `UserSerializer`, `AuthRateThrottle` already in `api/users/views.py`.
- Produces: `POST /api/v1/auth/google/`, `POST /api/v1/auth/apple/` — both accept `{"id_token": str}`, return `{"user": {...}, "access": str}` + `kh_refresh` cookie on success, `400 {"detail": str}` on failure. Consumed by Task 5's `lib/auth.ts`.

- [ ] **Step 1: Add the request serializer**

In `api/users/serializers.py`, append at the end of the file:

```python
class SocialLoginSerializer(serializers.Serializer):
    id_token = serializers.CharField()
```

- [ ] **Step 2: Write the failing integration tests**

Append to `api/users/tests.py`:

```python
from rest_framework.test import APIClient


class SocialLoginViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch("users.views.verify_google_token")
    def test_google_login_creates_user_and_sets_cookie(self, mock_verify):
        mock_verify.return_value = {"sub": "g-100", "email": "new-google@example.com"}
        response = self.client.post("/api/v1/auth/google/", {"id_token": "fake"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["email"], "new-google@example.com")
        self.assertIn("access", response.data)
        self.assertIn("kh_refresh", response.cookies)

    @patch("users.views.verify_google_token")
    def test_google_login_rejects_invalid_token(self, mock_verify):
        mock_verify.side_effect = SocialAuthError("bad token")
        response = self.client.post("/api/v1/auth/google/", {"id_token": "fake"}, format="json")
        self.assertEqual(response.status_code, 400)

    @patch("users.views.verify_apple_token")
    def test_apple_login_creates_user_and_sets_cookie(self, mock_verify):
        mock_verify.return_value = {"sub": "a-100", "email": "new-apple@example.com"}
        response = self.client.post("/api/v1/auth/apple/", {"id_token": "fake"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["email"], "new-apple@example.com")
        self.assertIn("kh_refresh", response.cookies)
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `.venv/Scripts/python.exe manage.py test users.tests.SocialLoginViewTests -v 2`
Expected: FAIL with 404 (no such URL yet).

- [ ] **Step 4: Add the views**

In `api/users/views.py`, change the import block to add the new names:

```python
from .serializers import (
    ChangePasswordSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    SocialLoginSerializer,
    UserSerializer,
)
from .social import SocialAuthError, resolve_social_user, verify_apple_token, verify_google_token
```

Append at the end of the file:

```python
class _SocialLoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes   = [AuthRateThrottle]
    provider = None

    def verify(self, id_token_str):
        raise NotImplementedError

    def post(self, request):
        serializer = SocialLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            claims = self.verify(serializer.validated_data["id_token"])
            user = resolve_social_user(self.provider, claims["sub"], claims.get("email"))
        except SocialAuthError:
            return Response({"detail": "Sign-in failed. Please try again."}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        response = Response({
            "user":   UserSerializer(user).data,
            "access": str(refresh.access_token),
        }, status=status.HTTP_200_OK)
        _set_refresh_cookie(response, str(refresh))
        return response


class GoogleLoginView(_SocialLoginView):
    provider = "google"

    def verify(self, id_token_str):
        # Called by bare name (not as a bound class attribute captured at
        # import time) so `@patch("users.views.verify_google_token")` in
        # tests can actually intercept it — see users/tests.py.
        return verify_google_token(id_token_str)


class AppleLoginView(_SocialLoginView):
    provider = "apple"

    def verify(self, id_token_str):
        return verify_apple_token(id_token_str)
```

- [ ] **Step 5: Wire the URLs**

In `api/users/urls/auth.py`, change the import and add the two new paths:

```python
from django.urls import path
from users.views import (
    AppleLoginView,
    ChangePasswordView,
    CookieTokenRefreshView,
    GoogleLoginView,
    LoginView,
    LogoutView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
)

urlpatterns = [
    path("register/",               RegisterView.as_view(),               name="auth-register"),
    path("login/",                  LoginView.as_view(),                  name="auth-login"),
    path("google/",                 GoogleLoginView.as_view(),            name="auth-google"),
    path("apple/",                  AppleLoginView.as_view(),             name="auth-apple"),
    path("logout/",                 LogoutView.as_view(),                 name="auth-logout"),
    path("token/refresh/",          CookieTokenRefreshView.as_view(),     name="token-refresh"),
    path("me/",                     MeView.as_view(),                     name="auth-me"),
    path("change-password/",        ChangePasswordView.as_view(),         name="auth-change-password"),
    path("password/reset/",         PasswordResetRequestView.as_view(),   name="auth-password-reset"),
    path("password/reset/confirm/", PasswordResetConfirmView.as_view(),   name="auth-password-reset-confirm"),
]
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `.venv/Scripts/python.exe manage.py test users.tests -v 2`
Expected: all tests PASS (full `users.tests` suite, ~16 tests).

- [ ] **Step 7: Commit**

```bash
git add api/users/serializers.py api/users/views.py api/users/urls/auth.py api/users/tests.py
git commit -m "feat: add /api/v1/auth/google/ and /apple/ social login endpoints"
```

---

## Task 5: Frontend auth lib + hook

**Files:**
- Modify: `web/lib/auth.ts`
- Modify: `web/hooks/use-auth.tsx`

**Interfaces:**
- Consumes: `apiFetch`, `setAccessToken` (module-private in `lib/auth.ts`, already exist).
- Produces: `loginWithGoogle(idToken: string): Promise<AuthUser>`, `loginWithApple(idToken: string): Promise<AuthUser>` exported from `lib/auth.ts`; `useAuth()` context gains `loginWithGoogle`/`loginWithApple` of the same signatures. Consumed by Task 6's `SocialAuthButtons`.

- [ ] **Step 1: Add the two functions to `lib/auth.ts`**

In `web/lib/auth.ts`, add after the existing `register` function:

```typescript
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
```

- [ ] **Step 2: Expose them through `useAuth`**

In `web/hooks/use-auth.tsx`, change the import block:

```typescript
import {
  login as apiLogin,
  loginWithApple as apiLoginWithApple,
  loginWithGoogle as apiLoginWithGoogle,
  logout as apiLogout,
  register as apiRegister,
  restoreSession,
  type AuthUser,
} from "@/lib/auth"
```

Change the `AuthContextValue` interface:

```typescript
interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  loginWithGoogle: (idToken: string) => Promise<AuthUser>
  loginWithApple: (idToken: string) => Promise<AuthUser>
  register: (input: Parameters<typeof apiRegister>[0]) => Promise<AuthUser>
  logout: () => Promise<void>
}
```

Add next to the existing `login` callback inside `AuthProvider`:

```typescript
  const loginWithGoogle = React.useCallback(async (idToken: string) => {
    const loggedInUser = await apiLoginWithGoogle(idToken)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const loginWithApple = React.useCallback(async (idToken: string) => {
    const loggedInUser = await apiLoginWithApple(idToken)
    setUser(loggedInUser)
    return loggedInUser
  }, [])
```

Add both to the context provider's `value`:

```typescript
  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, loginWithApple, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json` (from `web/`)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add web/lib/auth.ts web/hooks/use-auth.tsx
git commit -m "feat: add loginWithGoogle/loginWithApple to auth lib and useAuth"
```

---

## Task 6: `SocialAuthButtons` component

**Files:**
- Create: `web/components/features/auth/social-auth-buttons.tsx`
- Modify: `web/.env.example`

**Interfaces:**
- Consumes: `useAuth()` (`loginWithGoogle`, `loginWithApple` from Task 5), `AuthError`, `type AuthUser` from `@/lib/auth`.
- Produces: `<SocialAuthButtons onSuccess={(user: AuthUser) => void} onError={(message: string) => void} />`. Consumed by Task 7's login/signup pages.

- [ ] **Step 1: Add the new env vars**

Append to `web/.env.example`:

```
# Google/Apple sign-in client IDs (public — not secrets). Leave blank to hide
# the buttons' functionality from erroring; see docs/AUTH-PLAN.md.
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_APPLE_CLIENT_ID=
```

- [ ] **Step 2: Create the component**

Create `web/components/features/auth/social-auth-buttons.tsx`:

```tsx
"use client"

import * as React from "react"
import Script from "next/script"
import { useAuth } from "@/hooks"
import { AuthError, type AuthUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (resp: { credential: string }) => void
          }) => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
    AppleID?: {
      auth: {
        init: (config: { clientId: string; scope: string; redirectURI: string; usePopup: boolean }) => void
        signIn: () => Promise<{ authorization: { id_token: string } }>
      }
    }
  }
}

interface SocialAuthButtonsProps {
  onSuccess: (user: AuthUser) => void
  onError: (message: string) => void
}

export function SocialAuthButtons({ onSuccess, onError }: SocialAuthButtonsProps) {
  const { loginWithGoogle, loginWithApple } = useAuth()
  const googleButtonRef = React.useRef<HTMLDivElement>(null)

  const handleGoogleCredential = React.useCallback(
    async (credential: string) => {
      try {
        onSuccess(await loginWithGoogle(credential))
      } catch (err) {
        onError(err instanceof AuthError ? err.message : "Google sign-in failed. Please try again.")
      }
    },
    [loginWithGoogle, onSuccess, onError]
  )

  const handleAppleClick = React.useCallback(async () => {
    if (!window.AppleID) return
    try {
      const result = await window.AppleID.auth.signIn()
      onSuccess(await loginWithApple(result.authorization.id_token))
    } catch (err) {
      onError(err instanceof AuthError ? err.message : "Apple sign-in failed. Please try again.")
    }
  }, [loginWithApple, onSuccess, onError])

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          if (!window.google || !googleButtonRef.current) return
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
            callback: (resp) => handleGoogleCredential(resp.credential),
          })
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            type: "standard",
            shape: "pill",
            theme: "outline",
            size: "large",
            text: "continue_with",
            width: 260,
          })
        }}
      />
      <Script
        src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.AppleID?.auth.init({
            clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID ?? "",
            scope: "name email",
            redirectURI: window.location.origin,
            usePopup: true,
          })
        }}
      />

      <div className="my-5 flex items-center">
        <div className="flex-1 border-t border-border"></div>
        <div className="px-4 text-body-sm text-smoke tracking-body-sm">Or continue with</div>
        <div className="flex-1 border-t border-border"></div>
      </div>

      <div className="grid grid-cols-2 gap-3 items-center">
        <Button
          type="button"
          variant="outline"
          onClick={handleAppleClick}
          className="rounded-full h-[50px] bg-ash-mist border-transparent hover:bg-ash-mist hover:border-graphite/30 transition-colors font-semibold text-ink-black text-body shadow-none"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.09 2.31-.86 3.59-.8 1.51.05 2.53.72 3.26 1.84-2.88 1.62-2.39 5.61.34 6.74-.63 1.6-1.57 3.32-2.27 4.39zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.02 4.41-3.74 4.25z" />
          </svg>
          Apple
        </Button>
        <div ref={googleButtonRef} className="flex justify-center [&>div]:w-full" />
      </div>
    </>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json` (from `web/`)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add web/components/features/auth/social-auth-buttons.tsx web/.env.example
git commit -m "feat: add SocialAuthButtons component (Google + Apple)"
```

---

## Task 7: Wire buttons into login + signup pages

**Files:**
- Modify: `web/app/(auth)/login/page.tsx`
- Modify: `web/app/(auth)/signup/page.tsx`

**Interfaces:**
- Consumes: `SocialAuthButtons` from Task 6, `useAuth().login`/`.register` (unchanged), `useRouter` (already imported in both files).

- [ ] **Step 1: Replace the dead buttons on the login page**

In `web/app/(auth)/login/page.tsx`, add the import:

```typescript
import { SocialAuthButtons } from "@/components/features/auth/social-auth-buttons"
```

Replace lines 108-124 (the `<div className="grid grid-cols-2 gap-3">...</div>` block with the two inert `Button`s) with:

```tsx
      <SocialAuthButtons
        onSuccess={(user) => router.push(user.role === "host" ? "/host/dashboard" : "/")}
        onError={setError}
      />
```

- [ ] **Step 2: Replace the dead buttons on the signup page**

In `web/app/(auth)/signup/page.tsx`, add the import:

```typescript
import { SocialAuthButtons } from "@/components/features/auth/social-auth-buttons"
```

Replace lines 144-160 (the same inert-button grid) with:

```tsx
      <SocialAuthButtons
        onSuccess={(user) => router.push(user.role === "host" ? "/host/dashboard" : "/")}
        onError={setError}
      />
```

(Signup previously always redirected to `"/"` — switched to the same role-based redirect as login, since a social sign-in can resolve to an existing host account via email-linking, not just a fresh guest signup.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json` (from `web/`)
Expected: no errors. Confirm the now-unused `Button` import isn't left dangling in either file if it's no longer referenced elsewhere on the page (check remaining usages before removing the import).

- [ ] **Step 4: Manual browser check**

With the dev server running and `NEXT_PUBLIC_GOOGLE_CLIENT_ID`/`NEXT_PUBLIC_APPLE_CLIENT_ID` still blank (no real credentials yet), load `/login` and `/signup`: confirm the page renders without console errors, the divider + Apple button render, and the Google button slot renders empty (expected — GSI won't render a button with an empty client ID). This confirms the wiring doesn't break the existing email/password flow; full social-login click-through is deferred until real Google/Apple credentials exist (per the design spec).

- [ ] **Step 5: Commit**

```bash
git add "web/app/(auth)/login/page.tsx" "web/app/(auth)/signup/page.tsx"
git commit -m "feat: wire SocialAuthButtons into login and signup pages"
```

---

## Task 8: Update `AUTH-PLAN.md`

**Files:**
- Modify: `web/docs/AUTH-PLAN.md`

**Interfaces:** none — documentation only.

- [ ] **Step 1: Add a section documenting the new endpoints**

Append a new `## 1a. Social login (Google + Apple)` section to `web/docs/AUTH-PLAN.md`, after the existing endpoint table, covering: the two new endpoints and their contract (identical to `login/`), the `SocialAccount` model and why it exists (Apple's email-only-on-first-consent behavior), the new settings (`GOOGLE_CLIENT_ID`, `APPLE_CLIENT_ID`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_APPLE_CLIENT_ID`), and current status ("Google: implemented, needs a real Client ID to test end-to-end. Apple: implemented, untestable without a paid Apple Developer account — see `docs/superpowers/specs/2026-07-20-social-login-design.md`").

- [ ] **Step 2: Commit**

```bash
git add web/docs/AUTH-PLAN.md
git commit -m "docs: document Google/Apple social login in AUTH-PLAN.md"
```
