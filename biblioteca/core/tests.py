from datetime import date, timedelta

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

from .models import Emprestimo, Livro, Usuario
from .services.usuarios import remover_usuarios_desativados_expirados


def autenticar_admin(client, username="admin"):
    admin = User.objects.create_user(
        username=username,
        password="senha-admin",
        is_staff=True,
    )
    client.force_login(admin)

    return admin


class AuthAdminTests(TestCase):
    def test_login_com_admin_valido(self):
        User.objects.create_user(
            username="bibliotecario",
            password="senha-correta",
            is_staff=True,
        )

        response = self.client.post(
            "/api/auth/login/",
            data={
                "username": "bibliotecario",
                "password": "senha-correta",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["authenticated"])
        self.assertTrue(response.json()["is_admin"])
        self.assertEqual(response.json()["username"], "bibliotecario")

    def test_login_com_senha_invalida(self):
        User.objects.create_user(
            username="bibliotecario",
            password="senha-correta",
            is_staff=True,
        )

        response = self.client.post(
            "/api/auth/login/",
            data={
                "username": "bibliotecario",
                "password": "senha-errada",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 401)
        self.assertIn("Usuario ou senha invalidos", response.json()["error"])

    def test_login_com_usuario_comum_sem_staff(self):
        User.objects.create_user(
            username="usuario",
            password="senha-correta",
            is_staff=False,
        )

        response = self.client.post(
            "/api/auth/login/",
            data={
                "username": "usuario",
                "password": "senha-correta",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 403)
        self.assertIn("permissao administrativa", response.json()["error"])

    def test_me_autenticado(self):
        autenticar_admin(self.client, username="admin-me")

        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["authenticated"])
        self.assertTrue(response.json()["is_admin"])
        self.assertEqual(response.json()["username"], "admin-me")

    def test_me_anonimo(self):
        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["authenticated"])
        self.assertFalse(response.json()["is_admin"])

    def test_logout(self):
        autenticar_admin(self.client)

        response = self.client.post("/api/auth/logout/")

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["authenticated"])

        me_response = self.client.get("/api/auth/me/")

        self.assertFalse(me_response.json()["authenticated"])


class EmprestimoEstoqueTests(TestCase):
    def setUp(self):
        self.livro = Livro.objects.create(
            titulo="Livro Teste",
            autor="Autor Teste",
            categoria="Categoria",
            isbn="1234567890",
            total=2,
            disponiveis=2,
            ativo=True,
        )
        self.usuario = Usuario.objects.create(
            nome="Usuario Teste",
            email="usuario@example.com",
            telefone="0000-0000",
            ativo=True,
        )

    def criar_emprestimo(self, livro=None, usuario=None, data_devolucao=None):
        return Emprestimo.objects.create(
            livro=livro or self.livro,
            usuario=usuario or self.usuario,
            data_emprestimo=date.today(),
            data_devolucao=data_devolucao or date.today() + timedelta(days=7),
            status="emprestado",
        )

    def test_criar_emprestimo_reduz_disponibilidade(self):
        emprestimo = self.criar_emprestimo()

        self.livro.refresh_from_db()

        self.assertEqual(self.livro.disponiveis, 1)
        self.assertEqual(emprestimo.titulo_livro, self.livro.titulo)

    def test_devolver_emprestimo_aumenta_disponibilidade(self):
        emprestimo = self.criar_emprestimo()

        emprestimo.status = "devolvido"
        emprestimo.save()

        self.livro.refresh_from_db()

        self.assertEqual(self.livro.disponiveis, 2)

    def test_livro_sem_disponibilidade_nao_pode_ser_emprestado(self):
        self.livro.disponiveis = 0
        self.livro.save()

        with self.assertRaises(ValidationError):
            self.criar_emprestimo()

    def test_livro_desativado_nao_pode_ser_emprestado(self):
        self.livro.ativo = False
        self.livro.save()

        with self.assertRaises(ValidationError):
            self.criar_emprestimo()


