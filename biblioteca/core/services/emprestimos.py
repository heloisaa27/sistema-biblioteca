from django.core.exceptions import ValidationError


def preparar_emprestimo_para_salvar(emprestimo):
    if emprestimo.livro:
        emprestimo.titulo_livro = emprestimo.livro.titulo

    if not emprestimo.pk:
        registrar_novo_emprestimo(emprestimo)
        return

    registrar_devolucao_se_necessario(emprestimo)


def registrar_novo_emprestimo(emprestimo):
    if not emprestimo.livro:
        raise ValidationError("Livro inválido.")

    if not emprestimo.livro.ativo:
        raise ValidationError("Este livro está desativado.")

    if emprestimo.livro.disponiveis <= 0:
        raise ValidationError("Não há exemplares disponíveis.")

    emprestimo.livro.disponiveis -= 1
    emprestimo.livro.save()


def registrar_devolucao_se_necessario(emprestimo):
    emprestimo_antigo = emprestimo.__class__.objects.get(pk=emprestimo.pk)

    if (
        emprestimo_antigo.status != "devolvido"
        and emprestimo.status == "devolvido"
        and emprestimo.livro
    ):
        emprestimo.livro.disponiveis += 1
        emprestimo.livro.save()
