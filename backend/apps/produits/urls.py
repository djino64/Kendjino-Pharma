from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('categories', views.CategorieViewSet)
router.register('', views.ProduitViewSet)

urlpatterns = [path('', include(router.urls))]