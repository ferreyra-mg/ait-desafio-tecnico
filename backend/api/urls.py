from django.urls import include, path
from . import views
from rest_framework.routers import DefaultRouter

router =  DefaultRouter()
router.register(r'clientes', views.ClienteViewSet)
router.register(r'articulos', views.ArticuloViewSet)

# Aplicamos api versioning
urlpatterns = [
    path('api/v1/', include(router.urls)),
]