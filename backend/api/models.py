from __future__ import annotations

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserRole(models.TextChoices):
    ADMIN = "admin", "Admin"
    RECYCLING_CENTER = "recycling_center", "Recycling Center"
    COLLECTOR = "collector", "Collector"
    USER = "user", "User"
    GUEST = "guest", "Guest"


class ApprovalStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email: str, password: str | None, **extra_fields):
        if not email:
            raise ValueError("The given email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_user(self, email: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email=email, password=password, **extra_fields)

    def create_superuser(self, email: str, password: str, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", UserRole.ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email=email, password=password, **extra_fields)


class User(AbstractUser):
    username = None  # type: ignore[assignment]
    email = models.EmailField(unique=True)

    name = models.CharField(max_length=255)
    role = models.CharField(max_length=32, choices=UserRole.choices, default=UserRole.USER)
    approval_status = models.CharField(max_length=16, choices=ApprovalStatus.choices, default=ApprovalStatus.PENDING)
    phone = models.CharField(max_length=64, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    avatar = models.URLField(blank=True, null=True)

    status = models.CharField(
        max_length=16,
        choices=(("active", "Active"), ("inactive", "Inactive"), ("suspended", "Suspended")),
        default="active",
    )
    last_active = models.DateTimeField(blank=True, null=True)
    total_collections = models.IntegerField(default=0)
    total_points = models.IntegerField(default=0)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    objects = UserManager()

    def __str__(self) -> str:
        return f"{self.email} ({self.role})"

class CollectionStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    ASSIGNED = "assigned", "Assigned"
    IN_PROGRESS = "in_progress", "In Progress"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"


class EWasteCategory(models.TextChoices):
    COMPUTERS = "computers", "Computers"
    MOBILE_DEVICES = "mobile_devices", "Mobile Devices"
    TELEVISIONS = "televisions", "Televisions"
    APPLIANCES = "appliances", "Appliances"
    BATTERIES = "batteries", "Batteries"
    CABLES = "cables", "Cables"
    OTHER = "other", "Other"


class RecyclingCenter(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=64)
    address = models.TextField()
    city = models.CharField(max_length=128)
    capacity = models.IntegerField(default=0)
    current_load = models.IntegerField(default=0)
    accepted_categories = models.JSONField(default=list)
    rating = models.FloatField(default=0)
    total_collections = models.IntegerField(default=0)
    status = models.CharField(max_length=16, choices=(("active", "Active"), ("inactive", "Inactive")), default="active")
    approval_status = models.CharField(max_length=16, choices=ApprovalStatus.choices, default=ApprovalStatus.PENDING)
    registered_at = models.DateTimeField()
    approved_at = models.DateTimeField(blank=True, null=True)
    certifications = models.JSONField(default=list, blank=True)

    def __str__(self) -> str:
        return self.name


class Collector(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=64)
    vehicle_type = models.CharField(max_length=64)
    vehicle_number = models.CharField(max_length=64)
    assigned_center = models.ForeignKey(RecyclingCenter, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(
        max_length=16,
        choices=(("available", "Available"), ("busy", "Busy"), ("offline", "Offline")),
        default="offline",
    )
    completed_collections = models.IntegerField(default=0)
    rating = models.FloatField(default=0)
    current_location = models.CharField(max_length=255, blank=True, null=True)
    approval_status = models.CharField(max_length=16, choices=ApprovalStatus.choices, default=ApprovalStatus.PENDING)
    registered_at = models.DateTimeField()
    approved_at = models.DateTimeField(blank=True, null=True)
    license_number = models.CharField(max_length=64, blank=True, null=True)

    def __str__(self) -> str:
        return self.name


class EWasteCategoryConfig(models.Model):
    # allow admins to create new categories beyond the initial enum
    category = models.CharField(max_length=64, unique=True)
    label = models.CharField(max_length=128)
    description = models.TextField()
    reward_points = models.IntegerField(default=0)
    pickup_charge = models.IntegerField(default=0)
    active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return self.label


class RewardRule(models.Model):
    name = models.CharField(max_length=255)
    condition = models.CharField(max_length=255)
    category = models.CharField(max_length=64)
    min_weight = models.FloatField(default=0)
    max_weight = models.FloatField(blank=True, null=True)
    points_per_kg = models.FloatField(default=0)
    bonus_points = models.IntegerField(blank=True, null=True)
    multiplier = models.FloatField(default=1)


class Campaign(models.Model):
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=16, choices=(("notice", "Notice"), ("awareness", "Awareness"), ("promotion", "Promotion")))
    created_at = models.DateTimeField()
    expires_at = models.DateTimeField(blank=True, null=True)
    active = models.BooleanField(default=True)
    target_audience = models.CharField(max_length=16, choices=(("all", "All"), ("users", "Users"), ("collectors", "Collectors"), ("centers", "Centers")))


class DisposalGuideline(models.Model):
    category = models.CharField(max_length=64)
    title = models.CharField(max_length=255)
    description = models.TextField()
    steps = models.JSONField(default=list)
    safety_warnings = models.JSONField(default=list)
    uploaded_by = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField()
    file_url = models.CharField(max_length=512, blank=True, null=True)


class CollectionRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="collection_requests")
    user_name = models.CharField(max_length=255)
    user_phone = models.CharField(max_length=64)
    user_address = models.TextField()
    category = models.CharField(max_length=64)
    items = models.TextField()
    quantity = models.IntegerField(blank=True, null=True)
    weight = models.FloatField(blank=True, null=True)
    estimated_weight = models.CharField(max_length=64, blank=True, null=True)
    scheduled_date = models.DateField(blank=True, null=True)
    scheduled_time = models.CharField(max_length=32, blank=True, null=True)
    status = models.CharField(max_length=16, choices=CollectionStatus.choices, default=CollectionStatus.PENDING)
    collector = models.ForeignKey(Collector, on_delete=models.SET_NULL, null=True, blank=True, related_name="requests")
    recycling_center = models.ForeignKey(RecyclingCenter, on_delete=models.SET_NULL, null=True, blank=True, related_name="requests")
    created_at = models.DateTimeField()
    assigned_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    image = models.TextField(blank=True, null=True)
    reward_points = models.IntegerField(blank=True, null=True)
    pickup_charge = models.IntegerField(blank=True, null=True)
    received_at = models.DateTimeField(blank=True, null=True)
    classification = models.CharField(max_length=32, blank=True, null=True)
    recycling_outcome = models.JSONField(blank=True, null=True)
    tracking_history = models.JSONField(default=list, blank=True)
    pickup_otp = models.CharField(max_length=16, blank=True, null=True)
    otp_verified_at = models.DateTimeField(blank=True, null=True)

    def __str__(self) -> str:
        return f"CR{self.pk} {self.user_name}"


class RewardTransaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reward_transactions")
    type = models.CharField(max_length=16, choices=(("earned", "Earned"), ("redeemed", "Redeemed"), ("bonus", "Bonus")))
    points = models.IntegerField()
    description = models.CharField(max_length=255)
    related_request = models.ForeignKey(CollectionRequest, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField()
    balance = models.IntegerField()


class RewardRedemption(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    points_required = models.IntegerField()
    category = models.CharField(max_length=16, choices=(("voucher", "Voucher"), ("donation", "Donation"), ("discount", "Discount"), ("cashback", "Cashback")))
    icon = models.CharField(max_length=32, default="🎁")
    available = models.BooleanField(default=True)


class UserRewardProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="reward_profile")
    total_points = models.IntegerField(default=0)
    lifetime_points = models.IntegerField(default=0)
    redeemed_points = models.IntegerField(default=0)
    tier = models.CharField(max_length=16, choices=(("bronze", "Bronze"), ("silver", "Silver"), ("gold", "Gold"), ("platinum", "Platinum")), default="bronze")
    rank = models.IntegerField(blank=True, null=True)


class LeaderboardEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="leaderboard_entries")
    rank = models.IntegerField()
    points = models.IntegerField()
    collections = models.IntegerField()
    tier = models.CharField(max_length=16, choices=(("bronze", "Bronze"), ("silver", "Silver"), ("gold", "Gold"), ("platinum", "Platinum")))


class Conversation(models.Model):
    participants = models.JSONField(default=list)
    related_request = models.ForeignKey(CollectionRequest, on_delete=models.SET_NULL, null=True, blank=True)
    last_message = models.CharField(max_length=255)
    last_message_time = models.DateTimeField()
    unread_count = models.IntegerField(default=0)


class ChatMessage(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender_id = models.CharField(max_length=64)
    sender_name = models.CharField(max_length=255)
    sender_role = models.CharField(max_length=32)
    message = models.TextField()
    timestamp = models.DateTimeField()
    read = models.BooleanField(default=False)
