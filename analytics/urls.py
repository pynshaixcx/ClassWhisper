from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    # Dashboard
    path('dashboard/', views.dashboard, name='dashboard'),
    
    # Widget management
    path('widgets/create/', views.WidgetCreateView.as_view(), name='create_widget'),
    path('widgets/<int:pk>/update/', views.WidgetUpdateView.as_view(), name='update_widget'),
    path('widgets/<int:pk>/delete/', views.WidgetDeleteView.as_view(), name='delete_widget'),
    path('widgets/reorder/', views.reorder_widgets, name='reorder_widgets'),
    
    # Reports
    path('reports/', views.ReportListView.as_view(), name='report_list'),
    path('reports/create/', views.ReportCreateView.as_view(), name='create_report'),
    path('reports/<int:pk>/', views.ReportDetailView.as_view(), name='report_detail'),
    path('reports/<int:pk>/export/', views.export_report, name='export_report'),
]