from django.db import models
from users.models import User


class HostSubscription(models.Model):
    """One row per host. Billing is annual via Razorpay Checkout — see payments/views.py."""

    class Plan(models.TextChoices):
        BASIC   = "basic",   "Basic"
        PREMIUM = "premium", "Premium"

    class Status(models.TextChoices):
        PENDING   = "pending",   "Pending"    # order created, payment not yet verified
        ACTIVE    = "active",    "Active"
        EXPIRED   = "expired",   "Expired"
        CANCELLED = "cancelled", "Cancelled"

    host                 = models.OneToOneField(User, on_delete=models.CASCADE, related_name="subscription")
    plan                 = models.CharField(max_length=10, choices=Plan.choices, default=Plan.BASIC)
    status                = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    razorpay_order_id    = models.CharField(max_length=64, blank=True)
    razorpay_payment_id  = models.CharField(max_length=64, blank=True)
    current_period_end   = models.DateTimeField(null=True, blank=True)
    created_at           = models.DateTimeField(auto_now_add=True)
    updated_at           = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "host_subscriptions"

    def __str__(self):
        return f"{self.host.email} — {self.plan} ({self.status})"
