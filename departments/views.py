from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.http import JsonResponse

from .models import Department
from .forms import DepartmentForm
from accounts.models import User

class AdminRequiredMixin(UserPassesTestMixin):
    """Mixin to ensure only admins can access a view"""
    def test_func(self):
        return self.request.user.is_authenticated and (self.request.user.is_admin or self.request.user.is_superuser)

class DepartmentListView(LoginRequiredMixin, ListView):
    """View for listing all departments"""
    model = Department
    template_name = 'departments/department_list.html'
    context_object_name = 'departments'
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Add the member count to each department
        queryset = queryset.annotate(member_count=Count('members'))
        return queryset

class DepartmentDetailView(LoginRequiredMixin, DetailView):
    """View for displaying department details"""
    model = Department
    template_name = 'departments/department_detail.html'
    context_object_name = 'department'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Add additional context data
        department = self.get_object()
        context['members'] = department.members.all()
        context['feedback_count'] = department.get_feedback_count()
        return context

class DepartmentCreateView(LoginRequiredMixin, AdminRequiredMixin, CreateView):
    """View for creating a new department"""
    model = Department
    form_class = DepartmentForm
    template_name = 'departments/department_form.html'
    success_url = reverse_lazy('departments:department_list')
    
    def form_valid(self, form):
        messages.success(self.request, 'Department created successfully!')
        return super().form_valid(form)

class DepartmentUpdateView(LoginRequiredMixin, AdminRequiredMixin, UpdateView):
    """View for updating an existing department"""
    model = Department
    form_class = DepartmentForm
    template_name = 'departments/department_form.html'
    context_object_name = 'department'
    
    def get_success_url(self):
        return reverse_lazy('departments:department_detail', kwargs={'pk': self.object.pk})
    
    def form_valid(self, form):
        messages.success(self.request, 'Department updated successfully!')
        return super().form_valid(form)

class DepartmentDeleteView(LoginRequiredMixin, AdminRequiredMixin, DeleteView):
    """View for deleting a department"""
    model = Department
    template_name = 'departments/department_confirm_delete.html'
    success_url = reverse_lazy('departments:department_list')
    context_object_name = 'department'
    
    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'Department deleted successfully!')
        return super().delete(request, *args, **kwargs)

@login_required
def department_users(request, pk):
    """API view for getting users in a department"""
    department = get_object_or_404(Department, pk=pk)
    
    # Check if user has access
    if not (request.user.is_admin or request.user.is_superuser):
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    users = department.members.values('id', 'username', 'email')
    return JsonResponse(list(users), safe=False)