from __future__ import annotations

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
