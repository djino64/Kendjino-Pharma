from django.contrib import admin
from .models import Rapport

# Register your models here.
@admin.register(Rapport)
class RapportAdmin(admin.ModelAdmin):
    list_display = ('type', 'date_debut', 'date_fin', 'cree_le')
    list_filter = ('type',)