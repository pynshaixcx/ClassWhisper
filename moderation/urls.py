from django.urls import path
from . import views

app_name = 'moderation'

urlpatterns = [
    # Moderation queue
    path('queue/', views.ModerationQueueView.as_view(), name='queue'),
    path('moderate/<int:feedback_id>/', views.moderate_feedback, name='moderate_feedback'),
    
    # Filter rules
    path('filter-rules/', views.FilterRuleListView.as_view(), name='filter_rules'),
    path('filter-rules/create/', views.FilterRuleCreateView.as_view(), name='create_filter_rule'),
    path('filter-rules/<int:pk>/update/', views.FilterRuleUpdateView.as_view(), name='update_filter_rule'),
    path('filter-rules/<int:pk>/delete/', views.FilterRuleDeleteView.as_view(), name='delete_filter_rule'),
    path('filter-rules/<int:pk>/toggle/', views.toggle_filter_rule, name='toggle_filter_rule'),
]