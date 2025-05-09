from django import forms
from django.contrib.auth import get_user_model
from .models import Department

User = get_user_model()

class DepartmentForm(forms.ModelForm):
    """
    Form for creating and updating departments.
    """
    class Meta:
        model = Department
        fields = ['name', 'description', 'admin']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
            'admin': forms.Select(attrs={'class': 'form-select'}),
        }
    
    def __init__(self, *args, **kwargs):
        super(DepartmentForm, self).__init__(*args, **kwargs)
        # Only show faculty and admin users in the admin dropdown
        self.fields['admin'].queryset = User.objects.filter(
            is_faculty=True
        ).order_by('username')
        # Add an empty label
        self.fields['admin'].empty_label = "No admin assigned"