from __future__ import annotations

from datetime import datetime

from django.core.management.base import BaseCommand
from django.utils.timezone import make_aware

from api.models import (
    Campaign,
    ChatMessage,
    CollectionRequest,
    Collector,
    Conversation,
    DisposalGuideline,
    EWasteCategoryConfig,
    LeaderboardEntry,
    RecyclingCenter,
    RewardRedemption,
    RewardRule,
    RewardTransaction,
    User,
    UserRewardProfile,
)


def dt(value: str) -> datetime:
    # Accept both "Z" and "+00:00"
    value = value.replace("Z", "+00:00")
    parsed = datetime.fromisoformat(value)
    if parsed.tzinfo is None:
        parsed = make_aware(parsed)
    return parsed


class Command(BaseCommand):
    help = "Seed demo data for the Waste Management app"

    def handle(self, *args, **options):
        self.stdout.write("Seeding demo data...")

        admin, _ = User.objects.get_or_create(
            email="admin@ewaste.com",
            defaults={"name": "System Admin", "role": "admin", "phone": "+1-555-0100"},
        )
        if not admin.check_password("password123"):
            admin.set_password("password123")
            admin.save(update_fields=["password"])

        center_user, _ = User.objects.get_or_create(
            email="center@ewaste.com",
            defaults={"name": "GreenTech Recycling Center", "role": "recycling_center", "phone": "+1-555-0101", "address": "123 Green St, EcoCity"},
        )
        if not center_user.check_password("password123"):
            center_user.set_password("password123")
            center_user.save(update_fields=["password"])

        collector_user, _ = User.objects.get_or_create(
            email="collector@ewaste.com",
            defaults={"name": "John Collector", "role": "collector", "phone": "+1-555-0102"},
        )
        if not collector_user.check_password("password123"):
            collector_user.set_password("password123")
            collector_user.save(update_fields=["password"])

        normal_user, _ = User.objects.get_or_create(
            email="user@ewaste.com",
            defaults={
                "name": "Jane Smith",
                "role": "user",
                "phone": "+1-555-0103",
                "address": "456 Main St, Apt 2B, EcoCity",
                "status": "active",
                "total_collections": 3,
                "total_points": 165,
            },
        )
        if not normal_user.check_password("password123"):
            normal_user.set_password("password123")
            normal_user.save(update_fields=["password"])

        gt_center, _ = RecyclingCenter.objects.get_or_create(
            email="center@ewaste.com",
            defaults={
                "name": "GreenTech Recycling Center",
                "phone": "+1-555-0101",
                "address": "123 Green St, EcoCity",
                "city": "EcoCity",
                "capacity": 10000,
                "current_load": 6500,
                "accepted_categories": ["computers", "mobile_devices", "televisions", "appliances", "batteries", "cables"],
                "rating": 4.8,
                "total_collections": 1250,
                "status": "active",
                "approval_status": "approved",
                "registered_at": dt("2025-01-15T08:00:00Z"),
                "approved_at": dt("2025-01-16T10:00:00Z"),
                "certifications": ["ISO 14001", "EPA Certified"],
            },
        )

        karim, _ = Collector.objects.get_or_create(
            email="collector@ewaste.com",
            defaults={
                "name": "Karim Hossain",
                "phone": "+1-555-0102",
                "vehicle_type": "Van",
                "vehicle_number": "ECO-123",
                "assigned_center": gt_center,
                "status": "busy",
                "completed_collections": 145,
                "rating": 4.9,
                "current_location": "En route to 456 Main St",
                "approval_status": "approved",
                "registered_at": dt("2025-01-15T08:00:00Z"),
                "approved_at": dt("2025-01-16T10:00:00Z"),
                "license_number": "COL-12345",
            },
        )

        EWasteCategoryConfig.objects.get_or_create(
            category="computers",
            defaults={
                "label": "Computers & Laptops",
                "description": "Desktop computers, laptops, keyboards, mice",
                "reward_points": 50,
                "pickup_charge": 10,
                "active": True,
            },
        )
        EWasteCategoryConfig.objects.get_or_create(
            category="mobile_devices",
            defaults={
                "label": "Mobile Devices",
                "description": "Smartphones, tablets, smartwatches",
                "reward_points": 30,
                "pickup_charge": 5,
                "active": True,
            },
        )

        RewardRule.objects.get_or_create(
            name="Bulk Computer Discount",
            defaults={
                "condition": "Computers 10-50 kg",
                "category": "computers",
                "min_weight": 10,
                "max_weight": 50,
                "points_per_kg": 7,
                "bonus_points": 10,
                "multiplier": 1.4,
            },
        )

        Campaign.objects.get_or_create(
            title="Proper Battery Disposal",
            defaults={
                "message": "Did you know? Batteries contain toxic materials that can harm the environment. Always recycle your batteries responsibly!",
                "type": "awareness",
                "created_at": dt("2026-03-20T09:00:00Z"),
                "active": True,
                "target_audience": "all",
            },
        )

        guideline, _ = DisposalGuideline.objects.get_or_create(
            title="Safe Battery Disposal Guide",
            defaults={
                "category": "batteries",
                "description": "Guidelines for handling and disposing of various battery types safely",
                "steps": [
                    "Separate batteries by type (Li-ion, NiMH, Lead-acid, Alkaline)",
                    "Check for any damage or leakage - handle with protective gloves",
                    "Tape battery terminals to prevent short circuits",
                    "Store in a cool, dry place away from flammable materials",
                    "Transport in non-conductive containers",
                    "Process according to battery chemistry specifications",
                ],
                "safety_warnings": [
                    "Never puncture or incinerate batteries",
                    "Avoid exposure to water or extreme temperatures",
                    "Use proper PPE when handling damaged batteries",
                    "Keep away from children and pets",
                ],
                "uploaded_by": "GreenTech Recycling Center",
                "uploaded_at": dt("2026-01-15T10:00:00Z"),
                "file_url": "/guidelines/battery-disposal.pdf",
            },
        )
        _ = guideline

        req, _ = CollectionRequest.objects.get_or_create(
            user=normal_user,
            created_at=dt("2026-03-28T10:30:00Z"),
            defaults={
                "user_name": "Fatima Rahman",
                "user_phone": "+880-1712-345678",
                "user_address": "House 45, Road 12, Dhanmondi, Dhaka",
                "category": "computers",
                "items": "Old laptop, desktop computer, keyboard, mouse",
                "quantity": 4,
                "estimated_weight": "15-20 kg",
                "scheduled_date": datetime.fromisoformat("2026-04-02").date(),
                "scheduled_time": "10:00 AM",
                "status": "assigned",
                "collector": karim,
                "recycling_center": gt_center,
                "notes": "Please call before arrival",
                "reward_points": 50,
                "pickup_charge": 10,
                "tracking_history": [
                    {"status": "pending", "timestamp": "2026-03-28T10:30:00Z", "message": "Request submitted successfully"},
                    {"status": "assigned", "timestamp": "2026-03-28T14:00:00Z", "message": "Collector Karim Hossain assigned", "location": "GreenTech Recycling Center"},
                ],
            },
        )

        # Ensure conversation exists for the request
        Conversation.objects.get_or_create(
            related_request=req,
            defaults={
                "participants": [
                    {"id": str(gt_center.id), "name": gt_center.name, "role": "recycling_center"},
                    {"id": str(normal_user.id), "name": normal_user.name, "role": "user"},
                    {"id": str(karim.id), "name": karim.name, "role": "collector"},
                ],
                "last_message": "Conversation started",
                "last_message_time": dt("2026-03-28T10:30:00Z"),
                "unread_count": 0,
            },
        )

        RewardRedemption.objects.get_or_create(
            name="Amazon Gift Card",
            defaults={
                "description": "$5 Amazon e-gift card delivered via email",
                "points_required": 100,
                "category": "voucher",
                "icon": "🎁",
                "available": True,
            },
        )

        profile, _ = UserRewardProfile.objects.get_or_create(
            user=normal_user,
            defaults={"total_points": 165, "lifetime_points": 190, "redeemed_points": 25, "tier": "silver", "rank": 47},
        )
        _ = profile

        RewardTransaction.objects.get_or_create(
            user=normal_user,
            timestamp=dt("2026-03-28T16:00:00Z"),
            defaults={
                "type": "earned",
                "points": 50,
                "description": "E-waste collection completed - CR001",
                "related_request": req,
                "balance": 125,
            },
        )

        LeaderboardEntry.objects.get_or_create(
            rank=47,
            user=normal_user,
            defaults={"points": 165, "collections": 3, "tier": "silver"},
        )

        conv, _ = Conversation.objects.get_or_create(
            last_message="What time should I expect the pickup?",
            defaults={
                "participants": [
                    {"id": str(gt_center.id), "name": gt_center.name, "role": "recycling_center"},
                    {"id": str(normal_user.id), "name": normal_user.name, "role": "user"},
                ],
                "related_request": req,
                "last_message_time": dt("2026-03-30T15:30:00Z"),
                "unread_count": 1,
            },
        )

        ChatMessage.objects.get_or_create(
            conversation=conv,
            timestamp=dt("2026-03-30T15:00:00Z"),
            defaults={
                "sender_id": str(normal_user.id),
                "sender_name": normal_user.name,
                "sender_role": "user",
                "message": "Hi, I have a question about my pickup request.",
                "read": True,
            },
        )

        self.stdout.write(self.style.SUCCESS("Demo data seeded."))

