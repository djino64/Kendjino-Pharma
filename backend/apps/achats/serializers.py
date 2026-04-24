# pylint: disable=no-member

from decimal import Decimal

from django.db import transaction

from rest_framework import serializers

from .models import Achat, LigneAchat
from apps.produits.models import Produit
from apps.fournisseurs.models import Fournisseur


class LigneAchatSerializer(serializers.ModelSerializer):
    """Serializer des lignes d'achat"""

    produit_nom = serializers.CharField(
        source='produit.nom_commercial',
        read_only=True
    )

    class Meta:
        model = LigneAchat
        fields = '__all__'
        read_only_fields = ['sous_total']


class LigneAchatInputSerializer(serializers.Serializer):
    """Input des lignes d'achat"""

    produit = serializers.PrimaryKeyRelatedField(queryset=Produit.objects.all())
    quantite = serializers.IntegerField(min_value=1)
    prix_unitaire = serializers.DecimalField(max_digits=12, decimal_places=2)
    date_expiration = serializers.DateField(required=False, allow_null=True)
    numero_lot = serializers.CharField(required=False, allow_blank=True)


class AchatSerializer(serializers.ModelSerializer):
    """Serializer affichage achat"""

    lignes = LigneAchatSerializer(many=True, read_only=True)
    fournisseur_nom = serializers.CharField(source='fournisseur.nom', read_only=True)
    responsable_nom = serializers.CharField(source='responsable.get_full_name', read_only=True)

    class Meta:
        model = Achat
        fields = '__all__'
        read_only_fields = ['numero_bon', 'total']


class CreateAchatSerializer(serializers.Serializer):
    """Serializer création achat"""

    fournisseur = serializers.PrimaryKeyRelatedField(
        queryset=Fournisseur.objects.all()
    )

    lignes = LigneAchatInputSerializer(many=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    statut = serializers.ChoiceField(
        choices=Achat.STATUT_CHOICES,
        default=Achat.EN_COURS
    )

    @transaction.atomic
    def create(self, validated_data):
        request = self.context['request']
        lignes_data = validated_data.pop('lignes')

        total = sum(
            Decimal(l['quantite']) * l['prix_unitaire']
            for l in lignes_data
        )

        achat = Achat.objects.create(
            fournisseur=validated_data['fournisseur'],
            responsable=request.user,
            total=total,
            notes=validated_data.get('notes', ''),
            statut=validated_data.get('statut', Achat.EN_COURS),
        )

        statut = validated_data.get('statut', Achat.EN_COURS)

        for ligne_data in lignes_data:
            produit = ligne_data['produit']

            LigneAchat.objects.create(
                achat=achat,
                produit=produit,
                quantite=ligne_data['quantite'],
                prix_unitaire=ligne_data['prix_unitaire'],
                date_expiration=ligne_data.get('date_expiration'),
                numero_lot=ligne_data.get('numero_lot', ''),
            )

            # mise à jour stock si RECU
            if statut == Achat.RECU:
                produit.stock_actuel += ligne_data['quantite']

                if ligne_data.get('date_expiration'):
                    produit.date_expiration = ligne_data['date_expiration']

                if ligne_data.get('numero_lot'):
                    produit.numero_lot = ligne_data['numero_lot']

                produit.prix_achat = ligne_data['prix_unitaire']
                produit.save()

        return achat