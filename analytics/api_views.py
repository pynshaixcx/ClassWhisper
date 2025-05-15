from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from .models import Report, DashboardWidget
from .serializers import ReportSerializer, DashboardWidgetSerializer
from datetime import datetime, timedelta
from django.db.models import Count, Avg, Q, F, ExpressionWrapper, fields
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth

class IsFacultyOrAdmin(permissions.BasePermission):
    """
    Permission to allow only faculty members or admins.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_faculty or 
            request.user.is_admin or 
            request.user.is_superuser
        )

class IsOwnerOrDepartmentFacultyOrAdmin(permissions.BasePermission):
    """
    Permission to allow report owners, faculty of the department, or admins.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Is this the owner?
        if obj.created_by == user:
            return True
        
        # Is this a faculty member of the department?
        if user.is_faculty and obj.department and user.profile.department == obj.department:
            return True
        
        # Is this an admin?
        if user.is_admin or user.is_superuser:
            return True
        
        return False

class IsWidgetOwner(permissions.BasePermission):
    """
    Permission to allow only widget owners to edit.
    """
    def has_object_permission(self, request, view, obj):
        # Allow only the owner to edit the widget
        return obj.user == request.user

class ReportViewSet(viewsets.ModelViewSet):
    """
    API endpoint for reports.
    """
    serializer_class = ReportSerializer
    permission_classes = [IsFacultyOrAdmin, IsOwnerOrDepartmentFacultyOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['report_type', 'department', 'created_by']
    search_fields = ['title', 'description']
    
    def get_queryset(self):
        """
        Filter reports based on user role:
        - Admins can see all reports
        - Faculty can see reports for their department and ones they created
        """
        user = self.request.user
        
        if user.is_admin or user.is_superuser:
            return Report.objects.all()
        
        if user.is_faculty:
            # Faculty can see reports for their department and ones they created
            department = user.profile.department
            if department:
                return Report.objects.filter(
                    Q(created_by=user) | Q(department=department)
                )
            return Report.objects.filter(created_by=user)
        
        return Report.objects.none()
    
    def perform_create(self, serializer):
        """
        Set current user as report creator
        """
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['get'])
    def export(self, request, pk=None):
        """
        Export report as CSV
        """
        report = self.get_object()
        
        # Check permissions
        if not self.check_object_permissions(request, report):
            return Response({'detail': 'You do not have permission to export this report.'},
                           status=status.HTTP_403_FORBIDDEN)
        
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

class DashboardWidgetViewSet(viewsets.ModelViewSet):
    """
    API endpoint for dashboard widgets.
    """
    serializer_class = DashboardWidgetSerializer
    permission_classes = [IsFacultyOrAdmin, IsWidgetOwner]
    
    def get_queryset(self):
        """
        Filter widgets to only show the current user's widgets.
        """
        return DashboardWidget.objects.filter(user=self.request.user).order_by('position')
    
    def perform_create(self, serializer):
        """
        Set current user as widget owner and assign next position
        """
        # Get the next available position
        last_position = DashboardWidget.objects.filter(user=self.request.user).count()
        serializer.save(user=self.request.user, position=last_position)
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """
        Reorder widgets based on provided positions
        """
        positions = request.data
        
        if not isinstance(positions, dict):
            return Response({'error': 'Expected dictionary of widget IDs and positions'},
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Update positions
        for widget_id, position in positions.items():
            try:
                widget = DashboardWidget.objects.get(id=widget_id, user=request.user)
                widget.position = position
                widget.save()
            except (DashboardWidget.DoesNotExist, ValueError):
                # Skip invalid IDs
                continue
        
        return Response({'status': 'success'})
    
    @action(detail=False, methods=['get'])
    def create_defaults(self, request):
        """
        Create default widgets for a new user
        """
        user = request.user
        
        # Check if user already has widgets
        if DashboardWidget.objects.filter(user=user).exists():
            return Response({'message': 'User already has widgets'},
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Create default widgets
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
        
        created_widgets = []
        for widget_data in default_widgets:
            widget = DashboardWidget.objects.create(user=user, **widget_data)
            created_widgets.append(widget)
        
        serializer = self.get_serializer(created_widgets, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)