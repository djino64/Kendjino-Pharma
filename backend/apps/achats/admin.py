from django.contrib import admin
from .models import Achat, LigneAchat


class LigneAchatInline(admin.TabularInline):
    model = LigneAchat
    extra = 0


@admin.register(Achat)
class AchatAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'numero_bon',
        'fournisseur',
        'responsable',
        'total',
        'statut',
        'date_commande',
        'date_reception',
    )

    search_fields = (
        'numero_bon',
        'fournisseur__nom',
        'responsable__email',
    )

    list_filter = (
        'statut',
        'date_commande',
        'date_reception',
    )

    ordering = ('-date_commande',)

    inlines = [LigneAchatInline]


@admin.register(LigneAchat)
class LigneAchatAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'achat',
        'produit',
        'quantite',
        'prix_unitaire',
        'sous_total',
        'numero_lot',
        'date_expiration',
    )

    search_fields = (
        'achat__numero_bon',
        'produit__nom',
        'numero_lot',
    )