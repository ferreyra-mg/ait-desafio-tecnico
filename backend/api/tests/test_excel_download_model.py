import pytest
from django.test import RequestFactory
from api.views import DownloadExcelView
from api.models import Cliente, Articulo
import pandas as pd
import io
from django.urls import reverse

@pytest.fixture
def setup_data():
    cliente = Cliente.objects.create(nombre="Cliente de Prueba")
    Articulo.objects.create(codigo="123", descripcion="Artículo de Prueba 1", precio=10.0, cliente=cliente)
    Articulo.objects.create(codigo="456", descripcion="Artículo de Prueba 2", precio=20.0, cliente=cliente)
    return cliente

# Al finalizar, se eliminarán los archivos creados por este fixture
@pytest.fixture(autouse=True)
def cleanup_files(setup_data):
    yield
    # Eliminar los archivos creados por este fixture
    import os
    for filename in os.listdir('.'):
        if filename.startswith('articulos_') and filename.endswith('.xlsx'):
            os.remove(filename)

@pytest.mark.django_db
def test_download_excel_view(setup_data):
    factory = RequestFactory()
    url = reverse('download-excel')
    request = factory.get(url)
    view = DownloadExcelView.as_view()

    response = view(request)

    assert response.status_code == 200
    assert response['Content-Type'] == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    assert f'attachment; filename="articulos_{setup_data.nombre}.xlsx"' in response['Content-Disposition']

    excel_data = io.BytesIO(response.content)
    df = pd.read_excel(excel_data)

    assert df.shape == (2, 5)
    assert df[df['codigo'] == 123].shape[0] == 1
    assert df[df['codigo'] == 456].shape[0] == 1
    assert df[df['descripcion'] == 'Artículo de Prueba 1'].shape[0] == 1
    assert df[df['descripcion'] == 'Artículo de Prueba 2'].shape[0] == 1
    assert df[df['precio'] == 10.0].shape[0] == 1
    assert df[df['precio'] == 20.0].shape[0] == 1

@pytest.mark.django_db
def test_download_excel_view_no_data(setup_data):
    factory = RequestFactory()
    url = reverse('download-excel')
    request = factory.get(url)
    view = DownloadExcelView.as_view()

    response = view(request)

    assert response.status_code == 200
    assert response['Content-Type'] == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    assert f'attachment; filename="articulos_{setup_data.nombre}.xlsx"' in response['Content-Disposition']

    excel_data = io.BytesIO(response.content)
    df = pd.read_excel(excel_data)

    assert df.shape == (2, 5)
