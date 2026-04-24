from django.db import models
from django.utils import timezone


class Categorie(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        verbose_name = 'Catégorie'

    def __str__(self):
        return f"{self.nom}"


class Produit(models.Model):
    nom_commercial = models.CharField(max_length=200)
    nom_generique = models.CharField(max_length=200, blank=True)
    categorie = models.ForeignKey(Categorie, on_delete=models.SET_NULL, null=True, related_name='produits')
    code_barres = models.CharField(max_length=100, unique=True, blank=True, null=True)
    prix_achat = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    prix_vente = models.DecimalField(max_digits=12, decimal_places=2)
    stock_actuel = models.IntegerField(default=0)
    stock_minimum = models.IntegerField(default=10)
    date_expiration = models.DateField(null=True, blank=True)
    numero_lot = models.CharField(max_length=100, blank=True)
    fournisseur = models.ForeignKey(
        'fournisseurs.Fournisseur', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='produits'
    )
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='produits/', null=True, blank=True)
    est_actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'produits'
        verbose_name = 'Produit'
        ordering = ['nom_commercial']

    def __str__(self):
        #return self.nom_commercial
        return f"{self.nom_commercial}"

    @property
    def est_en_rupture(self):
        return self.stock_actuel <= 0

    @property
    def est_stock_faible(self):
        return 0 < self.stock_actuel <= self.stock_minimum

    @property
    def est_expire(self):
        if self.date_expiration:
            return self.date_expiration < timezone.now().date()
        return False

    @property
    def expire_bientot(self):
        if self.date_expiration:
            from datetime import timedelta
            delta = self.date_expiration - timezone.now().date()
            return timedelta(days=0) <= (self.date_expiration - timezone.now().date()) <= timedelta(days=30)
        return False