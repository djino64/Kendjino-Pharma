from django.db import models


class Ordonnance(models.Model):
    client = models.ForeignKey(
        'clients.Client', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='ordonnances'
    )
    medecin = models.CharField(max_length=200, blank=True)
    fichier = models.FileField(upload_to='ordonnances/')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ordonnances'
        verbose_name = 'Ordonnance'
        ordering = ['-created_at']

    def __str__(self):
        return f"Ordonnance #{self.pk} — {self.client}"