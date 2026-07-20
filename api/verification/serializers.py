from rest_framework import serializers
from .models import HostVerification


class HostVerificationStepSerializer(serializers.ModelSerializer):
    class Meta:
        model  = HostVerification
        fields = ["level", "status", "detail", "submitted_at", "reviewed_at"]
        read_only_fields = fields


class VerificationSubmitSerializer(serializers.Serializer):
    level  = serializers.ChoiceField(choices=HostVerification.Level.choices)
    detail = serializers.CharField(required=False, allow_blank=True, max_length=255)
