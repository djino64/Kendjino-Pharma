from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AchatViewSet

router = DefaultRouter()
router.register('', AchatViewSet)
urlpatterns = [path('', include(router.urls))]