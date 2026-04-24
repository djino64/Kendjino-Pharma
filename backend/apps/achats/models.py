# pylint: disable=no-member

from decimal import Decimal
from django.db import models
from django.utils import timezone


class Achat(models.Model):
    EN_COURS = 'en_cours'
    RECU = 'recu'
    ANNULE = 'annule'

    STATUT_CHOICES = [
        (EN_COURS, 'En cours'),
        (RECU, 'Reçu'),
        (ANNULE, 'Annulé'),
    ]

    numero_bon = models.CharField(max_length=50, unique=True, blank=True, null=True)

    fournisseur = models.ForeignKey(
        'fournisseurs.Fournisseur',
        on_delete=models.PROTECT,
        related_name='achats'
    )

    responsable = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='achats'
    )

    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default=EN_COURS
    )

    notes = models.TextField(blank=True)

    date_commande = models.DateTimeField(default=timezone.now)
    date_reception = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'achats'
        verbose_name = 'Achat'
        ordering = ['-date_commande']

    def save(self, *args, **kwargs):
        if not self.numero_bon:
            prefix = timezone.now().strftime('%Y%m')
            last = Achat.objects.filter(
                numero_bon__startswith=f'AC-{prefix}'
            ).order_by('-id').first()

            seq = 1
            if last and last.numero_bon:
                try:
                    seq = int(last.numero_bon.split('-')[-1]) + 1
                except (ValueError, IndexError):
                    seq = 1

            self.numero_bon = f"AC-{prefix}-{seq:04d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return str(self.numero_bon)


class LigneAchat(models.Model):
    achat = models.ForeignKey(Achat, on_delete=models.CASCADE, related_name='lignes')
    produit = models.ForeignKey('produits.Produit', on_delete=models.PROTECT)
    quantite = models.PositiveIntegerField()
    prix_unitaire = models.DecimalField(max_digits=12, decimal_places=2)
    sous_total = models.DecimalField(max_digits=12, decimal_places=2)
    date_expiration = models.DateField(null=True, blank=True)
    numero_lot = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = 'lignes_achat'

    def save(self, *args, **kwargs):
        self.sous_total = Decimal(self.quantite) * self.prix_unitaire
        super().save(*args, **kwargs)