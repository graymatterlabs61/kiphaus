from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from users.permissions import IsHost
from .models import HostSubscription
from .razorpay_client import PaymentError, create_order, verify_payment_signature, verify_webhook_signature
from .serializers import CreateOrderSerializer, HostSubscriptionSerializer, VerifyPaymentSerializer


class MySubscriptionView(APIView):
    """GET /api/v1/payments/subscription/ — null if the host has never started checkout."""
    permission_classes = [permissions.IsAuthenticated, IsHost]

    def get(self, request):
        subscription = HostSubscription.objects.filter(host=request.user).first()
        if subscription is None:
            return Response(None)
        return Response(HostSubscriptionSerializer(subscription).data)


class CreateOrderView(APIView):
    """POST /api/v1/payments/create-order/ — Body: {plan: "basic"|"premium"}."""
    permission_classes = [permissions.IsAuthenticated, IsHost]

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plan = serializer.validated_data["plan"]

        subscription, _ = HostSubscription.objects.get_or_create(host=request.user)
        receipt = f"host-{request.user.id}-{plan}-{int(timezone.now().timestamp())}"

        try:
            order = create_order(plan, receipt)
        except PaymentError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        subscription.plan = plan
        subscription.status = HostSubscription.Status.PENDING
        subscription.razorpay_order_id = order["order_id"]
        subscription.save(update_fields=["plan", "status", "razorpay_order_id", "updated_at"])

        return Response({
            "order_id": order["order_id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key_id": settings.RAZORPAY_KEY_ID,
        })


class VerifyPaymentView(APIView):
    """POST /api/v1/payments/verify/ — called by the frontend when Razorpay Checkout
    returns a success handler. The webhook (below) is the durable fallback."""
    permission_classes = [permissions.IsAuthenticated, IsHost]

    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            subscription = HostSubscription.objects.get(
                host=request.user, razorpay_order_id=data["razorpay_order_id"]
            )
        except HostSubscription.DoesNotExist:
            return Response({"detail": "No matching order for this account."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            verify_payment_signature(
                data["razorpay_order_id"], data["razorpay_payment_id"], data["razorpay_signature"]
            )
        except PaymentError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        subscription.status = HostSubscription.Status.ACTIVE
        subscription.razorpay_payment_id = data["razorpay_payment_id"]
        subscription.current_period_end = timezone.now() + timedelta(days=365)
        subscription.save(update_fields=["status", "razorpay_payment_id", "current_period_end", "updated_at"])

        return Response(HostSubscriptionSerializer(subscription).data)


class RazorpayWebhookView(APIView):
    """POST /api/v1/payments/webhook/ — durable source of truth in case the browser
    never returns from Checkout (closed tab, network drop) to hit VerifyPaymentView.
    Configure this URL in the Razorpay dashboard once RAZORPAY_WEBHOOK_SECRET is set."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        signature = request.headers.get("X-Razorpay-Signature", "")
        try:
            verify_webhook_signature(request.body, signature)
        except PaymentError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        event = request.data
        if event.get("event") == "payment.captured":
            payload = event.get("payload", {}).get("payment", {}).get("entity", {})
            order_id = payload.get("order_id")
            if order_id:
                HostSubscription.objects.filter(razorpay_order_id=order_id).update(
                    status=HostSubscription.Status.ACTIVE,
                    razorpay_payment_id=payload.get("id", ""),
                    current_period_end=timezone.now() + timedelta(days=365),
                )
        return Response({"detail": "ok"})
