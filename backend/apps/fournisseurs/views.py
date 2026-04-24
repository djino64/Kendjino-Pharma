from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Fournisseur
from .serializers import FournisseurSerializer
from apps.users.permissions import IsAdminOrGestionnaire


class FournisseurViewSet(viewsets.ModelViewSet):
    """
    Gestion des fournisseurs
    """
    queryset = Fournisseur.objects.all()
    serializer_class = FournisseurSerializer
    permission_classes = [IsAuthenticated]

    search_fields = ['nom', 'telephone', 'email']
    ordering_fields = ['nom', 'created_at']