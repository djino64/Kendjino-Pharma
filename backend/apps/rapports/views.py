

"""
Rapports et statistiques du système de gestion pharmaceutique.
"""

import io
from datetime import timedelta, datetime

from django.db.models import Sum, Count, F
from django.utils import timezone
from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.ventes.models import Vente, LigneVente
from apps.produits.models import Produit
from apps.clients.models import Client
from apps.users.permissions import IsAdmin


# =========================================================
# DASHBOARD STATISTIQUES
# =========================================================
class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        month_start = today.replace(day=1)

        ventes_today = Vente.objects.filter(
            statut=Vente.VALIDEE,
            created_at__date=today
        )

        ventes_month = Vente.objects.filter(
            statut=Vente.VALIDEE,
            created_at__date__gte=month_start
        )

        # Derniers 30 jours
        last_30 = today - timedelta(days=29)
        ventes_30j = (
            Vente.objects.filter(
                statut=Vente.VALIDEE,
                created_at__date__gte=last_30
            )
            .values('created_at__date')
            .annotate(total=Sum('total'), count=Count('id'))
            .order_by('created_at__date')
        )

        return Response({
            "aujourd_hui": {
                "ventes": ventes_today.count(),
                "chiffre_affaires": ventes_today.aggregate(
                    total=Sum('total')
                )['total'] or 0,
            },
            "ce_mois": {
                "ventes": ventes_month.count(),
                "chiffre_affaires": ventes_month.aggregate(
                    total=Sum('total')
                )['total'] or 0,
            },
            "total_produits": Produit.objects.filter(est_actif=True).count(),
            "total_clients": Client.objects.count(),

            "alertes": {
                "rupture": Produit.objects.filter(
                    est_actif=True,
                    stock_actuel__lte=0
                ).count(),

                "stock_faible": Produit.objects.filter(
                    est_actif=True,
                    stock_actuel__gt=0,
                    stock_actuel__lte=F('stock_minimum')
                ).count(),

                "expires": Produit.objects.filter(
                    est_actif=True,
                    date_expiration__lt=today
                ).count(),

                "expire_bientot": Produit.objects.filter(
                    est_actif=True,
                    date_expiration__gte=today,
                    date_expiration__lte=today + timedelta(days=30)
                ).count(),
            },

            "ventes_30j": list(ventes_30j),

            "top_produits": list(
                LigneVente.objects.filter(
                    vente__statut=Vente.VALIDEE
                )
                .values('produit__nom_commercial')
                .annotate(
                    quantite=Sum('quantite'),
                    chiffre=Sum('sous_total')
                )
                .order_by('-quantite')[:8]
            ),
        })


# =========================================================
# RAPPORT VENTES
# =========================================================
class RapportVentesView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        date_debut = request.query_params.get(
            "date_debut",
            (timezone.now().date() - timedelta(days=30)).isoformat()
        )
        date_fin = request.query_params.get(
            "date_fin",
            timezone.now().date().isoformat()
        )
        fmt = request.query_params.get("format", "json")

        # conversion safe des dates
        date_debut = datetime.fromisoformat(date_debut).date()
        date_fin = datetime.fromisoformat(date_fin).date()

        ventes = Vente.objects.filter(
            statut=Vente.VALIDEE,
            created_at__date__gte=date_debut,
            created_at__date__lte=date_fin
        ).select_related("client", "vendeur").prefetch_related("lignes__produit")

        if fmt == "excel":
            return self._export_excel(ventes)

        if fmt == "pdf":
            return self._export_pdf(ventes)

        data = [
            {
                "numero": v.numero_facture,
                "date": v.created_at.strftime("%d/%m/%Y %H:%M"),
                "client": v.client.get_full_name() if v.client else "Client anonyme",
                "vendeur": v.vendeur.get_full_name() if v.vendeur else "",
                "total": str(v.total),
                "mode_paiement": v.mode_paiement,
            }
            for v in ventes
        ]

        return Response({
            "ventes": data,
            "total": ventes.aggregate(total=Sum('total'))['total'] or 0
        })

    # =====================================================
    # EXPORT EXCEL
    # =====================================================
    def _export_excel(self, ventes):
        from openpyxl import Workbook

        wb = Workbook()
        ws = wb.active
        ws.title = "Rapport Ventes"

        ws.append(["N° Facture", "Date", "Client", "Vendeur", "Total", "Paiement"])

        for v in ventes:
            ws.append([
                v.numero_facture,
                v.created_at.strftime("%d/%m/%Y %H:%M"),
                v.client.get_full_name() if v.client else "Anonyme",
                v.vendeur.get_full_name() if v.vendeur else "",
                float(v.total),
                v.mode_paiement,
            ])

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)

        response = HttpResponse(
            buffer.read(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="rapport_ventes.xlsx"'
        return response

    # =====================================================
    # EXPORT PDF
    # =====================================================
    def _export_pdf(self, ventes):
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas

        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)

        width, height = A4

        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, height - 50, "Rapport des Ventes")

        c.setFont("Helvetica", 10)
        y = height - 90

        c.drawString(50, y, "Facture")
        c.drawString(150, y, "Date")
        c.drawString(260, y, "Client")
        c.drawString(420, y, "Total")

        y -= 20

        for v in ventes:
            if y < 50:
                c.showPage()
                y = height - 50

            c.drawString(50, y, v.numero_facture)
            c.drawString(150, y, v.created_at.strftime("%d/%m/%Y"))
            c.drawString(260, y, (v.client.get_full_name() if v.client else "Anonyme")[:25])
            c.drawString(420, y, f"{v.total:,.2f}")

            y -= 18

        c.save()
        buffer.seek(0)

        response = HttpResponse(buffer.read(), content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="rapport_ventes.pdf"'
        return response