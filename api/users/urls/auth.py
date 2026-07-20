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
    VerifyEmailConfirmView,
    VerifyEmailResendView,
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
    path("verify-email/resend/",    VerifyEmailResendView.as_view(),      name="auth-verify-email-resend"),
    path("verify-email/confirm/",   VerifyEmailConfirmView.as_view(),     name="auth-verify-email-confirm"),
]
