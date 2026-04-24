from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import F

from .models import Achat
from .serializers import AchatSerializer, CreateAchatSerializer


class AchatViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les achats (CRUD + réception + filtres)
    """

    queryset = (
        Achat.objects
        .select_related('fournisseur', 'responsable')
        .prefetch_related('lignes__produit')
        .all()
    )

    permission_classes = [IsAuthenticated]

    filterset_fields = ['statut', 'fournisseur']
    search_fields = ['numero_bon', 'fournisseur__nom']
    ordering_fields = ['date_commande', 'total']

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateAchatSerializer
        return AchatSerializer

    def create(self, request, *args, **kwargs):
        serializer = CreateAchatSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        achat = serializer.save()

        return Response(
            AchatSerializer(achat).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], url_path='recevoir')
    def recevoir(self, request, pk=None):
        """
        Marquer un achat comme reçu et mettre à jour le stock
        """
        achat = self.get_object()

        if achat.statut == Achat.RECU:
            return Response(
                {'detail': 'Achat déjà reçu.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        achat.statut = Achat.RECU
        achat.date_reception = timezone.now()
        achat.save()

        for ligne in achat.lignes.select_related('produit').all():
            produit = ligne.produit
            produit.stock_actuel += ligne.quantite

            if ligne.date_expiration:
                produit.date_expiration = ligne.date_expiration

            if ligne.numero_lot:
                produit.numero_lot = ligne.numero_lot

            produit.prix_achat = ligne.prix_unitaire
            produit.save()

        return Response(AchatSerializer(achat).data)