from core.models import Emprestimo, Usuario


def listar_usuarios():
    return Usuario.objects.all().order_by("-id")


def usuario_tem_emprestimo_atrasado(usuario, hoje):
    return Emprestimo.objects.filter(
        usuario=usuario,
        status="emprestado",
        data_devolucao__lt=hoje,
    ).exists()


def listar_usuarios_desativados_ate(data_limite):
    return Usuario.objects.filter(
        ativo=False,
        desativado_em__isnull=False,
        desativado_em__lte=data_limite,
    )
