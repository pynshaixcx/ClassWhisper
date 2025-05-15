from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import Feedback, Tag, Reply
from .serializers import FeedbackSerializer, TagSerializer, ReplySerializer

class IsFeedbackAuthorOrFacultyOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow feedback authors, faculty of the relevant department,
    or admins to access feedback.
    """
    def has_object_permission(self, request, view, obj):
        # Is this the author of the feedback?
        if obj.user == request.user:
            return True
        
        # Is this a faculty member of the department?
        if request.user.is_faculty and request.user.profile.department == obj.department:
            return True
        
        # Is this an admin?
        if request.user.is_admin or request.user.is_superuser:
            return True
        
        return False

class IsTagDepartmentFacultyOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow faculty of the department or admins to manage tags.
    """
    def has_object_permission(self, request, view, obj):
        # Allow GET, HEAD or OPTIONS requests
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Is this a faculty member of the department?
        if request.user.is_faculty and request.user.profile.department == obj.department:
            return True
        
        # Is this an admin?
        if request.user.is_admin or request.user.is_superuser:
            return True
        
        return False

class FeedbackViewSet(viewsets.ModelViewSet):
    """
    API endpoint for feedback.
    """
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated, IsFeedbackAuthorOrFacultyOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'status', 'is_anonymous']
    search_fields = ['title', 'content']
    ordering_fields = ['submission_date', 'updated_at']
    ordering = ['-submission_date']
    
    def get_queryset(self):
        """
        Filter feedback based on user role:
        - Admins can see all feedback
        - Faculty can see feedback for their department
        - Students can see their own feedback
        """
        user = self.request.user
        
        if user.is_admin or user.is_superuser:
            return Feedback.objects.all()
        
        if user.is_faculty:
            # Faculty can see feedback for their department
            department = user.profile.department
            if department:
                return Feedback.objects.filter(department=department)
            return Feedback.objects.none()
        
        # Students can see their own feedback
        return Feedback.objects.filter(user=user)
    
    def perform_create(self, serializer):
        """
        Save user as the feedback submitter
        """
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def student_dashboard(self, request):
        """
        Get feedback for student dashboard
        """
        # Only the student's own feedback
        queryset = Feedback.objects.filter(user=request.user, show_in_dashboard=True)
        
        # Apply department filter if provided
        department_id = request.query_params.get('department')
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def faculty_dashboard(self, request):
        """
        Get feedback for faculty dashboard
        """
        user = request.user
        
        # Faculty can only see their department's feedback
        if user.is_faculty and not user.is_admin and not user.is_superuser:
            department = user.profile.department
            if department:
                queryset = Feedback.objects.filter(department=department)
            else:
                queryset = Feedback.objects.none()
        # Admins can see all feedback
        elif user.is_admin or user.is_superuser:
            queryset = Feedback.objects.all()
        else:
            # Other users can't access this endpoint
            return Response({'detail': 'You do not have permission to access this endpoint.'},
                           status=status.HTTP_403_FORBIDDEN)
        
        # Apply filters if provided
        department_id = request.query_params.get('department')
        status_filter = request.query_params.get('status')
        search_query = request.query_params.get('q')
        
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | 
                Q(content__icontains=search_query)
            )
        
        # Order by most recent
        queryset = queryset.order_by('-submission_date')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_reply(self, request, pk=None):
        """
        Add a reply to feedback
        """
        feedback = self.get_object()
        
        # Check if user is authorized to reply
        if not (
            request.user.is_admin or 
            request.user.is_superuser or 
            (request.user.is_faculty and request.user.profile.department == feedback.department) or
            request.user == feedback.user
        ):
            return Response({'detail': 'You do not have permission to reply to this feedback.'},
                           status=status.HTTP_403_FORBIDDEN)
        
        # Create reply
        content = request.data.get('content')
        if not content:
            return Response({'error': 'Content is required for a reply.'},
                           status=status.HTTP_400_BAD_REQUEST)
        
        reply = Reply.objects.create(
            feedback=feedback,
            admin=request.user,
            content=content
        )
        
        # If faculty/admin reply, update status to addressed
        if request.user.is_faculty or request.user.is_admin or request.user.is_superuser:
            if feedback.status != 'addressed':
                feedback.status = 'addressed'
                feedback.save()
        
        serializer = ReplySerializer(reply)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class TagViewSet(viewsets.ModelViewSet):
    """
    API endpoint for tags.
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated, IsTagDepartmentFacultyOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['department']
    search_fields = ['name', 'description']
    
    def get_queryset(self):
        """
        Filter tags based on user role:
        - Admins can see all tags
        - Faculty can see tags for their department
        - Students can see all tags for selecting in feedback
        """
        user = self.request.user
        
        if user.is_admin or user.is_superuser:
            return Tag.objects.all()
        
        if user.is_faculty:
            # Faculty can see tags for their department
            department = user.profile.department
            if department:
                return Tag.objects.filter(department=department)
            return Tag.objects.none()
        
        # Students can see all tags for selecting in feedback
        return Tag.objects.all()