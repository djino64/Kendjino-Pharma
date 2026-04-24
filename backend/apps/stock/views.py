"""
API mouvements de stock
"""

# pylint: disable=no-member

from rest_framework import viewsets, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import MouvementStock
from apps.produits.models import Produit


class MouvementStockSerializer(serializers.ModelSerializer):
    """Serializer des mouvements de stock."""

    produit_nom = serializers.CharField(source='produit.nom_commercial', read_only=True)
    user_nom = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = MouvementStock
        fields = '__all__'


class AjustementSerializer(serializers.Serializer):
    """Serializer pour ajustement de stock."""

    produit = serializers.PrimaryKeyRelatedField(queryset=Produit.objects.all())
    quantite = serializers.IntegerField()
    motif = serializers.CharField()


class MouvementStockViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet mouvements de stock."""

    queryset = MouvementStock.objects.select_related('produit', 'user').all()
    serializer_class = MouvementStockSerializer
    permission_classes = [IsAuthenticated]

    filterset_fields = ['type_mouvement', 'produit']
    search_fields = ['produit__nom_commercial', 'motif', 'reference']

    @action(detail=False, methods=['post'], url_path='ajuster')
    def ajuster(self, request):
        """Ajustement manuel du stock."""

        serializer = AjustementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        produit = serializer.validated_data['produit']
        quantite = serializer.validated_data['quantite']
        motif = serializer.validated_data['motif']

        stock_avant = produit.stock_actuel
        produit.stock_actuel += quantite
        produit.save()

        MouvementStock.objects.create(
            produit=produit,
            type_mouvement=MouvementStock.AJUSTEMENT,
            quantite=quantite,
            stock_avant=stock_avant,
            stock_apres=produit.stock_actuel,
            motif=motif,
            user=request.user,
        )

        return Response({
            "detail": "Stock ajusté",
            "stock_actuel": produit.stock_actuel
        })