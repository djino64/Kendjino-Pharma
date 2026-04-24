from django.contrib.auth import authenticate, get_user_model
from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import models

from .models import OTPCode, AuditLog
from .serializers import (
    UserSerializer,
    LoginSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    AuditLogSerializer,
)
from .services import generate_otp, send_otp_email, log_action
from .permissions import IsAdmin

User = get_user_model()


# =========================
# LOGIN
# =========================
class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )

        if not user:
            return Response(
                {"detail": "Identifiants invalides."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"detail": "Compte désactivé."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        log_action(user, "LOGIN", ip=request.META.get("REMOTE_ADDR"))

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            }
        )


# =========================
# LOGOUT
# =========================
class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data["refresh"])
            token.blacklist()

            log_action(request.user, "LOGOUT", ip=request.META.get("REMOTE_ADDR"))
            return Response({"detail": "Déconnexion réussie."})

        except Exception:
            return Response(
                {"detail": "Token invalide."},
                status=status.HTTP_400_BAD_REQUEST,
            )


# =========================
# PASSWORD RESET REQUEST
# =========================
class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        user = User.objects.filter(email=email).first()
        if user:
            code = generate_otp(user)
            send_otp_email(user, code)

        return Response(
            {"detail": "Si cet email existe, un OTP a été envoyé."}
        )


# =========================
# PASSWORD RESET CONFIRM
# =========================
class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        otp_code = serializer.validated_data["otp"]
        new_password = serializer.validated_data["new_password"]

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"detail": "OTP invalide."}, status=400)

        otp = (
            OTPCode.objects.filter(user=user, code=otp_code)
            .order_by("-created_at")
            .first()
        )

        if not otp or not otp.is_valid():
            return Response(
                {"detail": "OTP expiré ou déjà utilisé."},
                status=400,
            )

        user.set_password(new_password)
        user.save()

        otp.is_used = True
        otp.save()

        return Response({"detail": "Mot de passe réinitialisé avec succès."})


# =========================
# ME
# =========================
class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


# =========================
# USERS CRUD
# =========================
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ["role", "is_active"]
    search_fields = ["first_name", "last_name", "email"]


# =========================
# AUDIT LOG
# =========================
class AuditLogListView(generics.ListAPIView):
    queryset = AuditLog.objects.select_related("user").all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ["model_name", "user"]
    search_fields = ["action", "model_name"]