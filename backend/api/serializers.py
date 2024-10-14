
from rest_framework import serializers
from .models import Cliente, Articulo

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class ArticuloSerializer(serializers.ModelSerializer):
    precio = serializers.FloatField()

    class Meta:
        model = Articulo
        fields = '__all__'
