from django.urls import path
from .views import CreateOrderView, MySubscriptionView, RazorpayWebhookView, VerifyPaymentView

urlpatterns = [
    path("subscription/",  MySubscriptionView.as_view(),  name="payments-subscription"),
    path("create-order/",  CreateOrderView.as_view(),     name="payments-create-order"),
    path("verify/",        VerifyPaymentView.as_view(),   name="payments-verify"),
    path("webhook/",       RazorpayWebhookView.as_view(), name="payments-webhook"),
]
