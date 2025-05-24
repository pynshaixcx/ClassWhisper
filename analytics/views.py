import json
from datetime import datetime, timedelta
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.http import JsonResponse, HttpResponse
from django.contrib import messages
from django.urls import reverse_lazy
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.db.models import Count, Avg, Q, F, ExpressionWrapper, fields
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from django.db.models import Max
from .models import Report, DashboardWidget
from .forms import ReportForm, DashboardWidgetForm
from feedback.models import Feedback, Tag, Reply
from departments.models import Department

class AdminRequiredMixin(UserPassesTestMixin):
    """Mixin to ensure only admins can access a view"""
    def test_func(self):
        return self.request.user.is_authenticated and (
            self.request.user.is_admin or 
            self.request.user.is_superuser
        )

class FacultyRequiredMixin(UserPassesTestMixin):
    """Mixin to ensure only faculty or admins can access a view"""
    def test_func(self):
        return self.request.user.is_authenticated and (
            self.request.user.is_faculty or 
            self.request.user.is_admin or 
            self.request.user.is_superuser
        )

@login_required
def dashboard(request):
    """
    Main analytics dashboard view.
    """
    if not (request.user.is_admin or request.user.is_faculty or request.user.is_superuser):
        messages.error(request, "You don't have permission to access the analytics dashboard.")
        return redirect('home')
    
    # Get user's widgets or create default widgets
    widgets = DashboardWidget.objects.filter(user=request.user)
    if not widgets.exists():
        # Create default widgets for new users
        create_default_widgets(request.user)
        widgets = DashboardWidget.objects.filter(user=request.user)
    
    # Get department filter if provided
    department_id = request.GET.get('department')
    department = None
    if department_id:
        try:
            department = Department.objects.get(id=department_id)
        except Department.DoesNotExist:
            pass
    
    # Get date range filter if provided
    days = request.GET.get('days', 30)
    try:
        days = int(days)
    except ValueError:
        days = 30
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Get base queryset for feedback
    if request.user.is_admin or request.user.is_superuser:
        feedback_queryset = Feedback.objects.all()
    else:
        # Faculty can only see their department's feedback
        department = request.user.profile.department
        if department:
            feedback_queryset = Feedback.objects.filter(department=department)
        else:
            feedback_queryset = Feedback.objects.none()
    
    # Apply department filter if provided
    if department:
        feedback_queryset = feedback_queryset.filter(department=department)
    
    # Apply date filter
    feedback_queryset = feedback_queryset.filter(
        submission_date__gte=start_date,
        submission_date__lte=end_date
    )
    
    # Calculate summary statistics
    total_feedback = feedback_queryset.count()
    pending_feedback = feedback_queryset.filter(status='pending').count()
    approved_feedback = feedback_queryset.filter(status='approved').count()
    addressed_feedback = feedback_queryset.filter(status='addressed').count()
    rejected_feedback = feedback_queryset.filter(status='rejected').count()
    
    # Get data for each widget
    widget_data = {}
    for widget in widgets:
        widget_data[widget.id] = get_widget_data(widget, feedback_queryset)
    
    # Get all departments for the filter
    departments = Department.objects.all().order_by('name')
    
    context = {
        'widgets': widgets,
        'widget_data': widget_data,
        'total_feedback': total_feedback,
        'pending_feedback': pending_feedback,
        'approved_feedback': approved_feedback,
        'addressed_feedback': addressed_feedback,
        'rejected_feedback': rejected_feedback,
        'departments': departments,
        'selected_department': department,
        'days': days,
    }
    
    return render(request, 'analytics/dashboard.html', context)

