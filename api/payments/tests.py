from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient

from users.models import User
from .models import HostSubscription
from .razorpay_client import PaymentError


def _make_host():
    return User.objects.create_user(username="host1", email="host1@example.com", role=User.Role.HOST)


def _make_guest():
    return User.objects.create_user(username="guest1", email="guest1@example.com", role=User.Role.GUEST)


class CreateOrderViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.host = _make_host()
        self.client.force_authenticate(self.host)

    @patch("payments.views.create_order")
    def test_creates_pending_subscription_and_returns_order(self, mock_create_order):
        mock_create_order.return_value = {"order_id": "order_abc", "amount": 199900, "currency": "INR"}

        response = self.client.post("/api/v1/payments/create-order/", {"plan": "basic"}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["order_id"], "order_abc")
        self.assertEqual(response.data["amount"], 199900)

        subscription = HostSubscription.objects.get(host=self.host)
        self.assertEqual(subscription.plan, "basic")
        self.assertEqual(subscription.status, HostSubscription.Status.PENDING)
        self.assertEqual(subscription.razorpay_order_id, "order_abc")

    @patch("payments.views.create_order")
    def test_razorpay_failure_returns_400(self, mock_create_order):
        mock_create_order.side_effect = PaymentError("Could not create the payment order.")
        response = self.client.post("/api/v1/payments/create-order/", {"plan": "premium"}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_guest_cannot_create_order(self):
        self.client.force_authenticate(_make_guest())
        response = self.client.post("/api/v1/payments/create-order/", {"plan": "basic"}, format="json")
        self.assertEqual(response.status_code, 403)

    def test_unknown_plan_is_rejected(self):
        response = self.client.post("/api/v1/payments/create-order/", {"plan": "enterprise"}, format="json")
        self.assertEqual(response.status_code, 400)


class VerifyPaymentViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.host = _make_host()
        self.client.force_authenticate(self.host)
        self.subscription = HostSubscription.objects.create(
            host=self.host, plan="basic", status=HostSubscription.Status.PENDING, razorpay_order_id="order_abc"
        )

    @patch("payments.views.verify_payment_signature")
    def test_activates_subscription_on_valid_signature(self, mock_verify):
        mock_verify.return_value = None

        response = self.client.post("/api/v1/payments/verify/", {
            "razorpay_order_id": "order_abc",
            "razorpay_payment_id": "pay_123",
            "razorpay_signature": "sig_123",
        }, format="json")

        self.assertEqual(response.status_code, 200)
        self.subscription.refresh_from_db()
        self.assertEqual(self.subscription.status, HostSubscription.Status.ACTIVE)
        self.assertEqual(self.subscription.razorpay_payment_id, "pay_123")
        self.assertIsNotNone(self.subscription.current_period_end)

    @patch("payments.views.verify_payment_signature")
    def test_invalid_signature_leaves_subscription_pending(self, mock_verify):
        mock_verify.side_effect = PaymentError("Payment signature verification failed.")

        response = self.client.post("/api/v1/payments/verify/", {
            "razorpay_order_id": "order_abc",
            "razorpay_payment_id": "pay_123",
            "razorpay_signature": "bad_sig",
        }, format="json")

        self.assertEqual(response.status_code, 400)
        self.subscription.refresh_from_db()
        self.assertEqual(self.subscription.status, HostSubscription.Status.PENDING)

    def test_unknown_order_id_rejected(self):
        response = self.client.post("/api/v1/payments/verify/", {
            "razorpay_order_id": "order_does_not_exist",
            "razorpay_payment_id": "pay_123",
            "razorpay_signature": "sig_123",
        }, format="json")
        self.assertEqual(response.status_code, 400)


class RazorpayWebhookViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.host = _make_host()
        self.subscription = HostSubscription.objects.create(
            host=self.host, plan="premium", status=HostSubscription.Status.PENDING, razorpay_order_id="order_xyz"
        )

    @patch("payments.views.verify_webhook_signature")
    def test_payment_captured_event_activates_subscription(self, mock_verify):
        mock_verify.return_value = None
        payload = {
            "event": "payment.captured",
            "payload": {"payment": {"entity": {"id": "pay_999", "order_id": "order_xyz"}}},
        }
        response = self.client.post(
            "/api/v1/payments/webhook/", payload, format="json", HTTP_X_RAZORPAY_SIGNATURE="sig"
        )
        self.assertEqual(response.status_code, 200)
        self.subscription.refresh_from_db()
        self.assertEqual(self.subscription.status, HostSubscription.Status.ACTIVE)
        self.assertEqual(self.subscription.razorpay_payment_id, "pay_999")

    @patch("payments.views.verify_webhook_signature")
    def test_bad_signature_rejected(self, mock_verify):
        mock_verify.side_effect = PaymentError("Webhook signature verification failed.")
        response = self.client.post(
            "/api/v1/payments/webhook/", {"event": "payment.captured"}, format="json", HTTP_X_RAZORPAY_SIGNATURE="bad"
        )
        self.assertEqual(response.status_code, 400)
        self.subscription.refresh_from_db()
        self.assertEqual(self.subscription.status, HostSubscription.Status.PENDING)


class MySubscriptionViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.host = _make_host()
        self.client.force_authenticate(self.host)

    def test_null_when_no_subscription_started(self):
        response = self.client.get("/api/v1/payments/subscription/")
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data)

    def test_returns_existing_subscription(self):
        HostSubscription.objects.create(host=self.host, plan="premium", status=HostSubscription.Status.ACTIVE)
        response = self.client.get("/api/v1/payments/subscription/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["plan"], "premium")
        self.assertEqual(response.data["status"], "active")
