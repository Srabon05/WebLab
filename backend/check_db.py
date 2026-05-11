import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wastemanagement_backend.settings')
django.setup()

from api.models import Conversation, CollectionRequest, User, Collector
print(f"Total Requests: {CollectionRequest.objects.count()}")
print(f"Total Conversations: {Conversation.objects.count()}")
print("-" * 20)
for c in Conversation.objects.all():
    print(f"Conv {c.id}: Participants={c.participants}, RequestId={c.related_request_id}")
print("-" * 20)
for r in CollectionRequest.objects.all():
    conv_exists = Conversation.objects.filter(related_request=r).exists()
    print(f"Request {r.id}: status={r.status}, conv_exists={conv_exists}")
