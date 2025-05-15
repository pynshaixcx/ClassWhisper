from rest_framework import serializers
from .models import User, Profile
from departments.models import Department

class ProfileSerializer(serializers.ModelSerializer):
    department_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = ['id', 'department', 'department_name', 'profile_picture', 'bio']
    
    def get_department_name(self, obj):
        if obj.department:
            return obj.department.name
        return None

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        write_only=True,
        required=False,
        source='profile.department'
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'is_student', 'is_faculty', 'is_admin', 'is_staff', 'is_active',
            'profile', 'department_id', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def get_full_name(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        return obj.username
    
    def create(self, validated_data):
        profile_data = None
        if 'profile' in validated_data:
            profile_data = validated_data.pop('profile')
        
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        
        if password:
            user.set_password(password)
        
        user.save()
        
        # Update profile if data was provided
        if profile_data:
            Profile.objects.filter(user=user).update(**profile_data)
        
        return user
    
    def update(self, instance, validated_data):
        # Handle nested profile update
        profile_data = None
        if 'profile' in validated_data:
            profile_data = validated_data.pop('profile')
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Set password if provided
        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)
        
        instance.save()
        
        # Update profile if data was provided
        if profile_data:
            Profile.objects.filter(user=instance).update(**profile_data)
        
        return instance

class UserRegistrationSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(
        choices=[('student', 'Student'), ('faculty', 'Faculty')],
        required=True
    )
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        role = validated_data.pop('role')
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            is_student=(role == 'student'),
            is_faculty=(role == 'faculty')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user