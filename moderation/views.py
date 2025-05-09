import re
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib import messages
from django.urls import reverse_lazy
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.db.models import Q

from .models import ModerationLog, FilterRule
from .forms import ModerationLogForm, FilterRuleForm
from feedback.models import Feedback

class ModeratorRequiredMixin(UserPassesTestMixin):
    """Mixin to ensure only moderators can access a view"""
    def test_func(self):
        return self.request.user.is_authenticated and (
            self.request.user.is_admin or 
            self.request.user.is_superuser or 
            self.request.user.is_faculty
        )

class ModerationQueueView(LoginRequiredMixin, ModeratorRequiredMixin, ListView):
    """
    View for the moderation queue of pending feedback.
    """
    model = Feedback
    template_name = 'moderation/moderation_queue.html'
    context_object_name = 'feedback_items'
    paginate_by = 20
    
    def get_queryset(self):
        user = self.request.user
        
        # Base queryset - pending feedback
        queryset = Feedback.objects.filter(status='pending')
        
        # For faculty, only show feedback from their department
        if user.is_faculty and not user.is_admin:
            department = user.profile.department
            if department:
                queryset = queryset.filter(department=department)
            else:
                queryset = Feedback.objects.none()
        
        # Apply filters from query parameters
        department_id = self.request.GET.get('department')
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        
        search_query = self.request.GET.get('q')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | 
                Q(content__icontains=search_query)
            )
        
        # Order by submission date
        return queryset.order_by('-submission_date')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from departments.models import Department
        
        # Add departments for filtering
        context['departments'] = Department.objects.all()
        
        # Add filter parameters for pagination links
        context['query_params'] = self.request.GET.copy()
        if 'page' in context['query_params']:
            del context['query_params']['page']
        
        return context

@login_required
def moderate_feedback(request, feedback_id):
    """
    View for moderating a specific feedback item.
    """
    feedback = get_object_or_404(Feedback, id=feedback_id)
    
    # Check permissions
    user = request.user
    if not (user.is_admin or user.is_superuser or 
            (user.is_faculty and feedback.department == user.profile.department)):
        messages.error(request, "You don't have permission to moderate this feedback.")
        return redirect('moderation:queue')
    
    if request.method == 'POST':
        action = request.POST.get('action')
        reason = request.POST.get('reason', '')
        
        if action in dict(ModerationLog.ACTION_CHOICES).keys():
            # Update feedback status
            if action == 'approved':
                feedback.status = 'approved'
            elif action == 'rejected':
                feedback.status = 'rejected'
            elif action == 'flagged':
                feedback.status = 'pending'  # Keep pending for review
            
            feedback.save()
            
            # Create moderation log
            ModerationLog.objects.create(
                feedback=feedback,
                moderator=request.user,
                action=action,
                reason=reason
            )
            
            messages.success(request, f'Feedback has been {action}.')
            return redirect('moderation:queue')
        else:
            messages.error(request, 'Invalid action.')
    
    return render(request, 'moderation/moderate_feedback.html', {
        'feedback': feedback,
    })

class FilterRuleListView(LoginRequiredMixin, ModeratorRequiredMixin, ListView):
    """
    View for listing all filter rules.
    """
    model = FilterRule
    template_name = 'moderation/filter_rule_list.html'
    context_object_name = 'filter_rules'
    paginate_by = 20
    
    def get_queryset(self):
        queryset = FilterRule.objects.all()
        
        # Apply filters from query parameters
        status = self.request.GET.get('status')
        if status == 'active':
            queryset = queryset.filter(is_active=True)
        elif status == 'inactive':
            queryset = queryset.filter(is_active=False)
        
        return queryset.order_by('name')

class FilterRuleCreateView(LoginRequiredMixin, ModeratorRequiredMixin, CreateView):
    """
    View for creating a new filter rule.
    """
    model = FilterRule
    form_class = FilterRuleForm
    template_name = 'moderation/filter_rule_form.html'
    success_url = reverse_lazy('moderation:filter_rules')
    
    def form_valid(self, form):
        form.instance.created_by = self.request.user
        messages.success(self.request, 'Filter rule created successfully!')
        return super().form_valid(form)

class FilterRuleUpdateView(LoginRequiredMixin, ModeratorRequiredMixin, UpdateView):
    """
    View for updating an existing filter rule.
    """
    model = FilterRule
    form_class = FilterRuleForm
    template_name = 'moderation/filter_rule_form.html'
    context_object_name = 'filter_rule'
    success_url = reverse_lazy('moderation:filter_rules')
    
    def form_valid(self, form):
        messages.success(self.request, 'Filter rule updated successfully!')
        return super().form_valid(form)

class FilterRuleDeleteView(LoginRequiredMixin, ModeratorRequiredMixin, DeleteView):
    """
    View for deleting a filter rule.
    """
    model = FilterRule
    template_name = 'moderation/filter_rule_confirm_delete.html'
    context_object_name = 'filter_rule'
    success_url = reverse_lazy('moderation:filter_rules')
    
    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'Filter rule deleted successfully!')
        return super().delete(request, *args, **kwargs)

@login_required
def toggle_filter_rule(request, pk):
    """
    View for toggling a filter rule's active status.
    """
    if not (request.user.is_admin or request.user.is_superuser):
        messages.error(request, "You don't have permission to modify filter rules.")
        return redirect('moderation:filter_rules')
    
    rule = get_object_or_404(FilterRule, pk=pk)
    rule.is_active = not rule.is_active
    rule.save()
    
    status = "activated" if rule.is_active else "deactivated"
    messages.success(request, f'Filter rule "{rule.name}" has been {status}.')
    
    return redirect('moderation:filter_rules')

def check_content_against_rules(content, title=None):
    """
    Utility function to check content against filter rules.
    Returns a tuple of (is_flagged, matching_rules).
    """
    # Get active filter rules
    rules = FilterRule.objects.filter(is_active=True)
    matching_rules = []
    
    # Combine title and content if title is provided
    check_text = content
    if title:
        check_text = f"{title}\n{content}"
    
    for rule in rules:
        if rule.rule_type == 'keyword':
            # Simple keyword check (case-insensitive)
            if rule.pattern.lower() in check_text.lower():
                matching_rules.append(rule)
        elif rule.rule_type == 'regex':
            # Regular expression check
            try:
                if re.search(rule.pattern, check_text, re.IGNORECASE):
                    matching_rules.append(rule)
            except re.error:
                # Log invalid regex patterns
                pass
    
    # Check if any matching rule requires auto-rejection
    is_flagged = any(rule.action == 'reject' for rule in matching_rules)
    
    return (is_flagged, matching_rules)