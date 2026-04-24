from django.urls import path
from .views import DashboardStatsView, RapportVentesView

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('ventes/', RapportVentesView.as_view(), name='rapport-ventes'),
]