from core.models import Emprestimo, Livro


def listar_livros():
    return Livro.objects.all().order_by("-id")


def contar_emprestimos_ativos(livro):
    return Emprestimo.objects.filter(
        livro=livro,
        status="emprestado",
    ).count()
