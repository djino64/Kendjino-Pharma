from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Ordonnance
from .serializers import OrdonnanceSerializer


class OrdonnanceViewSet(viewsets.ModelViewSet):
    """CRUD des ordonnances"""

    queryset = Ordonnance.objects.select_related('client').all()
    serializer_class = OrdonnanceSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['client']
    search_fields = ['medecin', 'notes']
    ordering_fields = ['created_at']