def get_widget_data(widget, feedback_queryset):
    """
    Generate data for a specific dashboard widget.
    """
    if widget.widget_type == 'feedback_count':
        return {
            'count': feedback_queryset.count(),
            'anonymous_count': feedback_queryset.filter(is_anonymous=True).count(),
        }
    
    elif widget.widget_type == 'feedback_by_department':
        department_data = feedback_queryset.values('department__name') \
            .annotate(count=Count('id')) \
            .order_by('-count')
        return list(department_data)
    
    elif widget.widget_type == 'feedback_by_status':
        status_data = feedback_queryset.values('status') \
            .annotate(count=Count('id')) \
            .order_by('status')
        return list(status_data)
    
    elif widget.widget_type == 'feedback_by_tag':
        tag_data = feedback_queryset.values('tags__name') \
            .annotate(count=Count('id')) \
            .exclude(tags__name=None) \
            .order_by('-count')[:10]  # Top 10 tags
        return list(tag_data)
    
    elif widget.widget_type == 'feedback_over_time':
        # Determine time grouping based on config
        grouping = widget.config.get('grouping', 'day')
        
        if grouping == 'day':
            time_data = feedback_queryset.annotate(
                date=TruncDay('submission_date')
            ).values('date').annotate(count=Count('id')).order_by('date')
        elif grouping == 'week':
            time_data = feedback_queryset.annotate(
                date=TruncWeek('submission_date')
            ).values('date').annotate(count=Count('id')).order_by('date')
        else:  # month
            time_data = feedback_queryset.annotate(
                date=TruncMonth('submission_date')
            ).values('date').annotate(count=Count('id')).order_by('date')
        
        return list(time_data)
    
    elif widget.widget_type == 'response_time':
        # Calculate average time between feedback and first reply
        # This is a bit complex as it involves multiple models and time calculation
        
        # Get feedback IDs that have replies
        feedback_with_replies = Reply.objects.values('feedback').distinct()
        
        # Filter feedback that has at least one reply
        feedback_with_reply = feedback_queryset.filter(id__in=feedback_with_replies)
        
        # For each feedback, get the time of the first reply
        response_time_data = []
        for feedback in feedback_with_reply:
            first_reply = Reply.objects.filter(feedback=feedback).order_by('created_at').first()
            if first_reply:
                # Calculate time difference in hours
                time_diff = (first_reply.created_at - feedback.submission_date).total_seconds() / 3600
                response_time_data.append({
                    'feedback_id': feedback.id,
                    'response_time_hours': time_diff,
                })
        
        # Calculate average response time
        if response_time_data:
            avg_response_time = sum(item['response_time_hours'] for item in response_time_data) / len(response_time_data)
        else:
            avg_response_time = 0
        
        return {
            'data': response_time_data,
            'avg_response_time': avg_response_time,
        }
    
    # Default case
    return {}

def create_default_widgets(user):
    """
    Create default dashboard widgets for a new user.
    """
    default_widgets = [
        {
            'title': 'Feedback Count',
            'widget_type': 'feedback_count',
            'position': 0,
            'config': {},
        },
        {
            'title': 'Feedback by Department',
            'widget_type': 'feedback_by_department',
            'position': 1,
            'config': {},
        },
        {
            'title': 'Feedback by Status',
            'widget_type': 'feedback_by_status',
            'position': 2,
            'config': {},
        },
        {
            'title': 'Top Tags',
            'widget_type': 'feedback_by_tag',
            'position': 3,
            'config': {},
        },
        {
            'title': 'Feedback Over Time',
            'widget_type': 'feedback_over_time',
            'position': 4,
            'config': {'grouping': 'day'},
        },
    ]
    
    for widget_data in default_widgets:
        DashboardWidget.objects.create(user=user, **widget_data)

class WidgetCreateView(LoginRequiredMixin, FacultyRequiredMixin, CreateView):
    """
    View for creating a new dashboard widget.
    """
    model = DashboardWidget
    form_class = DashboardWidgetForm
    template_name = 'analytics/widget_form.html'
    success_url = reverse_lazy('analytics:dashboard')
    
    def form_valid(self, form):
        form.instance.user = self.request.user
        
        # Set the widget position to the next available position
        last_position = DashboardWidget.objects.filter(user=self.request.user).aggregate(
            max_position= Max('position'))['max_position'] or -1
        form.instance.position = last_position + 1
        
        messages.success(self.request, 'Widget created successfully!')
        return super().form_valid(form)

class WidgetUpdateView(LoginRequiredMixin, FacultyRequiredMixin, UpdateView):
    """
    View for updating an existing dashboard widget.
    """
    model = DashboardWidget
    form_class = DashboardWidgetForm
    template_name = 'analytics/widget_form.html'
    context_object_name = 'widget'
    success_url = reverse_lazy('analytics:dashboard')
    
    def get_queryset(self):
        # Only allow editing of user's own widgets
        return DashboardWidget.objects.filter(user=self.request.user)
    
    def form_valid(self, form):
        messages.success(self.request, 'Widget updated successfully!')
        return super().form_valid(form)

