from rest_framework import serializers
from .models import Feedback, Tag, Reply
from departments.models import Department

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'description', 'department']

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'description']

class ReplySerializer(serializers.ModelSerializer):
    admin_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Reply
        fields = ['id', 'content', 'admin', 'admin_display', 'created_at', 'updated_at']
    
    def get_admin_display(self, obj):
        return obj.get_admin_display()

class FeedbackSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    department = DepartmentSerializer(read_only=True)
    replies = ReplySerializer(many=True, read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        write_only=True,
        source='department'
    )
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        write_only=True,
        many=True,
        required=False
    )
    author_display = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Feedback
        fields = [
            'id', 'hash_id', 'title', 'content', 'user', 'department', 'department_id',
            'tags', 'tag_ids', 'is_anonymous', 'status', 'submission_date',
            'updated_at', 'author_display', 'replies', 'replies_count', 'show_in_dashboard'
        ]
        read_only_fields = ['id', 'hash_id', 'user', 'status', 'submission_date', 'updated_at']
    
    def get_author_display(self, obj):
        return obj.get_author_display()
    
    def get_replies_count(self, obj):
        return obj.replies.count()
    
    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        feedback = Feedback.objects.create(**validated_data)
        feedback.tags.set(tag_ids)
        return feedback
    
    def update(self, instance, validated_data):
        tag_ids = validated_data.pop('tag_ids', None)
        
        # Update instance fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update tags if provided
        if tag_ids is not None:
            instance.tags.set(tag_ids)
        
        return instance