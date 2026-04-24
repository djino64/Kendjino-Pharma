from django.db import models


class Client(models.Model):
    nom = models.CharField(max_length=200)
    prenom = models.CharField(max_length=200, blank=True)
    telephone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    adresse = models.TextField(blank=True)
    entreprise = models.CharField(max_length=200, blank=True)
    points_fidelite = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'clients'
        verbose_name = 'Client'
        ordering = ['nom']

    def get_full_name(self):
        return f"{self.prenom} {self.nom}".strip()

    def __str__(self):
        return self.get_full_name()