from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
import os
# Import ViewSets
from accounts.api_views import UserViewSet
from departments.api_views import DepartmentViewSet
from feedback.api_views import FeedbackViewSet, TagViewSet
from moderation.api_views import ModerationQueueViewSet, FilterRuleViewSet
from analytics.api_views import ReportViewSet, DashboardWidgetViewSet
from .views import ReactAppView

# Create API router
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'feedback', FeedbackViewSet, basename='feedback')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'moderation/queue', ModerationQueueViewSet, basename='moderation_queue')
router.register(r'filter-rules', FilterRuleViewSet, basename='filter_rule')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'widgets', DashboardWidgetViewSet, basename='widget')

urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include([
        # Router URLs
        path('', include(router.urls)),
        
        # JWT Authentication
        path('auth/', include([
            path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
            path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
            path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
        ])),
        
        # API Authentication (for browsable API, if enabled)
        path('auth/', include('rest_framework.urls', namespace='rest_framework')),
    ])),
    
    # Django app URLs
    path('accounts/', include('accounts.urls')),
    path('feedback/', include('feedback.urls')),
    path('departments/', include('departments.urls')),
    path('moderation/', include('moderation.urls')),
    path('analytics/', include('analytics.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# In production, serve the React app for all other routes
# This should be at the end of urlpatterns to catch all non-matching routes
if not settings.DEBUG and hasattr(settings, 'REACT_BUILD_DIR') and os.path.exists(settings.REACT_BUILD_DIR):
    urlpatterns += [
        # Catch all other URLs and serve the React app
        re_path(r'^.*$', ReactAppView.as_view(), name='react-app'),
    ]
# In development, we'll also serve the React app for non-API routes
elif settings.DEBUG and hasattr(settings, 'REACT_BUILD_DIR') and os.path.exists(settings.REACT_BUILD_DIR):
    urlpatterns += [
        # Catch all other URLs and serve the React app in development
        re_path(r'^(?!admin|api|accounts|feedback|departments|moderation|analytics).*$', 
                ReactAppView.as_view(), name='react-app'),
    ]