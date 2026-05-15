from django.db import models


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
    desativado_em = models.DateTimeField(null=True, blank=True)

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

        from .services.emprestimos import preparar_emprestimo_para_salvar

        preparar_emprestimo_para_salvar(self)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.titulo_livro
