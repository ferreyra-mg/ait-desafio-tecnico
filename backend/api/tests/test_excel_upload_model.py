import os
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from api.models import Cliente, Articulo
import pandas as pd

# Despues de todas las pruebas, eliminamos los archivos temporales que se hayan generado
@pytest.fixture(autouse=True)
def cleanup_files():
    yield
    for file in os.listdir('tmp'):
        os.remove(os.path.join('tmp', file))


@pytest.mark.django_db
def test_upload_excel_view_success():
    client = APIClient()

    cliente = Cliente.objects.create(nombre="Cliente de Prueba")

    # Creo un archivo Excel de prueba
    df = pd.DataFrame({
        'codigo': ['101', '102'],
        'descripcion': ['Artículo 1', 'Artículo 2'],
        'precio': [100.0, 200.0]
    })
    excel_file = pd.ExcelWriter('prueba.xlsx', engine='xlsxwriter')
    df.to_excel(excel_file, index=False)
    excel_file.close()

    # Ahora leo el archivo Excel
    with open('prueba.xlsx', 'rb') as f:
        file_content = f.read()

    uploaded_file = SimpleUploadedFile('prueba.xlsx', file_content, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    url = reverse('upload-excel')

    response = client.post(url, {'file': uploaded_file}, format='multipart')
    
    assert response.status_code == status.HTTP_200_OK
    assert response.data['mensaje'] == "Archivo procesado exitosamente"
    assert response.data['procesados'] == 2

    articulo1 = Articulo.objects.get(codigo='101')
    assert articulo1.descripcion == 'Artículo 1'
    assert articulo1.precio == 100.0
    assert articulo1.cliente == cliente

    articulo2 = Articulo.objects.get(codigo='102')
    assert articulo2.descripcion == 'Artículo 2'
    assert articulo2.precio == 200.0
    assert articulo2.cliente == cliente

    # Elimino el archivo de prueba
    os.remove('prueba.xlsx')

@pytest.mark.django_db
def test_upload_excel_view_no_file():
    client = APIClient()
    url = reverse('upload-excel')

    response = client.post(url, {}, format='multipart')

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data['error'] == 'No file was submitted'

@pytest.mark.django_db
def test_upload_excel_view_invalid_file_format():
    client = APIClient()

    with open('prueba.txt', 'w') as f:
        f.write('Este es un archivo de prueba')

    # Leo el archivo
    with open('prueba.txt', 'rb') as f:
        file_content = f.read()

    uploaded_file = SimpleUploadedFile('prueba.txt', file_content, content_type='text/plain')
    url = reverse('upload-excel')

    response = client.post(url, {'file': uploaded_file}, format='multipart')

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data['error'] == 'File must be XLSX format: prueba.txt'

    # Elimino el archivo de prueba
    os.remove('prueba.txt')
