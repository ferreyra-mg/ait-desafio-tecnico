# tests/test_cliente_model.py
from django.forms import ValidationError
import pytest
from api.models import Cliente

@pytest.fixture
def cliente():
    """
    Fixture para crear un cliente de prueba.
    """
    return Cliente.objects.create(nombre='Cliente de Pruebas')

@pytest.mark.django_db
def test_cliente_creation(cliente):
    """
    Pruebamos que el cliente se creó correctamente.
    """
    assert cliente.nombre == 'Cliente de Pruebas'

@pytest.mark.django_db
def test_cliente_str_method(cliente):
    """
    Pruebamos que el método __str__ devuelve el nombre del cliente.
    """
    assert str(cliente) == 'Cliente de Pruebas'

@pytest.mark.django_db
def test_cliente_unique_name():
    """
    Pruebamos que lanza una excepción al intentar crear otro cliente con el mismo nombre.
    """
    Cliente.objects.create(nombre='Cliente de Pruebas')
    with pytest.raises(Exception):
        Cliente.objects.create(nombre='Cliente de Pruebas')

@pytest.mark.django_db
def test_cliente_creation_without_name():
    """
    Pruebamos que lanza una excepción al intentar crear un cliente sin proporcionar un nombre.
    """
    cliente = Cliente()
    with pytest.raises(ValidationError):
        # Lanzamos manualmente la validación del modelo
        cliente.full_clean()
