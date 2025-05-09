"""
WSGI config for class_whisper project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'class_whisper.settings')

application = get_wsgi_application()