from datetime import timedelta

from django.core.exceptions import ValidationError
from django.utils import timezone

from core.repositories.usuarios import (
    listar_usuarios_desativados_ate,
    usuario_tem_emprestimo_atrasado,
)


def preparar_dados_status_usuario(usuario, dados):
    if "ativo" not in dados:
        return dados

    novo_ativo = dados["ativo"]

    if novo_ativo is False and usuario.ativo:
        validar_usuario_pode_ser_desativado(usuario)
        dados["desativado_em"] = timezone.now()

    if novo_ativo is True:
        dados["desativado_em"] = None

    return dados


def validar_usuario_pode_ser_desativado(usuario):
    if usuario_tem_emprestimo_atrasado(usuario, timezone.localdate()):
        raise ValidationError(
            "Usuário não pode ser desativado enquanto possuir empréstimo atrasado."
        )


def remover_usuarios_desativados_expirados(agora=None, dias=30):
    agora = agora or timezone.now()
    data_limite = agora - timedelta(days=dias)
    usuarios = listar_usuarios_desativados_ate(data_limite)
    quantidade = usuarios.count()
    usuarios.delete()
    return quantidade
