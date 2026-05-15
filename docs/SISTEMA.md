# Sistema Biblioteca

Documentacao tecnica do sistema atual, criada a partir da leitura do codigo
existente. Este documento descreve a estrutura, os fluxos e os pontos de
evolucao sem alterar a logica implementada.

## Visao geral

O Sistema Biblioteca e uma aplicacao simples de gestao de biblioteca com:

- Backend em Django + Django REST Framework.
- Banco SQLite local.
- Frontend estatico em HTML, CSS e JavaScript.
- Graficos no dashboard com Chart.js.
- Icones com Lucide.
- Selects pesquisaveis no formulario de emprestimos com jQuery + Select2.

O frontend consome a API local configurada em
`frontend/assets/js/shared/config.js`.

## Estrutura atual

```text
.
|-- frontend/
|   |-- pages/
|   |   |-- dashboard.html
|   |   |-- emprestimos.html
|   |   |-- emprestimo-form.html
|   |   |-- livros.html
|   |   |-- livro-form.html
|   |   |-- usuarios.html
|   |   `-- usuarios-form.html
|   `-- assets/
|       |-- css/
|       |   `-- style.css
|       `-- js/
|           |-- shared/
|           |   |-- api.js
|           |   |-- config.js
|           |   |-- dom-utils.js
|           |   |-- formatters.js
|           |   `-- tabela-utils.js
|           `-- pages/
|               |-- dashboard.js
|               |-- emprestimos.js
|               |-- emprestimo-form.js
|               |-- livros.js
|               |-- livro-form.js
|               |-- usuarios.js
|               `-- usuario-form.js
`-- biblioteca/
    |-- manage.py
    |-- db.sqlite3
    |-- config/
    |   |-- settings.py
    |   |-- urls.py
    |   |-- asgi.py
    |   `-- wsgi.py
    `-- core/
        |-- models.py
        |-- serializers.py
        |-- controllers/
        |-- repositories/
        |-- services/
        |-- views.py
        |-- views_dashboard.py
        |-- urls.py
        |-- admin.py
        `-- migrations/
