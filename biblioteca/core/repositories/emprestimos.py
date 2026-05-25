from datetime import timedelta

from django.db.models import Count

from core.models import Emprestimo, Livro


def listar_emprestimos():
    return Emprestimo.objects.all().order_by("-id")


def emprestimos_por_periodo(periodo, hoje):
    query = Emprestimo.objects.all()

    if periodo == "semana":
        return query.filter(data_emprestimo__gte=hoje - timedelta(days=7))

    if periodo == "mes":
        return query.filter(data_emprestimo__gte=hoje - timedelta(days=30))

    if periodo == "trimestre":
        return query.filter(data_emprestimo__gte=hoje - timedelta(days=90))

    return query


def contar_emprestimos_ativos():
    return Emprestimo.objects.filter(status="emprestado").count()


def contar_emprestimos_atrasados(hoje):
    return Emprestimo.objects.filter(
        status="emprestado",
        data_devolucao__lt=hoje,
    ).count()


def contar_emprestimos_vencendo_hoje(hoje):
    return Emprestimo.objects.filter(
        status="emprestado",
        data_devolucao=hoje,
    ).count()


def contar_emprestimos_vencendo_em_breve(hoje, dias=3):
    return Emprestimo.objects.filter(
        status="emprestado",
        data_devolucao__gt=hoje,
        data_devolucao__lte=hoje + timedelta(days=dias),
    ).count()


def contar_total_livros():
    return Livro.objects.count()


def contar_livros_disponiveis():
    return Livro.objects.filter(
        ativo=True,
        disponiveis__gt=0,
    ).count()


def contar_livros_baixa_disponibilidade(limite_disponiveis=1):
    return Livro.objects.filter(
        ativo=True,
        total__gt=0,
        disponiveis__lte=limite_disponiveis,
    ).count()


def emprestimos_agrupados_por_data(query):
    return (
        query
        .values("data_emprestimo")
        .annotate(total=Count("id"))
        .order_by("data_emprestimo")
    )


def livros_mais_emprestados(query, limite=5):
    return (
        query
        .values("livro__titulo")
        .annotate(total=Count("id"))
        .order_by("-total")[:limite]
    )


def contar_devolvidos():
    return Emprestimo.objects.filter(status="devolvido").count()


def contar_emprestados_no_prazo(hoje):
    return Emprestimo.objects.filter(
        status="emprestado",
        data_devolucao__gte=hoje,
    ).count()


def contar_atrasados_nao_devolvidos(hoje):
    return (
        Emprestimo.objects
        .filter(data_devolucao__lt=hoje)
        .exclude(status="devolvido")
        .count()
    )


def listar_atrasados_recentes(hoje, limite=10):
    return (
        Emprestimo.objects
        .filter(
            status="emprestado",
            data_devolucao__lt=hoje,
        )
        .select_related("livro", "usuario")
        .order_by("data_devolucao")[:limite]
    )


def listar_vencimentos_proximos(hoje, dias=3, limite=10):
    return (
        Emprestimo.objects
        .filter(
            status="emprestado",
            data_devolucao__gte=hoje,
            data_devolucao__lte=hoje + timedelta(days=dias),
        )
        .select_related("livro", "usuario")
        .order_by("data_devolucao", "id")[:limite]
    )


def listar_livros_baixa_disponibilidade(limite_disponiveis=1, limite=8):
    return (
        Livro.objects
        .filter(
            ativo=True,
            total__gt=0,
            disponiveis__lte=limite_disponiveis,
        )
        .order_by("disponiveis", "titulo")[:limite]
    )