class DashboardTests(TestCase):
    def setUp(self):
        autenticar_admin(self.client)

        self.livro = Livro.objects.create(
            titulo="Livro Dashboard",
            autor="Autor Dashboard",
            categoria="Categoria",
            isbn="0987654321",
            total=3,
            disponiveis=3,
            ativo=True,
        )
        self.usuario = Usuario.objects.create(
            nome="Usuario Dashboard",
            email="dashboard@example.com",
            telefone="1111-1111",
            ativo=True,
        )

    def test_dashboard_retorna_estrutura_esperada(self):
        Emprestimo.objects.create(
            livro=self.livro,
            usuario=self.usuario,
            data_emprestimo=date.today(),
            data_devolucao=date.today() + timedelta(days=7),
            status="emprestado",
        )

        response = self.client.get("/api/dashboard/")

        self.assertEqual(response.status_code, 200)

        dados = response.json()

        self.assertIn("cards", dados)
        self.assertIn("emprestimos_por_data", dados)
        self.assertIn("livros_populares", dados)
        self.assertIn("status_distribution", dados)
        self.assertIn("vencimentos_proximos", dados)
        self.assertIn("livros_baixa_disponibilidade", dados)
        self.assertIn("atrasados_recentes", dados)
        self.assertEqual(dados["cards"]["emprestimos_ativos"], 1)

    def test_dashboard_lista_emprestimos_atrasados(self):
        Emprestimo.objects.create(
            livro=self.livro,
            usuario=self.usuario,
            data_emprestimo=date.today() - timedelta(days=10),
            data_devolucao=date.today() - timedelta(days=3),
            status="emprestado",
        )

        response = self.client.get("/api/dashboard/")

        self.assertEqual(response.status_code, 200)

        dados = response.json()

        self.assertEqual(dados["cards"]["emprestimos_atrasados"], 1)
        self.assertEqual(len(dados["atrasados_recentes"]), 1)
        self.assertEqual(dados["atrasados_recentes"][0]["dias_atraso"], 3)

    def test_dashboard_lista_emprestimo_vencendo_hoje(self):
        emprestimo = Emprestimo.objects.create(
            livro=self.livro,
            usuario=self.usuario,
            data_emprestimo=date.today() - timedelta(days=2),
            data_devolucao=date.today(),
            status="emprestado",
        )

        response = self.client.get("/api/dashboard/")

        self.assertEqual(response.status_code, 200)

        dados = response.json()

        self.assertEqual(dados["cards"]["emprestimos_vencendo_hoje"], 1)
        self.assertEqual(len(dados["vencimentos_proximos"]), 1)
        vencimento = dados["vencimentos_proximos"][0]

        self.assertEqual(vencimento["id"], emprestimo.id)
        self.assertEqual(vencimento["usuario_nome"], self.usuario.nome)
        self.assertEqual(vencimento["livro"], self.livro.titulo)
        self.assertEqual(vencimento["data_emprestimo"], str(date.today() - timedelta(days=2)))
        self.assertEqual(vencimento["data_devolucao"], str(date.today()))
        self.assertEqual(vencimento["status"], "hoje")
        self.assertEqual(vencimento["situacao"], "Vence hoje")
        self.assertEqual(vencimento["dias_para_vencer"], 0)

    def test_dashboard_lista_emprestimo_vencendo_amanha(self):
        Emprestimo.objects.create(
            livro=self.livro,
            usuario=self.usuario,
            data_emprestimo=date.today(),
            data_devolucao=date.today() + timedelta(days=1),
            status="emprestado",
        )

        response = self.client.get("/api/dashboard/")

        self.assertEqual(response.status_code, 200)

        dados = response.json()

        self.assertEqual(dados["cards"]["emprestimos_vencendo_3_dias"], 1)
        self.assertEqual(len(dados["vencimentos_proximos"]), 1)
        self.assertEqual(dados["vencimentos_proximos"][0]["status"], "em_breve")
        self.assertEqual(dados["vencimentos_proximos"][0]["situacao"], "Vence amanhã")
        self.assertEqual(dados["vencimentos_proximos"][0]["dias_para_vencer"], 1)

    def test_dashboard_lista_emprestimo_vencendo_nos_proximos_3_dias(self):
        Emprestimo.objects.create(
            livro=self.livro,
            usuario=self.usuario,
            data_emprestimo=date.today(),
            data_devolucao=date.today() + timedelta(days=3),
            status="emprestado",
        )

        response = self.client.get("/api/dashboard/")

        self.assertEqual(response.status_code, 200)

        dados = response.json()

        self.assertEqual(dados["cards"]["emprestimos_vencendo_3_dias"], 1)
        self.assertEqual(len(dados["vencimentos_proximos"]), 1)
        self.assertEqual(dados["vencimentos_proximos"][0]["status"], "em_breve")
        self.assertEqual(dados["vencimentos_proximos"][0]["situacao"], "Vence em 3 dias")
        self.assertEqual(dados["vencimentos_proximos"][0]["dias_para_vencer"], 3)

    def test_dashboard_nao_lista_emprestimo_devolvido_nos_vencimentos(self):
        Emprestimo.objects.create(
            livro=self.livro,
            usuario=self.usuario,
            data_emprestimo=date.today(),
            data_devolucao=date.today() + timedelta(days=1),
            status="devolvido",
        )

        response = self.client.get("/api/dashboard/")

        self.assertEqual(response.status_code, 200)

        dados = response.json()

        self.assertEqual(dados["cards"]["emprestimos_vencendo_3_dias"], 0)
        self.assertEqual(dados["vencimentos_proximos"], [])

    def test_dashboard_nao_lista_emprestimo_atrasado_nos_vencimentos(self):
        Emprestimo.objects.create(
            livro=self.livro,
            usuario=self.usuario,
            data_emprestimo=date.today() - timedelta(days=5),
            data_devolucao=date.today() - timedelta(days=1),
            status="emprestado",
        )

        response = self.client.get("/api/dashboard/")

        self.assertEqual(response.status_code, 200)

        dados = response.json()

        self.assertEqual(dados["cards"]["emprestimos_atrasados"], 1)
        self.assertEqual(dados["cards"]["emprestimos_vencendo_hoje"], 0)
        self.assertEqual(dados["cards"]["emprestimos_vencendo_3_dias"], 0)
        self.assertEqual(dados["vencimentos_proximos"], [])


