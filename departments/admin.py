from django.contrib import admin
from .models import Department

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_admin_display', 'get_member_count', 'get_feedback_count', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'description', 'admin__username', 'admin__email')
    date_hierarchy = 'created_at'
    
    def get_member_count(self, obj):
        return obj.get_member_count()
    get_member_count.short_description = 'Members'
    
    def get_feedback_count(self, obj):
        return obj.get_feedback_count()
    get_feedback_count.short_description = 'Feedback'