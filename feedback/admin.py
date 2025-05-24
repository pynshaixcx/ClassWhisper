from django.contrib import admin
from .models import Feedback, Reply, Tag

class ReplyInline(admin.TabularInline):
    model = Reply
    extra = 0

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('title', 'department', 'get_author_display', 'is_anonymous', 'status', 'submission_date')
    list_filter = ('status', 'is_anonymous', 'department', 'submission_date')
    search_fields = ('title', 'content', 'hash_id')
    date_hierarchy = 'submission_date'
    readonly_fields = ('hash_id', 'submission_date')
    inlines = [ReplyInline]
    
    # Define fields to show based on whether feedback is anonymous
    def get_fields(self, request, obj=None):
        fields = ['title', 'content', 'department', 'tags', 'is_anonymous', 'status', 'hash_id', 'submission_date']
        if obj and not obj.is_anonymous:
            fields.insert(3, 'user')
        return fields
    
    def get_readonly_fields(self, request, obj=None):
        readonly_fields = list(self.readonly_fields)
        if obj:
            if obj.is_anonymous:
                readonly_fields.append('is_anonymous')
            elif 'user' not in readonly_fields:
                readonly_fields.append('is_anonymous')
        return readonly_fields

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'department', 'description')
    list_filter = ('department',)
    search_fields = ('name', 'description')

@admin.register(Reply)
class ReplyAdmin(admin.ModelAdmin):
    list_display = ('get_feedback_title', 'admin', 'created_at')
    list_filter = ('created_at', 'admin')
    search_fields = ('content', 'feedback__title')
    date_hierarchy = 'created_at'
    
    def get_feedback_title(self, obj):
        return obj.feedback.title
    get_feedback_title.short_description = 'Feedback'
    get_feedback_title.admin_order_field = 'feedback__title'