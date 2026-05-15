from rest_framework.viewsets import ModelViewSet

from core.repositories.emprestimos import listar_emprestimos
from core.serializers import EmprestimoSerializer


class EmprestimoViewSet(ModelViewSet):
    serializer_class = EmprestimoSerializer

    def get_queryset(self):
        return listar_emprestimos()
