from django.db import models
from django.conf import settings
from feedback.models import Feedback, Tag
from departments.models import Department

class Report(models.Model):
    """
    Saved reports with analytics data.
    """
    REPORT_TYPE_CHOICES = (
        ('department', 'Department Analysis'),
        ('tag', 'Tag Analysis'),
        ('time', 'Time-based Analysis'),
        ('status', 'Status Analysis'),
        ('custom', 'Custom Analysis'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_reports'
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports'
    )
    # Store report parameters as JSON
    parameters = models.JSONField(default=dict, blank=True)
    # Store report results as JSON
    results = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title

class DashboardWidget(models.Model):
    """
    Configurable widgets for the analytics dashboard.
    """
    WIDGET_TYPE_CHOICES = (
        ('feedback_count', 'Feedback Count'),
        ('feedback_by_department', 'Feedback by Department'),
        ('feedback_by_status', 'Feedback by Status'),
        ('feedback_by_tag', 'Feedback by Tag'),
        ('feedback_over_time', 'Feedback Over Time'),
        ('response_time', 'Response Time Analysis'),
    )
    
    title = models.CharField(max_length=100)
    widget_type = models.CharField(max_length=30, choices=WIDGET_TYPE_CHOICES)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='dashboard_widgets'
    )
    # Widget position on the dashboard
    position = models.PositiveIntegerField(default=0)
    # Widget configuration options
    config = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['position']
    
    def __str__(self):
        return f"{self.title} ({self.get_widget_type_display()})"