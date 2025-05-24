from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib import messages
from django.urls import reverse_lazy, reverse
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.http import JsonResponse
from django.db.models import Q, Count

from .models import Feedback, Reply, Tag
from .forms import FeedbackForm, ReplyForm, TagForm
from departments.models import Department

class FeedbackCreateView(LoginRequiredMixin, CreateView):
    """
    View for creating new feedback.
    """
    model = Feedback
    form_class = FeedbackForm
    template_name = 'feedback/feedback_form.html'
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        kwargs['department_id'] = self.kwargs.get('department_id')
        return kwargs
    
    def form_valid(self, form):
        # Always associate the feedback with the current user
        # Even for anonymous feedback, we'll store the user reference
        form.instance.user = self.request.user
        
        # Set is_anonymous based on form data
        is_anonymous = form.cleaned_data.get('is_anonymous', False)
        form.instance.is_anonymous = is_anonymous
        
        # Show in dashboard should always be true for the user's own feedback
        form.instance.show_in_dashboard = True
        
        # Save the form
        response = super().form_valid(form)
        
        messages.success(self.request, 'Feedback submitted successfully!')
        return response
    
    def get_success_url(self):
        if self.object.is_anonymous:
            # For anonymous feedback, redirect to a generic confirmation page
            return reverse('feedback:feedback_success', kwargs={'hash_id': self.object.hash_id})
        # For non-anonymous feedback, redirect to the detail page
        return reverse('feedback:feedback_detail', kwargs={'hash_id': self.object.hash_id})
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Check if any departments exist
        from departments.models import Department
        context['departments_exist'] = Department.objects.exists()
        if not context['departments_exist']:
            messages.warning(self.request, 'No departments have been created yet. Please contact an administrator.')
        return context
    
class FeedbackSuccessView(DetailView):
    """
    Success view after submitting feedback.
    Shows the hash_id for anonymous feedback tracking.
    """
    model = Feedback
    template_name = 'feedback/feedback_success.html'
    context_object_name = 'feedback'
    
    def get_object(self):
        return get_object_or_404(Feedback, hash_id=self.kwargs['hash_id'])

class FeedbackDetailView(DetailView):
    """
    View for displaying feedback details.
    """
    model = Feedback
    template_name = 'feedback/feedback_detail.html'
    context_object_name = 'feedback'
    
    def get_object(self):
        return get_object_or_404(Feedback, hash_id=self.kwargs['hash_id'])
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['replies'] = self.object.replies.all()
        
        # Check if the user can reply (admin or faculty of the department)
        user = self.request.user
        can_reply = False
        
        # The student who submitted the feedback should be able to see replies
        # even if the feedback is anonymous
        is_submitter = user.is_authenticated and self.object.user == user
        
        if user.is_authenticated:
            if user.is_admin or user.is_superuser:
                can_reply = True
            elif user.is_faculty and self.object.department == user.profile.department:
                can_reply = True
        
        context['can_reply'] = can_reply
        context['is_submitter'] = is_submitter
        
        if can_reply:
            context['reply_form'] = ReplyForm()
        
        return context

class StudentDashboardView(LoginRequiredMixin, ListView):
    """
    Dashboard view for students to see their submitted feedback.
    """
    model = Feedback
    template_name = 'feedback/student_dashboard.html'
    context_object_name = 'feedback_items'
    
    def get_queryset(self):
        # Show all feedback submitted by the current user, including anonymous
        # that have show_in_dashboard=True
        user = self.request.user
        
        # Base queryset: all feedback where user is the author and show_in_dashboard is True
        queryset = Feedback.objects.filter(user=user, show_in_dashboard=True)
        
        # Apply department filter if specified
        department_id = self.request.GET.get('department')
        if department_id:
            queryset = queryset.filter(department_id=department_id)
            
        return queryset.order_by('-submission_date')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['departments'] = Department.objects.all()
        return context

class FacultyDashboardView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    """
    Dashboard view for faculty to see feedback for their department.
    """
    model = Feedback
    template_name = 'feedback/faculty_dashboard.html'
    context_object_name = 'feedback_items'
    
    def test_func(self):
        # Only faculty and admins can access this view
        return self.request.user.is_faculty or self.request.user.is_admin or self.request.user.is_superuser
    
    def get_queryset(self):
        user = self.request.user
        
        # For faculty, show only feedback for their department
        if user.is_faculty and not user.is_admin:
            department = user.profile.department
            if department:
                return Feedback.objects.filter(department=department).order_by('-submission_date')
            return Feedback.objects.none()
        
        # For admins, show all feedback
        return Feedback.objects.all().order_by('-submission_date')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Add departments for filtering
        context['departments'] = Department.objects.all()
        
        # Add statistics
        context['total_feedback'] = self.get_queryset().count()
        context['pending_feedback'] = self.get_queryset().filter(status='pending').count()
        context['addressed_feedback'] = self.get_queryset().filter(status='addressed').count()
        
        return context

