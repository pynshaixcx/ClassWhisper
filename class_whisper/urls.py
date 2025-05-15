from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Import ViewSets - You'll need to create these
from feedback.api_views import FeedbackViewSet, TagViewSet
from departments.api_views import DepartmentViewSet
from accounts.api_views import UserViewSet
from analytics.api_views import ReportViewSet, DashboardWidgetViewSet
from moderation.api_views import ModerationQueueViewSet, FilterRuleViewSet
from .views import ReactAppView  # This view will serve the React app

# Create API router
router = DefaultRouter()
router.register(r'feedback', FeedbackViewSet, basename='feedback')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'users', UserViewSet, basename='user')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'widgets', DashboardWidgetViewSet, basename='widget')
router.register(r'moderation/queue', ModerationQueueViewSet, basename='moderation_queue')
router.register(r'filter-rules', FilterRuleViewSet, basename='filter_rule')

urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),
    
    # API URLs
    path('api/', include([
        path('', include(router.urls)),
        path('auth/', include([
            path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
            path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        ])),
    ])),
    
    # Original app URLs - these will still be accessible
    path('accounts/', include('accounts.urls')),
    path('feedback/', include('feedback.urls')),
    path('departments/', include('departments.urls')),
    path('moderation/', include('moderation.urls')),
    path('analytics/', include('analytics.urls')),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# When in production and React build folder exists, serve the React app for all other routes
if not settings.DEBUG and hasattr(settings, 'REACT_BUILD_DIR') and settings.REACT_BUILD_DIR:
    urlpatterns += [
        # Catch all other URLs and serve the React app
        re_path(r'^.*$', ReactAppView.as_view(), name='react-app'),
    ]