"""
Serializers du module ventes
"""

from django.db import transaction
from rest_framework import serializers

from .models import Vente, LigneVente
from apps.produits.models import Produit
from apps.clients.models import Client
from apps.ordonnances.models import Ordonnance


class LigneVenteSerializer(serializers.ModelSerializer):
    """Serializer lecture des lignes de vente."""

    produit_nom = serializers.CharField(
        source="produit.nom_commercial",
        read_only=True
    )

    class Meta:
        model = LigneVente
        fields = [
            "id",
            "produit",
            "produit_nom",
            "nom_produit",
            "quantite",
            "prix_unitaire",
            "sous_total",
        ]
        read_only_fields = ["sous_total", "nom_produit"]


class LigneVenteInputSerializer(serializers.Serializer):
    """Serializer input pour création ligne de vente."""

    produit = serializers.PrimaryKeyRelatedField(
        queryset=Produit.objects.all()
    )
    quantite = serializers.IntegerField(min_value=1)
    prix_unitaire = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )


class VenteSerializer(serializers.ModelSerializer):
    """Serializer principal Vente."""

    lignes = LigneVenteSerializer(many=True, read_only=True)

    client_nom = serializers.CharField(
        source="client.get_full_name",
        read_only=True
    )

    vendeur_nom = serializers.CharField(
        source="vendeur.get_full_name",
        read_only=True
    )

    vendeur_role = serializers.CharField(
        source="vendeur.get_role_display",
        read_only=True
    )

    class Meta:
        model = Vente
        fields = "__all__"
        read_only_fields = [
            "numero_facture",
            "sous_total",
            "remise_montant",
            "total",
            "monnaie_rendue",
            "created_at",
        ]


class CreateVenteSerializer(serializers.Serializer):
    """Serializer création vente complète."""

    client = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(),
        required=False,
        allow_null=True
    )

    ordonnance = serializers.PrimaryKeyRelatedField(
        queryset=Ordonnance.objects.all(),
        required=False,
        allow_null=True
    )

    lignes = LigneVenteInputSerializer(many=True)

    remise_type = serializers.ChoiceField(
        choices=[("pct", "Pourcentage"), ("montant", "Montant")],
        default="pct"
    )

    remise_valeur = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    montant_recu = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    notes = serializers.CharField(
        required=False,
        allow_blank=True
    )

    @transaction.atomic
    def create(self, validated_data):
        from apps.users.services import log_action

        request = self.context["request"]
        lignes_data = validated_data.pop("lignes")

        sous_total = sum(
            item["quantite"] * item["prix_unitaire"]
            for item in lignes_data
        )

        remise_type = validated_data.get("remise_type", "pct")
        remise_valeur = validated_data.get("remise_valeur", 0)

        if remise_type == "pct":
            remise_montant = sous_total * remise_valeur / 100
        else:
            remise_montant = remise_valeur

        total = max(sous_total - remise_montant, 0)
        montant_recu = validated_data["montant_recu"]
        monnaie_rendue = montant_recu - total

        vente = Vente.objects.create(
            vendeur=request.user,
            client=validated_data.get("client"),
            ordonnance=validated_data.get("ordonnance"),
            sous_total=sous_total,
            remise_type=remise_type,
            remise_valeur=remise_valeur,
            remise_montant=remise_montant,
            total=total,
            montant_recu=montant_recu,
            monnaie_rendue=monnaie_rendue,
            notes=validated_data.get("notes", ""),
        )

        for item in lignes_data:
            produit = item["produit"]
            quantite = item["quantite"]

            LigneVente.objects.create(
                vente=vente,
                produit=produit,
                nom_produit=produit.nom_commercial,
                quantite=quantite,
                prix_unitaire=item["prix_unitaire"],
            )

            produit.stock_actuel -= quantite
            produit.save()

        log_action(
            request.user,
            "CREATE_VENTE",
            "Vente",
            vente.id,
            {
                "numero": vente.numero_facture,
                "total": str(total),
            },
            ip=request.META.get("REMOTE_ADDR"),
        )

        return vente