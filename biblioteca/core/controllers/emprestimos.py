from rest_framework.viewsets import ModelViewSet

from core.permissions import IsAdminOrSuperuser
from core.repositories.emprestimos import listar_emprestimos
from core.serializers import EmprestimoSerializer


class EmprestimoViewSet(ModelViewSet):
    permission_classes = [IsAdminOrSuperuser]
    serializer_class = EmprestimoSerializer

    def get_queryset(self):
        return listar_emprestimos()
