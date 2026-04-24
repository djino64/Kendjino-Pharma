from rest_framework import serializers
from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = '__all__'

    def get_full_name(self, obj):
        return obj.get_full_name()