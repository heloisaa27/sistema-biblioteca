# Sistema Biblioteca

Sistema web simples para gerenciamento de biblioteca, com cadastro de livros,
usuarios, emprestimos e dashboard administrativo.

## Tecnologias

- Python 3.11+
- Django 5.2
- Django REST Framework
- SQLite
- HTML, CSS e JavaScript
- Chart.js, Lucide, jQuery e Select2

## Como Rodar

Instale as dependencias:

```powershell
pip install -r requirements.txt
```

Entre na pasta do backend:

```powershell
cd biblioteca
```

Execute as migracoes:

```powershell
python manage.py migrate
```

Inicie o servidor:

```powershell
python manage.py runserver
```

Acesse o sistema pelo navegador:

```text
http://127.0.0.1:8000/
```

Importante: nao abra os arquivos da pasta `templates` diretamente no navegador.
Eles sao templates Django e precisam ser servidos pelo `runserver` para carregar
CSS, JavaScript e dados da API corretamente.
Os HTMLs oficiais ficam em `templates/`; a pasta `frontend/` guarda apenas os
assets estaticos usados por esses templates.

## Funcionalidades

- Dashboard com indicadores e graficos.
- Cadastro, edicao, ativacao e desativacao de livros.
- Cadastro, edicao, ativacao e desativacao de usuarios.
- Criacao, edicao, visualizacao e devolucao de emprestimos.
- API REST para livros, usuarios, emprestimos e dashboard.

## Rotas Principais

```text
/                  Dashboard
/livros.html       Listagem de livros
/livro-form.html   Cadastro/edicao de livro
/usuarios.html     Listagem de usuarios
/usuarios-form.html Cadastro/edicao de usuario
/emprestimos.html  Listagem de emprestimos
/emprestimo-form.html Cadastro/edicao de emprestimo
```

## API

```text
/api/livros/
/api/usuarios/
/api/emprestimos/
/api/dashboard/
```

## Sessao Administrativa

O refresh da pagina mantem o usuario logado enquanto a sessao Django estiver
valida. O botao Sair encerra a sessao imediatamente.

Variaveis disponiveis no `.env.example`:

```text
SESSION_COOKIE_AGE=7200
SESSION_EXPIRE_AT_BROWSER_CLOSE=True
```

## Estrutura

```text
biblioteca/       Backend Django
templates/        Templates servidos pelo Django
frontend/assets/  CSS e JavaScript usados pelos templates
docs/             Documentacao tecnica
```

## Validacao

Para conferir se o projeto esta configurado corretamente:

```powershell
cd biblioteca
python manage.py check
```
