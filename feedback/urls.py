from django.urls import path
from . import views

app_name = 'feedback'

urlpatterns = [
    # Dashboard views
    path('student-dashboard/', views.StudentDashboardView.as_view(), name='student_dashboard'),
    path('faculty-dashboard/', views.FacultyDashboardView.as_view(), name='faculty_dashboard'),
    
    # Feedback views
    path('submit/', views.FeedbackCreateView.as_view(), name='feedback_create'),
    path('submit/<int:department_id>/', views.FeedbackCreateView.as_view(), name='feedback_create_department'),
    path('success/<str:hash_id>/', views.FeedbackSuccessView.as_view(), name='feedback_success'),
    path('detail/<str:hash_id>/', views.FeedbackDetailView.as_view(), name='feedback_detail'),
    
    # Reply views
    path('reply/<str:hash_id>/', views.add_reply, name='add_reply'),
    
    # Status update
    path('status/<str:hash_id>/', views.update_feedback_status, name='update_status'),
    
    # Tag views
    path('tags/', views.TagListView.as_view(), name='tag_list'),
    path('tags/create/', views.TagCreateView.as_view(), name='tag_create'),
    
    # AJAX views
    path('get-department-tags/', views.get_department_tags, name='get_department_tags'),
]