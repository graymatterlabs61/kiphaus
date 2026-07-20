from django.conf import settings
import razorpay

# ₹1999/yr and ₹4999/yr — matches web/components/features/host/subscription-plan-card.tsx.
# Amounts are in paise (Razorpay's smallest INR unit), same as Stripe's cents convention.
PLAN_AMOUNT_PAISE = {
    "basic": 1999_00,
    "premium": 4999_00,
}

_client = None


class PaymentError(Exception):
    """Raised whenever an order/signature can't be created or verified."""


def _get_client() -> razorpay.Client:
    global _client
    if _client is None:
        _client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    return _client


def create_order(plan: str, receipt: str) -> dict:
    try:
        amount = PLAN_AMOUNT_PAISE[plan]
    except KeyError as exc:
        raise PaymentError(f"Unknown plan '{plan}'.") from exc

    try:
        order = _get_client().order.create({
            "amount": amount,
            "currency": "INR",
            "receipt": receipt,
            "payment_capture": 1,
        })
    except Exception as exc:  # razorpay raises its own BadRequestError/ServerError subclasses
        raise PaymentError("Could not create the payment order.") from exc

    return {"order_id": order["id"], "amount": amount, "currency": "INR"}


def verify_payment_signature(order_id: str, payment_id: str, signature: str) -> None:
    try:
        _get_client().utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        })
    except razorpay.errors.SignatureVerificationError as exc:
        raise PaymentError("Payment signature verification failed.") from exc


def verify_webhook_signature(body: bytes, signature: str) -> None:
    try:
        _get_client().utility.verify_webhook_signature(
            body.decode(), signature, settings.RAZORPAY_WEBHOOK_SECRET
        )
    except razorpay.errors.SignatureVerificationError as exc:
        raise PaymentError("Webhook signature verification failed.") from exc