class ApiIntegrationTests(TestCase):
    def setUp(self):
        autenticar_admin(self.client)

    def test_fluxo_completo_de_livro_usuario_emprestimo_e_devolucao(self):
        livro_response = self.client.post(
            "/api/livros/",
            data={
                "titulo": "Livro Integracao",
                "autor": "Autor Integracao",
                "categoria": "Categoria",
                "isbn": "1122334455",
                "total": 1,
                "disponiveis": 1,
                "ativo": True,
            },
            content_type="application/json",
        )
        self.assertEqual(livro_response.status_code, 201)

        usuario_response = self.client.post(
            "/api/usuarios/",
            data={
                "nome": "Usuario Integracao",
                "email": "integracao@example.com",
                "telefone": "2222-2222",
                "ativo": True,
            },
            content_type="application/json",
        )
        self.assertEqual(usuario_response.status_code, 201)

        livro_id = livro_response.json()["id"]
        usuario_id = usuario_response.json()["id"]

        emprestimo_response = self.client.post(
            "/api/emprestimos/",
            data={
                "livro": livro_id,
                "usuario": usuario_id,
                "titulo_livro": "Livro Integracao",
                "data_emprestimo": str(date.today()),
                "data_devolucao": str(date.today() + timedelta(days=7)),
                "status": "emprestado",
            },
            content_type="application/json",
        )
        self.assertEqual(emprestimo_response.status_code, 201)

        livro = Livro.objects.get(id=livro_id)
        self.assertEqual(livro.disponiveis, 0)

        emprestimo_id = emprestimo_response.json()["id"]
        devolucao_response = self.client.patch(
            f"/api/emprestimos/{emprestimo_id}/",
            data={"status": "devolvido"},
            content_type="application/json",
        )
        self.assertEqual(devolucao_response.status_code, 200)

        livro.refresh_from_db()
        self.assertEqual(livro.disponiveis, 1)

        dashboard_response = self.client.get("/api/dashboard/")
        self.assertEqual(dashboard_response.status_code, 200)
        self.assertEqual(dashboard_response.json()["cards"]["total_livros"], 1)


