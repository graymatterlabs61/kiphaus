from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        GUEST = "guest", "Guest"
        HOST  = "host",  "Host"
        ADMIN = "admin", "Admin"

    email       = models.EmailField(unique=True)
    role        = models.CharField(max_length=10, choices=Role.choices, default=Role.GUEST)
    phone       = models.CharField(max_length=20, blank=True)
    phone_verified = models.BooleanField(default=False)
    avatar      = models.ImageField(upload_to="avatars/", blank=True, null=True)
    bio         = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)   # ID-verified host/guest
    email_verified = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = ["username", "first_name", "last_name"]

    class Meta:
        db_table = "users"
        ordering = ["-created_at"]

    def __str__(self):
        return self.email

    @property
    def is_host(self):
        return self.role == self.Role.HOST

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email


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


class HostProfile(models.Model):
    """Extended profile for hosts — subscription info lives in payments app."""
    user            = models.OneToOneField(User, on_delete=models.CASCADE, related_name="host_profile")
    business_name   = models.CharField(max_length=200, blank=True)
    description     = models.TextField(blank=True)
    response_rate   = models.FloatField(default=0.0)
    response_time   = models.CharField(max_length=50, blank=True)  # e.g. "within an hour"
    is_superhost    = models.BooleanField(default=False)
    joined_as_host  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "host_profiles"

    def __str__(self):
        return f"HostProfile({self.user.email})"
