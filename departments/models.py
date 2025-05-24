from django.db import models
from django.conf import settings

class Department(models.Model):
    """
    Department model for organizing feedback by academic departments.
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    # Using string reference to avoid circular dependency with accounts.User
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='administered_departments'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def get_admin_display(self):
        """Returns a display name for the department admin"""
        if self.admin:
            return f"{self.admin.get_full_name() or self.admin.username}"
        return "No admin assigned"
    
    def get_member_count(self):
        """Returns the count of members in this department"""
        return self.members.count()
    
    def get_feedback_count(self):
        """Returns the count of feedback for this department"""
        return self.feedback_items.count()