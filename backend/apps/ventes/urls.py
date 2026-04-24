from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VenteViewSet

router = DefaultRouter()
router.register('', VenteViewSet)
urlpatterns = [path('', include(router.urls))]