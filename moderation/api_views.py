from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import ModerationLog, FilterRule
from feedback.models import Feedback
from .serializers import ModerationLogSerializer, FilterRuleSerializer

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

class IsAdminOrReadOnlyFaculty(permissions.BasePermission):
    """
    Permission to allow admins to make changes, faculty to read.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        # Faculty can read
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_faculty or request.user.is_admin or request.user.is_superuser
        
        # Only admins can write
        return request.user.is_admin or request.user.is_superuser

class ModerationQueueViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for the moderation queue.
    This is a read-only ViewSet that displays pending feedback items.
    """
    serializer_class = FilterRuleSerializer
    permission_classes = [IsFacultyOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['title', 'content']
    
    def get_queryset(self):
        """
        Filter for pending feedback based on user role:
        - Admins can see all pending feedback
        - Faculty can see pending feedback for their department
        """
        user = self.request.user
        
        # Base queryset - pending feedback
        queryset = Feedback.objects.filter(status='pending')
        
        if user.is_admin or user.is_superuser:
            pass  # Admins see all pending feedback
        elif user.is_faculty:
            # Faculty can only see their department's feedback
            department = user.profile.department
            if department:
                queryset = queryset.filter(department=department)
            else:
                queryset = Feedback.objects.none()
        else:
            # Other users can't access moderation
            queryset = Feedback.objects.none()
        
        # Apply department filter if provided
        department_id = self.request.query_params.get('department')
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        
        # Apply search filter if provided
        search_query = self.request.query_params.get('q')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | 
                Q(content__icontains=search_query)
            )
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def moderate(self, request, pk=None):
        """
        Moderate a feedback item.
        """
        feedback = get_object_or_404(Feedback, id=pk)
        
        # Check permissions for moderating this feedback
        user = request.user
        if not (
            user.is_admin or 
            user.is_superuser or 
            (user.is_faculty and user.profile.department == feedback.department)
        ):
            return Response({'detail': 'You do not have permission to moderate this feedback.'},
                           status=status.HTTP_403_FORBIDDEN)
        
        # Get action and reason from request
        action = request.data.get('action')
        reason = request.data.get('reason', '')
        
        if action not in dict(ModerationLog.ACTION_CHOICES).keys():
            return Response({'error': 'Invalid action.'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Update feedback status based on action
        if action == 'approved':
            feedback.status = 'approved'
        elif action == 'rejected':
            feedback.status = 'rejected'
        elif action == 'flagged':
            feedback.status = 'pending'  # Keep as pending for further review
        
        feedback.save()
        
        # Create moderation log
        log = ModerationLog.objects.create(
            feedback=feedback,
            moderator=user,
            action=action,
            reason=reason
        )
        
        serializer = ModerationLogSerializer(log)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class FilterRuleViewSet(viewsets.ModelViewSet):
    """
    API endpoint for filter rules.
    """
    queryset = FilterRule.objects.all()
    serializer_class = FilterRuleSerializer
    permission_classes = [IsAdminOrReadOnlyFaculty]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['rule_type', 'action', 'is_active']
    search_fields = ['name', 'description', 'pattern']
    
    def perform_create(self, serializer):
        """
        Set current user as creator
        """
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        """
        Toggle the active status of a filter rule.
        """
        rule = self.get_object()
        rule.is_active = not rule.is_active
        rule.save()
        
        serializer = self.get_serializer(rule)
        return Response(serializer.data)