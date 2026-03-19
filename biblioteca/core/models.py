from django.db import models
from django.core.exceptions import ValidationError


class Livro(models.Model):

    titulo = models.CharField(max_length=200)
    autor = models.CharField(max_length=200)
    categoria = models.CharField(max_length=100)
    isbn = models.CharField(max_length=20)

    total = models.IntegerField()
    disponiveis = models.IntegerField()

    ativo = models.BooleanField(default=True)

    def __str__(self):
        return self.titulo
    

class Usuario(models.Model):
    nome = models.CharField(max_length=200)
    email = models.EmailField()
    telefone = models.CharField(max_length=20)

    ativo = models.BooleanField(default=True)

    def __str__(self):
        return self.nome


class Emprestimo(models.Model):

    STATUS_CHOICES = [
        ('emprestado', 'Emprestado'),
        ('devolvido', 'Devolvido'),
    ]

    livro = models.ForeignKey(
        Livro,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=False
    )

    titulo_livro = models.CharField(max_length=200)

    data_emprestimo = models.DateField()
    data_devolucao = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="emprestado"
    )

    def save(self, *args, **kwargs):

        # guardar título para histórico
        if self.livro:
            self.titulo_livro = self.livro.titulo

        # criação do empréstimo
        if not self.pk:

            if not self.livro:
                raise ValidationError("Livro inválido.")

            if not self.livro.ativo:
                raise ValidationError("Este livro está desativado.")

            if self.livro.disponiveis <= 0:
                raise ValidationError("Não há exemplares disponíveis.")

            self.livro.disponiveis -= 1
            self.livro.save()

        else:

            emprestimo_antigo = Emprestimo.objects.get(pk=self.pk)

            if (
                emprestimo_antigo.status != "devolvido"
                and self.status == "devolvido"
                and self.livro
            ):
                self.livro.disponiveis += 1
                self.livro.save()

        super().save(*args, **kwargs)

    def __str__(self):
        return self.titulo_livro