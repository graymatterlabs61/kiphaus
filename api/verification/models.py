from django.db import models
from users.models import User


class HostVerification(models.Model):
    """One row per host per trust level. Levels are sequential — see services.approved_level_for:
    a level only counts as reached once every level below it is also approved (matches the
    guest-facing copy: 'unlocks once your video walkthrough is approved')."""

    class Level(models.IntegerChoices):
        IDENTITY = 1, "Identity"
        PROPERTY = 2, "Property"
        VIDEO    = 3, "Video"
        ON_SITE  = 4, "On-site"

    class Status(models.TextChoices):
        NOT_STARTED = "not_started", "Not started"
        IN_REVIEW   = "in_review",   "In review"
        APPROVED    = "approved",    "Approved"
        REJECTED    = "rejected",    "Rejected"

    host         = models.ForeignKey(User, on_delete=models.CASCADE, related_name="verification_steps")
    level        = models.PositiveSmallIntegerField(choices=Level.choices)
    status       = models.CharField(max_length=15, choices=Status.choices, default=Status.NOT_STARTED)
    detail       = models.CharField(max_length=255, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at  = models.DateTimeField(null=True, blank=True)
    reviewed_by  = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="verification_reviews"
    )

    class Meta:
        db_table = "host_verification_steps"
        unique_together = ["host", "level"]
        ordering = ["level"]

    def __str__(self):
        return f"{self.host.email} — Level {self.level} ({self.status})"