```

## Arquitetura

O projeto agora esta separado em duas areas principais:

- `frontend/`: interface estatica, com paginas HTML e assets proprios.
- `biblioteca/`: backend Django, API REST e regras de negocio.
- `biblioteca/config/`: configuracao do projeto Django (`settings`, `urls`,
  `asgi` e `wsgi`).

No backend, a organizacao segue uma arquitetura em camadas adaptada ao Django:

- `controllers/`: camada HTTP/API. Contem ViewSets e views que recebem requests
  e retornam responses.
- `services/`: regras de negocio e orquestracao de casos de uso.
- `repositories/`: consultas e acesso ao ORM.
- `models.py`: entidades persistidas pelo Django ORM.
- `serializers.py`: conversao entre modelos e payloads da API.
- `urls.py`: rotas da API.

No frontend, a separacao ficou assim:

- `pages/`: arquivos HTML navegaveis.
- `assets/js/pages/`: scripts especificos de cada tela.
- `assets/js/shared/`: utilitarios reutilizaveis, como API, formatacao,
  sanitizacao e tabela paginada.
- `assets/css/`: estilos da interface.

## Dominios principais

### Livro

Representa um item do acervo.

Campos principais:

- `titulo`
- `autor`
- `categoria`
- `isbn`
- `total`: quantidade total de exemplares.
- `disponiveis`: quantidade disponivel para emprestimo.
- `ativo`: controla se o livro pode aparecer para novo emprestimo.

Regras observadas:

- Livros desativados continuam no historico, mas nao aparecem como opcao para
  novos emprestimos.
- Ao atualizar um livro, a API recalcula `disponiveis` com base em
  `total - emprestimos ativos`.

### Usuario

Representa uma pessoa que pode receber emprestimos.

Campos principais:

- `nome`
- `email`
- `telefone`
- `ativo`: controla se o usuario pode aparecer para novo emprestimo.
- `desativado_em`: data/hora em que o usuario foi desativado.

Regras observadas:

- Usuarios desativados continuam no historico, mas nao aparecem como opcao para
  novos emprestimos.
- Um usuario so pode ser desativado se nao tiver emprestimo atrasado ativo.
- Usuarios desativados ha 30 dias ou mais podem ser removidos pelo comando
  `python manage.py remover_usuarios_desativados`.
- Emprestimos de usuarios removidos sao preservados; nesses casos a API retorna
  `Usuário removido` no campo `usuario_nome`.

### Emprestimo

Representa a retirada de um livro por um usuario.

Campos principais:

- `livro`: relacionamento com `Livro`.
- `usuario`: relacionamento com `Usuario`.
- `titulo_livro`: copia do titulo para preservar historico.
- `data_emprestimo`
- `data_devolucao`
- `status`: `emprestado` ou `devolvido`.

Regras observadas:

- Ao criar emprestimo, o sistema:
  - exige livro valido;
  - bloqueia livro desativado;
  - bloqueia livro sem exemplares disponiveis;
  - diminui `livro.disponiveis` em 1;
  - copia `livro.titulo` para `titulo_livro`.
- Ao mudar status de `emprestado` para `devolvido`, o sistema aumenta
  `livro.disponiveis` em 1.
- Atraso nao e persistido no banco; ele e calculado comparando
  `data_devolucao` com a data atual.

## API

Base local configurada em `frontend/assets/js/shared/config.js`:

```text
http://localhost:8000/api/
```

Endpoints principais:

| Metodo | Endpoint | Uso |
| --- | --- | --- |
| GET | `/api/livros/` | Lista livros |
| POST | `/api/livros/` | Cria livro |
| GET | `/api/livros/{id}/` | Busca livro |
| PUT/PATCH | `/api/livros/{id}/` | Atualiza livro |
| GET | `/api/usuarios/` | Lista usuarios |
| POST | `/api/usuarios/` | Cria usuario |
| GET | `/api/usuarios/{id}/` | Busca usuario |
| PUT/PATCH | `/api/usuarios/{id}/` | Atualiza usuario |
| GET | `/api/emprestimos/` | Lista emprestimos |
| POST | `/api/emprestimos/` | Cria emprestimo |
| GET | `/api/emprestimos/{id}/` | Busca emprestimo |
| PATCH | `/api/emprestimos/{id}/` | Atualiza emprestimo |
| GET | `/api/dashboard/` | Dados consolidados do dashboard |

Filtros do dashboard:

```text
/api/dashboard/?periodo=semana
/api/dashboard/?periodo=mes
/api/dashboard/?periodo=trimestre
/api/dashboard/
```

Quando `periodo=trimestre`, o dashboard considera os ultimos 90 dias.

## Telas do frontend

### Dashboard

Arquivo: `frontend/pages/dashboard.html`

Script: `frontend/assets/js/pages/dashboard.js`

Funcionalidades:

- Cards de emprestimos ativos, atrasados, livros disponiveis e total de livros.
- Grafico de emprestimos ao longo do tempo.
- Grafico de livros mais emprestados.
- Grafico de distribuicao por status.
- Tabela de emprestimos atrasados recentes.
- Filtros por ultima semana, ultimo mes e ultimos 3 meses.

### Livros

Arquivos:

- `frontend/pages/livros.html`
- `frontend/pages/livro-form.html`
- `frontend/assets/js/pages/livros.js`
- `frontend/assets/js/pages/livro-form.js`

Funcionalidades:

- Listagem de livros.
- Busca por titulo ou autor.
- Paginacao local.
- Criacao e edicao de livros.
- Ativacao/desativacao de livro.

### Usuarios

Arquivos:

- `frontend/pages/usuarios.html`
- `frontend/pages/usuarios-form.html`
- `frontend/assets/js/pages/usuarios.js`
- `frontend/assets/js/pages/usuario-form.js`

Funcionalidades:

- Listagem de usuarios.
- Busca por nome.
- Paginacao local.
- Criacao e edicao de usuarios.
- Ativacao/desativacao de usuario.

### Emprestimos

Arquivos:

- `frontend/pages/emprestimos.html`
- `frontend/pages/emprestimo-form.html`
- `frontend/assets/js/pages/emprestimos.js`
- `frontend/assets/js/pages/emprestimo-form.js`

Funcionalidades:

- Listagem de emprestimos.
- Busca por usuario ou livro.
- Paginacao local.
- Criacao e edicao de emprestimos.
- Confirmacao de devolucao.
- Visualizacao de emprestimo devolvido.
- Selecao de livro e usuario com Select2.

## Fluxos principais

### Cadastro de livro

1. Usuario abre `livro-form.html`.
2. Preenche titulo, autor, categoria, ISBN e quantidade total.
3. Frontend envia `POST /api/livros/`.
4. O campo `disponiveis` e enviado com o mesmo valor de `total`.
5. Usuario retorna para `livros.html`.

### Edicao de livro

1. Usuario abre `livro-form.html?id={id}`.
2. Frontend busca `GET /api/livros/{id}/`.
3. Usuario altera os dados.
4. Frontend envia `PUT /api/livros/{id}/`.
5. Backend recalcula exemplares disponiveis considerando emprestimos ativos.

### Novo emprestimo

1. Usuario abre `emprestimo-form.html`.
2. Frontend carrega livros ativos com disponibilidade e usuarios ativos.
3. Usuario seleciona livro, usuario e datas.
4. Frontend envia `POST /api/emprestimos/`.
5. Backend valida disponibilidade e reduz `disponiveis` do livro.
6. Usuario retorna para `emprestimos.html`.

### Devolucao

1. Usuario clica em confirmar devolucao na lista de emprestimos.
2. Frontend envia `PATCH /api/emprestimos/{id}/` com `status: "devolvido"`.
3. Backend aumenta `disponiveis` do livro.
4. Lista de emprestimos e recarregada.

### Desativacao e remocao de usuario

1. Usuario clica para desativar um cadastro.
2. Frontend envia `PATCH /api/usuarios/{id}/` com `ativo: false`.
3. Backend verifica se existe emprestimo atrasado ativo para o usuario.
4. Se houver atraso, a desativacao e bloqueada.
5. Se nao houver atraso, o usuario fica inativo e `desativado_em` e preenchido.
6. Apos 30 dias, o comando `python manage.py remover_usuarios_desativados`
   remove os usuarios desativados expirados.
7. Os emprestimos continuam no historico porque o relacionamento usa
   `SET_NULL`; a API exibe `Usuário removido` quando o cadastro nao existe mais.

### Dashboard

1. Frontend chama `GET /api/dashboard/`.
2. Backend agrega dados em `views_dashboard.py`.
3. Frontend atualiza cards, graficos e tabela de atrasados.

## Pontos de atencao encontrados

Os pontos tecnicos observados durante a analise inicial foram tratados. Novos
pontos devem ser registrados aqui conforme o sistema evoluir.

## Melhorias ja aplicadas

- Codificacao conferida nos arquivos HTML, JS e Python.
- URLs `http:/localhost` corrigidas.
- Logica repetida de paginacao e busca extraida para `frontend/assets/js/shared/tabela-utils.js`.
- URL base da API centralizada em `frontend/assets/js/shared/config.js`.
- Graficos do dashboard passam a destruir instancias antigas antes de recriar.
- Formatacao de data extraida para `frontend/assets/js/shared/formatters.js`.
- Testes de backend adicionados para estoque, devolucao, bloqueios e dashboard.
- Teste de integracao adicionado para fluxo API de livro, usuario, emprestimo,
  devolucao e dashboard.
- Testes adicionados para bloqueio de desativacao com atraso, remocao de
  usuario desativado e preservacao de historico.
- Tela de usuarios passa a exibir as mensagens de validacao retornadas pela API,
  como o bloqueio de desativacao por emprestimo atrasado.
- Regras de emprestimo e estoque movidas para `core/services/emprestimos.py`.
- Regras de ciclo de vida de usuario movidas para `core/services/usuarios.py`.
- Comando `remover_usuarios_desativados` criado para excluir usuarios
  desativados ha 30 dias ou mais.
- Grafico de emprestimos ao longo do tempo usa filtros de semana, mes e
  trimestre, evitando o excesso de dados de todo o periodo.
- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` e CORS passam a aceitar variaveis de ambiente.
- `.gitignore` criado para banco local, caches Python, ambientes e arquivos locais.
- Dados inseridos via `innerHTML` agora sao sanitizados com `frontend/assets/js/shared/dom-utils.js`.
- Banco SQLite local e caches Python removidos do indice do git.
- Frontend movido para `frontend/`, separando paginas e assets.
- Backend reorganizado em `controllers`, `services` e `repositories`.
- Chamadas HTTP do frontend centralizadas em `frontend/assets/js/shared/api.js`.
- Pacote Django interno renomeado para `config/`, evitando a estrutura
  `biblioteca/biblioteca`.
