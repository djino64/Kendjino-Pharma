from rest_framework import serializers
from .models import Produit, Categorie


class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = '__all__'


class ProduitSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    fournisseur_nom = serializers.CharField(source='fournisseur.nom', read_only=True)
    est_en_rupture = serializers.BooleanField(read_only=True)
    est_stock_faible = serializers.BooleanField(read_only=True)
    est_expire = serializers.BooleanField(read_only=True)
    expire_bientot = serializers.BooleanField(read_only=True)

    class Meta:
        model = Produit
        fields = '__all__'


class ProduitPOSSerializer(serializers.ModelSerializer):
    """Serializer léger pour le POS."""
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)

    class Meta:
        model = Produit
        fields = ['id', 'nom_commercial', 'nom_generique', 'code_barres',
                  'prix_vente', 'stock_actuel', 'categorie_nom', 'est_en_rupture']