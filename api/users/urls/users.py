from django.urls import path
from users.views import BecomeHostView, MeView

urlpatterns = [
    path("me/", MeView.as_view(), name="user-me"),
    path("me/become-host/", BecomeHostView.as_view(), name="user-become-host"),
]
