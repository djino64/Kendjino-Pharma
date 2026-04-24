from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrdonnanceViewSet

router = DefaultRouter()
router.register('', OrdonnanceViewSet)
urlpatterns = [path('', include(router.urls))]