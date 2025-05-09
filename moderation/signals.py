from django.db.models.signals import pre_save
from django.dispatch import receiver

from feedback.models import Feedback
from .views import check_content_against_rules  # ✅ correct


@receiver(pre_save, sender=Feedback)
def auto_moderate_feedback(sender, instance, **kwargs):
    """
    Automatically check feedback against content filters.
    If the feedback is being created and contains flagged content,
    mark it as pending for manual review.
    """
    # Only check on creation
    if not instance.pk:
        is_flagged, _ = check_content_against_rules(instance.content)
        
        if is_flagged:
            # Set status to pending for manual review
            instance.status = 'pending'