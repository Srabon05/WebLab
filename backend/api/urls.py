from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CampaignViewSet,
    ChatMessageViewSet,
    CollectionRequestViewSet,
    CollectorViewSet,
    ConversationViewSet,
    DisposalGuidelineViewSet,
    EWasteCategoryConfigViewSet,
    LeaderboardViewSet,
    LoginView,
    RefreshView,
    RecyclingCenterViewSet,
    RegisterViewSet,
    RewardRedemptionViewSet,
    RewardRuleViewSet,
    RewardTransactionViewSet,
    UserRewardProfileViewSet,
    UsersViewSet,
    logout_view,
    me_view,
    NotificationViewSet,
)

router = DefaultRouter()
router.register(r"auth/register", RegisterViewSet, basename="register")
router.register(r"users", UsersViewSet, basename="users")
router.register(r"recycling-centers", RecyclingCenterViewSet, basename="recycling-centers")
router.register(r"collectors", CollectorViewSet, basename="collectors")
router.register(r"categories", EWasteCategoryConfigViewSet, basename="categories")
router.register(r"reward-rules", RewardRuleViewSet, basename="reward-rules")
router.register(r"campaigns", CampaignViewSet, basename="campaigns")
router.register(r"guidelines", DisposalGuidelineViewSet, basename="guidelines")
router.register(r"collection-requests", CollectionRequestViewSet, basename="collection-requests")
router.register(r"reward-transactions", RewardTransactionViewSet, basename="reward-transactions")
router.register(r"reward-redemptions", RewardRedemptionViewSet, basename="reward-redemptions")
router.register(r"reward-profile", UserRewardProfileViewSet, basename="reward-profile")
router.register(r"leaderboard", LeaderboardViewSet, basename="leaderboard")
router.register(r"conversations", ConversationViewSet, basename="conversations")
router.register(r"chat-messages", ChatMessageViewSet, basename="chat-messages")
router.register(r"notifications", NotificationViewSet, basename="notifications")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/refresh/", RefreshView.as_view(), name="refresh"),
    path("auth/logout/", logout_view, name="logout"),
    path("auth/me/", me_view, name="me"),
]

