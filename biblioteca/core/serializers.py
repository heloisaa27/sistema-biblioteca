from rest_framework import serializers
from .models import Livro, Emprestimo, Usuario

class LivroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Livro
        fields = '__all__'
    
    def get_status(self, obj):
        return "Disponível" if obj.disponiveis > 0 else "Indisponível"


class EmprestimoSerializer(serializers.ModelSerializer):
    usuario_nome = serializers.SerializerMethodField()

    class Meta:
        model = Emprestimo
        fields = '__all__'

    def get_usuario_nome(self, obj):
        if obj.usuario:
            return obj.usuario.nome

        return "Usuário removido"

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'
