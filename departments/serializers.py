from rest_framework import serializers
from .models import Department
from accounts.models import User

class DepartmentSerializer(serializers.ModelSerializer):
    admin_name = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()
    feedback_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = [
            'id', 'name', 'description', 'admin', 'admin_name',
            'member_count', 'feedback_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_admin_name(self, obj):
        if obj.admin:
            return obj.get_admin_display()
        return None
    
    def get_member_count(self, obj):
        return obj.get_member_count()
    
    def get_feedback_count(self, obj):
        return obj.get_feedback_count()

class DepartmentMemberSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'role']
    
    def get_full_name(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        return obj.username
    
    def get_role(self, obj):
        if obj.is_admin:
            return 'Administrator'
        elif obj.is_faculty:
            return 'Faculty'
        elif obj.is_student:
            return 'Student'
        return 'User'