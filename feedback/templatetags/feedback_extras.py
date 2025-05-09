from django import template
from django.template.defaultfilters import stringfilter
from feedback.models import Feedback, Tag

register = template.Library()

@register.filter
def filter_anonymous(feedback_list):
    """
    Filter feedback items to return only anonymous ones.
    """
    return [f for f in feedback_list if f.is_anonymous]

@register.filter
def filter_by_status(feedback_list, status):
    """
    Filter feedback items by status.
    """
    return [f for f in feedback_list if f.status == status]

@register.filter
def get_item(dictionary, key):
    """
    Get an item from a dictionary using the key.
    """
    return dictionary.get(key)

@register.filter
def subtract(value, arg):
    """
    Subtract the arg from the value.
    """
    try:
        return int(value) - int(arg)
    except (ValueError, TypeError):
        return value

@register.filter
def multiply(value, arg):
    """
    Multiply the value by the arg.
    """
    try:
        return float(value) * float(arg)
    except (ValueError, TypeError):
        return value

@register.filter
def divide(value, arg):
    """
    Divide the value by the arg.
    """
    try:
        return float(value) / float(arg)
    except (ValueError, TypeError, ZeroDivisionError):
        return 0

@register.simple_tag
def feedback_count_by_department(department_id):
    """
    Return the count of feedback for a specific department.
    """
    return Feedback.objects.filter(department_id=department_id).count()

@register.simple_tag
def feedback_count_by_tag(tag_id):
    """
    Return the count of feedback for a specific tag.
    """
    return Feedback.objects.filter(tags__id=tag_id).count()

@register.simple_tag
def get_popular_tags(limit=5):
    """
    Return the most popular tags.
    """
    from django.db.models import Count
    return Tag.objects.annotate(feedback_count=Count('feedback_items')).order_by('-feedback_count')[:limit]

@register.inclusion_tag('feedback/tags/status_badge.html')
def status_badge(status):
    """
    Return HTML for a status badge.
    """
    return {'status': status}

@register.inclusion_tag('feedback/tags/feedback_stats.html')
def feedback_stats(feedback_list):
    """
    Return stats for a list of feedback items.
    """
    total = len(feedback_list)
    pending = len([f for f in feedback_list if f.status == 'pending'])
    approved = len([f for f in feedback_list if f.status == 'approved'])
    rejected = len([f for f in feedback_list if f.status == 'rejected'])
    addressed = len([f for f in feedback_list if f.status == 'addressed'])
    anonymous = len([f for f in feedback_list if f.is_anonymous])
    
    return {
        'total': total,
        'pending': pending,
        'approved': approved,
        'rejected': rejected,
        'addressed': addressed,
        'anonymous': anonymous
    }