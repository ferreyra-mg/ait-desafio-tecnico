import os
from rest_framework import viewsets, status as st
from rest_framework.response import Response
from rest_framework.views import APIView
import pandas as pd
from .models import Cliente, Articulo
from .serializers import ClienteSerializer, ArticuloSerializer
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework.parsers import MultiPartParser, FormParser
import time

# Create your views here.
class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class ArticuloViewSet(viewsets.ModelViewSet):
    queryset = Articulo.objects.all()
    serializer_class = ArticuloSerializer


class UploadExcelView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        xlsx_file = request.FILES.get('file')
        
        if not xlsx_file:
            return Response({'error': 'No file was submitted'}, status=st.HTTP_400_BAD_REQUEST)

        # Verificamos que sea un archivo XLSX. Acá faltaria validar que realmente sea un archivo XLSX para evitar brechas de seguridad
        if not xlsx_file.name.endswith('.xlsx') and not xlsx_file.name.endswith('.xls'):
            return Response({'error': f'File must be XLSX format: {xlsx_file.name}'}, status=st.HTTP_400_BAD_REQUEST)

        # Guardo el archivo de manera temporal adjuntando al nombre el timestamp
        timestamp = int(time.time())
        path = default_storage.save(f'tmp/{timestamp}_{xlsx_file.name}', ContentFile(xlsx_file.read()))
        full_path = os.path.join(default_storage.location, path)

        try:
            df = pd.read_excel(full_path)

            # Eliminamos el archivo temporal
            default_storage.delete(path)
            procesados = 0

            # Obtenemos el primer cliente de la base de datos. Emulamos por ahora que es el primer cliente, 
            # pero en un futuro se deberia obtener el cliente del usuario que subio el archivo a traves de un token JWT
            cliente = Cliente.objects.all().first()

            for _, row in df.iterrows():
                codigo = row['codigo']
                descripcion = row['descripcion']
                precio = row['precio']

                # Actualizo o creo el registro en la base de datos
                Articulo.objects.update_or_create(
                    codigo=codigo,
                    defaults={'descripcion': descripcion, 'precio': precio, 'cliente': cliente}
                )
                procesados += 1

        except Exception as e:
            return Response({"error": f"Error reading file: {str(e)}"}, status=st.HTTP_400_BAD_REQUEST)

        return Response({
            "mensaje": "Archivo procesado exitosamente",
            "procesados": procesados
        }, status=st.HTTP_200_OK)