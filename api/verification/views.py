from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from users.permissions import IsHost
from .models import HostVerification
from .serializers import HostVerificationStepSerializer, VerificationSubmitSerializer


def _ensure_all_steps(host):
    existing = {s.level for s in host.verification_steps.all()}
    for level in HostVerification.Level.values:
        if level not in existing:
            HostVerification.objects.create(host=host, level=level)


class MyVerificationStepsView(APIView):
    """The authenticated host's own 4 verification steps — creating any missing rows on first read."""
    permission_classes = [IsHost]

    def get(self, request):
        _ensure_all_steps(request.user)
        steps = request.user.verification_steps.all()
        return Response(HostVerificationStepSerializer(steps, many=True).data)


class VerificationSubmitView(APIView):
    """Host submits a level for review. Sequential — can't submit level N until N-1 is approved,
    and can't resubmit a level that's already approved or currently in review."""
    permission_classes = [IsHost]

    def post(self, request):
        serializer = VerificationSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        level = serializer.validated_data["level"]

        _ensure_all_steps(request.user)

        if level > 1:
            prior = request.user.verification_steps.get(level=level - 1)
            if prior.status != HostVerification.Status.APPROVED:
                return Response(
                    {"detail": f"Level {level - 1} must be approved before submitting level {level}."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        step = request.user.verification_steps.get(level=level)
        if step.status in (HostVerification.Status.APPROVED, HostVerification.Status.IN_REVIEW):
            return Response(
                {"detail": f"Level {level} is already {step.get_status_display().lower()}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        step.status = HostVerification.Status.IN_REVIEW
        step.detail = serializer.validated_data.get("detail", "")
        step.submitted_at = timezone.now()
        step.reviewed_at = None
        step.reviewed_by = None
        step.save(update_fields=["status", "detail", "submitted_at", "reviewed_at", "reviewed_by"])

        return Response(HostVerificationStepSerializer(step).data, status=status.HTTP_200_OK)
