from django import forms
from .models import ModerationLog, FilterRule

class ModerationLogForm(forms.ModelForm):
    """
    Form for recording moderation actions.
    """
    class Meta:
        model = ModerationLog
        fields = ['action', 'reason']
        widgets = {
            'action': forms.Select(attrs={'class': 'form-select'}),
            'reason': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }

class FilterRuleForm(forms.ModelForm):
    """
    Form for creating and updating filter rules.
    """
    class Meta:
        model = FilterRule
        fields = ['name', 'description', 'rule_type', 'pattern', 'action', 'is_active']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'rule_type': forms.Select(attrs={'class': 'form-select'}),
            'pattern': forms.TextInput(attrs={'class': 'form-control'}),
            'action': forms.Select(attrs={'class': 'form-select'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }
    
    def clean_pattern(self):
        rule_type = self.cleaned_data.get('rule_type')
        pattern = self.cleaned_data.get('pattern')
        
        if rule_type == 'regex':
            # Validate that the pattern is a valid regex
            import re
            try:
                re.compile(pattern)
            except re.error:
                raise forms.ValidationError("Invalid regular expression pattern.")
        
        return pattern