class WidgetDeleteView(LoginRequiredMixin, FacultyRequiredMixin, DeleteView):
    """
    View for deleting a dashboard widget.
    """
    model = DashboardWidget
    template_name = 'analytics/widget_confirm_delete.html'
    context_object_name = 'widget'
    success_url = reverse_lazy('analytics:dashboard')
    
    def get_queryset(self):
        # Only allow deleting of user's own widgets
        return DashboardWidget.objects.filter(user=self.request.user)
    
    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'Widget deleted successfully!')
        return super().delete(request, *args, **kwargs)

@login_required
def reorder_widgets(request):
    """
    AJAX view for reordering dashboard widgets.
    """
    if request.method == 'POST' and request.is_ajax():
        positions = json.loads(request.body)
        
        # Update positions
        for widget_id, position in positions.items():
            widget = get_object_or_404(DashboardWidget, id=widget_id, user=request.user)
            widget.position = position
            widget.save()
        
        return JsonResponse({'status': 'success'})
    
    return JsonResponse({'status': 'error'}, status=400)

class ReportListView(LoginRequiredMixin, FacultyRequiredMixin, ListView):
    """
    View for listing saved reports.
    """
    model = Report
    template_name = 'analytics/report_list.html'
    context_object_name = 'reports'
    paginate_by = 10
    
    def get_queryset(self):
        # For admins, show all reports
        if self.request.user.is_admin or self.request.user.is_superuser:
            return Report.objects.all()
        
        # For faculty, show only their reports or reports for their department
        department = self.request.user.profile.department
        return Report.objects.filter(
            Q(created_by=self.request.user) | Q(department=department)
        )

class ReportCreateView(LoginRequiredMixin, FacultyRequiredMixin, CreateView):
    """
    View for creating a new report.
    """
    model = Report
    form_class = ReportForm
    template_name = 'analytics/report_form.html'
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs
    
    def form_valid(self, form):
        form.instance.created_by = self.request.user
        
        # Generate report data based on parameters
        report_type = form.cleaned_data.get('report_type')
        department = form.cleaned_data.get('department')
        
        # Get base queryset
        if department:
            queryset = Feedback.objects.filter(department=department)
        else:
            # For faculty without admin rights, limit to their department
            if self.request.user.is_faculty and not self.request.user.is_admin:
                department = self.request.user.profile.department
                if department:
                    queryset = Feedback.objects.filter(department=department)
                else:
                    queryset = Feedback.objects.none()
            else:
                queryset = Feedback.objects.all()
        
        # Generate report data based on type
        results = {}
        if report_type == 'department':
            results = self.generate_department_report(queryset)
        elif report_type == 'tag':
            results = self.generate_tag_report(queryset)
        elif report_type == 'time':
            results = self.generate_time_report(queryset)
        elif report_type == 'status':
            results = self.generate_status_report(queryset)
        
        # Save the report results
        form.instance.results = results
        
        messages.success(self.request, 'Report created successfully!')
        return super().form_valid(form)
    
    def get_success_url(self):
        return reverse_lazy('analytics:report_detail', kwargs={'pk': self.object.pk})
    
    def generate_department_report(self, queryset):
        """Generate department analysis report"""
        department_data = queryset.values('department__name') \
            .annotate(count=Count('id')) \
            .order_by('-count')
        
        # Add percentage data
        total = queryset.count()
        for item in department_data:
            item['percentage'] = (item['count'] / total * 100) if total > 0 else 0
        
        # Get status breakdown for each department
        department_status = {}
        for dept in Department.objects.all():
            dept_queryset = queryset.filter(department=dept)
            status_data = dept_queryset.values('status') \
                .annotate(count=Count('id')) \
                .order_by('status')
            department_status[dept.name] = list(status_data)
        
        return {
            'department_data': list(department_data),
            'department_status': department_status,
            'total_feedback': total,
        }
    
    def generate_tag_report(self, queryset):
        """Generate tag analysis report"""
        tag_data = queryset.values('tags__name') \
            .annotate(count=Count('id')) \
            .exclude(tags__name=None) \
            .order_by('-count')
        
        # Top tags overall
        top_tags = list(tag_data[:10])
        
        # Tag usage by department
        departments = Department.objects.all()
        tag_by_department = {}
        for dept in departments:
            dept_queryset = queryset.filter(department=dept)
            dept_tag_data = dept_queryset.values('tags__name') \
                .annotate(count=Count('id')) \
                .exclude(tags__name=None) \
                .order_by('-count')[:5]  # Top 5 per department
            tag_by_department[dept.name] = list(dept_tag_data)
        
        return {
            'top_tags': top_tags,
            'tag_by_department': tag_by_department,
            'total_feedback': queryset.count(),
        }
    
    def generate_time_report(self, queryset):
        """Generate time-based analysis report"""
        # Daily trends
        daily_data = queryset.annotate(
            date=TruncDay('submission_date')
        ).values('date').annotate(count=Count('id')).order_by('date')
        
        # Weekly trends
        weekly_data = queryset.annotate(
            date=TruncWeek('submission_date')
        ).values('date').annotate(count=Count('id')).order_by('date')
        
        # Monthly trends
        monthly_data = queryset.annotate(
            date=TruncMonth('submission_date')
        ).values('date').annotate(count=Count('id')).order_by('date')
        
        return {
            'daily_data': list(daily_data),
            'weekly_data': list(weekly_data),
            'monthly_data': list(monthly_data),
            'total_feedback': queryset.count(),
        }
    
    def generate_status_report(self, queryset):
        """Generate status analysis report"""
        # Status breakdown
        status_data = queryset.values('status') \
            .annotate(count=Count('id')) \
            .order_by('status')
        
        # Calculate percentages
        total = queryset.count()
        status_with_percentage = []
        for item in status_data:
            item['percentage'] = (item['count'] / total * 100) if total > 0 else 0
            status_with_percentage.append(item)
        
        # Status by department
        departments = Department.objects.all()
        status_by_department = {}
        for dept in departments:
            dept_queryset = queryset.filter(department=dept)
            dept_status_data = dept_queryset.values('status') \
                .annotate(count=Count('id')) \
                .order_by('status')
            status_by_department[dept.name] = list(dept_status_data)
        
        # Response time analysis (for addressed feedback)
        addressed_feedback = queryset.filter(status='addressed')
        feedback_with_replies = Reply.objects.values('feedback').distinct()
        feedback_with_reply = addressed_feedback.filter(id__in=feedback_with_replies)
        
        response_times = []
        for feedback in feedback_with_reply:
            first_reply = Reply.objects.filter(feedback=feedback).order_by('created_at').first()
            if first_reply:
                response_time = (first_reply.created_at - feedback.submission_date).total_seconds() / 3600
                response_times.append(response_time)
        
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        return {
            'status_data': status_with_percentage,
            'status_by_department': status_by_department,
            'total_feedback': total,
            'avg_response_time': avg_response_time,
            'response_times': response_times,
        }

