from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import LivroViewSet, EmprestimoViewSet, UsuarioViewSet
from .views_dashboard import dashboard_data

router = DefaultRouter()
router.register('livros', LivroViewSet)
router.register('emprestimos', EmprestimoViewSet)
router.register('usuarios', UsuarioViewSet)

urlpatterns = [
    path("dashboard/", dashboard_data),
]

urlpatterns += router.urls