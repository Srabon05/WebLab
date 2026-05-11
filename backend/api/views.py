from __future__ import annotations
from django.utils import timezone

from django.contrib.auth import get_user_model
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

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
from .serializers import (
    CampaignSerializer,
    ChatMessageSerializer,
    CollectionRequestSerializer,
    CollectorSerializer,
    ConversationSerializer,
    DisposalGuidelineSerializer,
    EWasteCategoryConfigSerializer,
    LeaderboardEntrySerializer,
    RecyclingCenterSerializer,
    RegisterSerializer,
    RewardRedemptionSerializer,
    RewardRuleSerializer,
    RewardTransactionSerializer,
    UserRewardProfileSerializer,
    UserSerializer,
    NotificationSerializer,
)

User = get_user_model()


class PublicTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        return super().get_token(user)

    def validate(self, attrs):
        data = super().validate(attrs)
        from rest_framework.exceptions import PermissionDenied
        
        # Superusers are always allowed
        if getattr(self.user, 'is_superuser', False):
            pass
        elif getattr(self.user, 'approval_status', 'approved') != 'approved':
            raise PermissionDenied("Your account is pending admin approval.")
            
        data["user"] = UserSerializer(self.user).data
        return data


class LoginView(TokenObtainPairView):
    serializer_class = PublicTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class RefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    refresh = request.data.get("refresh")
    if not refresh:
        return Response({"detail": "refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = RefreshToken(refresh)
        token.blacklist()
    except Exception:
        return Response({"detail": "invalid refresh token"}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"detail": "logged out"}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    return Response(UserSerializer(request.user).data)


class RegisterViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        if user.approval_status != 'approved':
            return Response(
                {
                    "message": "Registration successful. Please wait for admin approval.",
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class UsersViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        if "approval_status" in self.request.data:
            if instance.role == "recycling_center":
                RecyclingCenter.objects.filter(email=instance.email).update(approval_status=instance.approval_status)
            elif instance.role == "collector":
                Collector.objects.filter(email=instance.email).update(approval_status=instance.approval_status)


class RecyclingCenterViewSet(viewsets.ModelViewSet):
    queryset = RecyclingCenter.objects.all().order_by("id")
    serializer_class = RecyclingCenterSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        if "approval_status" in self.request.data:
            User.objects.filter(email=instance.email).update(approval_status=instance.approval_status)


class CollectorViewSet(viewsets.ModelViewSet):
    queryset = Collector.objects.all().order_by("id")
    serializer_class = CollectorSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        if "approval_status" in self.request.data:
            User.objects.filter(email=instance.email).update(approval_status=instance.approval_status)


class EWasteCategoryConfigViewSet(viewsets.ModelViewSet):
    queryset = EWasteCategoryConfig.objects.all().order_by("category")
    serializer_class = EWasteCategoryConfigSerializer


class RewardRuleViewSet(viewsets.ModelViewSet):
    queryset = RewardRule.objects.all().order_by("id")
    serializer_class = RewardRuleSerializer


class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all().order_by("-created_at")
    serializer_class = CampaignSerializer


class DisposalGuidelineViewSet(viewsets.ModelViewSet):
    queryset = DisposalGuideline.objects.all().order_by("-uploaded_at")
    serializer_class = DisposalGuidelineSerializer


class CollectionRequestViewSet(viewsets.ModelViewSet):
    queryset = CollectionRequest.objects.select_related("user", "collector", "recycling_center").all().order_by("-created_at")
    serializer_class = CollectionRequestSerializer

    def perform_create(self, serializer):
        quantity_val = self.request.data.get("quantity", 1)
        try:
            quantity = int(quantity_val)
        except (ValueError, TypeError):
            quantity = 1

        reward_points = 0
        pickup_charge = 20

        # category is already resolved to an EWasteCategoryConfig object by the serializer
        config = serializer.validated_data.get("category")
        if config:
            reward_points = config.reward_points * quantity
            pickup_charge = getattr(config, "pickup_charge", 20) or 20

        serializer.save(
            user=self.request.user,
            reward_points=reward_points,
            pickup_charge=pickup_charge
        )

    def perform_update(self, serializer):
        instance = self.get_object()
        old_status = instance.status
        new_status = serializer.validated_data.get("status", old_status)
        
        # Auto-assign recycling center if collector is being assigned and center is missing
        collector_obj = serializer.validated_data.get("collector")
        if collector_obj and not serializer.validated_data.get("recycling_center") and not instance.recycling_center:
            if collector_obj.assigned_center:
                serializer.validated_data["recycling_center"] = collector_obj.assigned_center
                
        updated_instance = serializer.save()
        
        if old_status != "completed" and new_status == "completed":
            # 1. Update User Reward Points based on category ForeignKey
            config = updated_instance.category  # direct FK object
            if config:
                points = config.reward_points * (updated_instance.quantity or 1)

                # Update User Profile
                profile, _ = UserRewardProfile.objects.get_or_create(user=updated_instance.user)
                profile.total_points += points
                profile.lifetime_points += points
                profile.save()

                # Create Reward Transaction
                RewardTransaction.objects.create(
                    user=updated_instance.user,
                    type="earned",
                    points=points,
                    description=f"Earned points for {config.label} pickup",
                    related_request=updated_instance,
                    timestamp=updated_instance.completed_at or timezone.now(),
                    balance=profile.total_points
                )

            # 2. Update Collector Balance
            if updated_instance.collector:
                charge = updated_instance.pickup_charge or 20
                updated_instance.collector.balance += charge
                updated_instance.collector.save()

    @action(detail=False, methods=["GET"])
    def mine(self, request):
        qs = self.get_queryset().filter(user=request.user)
        return Response(self.get_serializer(qs, many=True).data)


class RewardTransactionViewSet(viewsets.ModelViewSet):
    queryset = RewardTransaction.objects.select_related("user", "related_request").all().order_by("-timestamp")
    serializer_class = RewardTransactionSerializer

    @action(detail=False, methods=["GET"])
    def mine(self, request):
        qs = self.get_queryset().filter(user=request.user)
        return Response(self.get_serializer(qs, many=True).data)


class RewardRedemptionViewSet(viewsets.ModelViewSet):
    queryset = RewardRedemption.objects.all().order_by("points_required")
    serializer_class = RewardRedemptionSerializer


class UserRewardProfileViewSet(viewsets.ModelViewSet):
    queryset = UserRewardProfile.objects.select_related("user").all()
    serializer_class = UserRewardProfileSerializer

    @action(detail=False, methods=["GET"])
    def mine(self, request):
        obj, _ = UserRewardProfile.objects.get_or_create(user=request.user)
        
        # Sync points if they appear out of date (e.g. for older accounts)
        if obj.total_points == 0:
            from django.db.models import Sum
            earned = RewardTransaction.objects.filter(user=request.user, type="earned").aggregate(Sum("points"))["points__sum"] or 0
            redeemed = RewardTransaction.objects.filter(user=request.user, type="redeemed").aggregate(Sum("points"))["points__sum"] or 0
            if earned > 0:
                obj.total_points = max(0, earned - redeemed)
                obj.lifetime_points = earned
                obj.save()
                
        return Response(self.get_serializer(obj).data)


class LeaderboardViewSet(viewsets.ModelViewSet):
    queryset = LeaderboardEntry.objects.select_related("user").all().order_by("rank")
    serializer_class = LeaderboardEntrySerializer


class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all().order_by("-last_message_time")
    serializer_class = ConversationSerializer


class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.select_related("conversation").all().order_by("timestamp")
    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        conversation_id = self.request.query_params.get("conversationId")
        if conversation_id:
            qs = qs.filter(conversation_id=conversation_id)
        return qs


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by("-created_at")
    serializer_class = NotificationSerializer

    def get_queryset(self):
        # Allow filtering by userId
        user_id = self.request.query_params.get("userId")
        if user_id:
            return self.queryset.filter(user_id=user_id)
        return self.queryset
