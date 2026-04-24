from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register('users', views.UserViewSet)

urlpatterns = [
    path('login/', views.LoginView.as_view()),
    path('logout/', views.LogoutView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('me/', views.MeView.as_view()),
    path('password/reset/', views.PasswordResetRequestView.as_view()),
    path('password/reset/confirm/', views.PasswordResetConfirmView.as_view()),
    path('audit-logs/', views.AuditLogListView.as_view()),
    path('', include(router.urls)),
]