from rest_framework import serializers
from .models import HostSubscription


class CreateOrderSerializer(serializers.Serializer):
    plan = serializers.ChoiceField(choices=HostSubscription.Plan.choices)


class VerifyPaymentSerializer(serializers.Serializer):
    razorpay_order_id   = serializers.CharField()
    razorpay_payment_id = serializers.CharField()
    razorpay_signature  = serializers.CharField()


class HostSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = HostSubscription
        fields = ["plan", "status", "current_period_end", "updated_at"]
        read_only_fields = fields
