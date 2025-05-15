"""
Create this file: class_whisper/views.py
This view will serve the React app
"""

from django.views.generic import TemplateView
from django.conf import settings
import os

class ReactAppView(TemplateView):
    """
    Serves the React app for all non-API routes.
    """
    template_name = 'index.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # You can add any context data needed for the React app here
        return context