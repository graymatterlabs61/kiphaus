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