class ReportDetailView(LoginRequiredMixin, FacultyRequiredMixin, DetailView):
    """
    View for displaying report details.
    """
    model = Report
    template_name = 'analytics/report_detail.html'
    context_object_name = 'report'

@login_required
def export_report(request, pk):
    """
    View for exporting a report as CSV.
    """
    report = get_object_or_404(Report, pk=pk)
    
    # Check permissions
    if not (request.user.is_admin or request.user.is_superuser or 
            request.user == report.created_by or 
            (report.department and request.user.profile.department == report.department)):
        messages.error(request, "You don't have permission to export this report.")
        return redirect('analytics:report_detail', pk=pk)
    
    # Generate CSV content based on report type
    import csv
    from io import StringIO
    
    csv_content = StringIO()
    writer = csv.writer(csv_content)
    
    if report.report_type == 'department':
        # Write department data
        writer.writerow(['Department', 'Feedback Count', 'Percentage'])
        for dept in report.results.get('department_data', []):
            writer.writerow([
                dept.get('department__name', 'Unknown'),
                dept.get('count', 0),
                f"{dept.get('percentage', 0):.2f}%"
            ])
    
    elif report.report_type == 'tag':
        # Write tag data
        writer.writerow(['Tag', 'Feedback Count'])
        for tag in report.results.get('top_tags', []):
            writer.writerow([
                tag.get('tags__name', 'Unknown'),
                tag.get('count', 0)
            ])
    
    elif report.report_type == 'time':
        # Write time data
        writer.writerow(['Date', 'Feedback Count'])
        for entry in report.results.get('monthly_data', []):
            writer.writerow([
                entry.get('date', 'Unknown'),
                entry.get('count', 0)
            ])
    
    elif report.report_type == 'status':
        # Write status data
        writer.writerow(['Status', 'Feedback Count', 'Percentage'])
        for status in report.results.get('status_data', []):
            writer.writerow([
                status.get('status', 'Unknown'),
                status.get('count', 0),
                f"{status.get('percentage', 0):.2f}%"
            ])
    
    # Create response with CSV content
    response = HttpResponse(csv_content.getvalue(), content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{report.title.replace(" ", "_")}.csv"'
    
    return response