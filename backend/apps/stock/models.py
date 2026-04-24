from django.db import models


class MouvementStock(models.Model):
    ENTREE = 'entree'
    SORTIE = 'sortie'
    AJUSTEMENT = 'ajustement'
    TYPE_CHOICES = [
        (ENTREE, 'Entrée'),
        (SORTIE, 'Sortie'),
        (AJUSTEMENT, 'Ajustement'),
    ]

    produit = models.ForeignKey('produits.Produit', on_delete=models.CASCADE, related_name='mouvements')
    type_mouvement = models.CharField(max_length=20, choices=TYPE_CHOICES)
    quantite = models.IntegerField()
    stock_avant = models.IntegerField()
    stock_apres = models.IntegerField()
    motif = models.CharField(max_length=255, blank=True)
    reference = models.CharField(max_length=50, blank=True)  # num facture ou bon achat
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'mouvements_stock'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type_mouvement} {self.produit} x{self.quantite}"