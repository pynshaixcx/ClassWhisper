from django.db import models
from django.conf import settings
from feedback.models import Feedback

class ModerationLog(models.Model):
    """
    Log of moderation actions taken on feedback items.
    """
    ACTION_CHOICES = (
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('flagged', 'Flagged for Review'),
        ('hidden', 'Hidden'),
        ('restored', 'Restored'),
    )
    
    feedback = models.ForeignKey(
        Feedback,
        on_delete=models.CASCADE,
        related_name='moderation_logs'
    )
    moderator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='moderation_actions'
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    reason = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.get_action_display()} - {self.feedback.title}"

class FilterRule(models.Model):
    """
    Rules for automatic filtering of feedback content.
    """
    RULE_TYPE_CHOICES = (
        ('keyword', 'Keyword'),
        ('regex', 'Regular Expression'),
    )
    
    ACTION_CHOICES = (
        ('flag', 'Flag for Review'),
        ('reject', 'Auto-Reject'),
    )
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    rule_type = models.CharField(max_length=10, choices=RULE_TYPE_CHOICES)
    pattern = models.CharField(max_length=255)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_filter_rules'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name