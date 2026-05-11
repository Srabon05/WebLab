import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wastemanagement_backend.settings')
django.setup()

from api.models import CollectionRequest, EWasteCategoryConfig

def update_points():
    requests = CollectionRequest.objects.all()
    count = 0
    for req in requests:
        # Since category is now a ForeignKey to EWasteCategoryConfig
        config = req.category
        if config:
            new_points = config.reward_points * (req.quantity or 1)
            if req.reward_points != new_points:
                req.reward_points = new_points
                req.save()
                count += 1
                print(f"Updated CR{req.id}: {new_points} points")
    print(f"Total requests updated: {count}")

if __name__ == "__main__":
    update_points()
