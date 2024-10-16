from django.urls import include, path
from . import views
from rest_framework.routers import DefaultRouter
from .views import UploadExcelView, DownloadExcelView

router =  DefaultRouter()
router.register(r'clientes', views.ClienteViewSet)
router.register(r'articulos', views.ArticuloViewSet)

# Aplicamos api versioning
urlpatterns = [
    path('api/v1/', include(router.urls)),
    path('api/v1/upload/', UploadExcelView.as_view(), name='upload-excel'),
    path('api/v1/download/', DownloadExcelView.as_view(), name='download-excel'),

]