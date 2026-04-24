from rest_framework import serializers
from .models import Ordonnance


class OrdonnanceSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.get_full_name', read_only=True)

    class Meta:
        model = Ordonnance
        fields = '__all__'