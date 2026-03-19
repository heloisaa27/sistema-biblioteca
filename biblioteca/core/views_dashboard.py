from datetime import date, timedelta
from django.db.models import Count
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Livro, Emprestimo


@api_view(["GET"])
def dashboard_data(request):

    hoje = date.today()
    MULTA_POR_DIA = 2.0
    VALOR_MAXIMO = 30

    # =========================
    # FILTRO DE PERÍODO
    # =========================

    periodo = request.GET.get("periodo")

    query = Emprestimo.objects.all()

    if periodo == "semana":
        inicio = hoje - timedelta(days=7)
        query = query.filter(data_emprestimo__gte=inicio)

    elif periodo == "mes":
        inicio = hoje - timedelta(days=30)
        query = query.filter(data_emprestimo__gte=inicio)


    # =========================
    # CARDS
    # =========================

    emprestimos_ativos = Emprestimo.objects.filter(
        status="emprestado"
    ).count()

    emprestimos_atrasados = Emprestimo.objects.filter(
        status="emprestado",
        data_devolucao__lt=hoje
    ).count()

    total_livros = Livro.objects.count()

    livros_disponiveis = Livro.objects.filter(
        ativo=True,
        disponiveis__gt=0
    ).count()


    # =========================
    # EMPRÉSTIMOS AO LONGO DO TEMPO
    # =========================

    emprestimos_por_data = (
        query
        .values("data_emprestimo")
        .annotate(total=Count("id"))
        .order_by("data_emprestimo")
    )


    # =========================
    # LIVROS MAIS EMPRESTADOS
    # =========================

    livros_populares = (
        query
        .values("livro__titulo")
        .annotate(total=Count("id"))
        .order_by("-total")[:5]
    )


    # =========================
    # STATUS
    # =========================

    total_devolvidos = Emprestimo.objects.filter(
        status="devolvido"
    ).count()

    total_emprestados = Emprestimo.objects.filter(
        status="emprestado",
        data_devolucao__gte=hoje
    ).count()

    total_atrasados = Emprestimo.objects.filter(
        data_devolucao__lt=hoje
    ).exclude(status="devolvido").count()

    status_distribution = [
        {"status": "Emprestado", "total": total_emprestados},
        {"status": "Devolvido", "total": total_devolvidos},
        {"status": "Atrasado", "total": total_atrasados},
    ]


    # =========================
    # EMPRÉSTIMOS ATRASADOS
    # =========================

    atrasados_query = (
        Emprestimo.objects
        .filter(
            status="emprestado",
            data_devolucao__lt=hoje
        )
        .select_related("livro", "usuario")
        .order_by("data_devolucao")[:10]
    )

    atrasados_recentes = []

    for emp in atrasados_query:

        dias_atraso = (hoje - emp.data_devolucao).days
        multa = dias_atraso * MULTA_POR_DIA

        if (multa >= VALOR_MAXIMO):
             multa = VALOR_MAXIMO

        atrasados_recentes.append({

            "usuario_nome": emp.usuario.nome if emp.usuario else "Usuário removido",

            "livro": emp.livro.titulo if emp.livro else emp.titulo_livro,

            "data_devolucao": emp.data_devolucao,

            "dias_atraso": dias_atraso,

            "multa": multa,

        })


    return Response({

        "cards": {

            "emprestimos_ativos": emprestimos_ativos,

            "emprestimos_atrasados": emprestimos_atrasados,

            "total_livros": total_livros,

            "livros_disponiveis": livros_disponiveis,

        },

        "emprestimos_por_data": list(emprestimos_por_data),

        "livros_populares": list(livros_populares),

        "status_distribution": status_distribution,

        "atrasados_recentes": atrasados_recentes,

    })
