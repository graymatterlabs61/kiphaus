from django.contrib import admin
from django.utils import timezone
from .models import HostVerification


@admin.register(HostVerification)
class HostVerificationAdmin(admin.ModelAdmin):
    list_display  = ["host", "level", "status", "submitted_at", "reviewed_at"]
    list_filter   = ["level", "status"]
    search_fields = ["host__email"]
    actions       = ["approve_selected", "reject_selected"]

    @admin.action(description="Approve selected steps")
    def approve_selected(self, request, queryset):
        queryset.update(status=HostVerification.Status.APPROVED, reviewed_at=timezone.now(), reviewed_by=request.user)

    @admin.action(description="Reject selected steps")
    def reject_selected(self, request, queryset):
        queryset.update(status=HostVerification.Status.REJECTED, reviewed_at=timezone.now(), reviewed_by=request.user)
