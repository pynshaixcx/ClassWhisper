from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Profile

@receiver(post_save, sender=User)
def create_or_save_profile(sender, instance, created, **kwargs):
    """Create profile if new user; otherwise save if profile exists."""
    if created:
        if not hasattr(instance, 'profile'):
            Profile.objects.create(user=instance)
    else:
        try:
            instance.profile.save()
        except Profile.DoesNotExist:
            Profile.objects.create(user=instance)
