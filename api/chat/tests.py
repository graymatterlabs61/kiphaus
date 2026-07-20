from asgiref.sync import async_to_sync
from django.test import TransactionTestCase

from users.models import User
from properties.models import Property
from .consumers import ChatConsumer
from .models import Conversation


class ChatConsumerRegressionTests(TransactionTestCase):
    """TransactionTestCase, not TestCase: database_sync_to_async hops to a real worker
    thread, which doesn't see TestCase's per-test atomic transaction on the main thread."""

    """Regression test: consumers.py used models.Q(...) without `from django.db import
    models` — user_in_conversation() NameError'd on every websocket connect attempt."""

    def setUp(self):
        self.host = User.objects.create_user(username="chathost", email="chathost@example.com", role=User.Role.HOST)
        self.guest = User.objects.create_user(username="chatguest", email="chatguest@example.com")
        self.stranger = User.objects.create_user(username="stranger", email="stranger@example.com")
        self.property = Property.objects.create(
            host=self.host, title="Test place", description="A place",
            property_type="apartment", address_line1="1 Road", city="City",
            state="State", country="India", postal_code="000000", price_per_night=1000,
        )
        self.conversation = Conversation.objects.create(property=self.property, guest=self.guest, host=self.host)

    def _consumer_for(self, user):
        consumer = ChatConsumer()
        consumer.conversation_id = self.conversation.id
        consumer.user = user
        return consumer

    def test_participant_is_recognized(self):
        self.assertTrue(async_to_sync(self._consumer_for(self.guest).user_in_conversation)())
        self.assertTrue(async_to_sync(self._consumer_for(self.host).user_in_conversation)())

    def test_non_participant_is_rejected(self):
        self.assertFalse(async_to_sync(self._consumer_for(self.stranger).user_in_conversation)())
