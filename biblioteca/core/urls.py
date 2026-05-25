from django.urls import path
from rest_framework.routers import DefaultRouter
from .controllers.autenticacao import login_admin, logout_admin, me
from .controllers.dashboard import dashboard_data
from .controllers.emprestimos import EmprestimoViewSet
from .controllers.livros import LivroViewSet
from .controllers.usuarios import UsuarioViewSet

router = DefaultRouter()
router.register('livros', LivroViewSet, basename='livro')
router.register('emprestimos', EmprestimoViewSet, basename='emprestimo')
router.register('usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [
    path("auth/login/", login_admin),
    path("auth/logout/", logout_admin),
    path("auth/me/", me),
    path("dashboard/", dashboard_data),
]

urlpatterns += router.urls
