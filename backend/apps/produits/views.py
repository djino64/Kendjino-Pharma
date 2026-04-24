# pylint: disable=no-member

from datetime import timedelta

from django.utils import timezone
from django.db.models import F, Q

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Produit, Categorie
from .serializers import (
    ProduitSerializer,
    ProduitPOSSerializer,
    CategorieSerializer
)
from apps.users.permissions import IsAdmin, IsAdminOrGestionnaire


class CategorieViewSet(viewsets.ModelViewSet):
    """CRUD des catégories de produits."""

    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    permission_classes = [IsAuthenticated]


class ProduitViewSet(viewsets.ModelViewSet):
    """Gestion des produits (stock pharmacie + POS + alertes)."""

    queryset = Produit.objects.select_related(
        'categorie',
        'fournisseur'
    ).filter(est_actif=True)

    serializer_class = ProduitSerializer
    permission_classes = [IsAuthenticated]

    filterset_fields = ['categorie', 'fournisseur', 'est_actif']
    search_fields = ['nom_commercial', 'nom_generique', 'code_barres']
    ordering_fields = ['nom_commercial', 'stock_actuel', 'prix_vente', 'date_expiration']

    def get_serializer_class(self):
        """Retourne serializer adapté selon l'action."""
        if self.action == 'pos_search':
            return ProduitPOSSerializer
        return ProduitSerializer

    @action(detail=False, methods=['get'], url_path='pos-search')
    def pos_search(self, request):
        """Recherche rapide pour caisse (POS)."""
        q = request.query_params.get('q', '')

        qs = self.get_queryset()

        if q:
            qs = qs.filter(
                Q(nom_commercial__icontains=q) |
                Q(code_barres__icontains=q)
            )

        qs = qs[:20]
        serializer = ProduitPOSSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='alertes')
    def alertes(self, request):
        """Statistiques alertes stock et expiration."""
        now = timezone.now().date()
        expiration_limit = now + timedelta(days=30)

        expires = Produit.objects.filter(
            est_actif=True,
            date_expiration__lt=now
        ).count()

        expire_bientot = Produit.objects.filter(
            est_actif=True,
            date_expiration__gte=now,
            date_expiration__lte=expiration_limit
        ).count()

        rupture = Produit.objects.filter(
            est_actif=True,
            stock_actuel__lte=0
        ).count()

        stock_faible = Produit.objects.filter(
            est_actif=True,
            stock_actuel__gt=0,
            stock_actuel__lte=F('stock_minimum')
        ).count()

        return Response({
            'expires': expires,
            'expire_bientot': expire_bientot,
            'rupture': rupture,
            'stock_faible': stock_faible,
        })

    @action(detail=False, methods=['get'], url_path='expires')
    def expires(self, request):
        """Produits expirés."""
        now = timezone.now().date()

        qs = Produit.objects.filter(
            est_actif=True,
            date_expiration__lt=now
        )

        serializer = ProduitSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='expire-bientot')
    def expire_bientot(self, request):
        """Produits proches expiration (30 jours)."""
        now = timezone.now().date()
        limit = now + timedelta(days=30)

        qs = Produit.objects.filter(
            est_actif=True,
            date_expiration__gte=now,
            date_expiration__lte=limit
        )

        serializer = ProduitSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='stock-faible')
    def stock_faible(self, request):
        """Produits en stock faible."""
        qs = Produit.objects.filter(
            est_actif=True,
            stock_actuel__lte=F('stock_minimum')
        )

        serializer = ProduitSerializer(qs, many=True)
        return Response(serializer.data)