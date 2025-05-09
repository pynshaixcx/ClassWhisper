from django.contrib import admin
from .models import ModerationLog, FilterRule

@admin.register(ModerationLog)
class ModerationLogAdmin(admin.ModelAdmin):
    list_display = ('get_feedback_title', 'action', 'moderator', 'timestamp')
    list_filter = ('action', 'timestamp', 'moderator')
    search_fields = ('feedback__title', 'reason', 'moderator__username')
    date_hierarchy = 'timestamp'
    readonly_fields = ('feedback', 'moderator', 'action', 'timestamp')
    
    def get_feedback_title(self, obj):
        return obj.feedback.title
    get_feedback_title.short_description = 'Feedback'
    get_feedback_title.admin_order_field = 'feedback__title'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        # Allow viewing but not editing
        return request.method in ['GET', 'HEAD']

@admin.register(FilterRule)
class FilterRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'rule_type', 'action', 'is_active', 'created_by', 'created_at')
    list_filter = ('rule_type', 'action', 'is_active', 'created_at')
    search_fields = ('name', 'description', 'pattern')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (None, {
            'fields': ('name', 'description')
        }),
        ('Rule Configuration', {
            'fields': ('rule_type', 'pattern', 'action', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_by', 'created_at', 'updated_at')
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)