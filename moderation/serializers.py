from rest_framework import serializers
from .models import ModerationLog, FilterRule
from feedback.models import Feedback
from accounts.models import User

class ModerationLogSerializer(serializers.ModelSerializer):
    feedback_title = serializers.SerializerMethodField()
    moderator_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ModerationLog
        fields = [
            'id', 'feedback', 'feedback_title', 'moderator', 'moderator_name',
            'action', 'reason', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']
    
    def get_feedback_title(self, obj):
        return obj.feedback.title
    
    def get_moderator_name(self, obj):
        if obj.moderator:
            return obj.moderator.get_full_name() or obj.moderator.username
        return None

class FilterRuleSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    rule_type_display = serializers.SerializerMethodField()
    action_display = serializers.SerializerMethodField()
    
    class Meta:
        model = FilterRule
        fields = [
            'id', 'name', 'description', 'rule_type', 'rule_type_display',
            'pattern', 'action', 'action_display', 'is_active',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_by_name', 'created_at', 'updated_at']
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None
    
    def get_rule_type_display(self, obj):
        return obj.get_rule_type_display()
    
    def get_action_display(self, obj):
        return obj.get_action_display()
    
    def create(self, validated_data):
        # Set the created_by field to the current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)