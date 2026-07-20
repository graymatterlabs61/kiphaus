from unittest.mock import patch

from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.core import mail
from django.db import IntegrityError
from django.test import TestCase
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from .models import HostProfile, SocialAccount, User
from .social import SocialAuthError, resolve_social_user, verify_apple_token, verify_google_token
from .tokens import email_verification_token


class PasswordValidationTests(TestCase):
    def test_weak_password_is_rejected(self):
        with self.assertRaises(ValidationError):
            validate_password("1")

    def test_reasonable_password_is_accepted(self):
        # Should not raise.
        validate_password("correct-horse-battery-staple-9")


class SocialAccountModelTests(TestCase):
    def test_provider_and_provider_user_id_must_be_unique_together(self):
        user = User.objects.create_user(username="alice", email="alice@example.com")
        SocialAccount.objects.create(user=user, provider="google", provider_user_id="sub-123", email="alice@example.com")
        with self.assertRaises(IntegrityError):
            SocialAccount.objects.create(user=user, provider="google", provider_user_id="sub-123", email="alice@example.com")


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


class SocialLoginViewTests(TestCase):
    def setUp(self):
        from rest_framework.test import APIClient
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


class BecomeHostViewTests(TestCase):
    def setUp(self):
        from rest_framework.test import APIClient
        self.client = APIClient()
        self.user = User.objects.create_user(username="dana", email="dana@example.com")

    def test_upgrades_role_and_creates_host_profile(self):
        self.client.force_authenticate(self.user)
        response = self.client.post("/api/v1/users/me/become-host/", {"phone": "+911234567890", "bio": "Host bio"}, format="json")
        self.assertEqual(response.status_code, 200)

        self.user.refresh_from_db()
        self.assertEqual(self.user.role, User.Role.HOST)
        self.assertEqual(self.user.phone, "+911234567890")
        self.assertEqual(self.user.bio, "Host bio")
        self.assertTrue(HostProfile.objects.filter(user=self.user).exists())

    def test_idempotent_for_existing_host(self):
        self.client.force_authenticate(self.user)
        self.client.post("/api/v1/users/me/become-host/", {}, format="json")
        HostProfile.objects.filter(user=self.user).delete()  # simulate a stray missing profile
        response = self.client.post("/api/v1/users/me/become-host/", {}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(HostProfile.objects.filter(user=self.user).exists())

    def test_requires_authentication(self):
        response = self.client.post("/api/v1/users/me/become-host/", {}, format="json")
        self.assertEqual(response.status_code, 401)


class EmailVerificationTests(TestCase):
    def setUp(self):
        from rest_framework.test import APIClient
        self.client = APIClient()
        self.user = User.objects.create_user(username="erin", email="erin@example.com")

    def test_register_sends_a_verification_email(self):
        response = self.client.post("/api/v1/auth/register/", {
            "email": "new-signup@example.com",
            "username": "newsignup",
            "password": "correct-horse-battery-staple-9",
            "password2": "correct-horse-battery-staple-9",
        }, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("new-signup@example.com", mail.outbox[0].to)

    def test_resend_sends_another_email_when_unverified(self):
        self.client.force_authenticate(self.user)
        response = self.client.post("/api/v1/auth/verify-email/resend/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)

    def test_resend_is_a_noop_once_verified(self):
        self.user.email_verified = True
        self.user.save(update_fields=["email_verified"])
        self.client.force_authenticate(self.user)
        self.client.post("/api/v1/auth/verify-email/resend/")
        self.assertEqual(len(mail.outbox), 0)

    def test_confirm_with_valid_token_marks_verified(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = email_verification_token.make_token(self.user)
        response = self.client.post("/api/v1/auth/verify-email/confirm/", {"uid": uid, "token": token}, format="json")
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.email_verified)

    def test_confirm_token_is_single_use(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = email_verification_token.make_token(self.user)
        self.client.post("/api/v1/auth/verify-email/confirm/", {"uid": uid, "token": token}, format="json")
        # Token hashes in email_verified, which is now True — the same token no longer checks out.
        response = self.client.post("/api/v1/auth/verify-email/confirm/", {"uid": uid, "token": token}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_confirm_rejects_bad_token(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        response = self.client.post("/api/v1/auth/verify-email/confirm/", {"uid": uid, "token": "garbage"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.user.refresh_from_db()
        self.assertFalse(self.user.email_verified)

    def test_a_password_reset_token_does_not_verify_email(self):
        """Distinct key_salt must keep the two token purposes from being interchangeable."""
        from django.contrib.auth.tokens import default_token_generator
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        password_reset_token = default_token_generator.make_token(self.user)
        response = self.client.post("/api/v1/auth/verify-email/confirm/", {"uid": uid, "token": password_reset_token}, format="json")
        self.assertEqual(response.status_code, 400)
