# pylint: disable=no-member

"""
Dashboard API views.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.produits.models import Produit
from apps.ventes.models import Vente


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):  # pylint: disable=unused-argument
    """Retourne les statistiques principales du dashboard."""

    total_produits = Produit.objects.count()
    total_ventes = Vente.objects.count()
    total_revenus = sum(v.total for v in Vente.objects.all())

    return Response({
        "total_produits": total_produits,
        "total_ventes": total_ventes,
        "total_revenus": total_revenus,
    })