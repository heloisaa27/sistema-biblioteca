from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from core.permissions import IsAdminOrSuperuser
from core.repositories.livros import listar_livros
from core.serializers import LivroSerializer
from core.services.livros import recalcular_disponiveis


class LivroViewSet(ModelViewSet):
    permission_classes = [IsAdminOrSuperuser]
    serializer_class = LivroSerializer

    def get_queryset(self):
        return listar_livros()

    def update(self, request, *args, **kwargs):
        livro = self.get_object()

        serializer = self.get_serializer(livro, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        livro = recalcular_disponiveis(livro)

        return Response(self.get_serializer(livro).data)
