from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta

from .models import Vente, LigneVente
from .serializers import VenteSerializer, CreateVenteSerializer
from apps.users.permissions import IsAdmin, IsVendeur
from apps.users.models import User


class VenteViewSet(viewsets.ModelViewSet):
    queryset = Vente.objects.select_related('client', 'vendeur', 'ordonnance').prefetch_related('lignes__produit').all()
    permission_classes = [IsAuthenticated]
    filterset_fields = ['statut', 'mode_paiement', 'vendeur', 'client']
    search_fields = ['numero_facture', 'client__nom']
    ordering_fields = ['created_at', 'total']

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateVenteSerializer
        return VenteSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == User.VENDEUR:
            qs = qs.filter(vendeur=user)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = CreateVenteSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        vente = serializer.save()
        return Response(VenteSerializer(vente).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        today = timezone.now().date()
        month_start = today.replace(day=1)

        stats = {
            'ventes_aujourd_hui': Vente.objects.filter(
                statut=Vente.VALIDEE,
                created_at__date=today
            ).aggregate(count=Count('id'), total=Sum('total')),
            'ventes_ce_mois': Vente.objects.filter(
                statut=Vente.VALIDEE,
                created_at__date__gte=month_start
            ).aggregate(count=Count('id'), total=Sum('total')),
            'top_produits': list(
                LigneVente.objects.filter(vente__statut=Vente.VALIDEE)
                .values('produit__nom_commercial')
                .annotate(total_vendu=Sum('quantite'), chiffre=Sum('sous_total'))
                .order_by('-total_vendu')[:10]
            ),
        }
        return Response(stats)