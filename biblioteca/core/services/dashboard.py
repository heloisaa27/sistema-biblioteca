from datetime import date

from core.repositories import emprestimos as emprestimos_repo

MULTA_POR_DIA = 2.0
VALOR_MAXIMO_MULTA = 30


def montar_dashboard(periodo=None, hoje=None):
    hoje = hoje or date.today()
    query = emprestimos_repo.emprestimos_por_periodo(periodo, hoje)

    return {
        "cards": montar_cards(hoje),
        "emprestimos_por_data": list(
            emprestimos_repo.emprestimos_agrupados_por_data(query)
        ),
        "livros_populares": list(
            emprestimos_repo.livros_mais_emprestados(query)
        ),
        "status_distribution": montar_distribuicao_status(hoje),
        "atrasados_recentes": montar_atrasados_recentes(hoje),
    }


def montar_cards(hoje):
    return {
        "emprestimos_ativos": emprestimos_repo.contar_emprestimos_ativos(),
        "emprestimos_atrasados": emprestimos_repo.contar_emprestimos_atrasados(hoje),
        "total_livros": emprestimos_repo.contar_total_livros(),
        "livros_disponiveis": emprestimos_repo.contar_livros_disponiveis(),
    }


def montar_distribuicao_status(hoje):
    return [
        {
            "status": "Emprestado",
            "total": emprestimos_repo.contar_emprestados_no_prazo(hoje),
        },
        {
            "status": "Devolvido",
            "total": emprestimos_repo.contar_devolvidos(),
        },
        {
            "status": "Atrasado",
            "total": emprestimos_repo.contar_atrasados_nao_devolvidos(hoje),
        },
    ]


def montar_atrasados_recentes(hoje):
    atrasados = []

    for emprestimo in emprestimos_repo.listar_atrasados_recentes(hoje):
        dias_atraso = (hoje - emprestimo.data_devolucao).days
        multa = min(dias_atraso * MULTA_POR_DIA, VALOR_MAXIMO_MULTA)

        atrasados.append({
            "usuario_nome": (
                emprestimo.usuario.nome
                if emprestimo.usuario
                else "Usuário removido"
            ),
            "livro": (
                emprestimo.livro.titulo
                if emprestimo.livro
                else emprestimo.titulo_livro
            ),
            "data_devolucao": emprestimo.data_devolucao,
            "dias_atraso": dias_atraso,
            "multa": multa,
        })

    return atrasados
