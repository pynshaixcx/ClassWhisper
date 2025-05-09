from django import forms
from django.forms import widgets
from .models import Feedback, Reply, Tag

class FeedbackForm(forms.ModelForm):
    """
    Form for submitting feedback.
    """
    is_anonymous = forms.BooleanField(
        required=False,
        initial=False,
        label="Submit Anonymously",
        help_text="If checked, your identity will be kept anonymous."
    )
    
    class Meta:
        model = Feedback
        fields = ['title', 'content', 'department', 'tags', 'is_anonymous']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'content': forms.Textarea(attrs={'class': 'form-control', 'rows': 5}),
            'department': forms.Select(attrs={'class': 'form-select'}),
            'tags': forms.SelectMultiple(attrs={'class': 'form-select'}),
        }
    
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        department_id = kwargs.pop('department_id', None)
        
        super(FeedbackForm, self).__init__(*args, **kwargs)
        
        # Check if any departments exist
        from departments.models import Department
        departments_exist = Department.objects.exists()
        
        if not departments_exist:
            self.fields['department'].choices = [('', 'No departments available')]
            self.fields['department'].help_text = "No departments are available. Please contact an administrator."
        
        # If a department is specified, filter tags by that department
        if department_id:
            self.fields['department'].initial = department_id
            self.fields['tags'].queryset = Tag.objects.filter(department_id=department_id)
        else:
            self.fields['tags'].queryset = Tag.objects.none()
        
        # If user has a department in their profile, set it as default
        if user and user.profile.department:
            self.fields['department'].initial = user.profile.department.id
            self.fields['tags'].queryset = Tag.objects.filter(department=user.profile.department)
    
    def clean(self):
        cleaned_data = super().clean()
        
        # Validate that the selected tags belong to the selected department
        tags = cleaned_data.get('tags')
        department = cleaned_data.get('department')
        
        if tags and department:
            for tag in tags:
                if tag.department != department:
                    self.add_error('tags', f"The tag '{tag.name}' does not belong to the selected department.")
        
        return cleaned_data

class ReplyForm(forms.ModelForm):
    """
    Form for replying to feedback.
    """
    class Meta:
        model = Reply
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
        }

class TagForm(forms.ModelForm):
    """
    Form for creating and managing tags.
    """
    class Meta:
        model = Tag
        fields = ['name', 'description', 'department']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'department': forms.Select(attrs={'class': 'form-select'}),
        }