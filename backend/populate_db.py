import os
import django
import random
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wastemanagement_backend.settings')
django.setup()

from django.utils.timezone import now
from django.contrib.auth import get_user_model
from api.models import (
    RecyclingCenter, Collector, EWasteCategoryConfig, 
    RewardRule, Campaign, DisposalGuideline, CollectionRequest,
    RewardTransaction, RewardRedemption, UserRewardProfile,
    LeaderboardEntry
)

User = get_user_model()

print("Populating database...")

# 1. Ensure basic users exist
admin = User.objects.filter(email='admin@ewaste.com').first()
center_user = User.objects.filter(email='center@ewaste.com').first()
collector_user = User.objects.filter(email='collector@ewaste.com').first()
normal_user = User.objects.filter(email='user@ewaste.com').first()

if not all([admin, center_user, collector_user, normal_user]):
    print("Base users not found. Run previous setup first.")
    exit()

# 2. Categories
categories = [
    {"category": "computers", "label": "Computers & Laptops", "description": "Desktops, laptops, servers, and related accessories.", "reward_points": 500, "pickup_charge": 50},
    {"category": "mobile_devices", "label": "Mobile Devices", "description": "Smartphones, tablets, and mobile phones.", "reward_points": 200, "pickup_charge": 0},
    {"category": "televisions", "label": "Televisions & Monitors", "description": "CRT, LCD, LED TVs and computer monitors.", "reward_points": 300, "pickup_charge": 100},
    {"category": "appliances", "label": "Home Appliances", "description": "Refrigerators, washing machines, microwaves.", "reward_points": 1000, "pickup_charge": 200},
    {"category": "batteries", "label": "Batteries", "description": "Lithium-ion, lead-acid, and alkaline batteries.", "reward_points": 100, "pickup_charge": 0},
    {"category": "cables", "label": "Cables & Peripherals", "description": "Keyboards, mice, cables, chargers.", "reward_points": 50, "pickup_charge": 0},
]

for cat_data in categories:
    EWasteCategoryConfig.objects.get_or_create(category=cat_data["category"], defaults=cat_data)

# 3. Centers & Collectors
center = RecyclingCenter.objects.filter(email='center@ewaste.com').first()
collector = Collector.objects.filter(email='collector@ewaste.com').first()

# 4. Collection Requests
requests_data = [
    {
        "category": "mobile_devices", "items": "2 broken smartphones", "quantity": 2, "weight": 0.5,
        "status": "completed", "notes": "Screens cracked", "reward_points": 400
    },
    {
        "category": "computers", "items": "1 old laptop", "quantity": 1, "weight": 2.5,
        "status": "pending", "notes": "Doesn't turn on", "reward_points": 500
    },
    {
        "category": "appliances", "items": "1 Microwave", "quantity": 1, "weight": 15.0,
        "status": "in_progress", "notes": "Door broken", "reward_points": 1000
    }
]

for i, req in enumerate(requests_data):
    cr, created = CollectionRequest.objects.get_or_create(
        user=normal_user,
        category=req["category"],
        defaults={
            "user_name": normal_user.name,
            "user_phone": "111222333",
            "user_address": "123 User St",
            "items": req["items"],
            "quantity": req["quantity"],
            "weight": req["weight"],
            "status": req["status"],
            "created_at": now() - timedelta(days=i*2),
            "notes": req["notes"],
            "reward_points": req["reward_points"]
        }
    )
    if cr.status in ["in_progress", "completed"]:
        cr.collector = collector
        cr.recycling_center = center
        cr.assigned_at = cr.created_at + timedelta(hours=1)
        if cr.status == "completed":
            cr.completed_at = cr.created_at + timedelta(hours=24)
            cr.received_at = cr.completed_at
            
            # Create reward transaction
            RewardTransaction.objects.get_or_create(
                user=normal_user,
                related_request=cr,
                defaults={
                    "type": "earned",
                    "points": req["reward_points"],
                    "description": f"Earned from {cr.category} collection",
                    "timestamp": cr.completed_at,
                    "balance": req["reward_points"]
                }
            )
        cr.save()

# 5. Reward Profile
profile, _ = UserRewardProfile.objects.get_or_create(
    user=normal_user,
    defaults={
        "total_points": 400,
        "lifetime_points": 400,
        "tier": "bronze"
    }
)

# 6. Reward Rules
rules = [
    {"name": "Heavy Item Bonus", "condition": "weight > 10", "category": "all", "min_weight": 10, "points_per_kg": 0, "bonus_points": 200, "multiplier": 1.0},
    {"name": "Mobile Double Points", "condition": "category == mobile_devices", "category": "mobile_devices", "points_per_kg": 0, "multiplier": 2.0},
]
for rule in rules:
    RewardRule.objects.get_or_create(name=rule["name"], defaults=rule)

# 7. Redemptions
redemptions = [
    {"name": "$5 Amazon Card", "description": "Gift card for Amazon", "points_required": 500, "category": "voucher"},
    {"name": "10% Utility Discount", "description": "Discount on electric bill", "points_required": 1000, "category": "discount"},
]
for red in redemptions:
    RewardRedemption.objects.get_or_create(name=red["name"], defaults=red)

print("Database successfully populated with sample data!")
