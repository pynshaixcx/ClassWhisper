"""
View to serve the React app for non-API routes.
"""
import os
from django.views.generic import TemplateView
from django.http import HttpResponse
from django.conf import settings

class ReactAppView(TemplateView):
    """
    Serves the compiled React app for all non-API routes.
    """
    template_name = 'index.html'
    
    def get(self, request, *args, **kwargs):
        # Check if React build directory exists
        if not hasattr(settings, 'REACT_BUILD_DIR') or not settings.REACT_BUILD_DIR:
            return HttpResponse(
                """<h1>React App Not Found</h1>
                <p>The React app build directory is not configured in settings.</p>
                <p>Please build the React app and set REACT_BUILD_DIR in your settings.</p>""",
                status=500
            )
        
        try:
            # Try to render the React app template
            return super().get(request, *args, **kwargs)
        except Exception as e:
            # Handle template not found or other errors
            return HttpResponse(
                f"""<h1>Error Serving React App</h1>
                <p>There was an error serving the React app: {str(e)}</p>
                <p>Please ensure the React app is built and properly configured.</p>""",
                status=500
            )
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Add any context data needed for the React app
        # For example, we might want to add the API base URL
        context['api_url'] = settings.API_URL if hasattr(settings, 'API_URL') else '/api/'
        
        return context