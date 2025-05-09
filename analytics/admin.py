from django.contrib import admin
from django.utils.html import format_html
import json
from .models import Report, DashboardWidget

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'report_type', 'department', 'created_by', 'created_at')
    list_filter = ('report_type', 'department', 'created_at')
    search_fields = ('title', 'description', 'created_by__username')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_by', 'created_at', 'updated_at', 'formatted_parameters', 'formatted_results')
    
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'report_type', 'department')
        }),
        ('Report Data', {
            'fields': ('formatted_parameters', 'formatted_results'),
            'classes': ('wide',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def formatted_parameters(self, obj):
        """Display formatted JSON for parameters"""
        if not obj.parameters:
            return "No parameters"
        try:
            formatted = json.dumps(obj.parameters, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        except Exception:
            return str(obj.parameters)
    formatted_parameters.short_description = 'Parameters'
    
    def formatted_results(self, obj):
        """Display formatted JSON for results"""
        if not obj.results:
            return "No results"
        try:
            formatted = json.dumps(obj.results, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        except Exception:
            return str(obj.results)
    formatted_results.short_description = 'Results'
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(DashboardWidget)
class DashboardWidgetAdmin(admin.ModelAdmin):
    list_display = ('title', 'widget_type', 'user', 'position', 'updated_at')
    list_filter = ('widget_type', 'user', 'updated_at')
    search_fields = ('title', 'user__username')
    readonly_fields = ('created_at', 'updated_at', 'formatted_config')
    
    fieldsets = (
        (None, {
            'fields': ('title', 'widget_type', 'user', 'position')
        }),
        ('Widget Configuration', {
            'fields': ('formatted_config',),
            'classes': ('wide',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def formatted_config(self, obj):
        """Display formatted JSON for config"""
        if not obj.config:
            return "No configuration"
        try:
            formatted = json.dumps(obj.config, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        except Exception:
            return str(obj.config)
    formatted_config.short_description = 'Configuration'