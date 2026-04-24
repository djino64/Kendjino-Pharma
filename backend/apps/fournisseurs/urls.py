from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FournisseurViewSet

router = DefaultRouter()
router.register('', FournisseurViewSet)
urlpatterns = [path('', include(router.urls))]