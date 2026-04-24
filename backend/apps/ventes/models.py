"""
Modèles du module ventes.
"""

from django.db import models
from django.utils import timezone


class Vente(models.Model):
    """Modèle de vente."""

    EN_ATTENTE = "en_attente"
    VALIDEE = "validee"
    ANNULEE = "annulee"

    STATUT_CHOICES = [
        (EN_ATTENTE, "En attente"),
        (VALIDEE, "Validée"),
        (ANNULEE, "Annulée"),
    ]

    ESPECES = "especes"
    MODE_CHOICES = [(ESPECES, "Espèces HTG")]

    numero_facture = models.CharField(max_length=30, unique=True, blank=True)

    client = models.ForeignKey(
        "clients.Client",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ventes",
    )

    ordonnance = models.ForeignKey(
        "ordonnances.Ordonnance",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ventes",
    )

    vendeur = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="ventes",
    )

    sous_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    remise_type = models.CharField(
        max_length=10,
        choices=[("pct", "Pourcentage"), ("montant", "Montant")],
        default="pct",
    )
    remise_valeur = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    remise_montant = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    montant_recu = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    monnaie_rendue = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    mode_paiement = models.CharField(max_length=20, choices=MODE_CHOICES, default=ESPECES)

    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default=VALIDEE)

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "ventes"
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.numero_facture:
            self.numero_facture = self.generate_invoice_number()
        super().save(*args, **kwargs)

    @staticmethod
    def generate_invoice_number():
        from django.utils import timezone

        prefix = timezone.now().strftime("%Y%m")

        last = Vente.objects.filter(
            numero_facture__startswith=f"KP-{prefix}"
        ).order_by("-id").first()

        seq = 1
        if last and last.numero_facture:
            try:
                seq = int(last.numero_facture.split("-")[-1]) + 1
            except (ValueError, IndexError):
                seq = 1

        return f"KP-{prefix}-{seq:04d}"


class LigneVente(models.Model):
    """Lignes de vente."""

    vente = models.ForeignKey(Vente, on_delete=models.CASCADE, related_name="lignes")
    produit = models.ForeignKey("produits.Produit", on_delete=models.PROTECT, related_name="lignes_vente")

    nom_produit = models.CharField(max_length=200)
    quantite = models.PositiveIntegerField()
    prix_unitaire = models.DecimalField(max_digits=12, decimal_places=2)
    sous_total = models.DecimalField(max_digits=12, decimal_places=2)

    def save(self, *args, **kwargs):
        self.sous_total = self.quantite * self.prix_unitaire
        super().save(*args, **kwargs)