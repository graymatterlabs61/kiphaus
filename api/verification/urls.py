from django.urls import path
from .views import MyVerificationStepsView, VerificationSubmitView

urlpatterns = [
    path("me/", MyVerificationStepsView.as_view(), name="verification-me"),
    path("me/submit/", VerificationSubmitView.as_view(), name="verification-submit"),
]
