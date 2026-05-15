from core.repositories.livros import contar_emprestimos_ativos


def recalcular_disponiveis(livro):
    emprestados = contar_emprestimos_ativos(livro)
    livro.disponiveis = max(0, livro.total - emprestados)
    livro.save()
    return livro
