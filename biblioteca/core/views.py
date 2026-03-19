from rest_framework import viewsets
from .models import Livro, Emprestimo, Usuario
from .serializers import LivroSerializer, EmprestimoSerializer, UsuarioSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response


class LivroViewSet(ModelViewSet):
    queryset = Livro.objects.all().order_by("-id")
    serializer_class = LivroSerializer

    def update(self, request, *args, **kwargs):

        livro = self.get_object()

        serializer = self.get_serializer(livro, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # contar empréstimos ativos
        emprestados = Emprestimo.objects.filter(
            livro=livro,
            status="emprestado"
        ).count()

        # recalcular disponíveis
        livro.disponiveis = max(0, livro.total - emprestados)
        livro.save()

        return Response(self.get_serializer(livro).data)


class EmprestimoViewSet(viewsets.ModelViewSet):
    queryset = Emprestimo.objects.all().order_by("-id")
    serializer_class = EmprestimoSerializer

class UsuarioViewSet(ModelViewSet):
    queryset = Usuario.objects.all().order_by("-id")
    serializer_class = UsuarioSerializer
