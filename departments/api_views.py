from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Department
from accounts.models import User
from .serializers import DepartmentSerializer, DepartmentMemberSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit departments.
    Others can view.
    """
    def has_permission(self, request, view):
        # Allow GET, HEAD or OPTIONS requests
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Allow only admins to make changes
        return request.user.is_authenticated and (request.user.is_admin or request.user.is_superuser)
    
    def has_object_permission(self, request, view, obj):
        # Allow GET, HEAD or OPTIONS requests
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Allow only admins to make changes
        return request.user.is_authenticated and (request.user.is_admin or request.user.is_superuser)

class DepartmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for departments.
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    
    def get_queryset(self):
        """
        Filter departments based on user role:
        - Admins and superusers can see all departments
        - Faculty can see their department and any they administer
        - Students can see their department and all departments for submitting feedback
        """
        user = self.request.user
        
        if user.is_admin or user.is_superuser:
            return Department.objects.all()
        
        if user.is_faculty:
            # Faculty can see their department and any they administer
            return Department.objects.filter(
                id__in=[user.profile.department_id, *user.administered_departments.values_list('id', flat=True)]
            ).distinct()
        
        # Students and other users can see all departments for submitting feedback
        return Department.objects.all()
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """
        Get members of a department.
        """
        department = self.get_object()
        members = User.objects.filter(profile__department=department)
        
        serializer = DepartmentMemberSerializer(members, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def assign_admin(self, request, pk=None):
        """
        Assign an admin to a department.
        """
        department = self.get_object()
        
        # Check if user has permissions to update department
        if not (request.user.is_admin or request.user.is_superuser):
            return Response({'detail': 'You do not have permission to perform this action.'},
                           status=status.HTTP_403_FORBIDDEN)
        
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'User ID is required'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            
            # Check if user is faculty
            if not user.is_faculty:
                return Response({'error': 'Only faculty members can be department admins'},
                               status=status.HTTP_400_BAD_REQUEST)
            
            department.admin = user
            department.save()
            
            serializer = DepartmentSerializer(department)
            return Response(serializer.data)
        
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, 
                           status=status.HTTP_404_NOT_FOUND)