@login_required
def add_reply(request, hash_id):
    """
    View for adding a reply to feedback.
    """
    feedback = get_object_or_404(Feedback, hash_id=hash_id)
    
    # Check permissions
    user = request.user
    
    # Check if user is the submitter of the feedback, even if anonymous
    is_submitter = user == feedback.user
    
    # Check if user can reply (admin, faculty of the department, or the submitter)
    can_reply = (user.is_admin or user.is_superuser or 
                (user.is_faculty and feedback.department == user.profile.department) or
                is_submitter)
    
    if not can_reply:
        messages.error(request, "You don't have permission to reply to this feedback.")
        return redirect('feedback:feedback_detail', hash_id=hash_id)
    
    if request.method == 'POST':
        form = ReplyForm(request.POST)
        if form.is_valid():
            reply = form.save(commit=False)
            reply.feedback = feedback
            reply.admin = request.user
            reply.save()
            
            # Update feedback status to addressed if this is a faculty or admin reply
            if user.is_admin or user.is_faculty:
                feedback.status = 'addressed'
                feedback.save()
            
            messages.success(request, 'Reply added successfully!')
            return redirect('feedback:feedback_detail', hash_id=hash_id)
    else:
        form = ReplyForm()
    
    return render(request, 'feedback/add_reply.html', {
        'form': form,
        'feedback': feedback,
        'is_submitter': is_submitter,
    })

@login_required
def update_feedback_status(request, hash_id):
    """
    View for updating the status of feedback.
    """
    feedback = get_object_or_404(Feedback, hash_id=hash_id)
    
    # Check permissions
    user = request.user
    if not (user.is_admin or user.is_superuser or 
            (user.is_faculty and feedback.department == user.profile.department)):
        messages.error(request, "You don't have permission to update this feedback's status.")
        return redirect('feedback:feedback_detail', hash_id=hash_id)
    
    if request.method == 'POST':
        new_status = request.POST.get('status')
        if new_status in dict(Feedback.STATUS_CHOICES).keys():
            feedback.status = new_status
            feedback.save()
            messages.success(request, f'Feedback status updated to {new_status}.')
        else:
            messages.error(request, 'Invalid status value.')
    
    return redirect('feedback:feedback_detail', hash_id=hash_id)

@login_required
def get_department_tags(request):
    """
    AJAX view for getting tags by department.
    """
    department_id = request.GET.get('department_id')
    if not department_id:
        return JsonResponse({'error': 'No department specified'}, status=400)
    
    tags = Tag.objects.filter(department_id=department_id).values('id', 'name')
    return JsonResponse(list(tags), safe=False)

class TagListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    """
    View for listing all tags.
    """
    model = Tag
    template_name = 'feedback/tag_list.html'
    context_object_name = 'tags'
    
    def test_func(self):
        # Only faculty and admins can access this view
        return self.request.user.is_faculty or self.request.user.is_admin or self.request.user.is_superuser
    
    def get_queryset(self):
        user = self.request.user
        
        # For faculty, show only tags for their department
        if user.is_faculty and not user.is_admin:
            department = user.profile.department
            if department:
                return Tag.objects.filter(department=department)
            return Tag.objects.none()
        
        # For admins, show all tags
        return Tag.objects.all()

class TagCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    """
    View for creating a new tag.
    """
    model = Tag
    form_class = TagForm
    template_name = 'feedback/tag_form.html'
    success_url = reverse_lazy('feedback:tag_list')
    
    def test_func(self):
        # Only faculty and admins can access this view
        return self.request.user.is_faculty or self.request.user.is_admin or self.request.user.is_superuser
    
    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        user = self.request.user
        
        # For faculty, restrict department choices to their department
        if user.is_faculty and not user.is_admin:
            department = user.profile.department
            if department:
                form.fields['department'].queryset = Department.objects.filter(id=department.id)
                form.fields['department'].initial = department
        
        return form
    
    def form_valid(self, form):
        messages.success(self.request, 'Tag created successfully!')
        return super().form_valid(form)