class UsuarioLifecycleTests(TestCase):
    def setUp(self):
        autenticar_admin(self.client)

        self.livro = Livro.objects.create(
            titulo="Livro Usuario",
            autor="Autor Usuario",
            categoria="Categoria",
            isbn="5566778899",
            total=2,
            disponiveis=2,
            ativo=True,
        )
        self.usuario = Usuario.objects.create(
            nome="Usuario Ciclo",
            email="ciclo@example.com",
            telefone="3333-3333",
            ativo=True,
        )

    def test_nao_desativa_usuario_com_emprestimo_atrasado(self):
        Emprestimo.objects.create(
            livro=self.livro,
            usuario=self.usuario,
            data_emprestimo=date.today() - timedelta(days=10),
            data_devolucao=date.today() - timedelta(days=1),
            status="emprestado",
        )

        response = self.client.patch(
            f"/api/usuarios/{self.usuario.id}/",
            data={"ativo": False},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)

        self.usuario.refresh_from_db()

        self.assertTrue(self.usuario.ativo)
        self.assertIsNone(self.usuario.desativado_em)

    def test_desativa_usuario_sem_emprestimo_atrasado(self):
        response = self.client.patch(
            f"/api/usuarios/{self.usuario.id}/",
            data={"ativo": False},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)

        self.usuario.refresh_from_db()

        self.assertFalse(self.usuario.ativo)
        self.assertIsNotNone(self.usuario.desativado_em)

    def test_remove_usuario_desativado_ha_30_dias_preservando_emprestimo(self):
        emprestimo = Emprestimo.objects.create(
            livro=self.livro,
            usuario=self.usuario,
            data_emprestimo=date.today() - timedelta(days=40),
            data_devolucao=date.today() - timedelta(days=35),
            status="devolvido",
        )
        self.usuario.ativo = False
        self.usuario.desativado_em = timezone.now() - timedelta(days=31)
        self.usuario.save()

        removidos = remover_usuarios_desativados_expirados()

        self.assertEqual(removidos, 1)
        self.assertFalse(Usuario.objects.filter(id=self.usuario.id).exists())

        emprestimo.refresh_from_db()

        self.assertIsNone(emprestimo.usuario)

        response = self.client.get(f"/api/emprestimos/{emprestimo.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["usuario_nome"], "Usuário removido")


class DashboardPeriodoTests(TestCase):
    def test_dashboard_trimestre_limita_emprestimos_por_data(self):
        autenticar_admin(self.client)

        usuario = Usuario.objects.create(
            nome="Usuario Periodo",
            email="periodo@example.com",
            telefone="4444-4444",
            ativo=True,
        )
        livro_recente = Livro.objects.create(
            titulo="Livro Recente",
            autor="Autor",
            categoria="Categoria",
            isbn="1000000001",
            total=1,
            disponiveis=1,
            ativo=True,
        )
        livro_antigo = Livro.objects.create(
            titulo="Livro Antigo",
            autor="Autor",
            categoria="Categoria",
            isbn="1000000002",
            total=1,
            disponiveis=1,
            ativo=True,
        )
        Emprestimo.objects.create(
            livro=livro_recente,
            usuario=usuario,
            data_emprestimo=date.today() - timedelta(days=10),
            data_devolucao=date.today() + timedelta(days=5),
            status="emprestado",
        )
        Emprestimo.objects.create(
            livro=livro_antigo,
            usuario=usuario,
            data_emprestimo=date.today() - timedelta(days=120),
            data_devolucao=date.today() - timedelta(days=100),
            status="devolvido",
        )

        response = self.client.get("/api/dashboard/?periodo=trimestre")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["emprestimos_por_data"]), 1)
