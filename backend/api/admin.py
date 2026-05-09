from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

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
    User,
    UserRewardProfile,
)


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Profile", {"fields": ("name", "role", "phone", "address", "avatar")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "name", "role", "password1", "password2")}),
    )
    list_display = ("email", "name", "role", "is_staff")
    search_fields = ("email", "name")
    ordering = ("email",)
    filter_horizontal = ("groups", "user_permissions")


admin.site.register(RecyclingCenter)
admin.site.register(Collector)
admin.site.register(EWasteCategoryConfig)
admin.site.register(RewardRule)
admin.site.register(Campaign)
admin.site.register(DisposalGuideline)
admin.site.register(CollectionRequest)
admin.site.register(RewardTransaction)
admin.site.register(RewardRedemption)
admin.site.register(UserRewardProfile)
admin.site.register(LeaderboardEntry)
admin.site.register(Conversation)
admin.site.register(ChatMessage)
