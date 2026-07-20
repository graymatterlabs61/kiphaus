from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import HostProfile, User
from .serializers import (
    BecomeHostSerializer,
    ChangePasswordSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    SocialLoginSerializer,
    UserSerializer,
    VerifyEmailConfirmSerializer,
)
from .social import SocialAuthError, resolve_social_user, verify_apple_token, verify_google_token
from .throttles import AuthRateThrottle
from .tokens import email_verification_token

REFRESH_COOKIE_NAME = "kh_refresh"


def _send_verification_email(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = email_verification_token.make_token(user)
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
    link = f"{frontend_url}/verify?uid={uid}&token={token}"
    send_mail(
        subject="Verify your Kiphaus email",
        message=f"Confirm your email address: {link}\n\nIf you didn't create a Kiphaus account, you can ignore this email.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )


def _cookie_domain():
    return getattr(settings, "AUTH_COOKIE_DOMAIN", "") or None


def _set_refresh_cookie(response, refresh_token: str):
    response.set_cookie(
        REFRESH_COOKIE_NAME,
        str(refresh_token),
        max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        httponly=True,
        secure=not settings.DEBUG,
        samesite="Lax",
        domain=_cookie_domain(),
        path="/",
    )


def _clear_refresh_cookie(response):
    response.delete_cookie(REFRESH_COOKIE_NAME, path="/", domain=_cookie_domain())


class CustomTokenSerializer(TokenObtainPairSerializer):
    """Add user info to login response."""
    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    throttle_classes   = [AuthRateThrottle]
    serializer_class   = CustomTokenSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            refresh = response.data.pop("refresh", None)
            if refresh:
                _set_refresh_cookie(response, refresh)
        return response


class RegisterView(generics.CreateAPIView):
    queryset           = User.objects.all()
    permission_classes = [AllowAny]
    throttle_classes   = [AuthRateThrottle]
    serializer_class   = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        _send_verification_email(user)
        refresh = RefreshToken.for_user(user)
        response = Response({
            "user":   UserSerializer(user).data,
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
        _set_refresh_cookie(response, str(refresh))
        return response


class VerifyEmailResendView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes   = [AuthRateThrottle]

    def post(self, request):
        if not request.user.email_verified:
            _send_verification_email(request.user)
        return Response({"detail": "If your email isn't verified yet, a new link has been sent."})


class VerifyEmailConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_classes   = [AuthRateThrottle]

    def post(self, request):
        serializer = VerifyEmailConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            uid = force_str(urlsafe_base64_decode(data["uid"]))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({"detail": "This verification link is invalid or has expired."}, status=status.HTTP_400_BAD_REQUEST)

        if not email_verification_token.check_token(user, data["token"]):
            return Response({"detail": "This verification link is invalid or has expired."}, status=status.HTTP_400_BAD_REQUEST)

        if not user.email_verified:
            user.email_verified = True
            user.save(update_fields=["email_verified"])
        return Response({"detail": "Email verified."})


class CookieTokenRefreshView(TokenRefreshView):
    """Reads the refresh token from the httpOnly cookie (falls back to body for non-browser clients)."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get("refresh") or request.COOKIES.get(REFRESH_COOKIE_NAME)
        if not refresh_token:
            return Response({"detail": "No refresh token provided."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data={"refresh": refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except (TokenError, InvalidToken):
            response = Response({"detail": "Refresh token invalid or expired."}, status=status.HTTP_401_UNAUTHORIZED)
            _clear_refresh_cookie(response)
            return response

        data = serializer.validated_data
        response = Response({"access": data["access"]}, status=status.HTTP_200_OK)
        rotated_refresh = data.get("refresh")
        if rotated_refresh:
            _set_refresh_cookie(response, rotated_refresh)
        return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh") or request.COOKIES.get(REFRESH_COOKIE_NAME)
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except TokenError:
                pass
        response = Response({"detail": "Logged out."}, status=status.HTTP_205_RESET_CONTENT)
        _clear_refresh_cookie(response)
        return response


class MeView(generics.RetrieveUpdateAPIView):
    """Get and update the authenticated user's profile."""
    serializer_class   = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class BecomeHostView(APIView):
    """POST /api/v1/users/me/become-host/ — upgrade the authenticated guest to a host.
    role is read_only on UserSerializer/MeView by design (prevents arbitrary self-promotion
    via a generic profile PATCH); this is the one deliberate, narrow path to HOST."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BecomeHostSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if user.role != User.Role.HOST:
            user.role = User.Role.HOST
            update_fields = ["role"]
            if serializer.validated_data.get("phone"):
                user.phone = serializer.validated_data["phone"]
                update_fields.append("phone")
            if serializer.validated_data.get("bio"):
                user.bio = serializer.validated_data["bio"]
                update_fields.append("bio")
            user.save(update_fields=update_fields)

        HostProfile.objects.get_or_create(user=user)
        return Response(UserSerializer(user).data)


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class   = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password updated."})


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_classes   = [AuthRateThrottle]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        user = User.objects.filter(email__iexact=email).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
            link = f"{frontend_url}/reset-password?uid={uid}&token={token}"
            send_mail(
                subject="Reset your Kiphaus password",
                message=(
                    f"Reset your password: {link}\n\n"
                    "If you didn't request this, you can safely ignore this email."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        # Always the same response — don't leak whether the email exists.
        return Response({"detail": "If an account exists for that email, a reset link has been sent."})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_classes   = [AuthRateThrottle]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            uid = force_str(urlsafe_base64_decode(data["uid"]))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({"detail": "This reset link is invalid or has expired."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, data["token"]):
            return Response({"detail": "This reset link is invalid or has expired."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(data["new_password1"])
        user.save(update_fields=["password"])
        return Response({"detail": "Password has been reset."})


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
