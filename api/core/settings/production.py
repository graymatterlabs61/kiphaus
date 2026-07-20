import os
import environ
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env()
environ.Env.read_env(BASE_DIR / ".env", overwrite=False)

SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    raise Exception("SECRET_KEY environment variable is not set!")

DEBUG = os.environ.get("DEBUG", "False") == "True"

_allowed_hosts = os.environ.get("ALLOWED_HOSTS", "")
if not _allowed_hosts:
    raise Exception("ALLOWED_HOSTS environment variable is not set!")
ALLOWED_HOSTS = [h.strip() for h in _allowed_hosts.split(",") if h.strip()]

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    "storages",
    "cloudinary",
    "cloudinary_storage",
]

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

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"
WSGI_APPLICATION = "core.wsgi.application"
AUTH_USER_MODEL = "users.User"

# ── Database — read directly from DATABASE_URL env var ───────────────────────
import dj_database_url
DATABASE_URL = os.environ.get("DATABASE_URL", "")
if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
        )
    }
else:
    raise Exception("DATABASE_URL environment variable is not set!")

# ── Password validation ───────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ── Redis ─────────────────────────────────────────────────────────────────────
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": REDIS_URL,
    }
}

CELERY_BROKER_URL     = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_TIMEZONE = "UTC"

# ── REST Framework ────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}

from datetime import timedelta
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ── CORS ──────────────────────────────────────────────────────────────────────
# Wildcard + credentials would defeat CORS entirely for a cookie-authenticated
# API — list real origins explicitly.
_cors_origins = os.environ.get("CORS_ALLOWED_ORIGINS", "")
CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors_origins.split(",") if o.strip()]
CORS_ALLOW_CREDENTIALS = True

# ── Auth cookie / frontend link config ────────────────────────────────────────
AUTH_COOKIE_DOMAIN = os.environ.get("AUTH_COOKIE_DOMAIN", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://www.kiphaus.com")

# ── Social login (Google/Apple) — see users/social.py ─────────────────────────
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
APPLE_CLIENT_ID  = os.environ.get("APPLE_CLIENT_ID", "")

# ── Cloudinary ────────────────────────────────────────────────────────────────
# CLOUDINARY_STORAGE = {
#     "CLOUD_NAME": os.environ.get("CLOUDINARY_CLOUD_NAME", "cgtjcyy4"),
#     "API_KEY":    os.environ.get("CLOUDINARY_API_KEY", ""),
#     "API_SECRET": os.environ.get("CLOUDINARY_API_SECRET", ""),
# }
# DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
# # MEDIA_URL = f"https://res.cloudinary.com/{os.environ.get('CLOUDINARY_CLOUD_NAME', '')}/"
# MEDIA_URL = '/media/'

CLOUDINARY_STORAGE = {
    "CLOUD_NAME": os.environ.get("CLOUDINARY_CLOUD_NAME", "cgtjcyy4"),
    "API_KEY":    os.environ.get("CLOUDINARY_API_KEY", ""),
    "API_SECRET": os.environ.get("CLOUDINARY_API_SECRET", ""),
    "PREFIX":     "",  # no prefix
}
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
MEDIA_URL = ""  # empty — let cloudinary build full URL

# ── Static ────────────────────────────────────────────────────────────────────
STATIC_URL  = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ── Email ─────────────────────────────────────────────────────────────────────
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.sendgrid.net"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "apikey"
EMAIL_HOST_PASSWORD = os.environ.get("SENDGRID_API_KEY", "")
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "noreply@kiphaus.com")

# ── Security ──────────────────────────────────────────────────────────────────
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = False  # Render handles SSL termination
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# ── Stripe ────────────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY     = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_PUBLISHABLE_KEY= os.environ.get("STRIPE_PUBLISHABLE_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

# ── i18n ──────────────────────────────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ── Logging ───────────────────────────────────────────────────────────────────
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}

# ── Celery Beat ───────────────────────────────────────────────────────────────
from celery.schedules import crontab
CELERY_BEAT_SCHEDULE = {
    "auto-complete-bookings": {
        "task": "bookings.tasks.auto_complete_bookings",
        "schedule": crontab(hour=0, minute=30),
    },
    "auto-cancel-unpaid": {
        "task": "bookings.tasks.auto_cancel_unpaid_bookings",
        "schedule": crontab(minute=0),
    },
}
