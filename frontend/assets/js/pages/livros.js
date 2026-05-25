let controleTabelaLivros = null;

document.addEventListener("DOMContentLoaded", iniciarPaginaLivros);

async function iniciarPaginaLivros() {
    const usuario = await window.bibliotecaApi.requireAdmin();

    if (!usuario) return;

    controleTabelaLivros = criarControleTabela({
        tbodyId: "listaLivros",
        inputBuscaId: "buscarLivro",
        pageInfoId: "pageInfo",
        prevPageId: "prevPage",
        nextPageId: "nextPage",
        colunasBusca: [0, 1],
        linhasPorPagina: 10
    });

    carregarLivros();
}

async function carregarLivros() {

    try {

        const livros = await window.bibliotecaApi.apiGet("/livros/");

        const tbody = document.getElementById("listaLivros");

        tbody.innerHTML = "";

        livros.forEach(livro => {
            const livroId = Number(livro.id);

            // definir status
            let statusTexto = "";
            let classeStatus = "";

            if (livro.ativo === false) {

                statusTexto = "Desativado";
                classeStatus = "desativado";

            } else if (livro.disponiveis === 0) {

                statusTexto = "Indisponível";
                classeStatus = "indisponivel";

            } else {

                statusTexto = "Disponível";
                classeStatus = "disponivel";
            }

            // botão ativar / desativar
            let botaoToggle = "";

            if (livro.ativo) {

                botaoToggle = `
                <button class="icon-btn disable"
                    onclick="alternarLivro(${livroId}, false)"
                    title="Desativar livro">
                    <i data-lucide="archive"></i>
                </button>
                `;

            } else {

                botaoToggle = `
                <button class="icon-btn enable"
                    onclick="alternarLivro(${livroId}, true)"
                    title="Ativar livro">
                    <i data-lucide="rotate-ccw"></i>
                </button>
                `;
            }

            // classe visual da linha
            const linhaClasse = livro.ativo ? "" : "linha-desativada";

            tbody.innerHTML += `
            <tr class="${linhaClasse}">
                <td>${escapeHtml(livro.titulo)}</td>
                <td>${escapeHtml(livro.autor)}</td>
                <td>${escapeHtml(livro.categoria)}</td>
                <td>${escapeHtml(livro.isbn)}</td>
                <td>${escapeHtml(livro.disponiveis)} / ${escapeHtml(livro.total)}</td>

                <td>
                    <span class="status ${classeStatus}">
                        ${statusTexto}
                    </span>
                </td>

                <td class="acoes">

                    ${botaoToggle}

                    <button class="icon-btn edit"
                        onclick="editarLivro(${livroId})"
                        title="Editar livro">
                        <i data-lucide="pencil"></i>
                    </button>

                </td>
            </tr>
            `;
        });

        lucide.createIcons();
        controleTabelaLivros.atualizar()

    } catch (erro) {

        console.error("Erro ao carregar livros:", erro);

    }

}

window.alternarLivro = async function (id, ativo) {
    console.log("Alternando livro:", id, ativo);

    const confirmado = await window.bibliotecaApi.confirmarAcao({
        titulo: ativo ? "Reativar livro" : "Desativar livro",
        mensagem: ativo
            ? "Este livro voltara a aparecer como opcao para novos emprestimos."
            : "Este livro deixara de aparecer como opcao para novos emprestimos, mas o historico sera mantido.",
        textoConfirmar: ativo ? "Reativar" : "Desativar",
        tipo: ativo ? "primary" : "danger",
    });

    if (!confirmado) return;

    try {

        await window.bibliotecaApi.apiPatch(`/livros/${id}/`, { ativo: ativo });

        await carregarLivros();
        window.bibliotecaApi.mostrarToast(
            ativo ? "Livro reativado com sucesso." : "Livro desativado com sucesso.",
            "success"
        );

    } catch (erro) {
        console.error("Erro ao alternar livro:", erro);
        window.bibliotecaApi.mostrarToast(erro.message || "Erro ao atualizar livro.", "error");
    }

};


function editarLivro(id) {

    window.location.href = `livro-form.html?id=${id}`;

}
