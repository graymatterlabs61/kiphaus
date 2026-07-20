from unittest.mock import patch

from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.db import IntegrityError
from django.test import TestCase

from .models import SocialAccount, User
from .social import SocialAuthError, resolve_social_user, verify_apple_token, verify_google_token


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