- `manage.py`, `asgi.py` e `wsgi.py` forcam `config.settings`, protegendo contra
  ambientes antigos com `DJANGO_SETTINGS_MODULE=biblioteca.settings`.

## Refatoracao aplicada

A refatoracao foi feita mantendo os comportamentos e endpoints existentes.

### Frontend

Estrutura adotada:

```text
frontend/
|-- pages/
|   |-- dashboard.html
|   |-- livros.html
|   |-- livro-form.html
|   |-- usuarios.html
|   |-- usuarios-form.html
|   |-- emprestimos.html
|   `-- emprestimo-form.html
`-- assets/
    |-- css/
    |   `-- style.css
    `-- js/
        |-- shared/
        |   |-- api.js
        |   |-- config.js
        |   |-- dom-utils.js
        |   |-- formatters.js
        |   `-- tabela-utils.js
        `-- pages/
            |-- dashboard.js
            |-- livros.js
            |-- livro-form.js
            |-- usuarios.js
            |-- usuario-form.js
            |-- emprestimos.js
            `-- emprestimo-form.js
```

Responsabilidades:

- `config.js`: URL base da API e helper `apiUrl`.
- `api.js`: funcoes `apiGet`, `apiPost`, `apiPut` e `apiPatch`.
- `dom-utils.js`: sanitizacao de valores antes de insercao em HTML.
- `formatters.js`: formatacao de datas e textos.
- `tabela-utils.js`: paginacao e busca reutilizaveis para tabelas.
- `pages/*`: codigo especifico de cada tela.

### Backend

Estrutura adotada dentro de `core/`:

```text
core/
|-- models.py
|-- serializers.py
|-- urls.py
|-- controllers/
|   |-- livros.py
|   |-- usuarios.py
|   |-- emprestimos.py
|   `-- dashboard.py
|-- repositories/
|   |-- livros.py
|   |-- usuarios.py
|   `-- emprestimos.py
|-- services/
|   |-- emprestimos.py
|   |-- livros.py
|   `-- dashboard.py
`-- tests.py
```

Responsabilidades:

- `controllers/*`: recebem requests HTTP e devolvem responses.
- `repositories/*`: concentram consultas ao ORM.
- `services/emprestimos.py`: regras de criacao, devolucao e estoque.
- `services/livros.py`: recalculo de disponibilidade.
- `services/dashboard.py`: consultas agregadas do dashboard.
- `views.py` e `views_dashboard.py`: pontes de compatibilidade para imports
  antigos.
- `tests.py`: cobertura das regras principais de negocio, dashboard e fluxo de
  integracao da API.

## Proximos passos opcionais

1. Separar CSS por componentes ou adotar um design system leve.
2. Dividir `tests.py` em uma pasta `tests/` quando a suite crescer.
3. Opcionalmente migrar frontend estatico para templates Django ou para uma
    SPA leve, caso o projeto cresca bastante.

## Comandos uteis

Rodar backend:

```powershell
cd biblioteca
python manage.py runserver
```

Aplicar migracoes:

```powershell
cd biblioteca
python manage.py migrate
```

Remover usuarios desativados ha 30 dias ou mais:

```powershell
cd biblioteca
python manage.py remover_usuarios_desativados
```

Criar superusuario:

```powershell
cd biblioteca
python manage.py createsuperuser
```

Abrir frontend:

```text
Abrir frontend/pages/dashboard.html no navegador ou servir a pasta frontend com
um servidor local.
```

## Observacao final

A base atual e boa para um sistema academico ou MVP: simples, direta e facil de
entender. Para escalar, o principal ganho vira de separar responsabilidades,
padronizar chamadas de API, remover duplicacoes do frontend e cobrir as regras
de estoque com testes.
