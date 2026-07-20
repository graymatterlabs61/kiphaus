from rest_framework.throttling import AnonRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """Brute-force guard for login/register/password-reset only — not a global API limit.
    Rate is set via REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]["auth"] in settings."""
    scope = "auth"
