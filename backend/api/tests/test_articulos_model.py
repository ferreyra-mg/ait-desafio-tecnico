import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from api.models import Articulo, Cliente

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def cliente():
    return Cliente.objects.create(nombre='Cliente de Pruebas')

@pytest.fixture
def articulo_data(cliente):
    return {
        'cliente': cliente.id,  
        'codigo': 'COD-001-1',
        'descripcion': 'Articulo de Prueba',
        'precio': 10.00,
    }

@pytest.fixture
def articulo(articulo_data):
    cliente_instance = Cliente.objects.get(id=articulo_data['cliente'])
    articulo_data['cliente'] = cliente_instance
    return Articulo.objects.create(**articulo_data)

@pytest.mark.django_db
def test_list_articulos(api_client, articulo):
    url = reverse('articulo-list')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['codigo'] == articulo.codigo

@pytest.mark.django_db
def test_create_articulo(api_client, articulo_data):
    url = reverse('articulo-list')
    response = api_client.post(url, articulo_data, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert Articulo.objects.count() == 1
    assert Articulo.objects.get().codigo == articulo_data['codigo']

@pytest.mark.django_db
def test_retrieve_articulo(api_client, articulo):
    url = reverse('articulo-detail', kwargs={'pk': articulo.id})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['codigo'] == articulo.codigo

@pytest.mark.django_db
def test_update_articulo(api_client, articulo):
    updated_data = {
        'cliente': articulo.cliente.id,  
        'codigo': 'CAD-222-111',
        'descripcion': 'NUEVA DESCRIPCION',
        'precio': 20.00,
    }
    url = reverse('articulo-detail', kwargs={'pk': articulo.id})
    response = api_client.put(url, updated_data, format='json')
    assert response.status_code == status.HTTP_200_OK
    articulo.refresh_from_db()
    assert articulo.codigo == updated_data['codigo']
    assert articulo.descripcion == updated_data['descripcion']
    assert articulo.precio == updated_data['precio']

@pytest.mark.django_db
def test_partial_update_articulo(api_client, articulo):
    partial_data = {
        'descripcion': 'ACTUALIZACION DE UNICAMENTE DESCRIPCION',
    }
    url = reverse('articulo-detail', kwargs={'pk': articulo.id})
    response = api_client.patch(url, partial_data, format='json')
    assert response.status_code == status.HTTP_200_OK
    articulo.refresh_from_db()
    assert articulo.descripcion == partial_data['descripcion']

@pytest.mark.django_db
def test_delete_articulo(api_client, articulo):
    url = reverse('articulo-detail', kwargs={'pk': articulo.id})
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert Articulo.objects.count() == 0

@pytest.mark.django_db
def test_invalid_articulo_creation(api_client, cliente):
    invalid_data = {
        'cliente': cliente.id,  
        'codigo': '',  
        'descripcion': 'ESTE ARTICULO NO DEBE GRABARSE PORQUE FALTA EL CODIGO DEL ARTICULO',
        'precio': 10.00,
    }
    url = reverse('articulo-list')
    response = api_client.post(url, invalid_data, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_invalid_articulo_update(api_client, articulo):
    invalid_data = {
        'cliente': articulo.cliente.id,  
        'codigo': '',  
        'descripcion': 'ESTA DESCRIPCION NO DEBE ACTUALIZARSE PORQUE FALTA EL CODIGO DEL ARTICULO',
        'precio': 20.00,
    }
    url = reverse('articulo-detail', kwargs={'pk': articulo.id})
    response = api_client.put(url, invalid_data, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_invalid_articulo_partial_update(api_client, articulo):
    invalid_data = {
        'codigo': ''
    }
    url = reverse('articulo-detail', kwargs={'pk': articulo.id})
    response = api_client.patch(url, invalid_data, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_retrieve_nonexistent_articulo(api_client):
    url = reverse('articulo-detail', kwargs={'pk': 999})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.django_db
def test_delete_nonexistent_articulo(api_client):
    url = reverse('articulo-detail', kwargs={'pk': 999})
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND
