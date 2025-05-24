import uuid
import hashlib
from django.db import models
from django.conf import settings
from django.urls import reverse
from django.utils.text import slugify
from departments.models import Department

class Tag(models.Model):
    """
    Tags for categorizing feedback.
    """
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    department = models.ForeignKey(
        Department, 
        on_delete=models.CASCADE,
        related_name='tags'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        unique_together = ['name', 'department']
    
    def __str__(self):
        return f"{self.name} ({self.department.name})"

class Feedback(models.Model):
    """
    Main feedback model for storing user submissions.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('addressed', 'Addressed'),
    )
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='submitted_feedback'
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='feedback_items'
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name='feedback_items')
    is_anonymous = models.BooleanField(default=False)
    show_in_dashboard = models.BooleanField(default=True)  # Add this field
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    submission_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    hash_id = models.CharField(max_length=64, unique=True, blank=True)
    
    class Meta:
        ordering = ['-submission_date']
        verbose_name = 'Feedback'
        verbose_name_plural = 'Feedback Items'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Generate a unique hash_id for tracking anonymous feedback
        if not self.hash_id:
            # Create a unique ID based on timestamp and random UUID
            unique_str = f"{uuid.uuid4()}-{self.submission_date.timestamp() if self.submission_date else uuid.uuid4()}"
            self.hash_id = hashlib.sha256(unique_str.encode()).hexdigest()
        
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return reverse('feedback:feedback_detail', kwargs={'hash_id': self.hash_id})
    
    def get_author_display(self):
        """Returns a display name for the feedback author"""
        if self.is_anonymous:
            return "Anonymous"
        elif self.user:
            return self.user.get_full_name() or self.user.username
        return "Unknown User"
    
    def get_tag_list(self):
        """Returns a list of tag names for this feedback"""
        return [tag.name for tag in self.tags.all()]

class Reply(models.Model):
    """
    Model for replies to feedback items.
    """
    feedback = models.ForeignKey(
        Feedback,
        on_delete=models.CASCADE,
        related_name='replies'
    )
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='feedback_replies'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        verbose_name = 'Reply'
        verbose_name_plural = 'Replies'
    
    def __str__(self):
        return f"Reply to {self.feedback.title}"
    
    def get_admin_display(self):
        """Returns a display name for the reply author"""
        if self.admin:
            # If the reply is from the feedback submitter and the feedback is anonymous,
            # display "Anonymous (Student)" to faculty/admin
            if self.feedback.is_anonymous and self.admin == self.feedback.user and not self.is_user_feedback_author():
                return "Anonymous (Student)"
            
            # For faculty/admin or the student's own view of their anonymous replies
            if self.feedback.is_anonymous and self.admin == self.feedback.user:
                return "You (Anonymous to others)"
            
            # Regular display for non-anonymous feedback
            return self.admin.get_full_name() or self.admin.username
        return "Department Admin"
    
    def is_user_feedback_author(self):
        """Check if the current user is the author of the feedback"""
        from django.contrib.auth.context_processors import get_user
        request = getattr(get_thread_local(), 'request', None)
        if request:
            user = get_user(request)
            return user.is_authenticated and user == self.feedback.user
        return False