from django.db import models

class Rapport(models.Model):
    TYPE_CHOICES = [
        ("ventes", "Ventes"),
        ("stock", "Stock"),
    ]

    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    date_debut = models.DateField()
    date_fin = models.DateField()
    cree_le = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} ({self.date_debut} → {self.date_fin})"