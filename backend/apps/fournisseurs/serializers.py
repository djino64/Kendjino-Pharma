from rest_framework import serializers
from .models import Fournisseur


class FournisseurSerializer(serializers.ModelSerializer):
    nb_produits = serializers.SerializerMethodField()

    class Meta:
        model = Fournisseur
        fields = '__all__'

    def get_nb_produits(self, obj):
        return obj.produits.count()