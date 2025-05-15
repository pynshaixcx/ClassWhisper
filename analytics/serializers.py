from rest_framework import serializers
from .models import Report, DashboardWidget
from departments.models import Department

class ReportSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    report_type_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Report
        fields = [
            'id', 'title', 'description', 'report_type', 'report_type_display',
            'created_by', 'created_by_name', 'department', 'department_name',
            'parameters', 'results', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None
    
    def get_department_name(self, obj):
        if obj.department:
            return obj.department.name
        return None
    
    def get_report_type_display(self, obj):
        return obj.get_report_type_display()
    
    def create(self, validated_data):
        # Set the created_by field to the current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class DashboardWidgetSerializer(serializers.ModelSerializer):
    widget_type_display = serializers.SerializerMethodField()
    
    class Meta:
        model = DashboardWidget
        fields = [
            'id', 'title', 'widget_type', 'widget_type_display',
            'user', 'position', 'config', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_widget_type_display(self, obj):
        return obj.get_widget_type_display()
    
    def create(self, validated_data):
        # Set the user field to the current user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)