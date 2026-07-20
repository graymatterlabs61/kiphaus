from django.contrib.auth.tokens import PasswordResetTokenGenerator


class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    """Distinct key_salt from Django's default_token_generator (used for password
    reset) so a verification link can never double as a password-reset link, and
    vice versa. Hashing in email_verified means the token self-invalidates once
    used, the same way password-reset tokens invalidate once the password changes."""

    key_salt = "users.tokens.EmailVerificationTokenGenerator"

    def _make_hash_value(self, user, timestamp):
        return f"{user.pk}{user.password}{timestamp}{user.email_verified}"


email_verification_token = EmailVerificationTokenGenerator()
