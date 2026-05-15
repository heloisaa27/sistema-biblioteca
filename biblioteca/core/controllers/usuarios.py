from rest_framework.viewsets import ModelViewSet
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError

from core.repositories.usuarios import listar_usuarios
from core.serializers import UsuarioSerializer
from core.services.usuarios import preparar_dados_status_usuario


class UsuarioViewSet(ModelViewSet):
    serializer_class = UsuarioSerializer

    def get_queryset(self):
        return listar_usuarios()

    def update(self, request, *args, **kwargs):
        usuario = self.get_object()
        dados = request.data.copy()

        try:
            dados = preparar_dados_status_usuario(usuario, dados)
        except DjangoValidationError as exc:
            raise ValidationError({"ativo": exc.messages})

        serializer = self.get_serializer(usuario, data=dados, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return self.retrieve(request, *args, **kwargs)
