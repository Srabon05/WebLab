from __future__ import annotations

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from .models import (
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
    UserRewardProfile,
    Notification,
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "name",
            "role",
            "approval_status",
            "phone",
            "address",
            "avatar",
            "status",
            "last_active",
            "total_collections",
            "total_points",
            "date_joined",
        )


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("email", "password", "name", "role", "phone", "address")

    def create(self, validated_data):
        from django.utils import timezone
        password = validated_data.pop("password")
        user = User.objects.create_user(**validated_data, password=password)
        
        role = user.role
        if role == "recycling_center":
            RecyclingCenter.objects.create(
                name=user.name,
                email=user.email,
                phone=user.phone or "",
                address=user.address or "",
                city="",
                registered_at=timezone.now(),
                approval_status="pending",
                status="inactive"
            )
        elif role == "collector":
            Collector.objects.create(
                name=user.name,
                email=user.email,
                phone=user.phone or "",
                vehicle_type="Unknown",
                vehicle_number="Unknown",
                registered_at=timezone.now(),
                approval_status="pending",
                status="offline"
            )
            
        return user


class RecyclingCenterSerializer(serializers.ModelSerializer):
    approvalStatus = serializers.CharField(source="approval_status", required=False)

    class Meta:
        model = RecyclingCenter
        fields = "__all__"


class CollectorSerializer(serializers.ModelSerializer):
    assigned_center_name = serializers.SerializerMethodField()
    vehicleType = serializers.CharField(source="vehicle_type", required=False)
    vehicleNumber = serializers.CharField(source="vehicle_number", required=False)
    completedCollections = serializers.IntegerField(source="completed_collections", required=False)
    currentLocation = serializers.CharField(source="current_location", allow_null=True, required=False)
    approvalStatus = serializers.CharField(source="approval_status", required=False)

    class Meta:
        model = Collector
        fields = "__all__"

    def get_assigned_center_name(self, obj):
        return obj.assigned_center.name if obj.assigned_center else None


class EWasteCategoryConfigSerializer(serializers.ModelSerializer):
    dbId = serializers.IntegerField(source="pk", read_only=True)
    id = serializers.CharField(source="category", read_only=True)
    category = serializers.CharField(read_only=True)
    rewardPoints = serializers.IntegerField(source="reward_points")
    pickupCharge = serializers.IntegerField(source="pickup_charge")

    class Meta:
        model = EWasteCategoryConfig
        fields = ("dbId", "id", "category", "label", "description", "rewardPoints", "pickupCharge", "active")


class RewardRuleSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="pk", read_only=True)
    minWeight = serializers.FloatField(source="min_weight")
    maxWeight = serializers.FloatField(source="max_weight", allow_null=True, required=False)
    pointsPerKg = serializers.FloatField(source="points_per_kg")
    bonusPoints = serializers.IntegerField(source="bonus_points", allow_null=True, required=False)

    class Meta:
        model = RewardRule
        fields = ("id", "name", "condition", "category", "minWeight", "maxWeight", "pointsPerKg", "bonusPoints", "multiplier")


class CampaignSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="pk", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at")
    expiresAt = serializers.DateTimeField(source="expires_at", allow_null=True, required=False)
    targetAudience = serializers.CharField(source="target_audience")

    class Meta:
        model = Campaign
        fields = ("id", "title", "message", "type", "createdAt", "expiresAt", "active", "targetAudience")


class DisposalGuidelineSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="pk", read_only=True)
    safetyWarnings = serializers.ListField(source="safety_warnings")
    uploadedBy = serializers.CharField(source="uploaded_by")
    uploadedAt = serializers.DateTimeField(source="uploaded_at")
    fileUrl = serializers.CharField(source="file_url", allow_null=True, required=False)
    safetyPrecautions = serializers.ListField(source="safety_warnings", required=False)
    disposalMethod = serializers.SerializerMethodField()
    severity = serializers.SerializerMethodField()

    class Meta:
        model = DisposalGuideline
        fields = (
            "id",
            "category",
            "title",
            "description",
            "steps",
            "safetyWarnings",
            "safetyPrecautions",
            "uploadedBy",
            "uploadedAt",
            "fileUrl",
            "disposalMethod",
            "severity",
        )

    def get_disposalMethod(self, obj):
        # Frontend expects a single string; reuse first step as a short summary.
        return obj.steps[0] if isinstance(obj.steps, list) and obj.steps else "Follow approved disposal procedures."

    def get_severity(self, obj):
        return "medium"


class CollectionRequestSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="pk", read_only=True)
    userId = serializers.CharField(source="user_id", read_only=True)
    userName = serializers.CharField(source="user_name", allow_blank=True, required=False, default="")
    userPhone = serializers.CharField(source="user_phone", allow_blank=True, required=False, default="")
    userAddress = serializers.CharField(source="user_address", allow_blank=True, allow_null=True, required=False, default="")
    # category is a ForeignKey to EWasteCategoryConfig via the 'category' slug field
    category = serializers.SlugRelatedField(
        slug_field="category",
        queryset=EWasteCategoryConfig.objects.all()
    )
    categoryLabel = serializers.SerializerMethodField()
    collectorId = serializers.CharField(source="collector_id", allow_null=True, required=False)
    collectorName = serializers.SerializerMethodField()
    recyclingCenterId = serializers.CharField(source="recycling_center_id", allow_null=True, required=False)
    recyclingCenterName = serializers.SerializerMethodField()
    recyclingCenterAddress = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at")
    assignedAt = serializers.DateTimeField(source="assigned_at", allow_null=True, required=False)
    completedAt = serializers.DateTimeField(source="completed_at", allow_null=True, required=False)
    rewardPoints = serializers.IntegerField(source="reward_points", allow_null=True, required=False)
    pickupCharge = serializers.IntegerField(source="pickup_charge", allow_null=True, required=False)
    receivedAt = serializers.DateTimeField(source="received_at", allow_null=True, required=False)
    trackingHistory = serializers.ListField(source="tracking_history", required=False)
    pickupOTP = serializers.CharField(source="pickup_otp", allow_null=True, required=False)
    otpVerifiedAt = serializers.DateTimeField(source="otp_verified_at", allow_null=True, required=False)

    class Meta:
        model = CollectionRequest
        fields = (
            "id",
            "userId",
            "userName",
            "userPhone",
            "userAddress",
            "category",
            "categoryLabel",
            "items",
            "quantity",
            "weight",
            "estimatedWeight",
            "scheduledDate",
            "scheduledTime",
            "status",
            "collectorId",
            "collectorName",
            "recyclingCenterId",
            "recyclingCenterName",
            "recyclingCenterAddress",
            "createdAt",
            "assignedAt",
            "completedAt",
            "notes",
            "image",
            "rewardPoints",
            "pickupCharge",
            "receivedAt",
            "classification",
            "recyclingOutcome",
            "trackingHistory",
            "pickupOTP",
            "otpVerifiedAt",
        )

    estimatedWeight = serializers.CharField(source="estimated_weight", allow_null=True, required=False)
    scheduledDate = serializers.DateField(source="scheduled_date", allow_null=True, required=False)
    scheduledTime = serializers.CharField(source="scheduled_time", allow_null=True, required=False)
    recyclingOutcome = serializers.JSONField(source="recycling_outcome", allow_null=True, required=False)

    def get_recyclingCenterAddress(self, obj):
        return obj.recycling_center.address if obj.recycling_center else None

    def get_collectorName(self, obj):
        return obj.collector.name if obj.collector else None

    def get_recyclingCenterName(self, obj):
        return obj.recycling_center.name if obj.recycling_center else None

    def get_categoryLabel(self, obj):
        return obj.category.label if obj.category else None


class RewardTransactionSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="pk", read_only=True)
    userId = serializers.CharField(source="user_id", read_only=True)
    relatedRequestId = serializers.SerializerMethodField()

    class Meta:
        model = RewardTransaction
        fields = ("id", "userId", "type", "points", "description", "relatedRequestId", "timestamp", "balance")

    def get_relatedRequestId(self, obj):
        return str(obj.related_request_id) if obj.related_request_id else None


class RewardRedemptionSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="pk", read_only=True)
    pointsRequired = serializers.IntegerField(source="points_required")

    class Meta:
        model = RewardRedemption
        fields = ("id", "name", "description", "pointsRequired", "category", "icon", "available")


class UserRewardProfileSerializer(serializers.ModelSerializer):
    userId = serializers.CharField(source="user_id", read_only=True)
    totalPoints = serializers.IntegerField(source="total_points")
    lifetimePoints = serializers.IntegerField(source="lifetime_points")
    redeemedPoints = serializers.IntegerField(source="redeemed_points")

    class Meta:
        model = UserRewardProfile
        fields = ("userId", "totalPoints", "lifetimePoints", "redeemedPoints", "tier", "rank")


class LeaderboardEntrySerializer(serializers.ModelSerializer):
    userId = serializers.CharField(source="user_id", read_only=True)
    name = serializers.SerializerMethodField()

    class Meta:
        model = LeaderboardEntry
        fields = ("rank", "userId", "name", "points", "collections", "tier")

    def get_name(self, obj):
        return obj.user.name


class ConversationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="pk", read_only=True)
    relatedRequestId = serializers.SerializerMethodField()
    lastMessage = serializers.CharField(source="last_message")
    lastMessageTime = serializers.DateTimeField(source="last_message_time")
    unreadCount = serializers.IntegerField(source="unread_count")

    class Meta:
        model = Conversation
        fields = ("id", "participants", "related_request", "relatedRequestId", "lastMessage", "lastMessageTime", "unreadCount")
        extra_kwargs = {
            "last_message": {"required": False, "default": "Conversation started"},
            "last_message_time": {"required": False},
            "unread_count": {"required": False},
        }

    def get_relatedRequestId(self, obj):
        return str(obj.related_request_id) if obj.related_request_id else None


class ChatMessageSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="pk", read_only=True)
    conversationId = serializers.CharField(source="conversation_id", read_only=True)
    conversation = serializers.PrimaryKeyRelatedField(queryset=Conversation.objects.all(), write_only=True, required=False)
    senderId = serializers.CharField(source="sender_id")
    senderName = serializers.CharField(source="sender_name")
    senderRole = serializers.CharField(source="sender_role")
    timestamp = serializers.DateTimeField(required=False)

    class Meta:
        model = ChatMessage
        fields = ("id", "conversationId", "conversation", "senderId", "senderName", "senderRole", "message", "timestamp", "read")

    def to_internal_value(self, data):
        payload = dict(data)
        if "conversation" not in payload and "conversationId" in payload:
            payload["conversation"] = payload["conversationId"]
        return super().to_internal_value(payload)

    def create(self, validated_data):
        validated_data.setdefault("timestamp", timezone.now())
        return super().create(validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="pk", read_only=True)
    userId = serializers.PrimaryKeyRelatedField(source="user", queryset=User.objects.all())
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Notification
        fields = ("id", "userId", "title", "message", "type", "read", "createdAt")

