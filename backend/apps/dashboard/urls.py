from django.urls import path
#from .views import dashboard_stats
from .views import dashboard_stats
from django.contrib import admin
from apps.dashboard.views import dashboard_stats

from apps.dashboard.views import dashboard_stats

urlpatterns = [
    #path('stats/', dashboard_stats),
    path('stats/', dashboard_stats),
]