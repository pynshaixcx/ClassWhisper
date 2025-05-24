"""
Custom middleware for the Class Whisper application.
"""

import threading


_thread_locals = threading.local()

def get_thread_local():
    return _thread_locals

class ThreadLocalMiddleware:
    """
    Middleware to store the request object in thread local storage.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Store request in thread local storage
        _thread_locals.request = request
        response = self.get_response(request)
        # Clean up thread local storage
        del _thread_locals.request
        return response

class AnonymityMiddleware:
    """
    Middleware to ensure anonymity for anonymous feedback submissions.
    Prevents storing IP addresses and other identifying information.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Process request
        # Check if the current request is for anonymous feedback submission
        if request.path.startswith('/feedback/submit/') and request.method == 'POST':
            if request.POST.get('is_anonymous'):
                # Remove identifying information
                request.META['REMOTE_ADDR'] = '0.0.0.0'  # Mask IP address
                # Remove other potential tracking headers
                for header in ['HTTP_X_FORWARDED_FOR', 'HTTP_USER_AGENT', 'HTTP_REFERER']:
                    if header in request.META:
                        request.META[header] = ''
        
        response = self.get_response(request)
        
        # Process response
        # Ensure no tracking cookies are set for anonymous requests
        if request.path.startswith('/feedback/submit/') and request.method == 'POST':
            if request.POST.get('is_anonymous'):
                # Remove any cookies that might be used for tracking
                for cookie in response.cookies:
                    if cookie not in ['csrftoken', 'sessionid']:
                        del response.cookies[cookie]
        
        return response