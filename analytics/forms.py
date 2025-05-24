from django import forms
from .models import Report, DashboardWidget
from departments.models import Department

class ReportForm(forms.ModelForm):
    """
    Form for creating and updating reports.
    """
    class Meta:
        model = Report
        fields = ['title', 'description', 'report_type', 'department']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'report_type': forms.Select(attrs={'class': 'form-select'}),
            'department': forms.Select(attrs={'class': 'form-select'}),
        }
    
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super(ReportForm, self).__init__(*args, **kwargs)
        
        # Add empty label for department
        self.fields['department'].empty_label = "All Departments"
        self.fields['department'].required = False
        
        # For faculty, restrict to their department if they don't have admin rights
        if user and user.is_faculty and not user.is_admin:
            department = user.profile.department
            if department:
                self.fields['department'].initial = department.id
                self.fields['department'].queryset = Department.objects.filter(id=department.id)
                self.fields['department'].disabled = True
            else:
                self.fields['department'].queryset = Department.objects.none()
        else:
            self.fields['department'].queryset = Department.objects.all()

class DashboardWidgetForm(forms.ModelForm):
    """
    Form for creating and updating dashboard widgets.
    """
    class Meta:
        model = DashboardWidget
        fields = ['title', 'widget_type', 'config']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'widget_type': forms.Select(attrs={'class': 'form-select'}),
        }
    
    # Add JSON editor for config or custom widgets based on widget_type
    grouping = forms.ChoiceField(
        choices=[
            ('day', 'Daily'),
            ('week', 'Weekly'),
            ('month', 'Monthly'),
        ],
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'}),
        help_text="Time grouping for time-based widgets"
    )
    
    def __init__(self, *args, **kwargs):
        super(DashboardWidgetForm, self).__init__(*args, **kwargs)
        
        # If editing an existing widget, populate the grouping field
        if self.instance.pk and self.instance.widget_type == 'feedback_over_time':
            self.fields['grouping'].initial = self.instance.config.get('grouping', 'day')
    
    def clean(self):
        cleaned_data = super().clean()
        widget_type = cleaned_data.get('widget_type')
        
        # Create config object based on widget type
        config = {}
        
        if widget_type == 'feedback_over_time':
            config['grouping'] = cleaned_data.get('grouping', 'day')
        
        # Set the config field
        cleaned_data['config'] = config
        
        return cleaned_data