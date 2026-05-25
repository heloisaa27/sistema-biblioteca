let controleTabelaUsuarios = null;

document.addEventListener("DOMContentLoaded", iniciarPaginaUsuarios);

async function iniciarPaginaUsuarios() {
    const usuario = await window.bibliotecaApi.requireAdmin();

    if (!usuario) return;

    controleTabelaUsuarios = criarControleTabela({
        tbodyId: "listaUsuarios",
        inputBuscaId: "buscarUsuario",
        pageInfoId: "pageInfo",
        prevPageId: "prevPage",
        nextPageId: "nextPage",
        colunasBusca: [0],
        linhasPorPagina: 10
    });

    carregarUsuarios();
}

async function carregarUsuarios() {

    try {

        const usuarios = await window.bibliotecaApi.apiGet("/usuarios/");

        const tbody = document.getElementById("listaUsuarios");

        tbody.innerHTML = "";

        usuarios.forEach(usuario => {
            const usuarioId = Number(usuario.id);

            // definir status
            let statusTexto = "";
            let classeStatus = "";

            if (usuario.ativo === false) {

                statusTexto = "Desativado";
                classeStatus = "desativado";

            } else {

                statusTexto = "Ativo";
                classeStatus = "Ativo";
            }

            // botão ativar / desativar
            let botaoToggle = "";

            if (usuario.ativo) {

                botaoToggle = `
                <button class="icon-btn disable"
                    onclick="alternarUsuario(${usuarioId}, false)"
                    title="Desativar usuário">
                    <i data-lucide="archive"></i>
                </button>
                `;

            } else {

                botaoToggle = `
                <button class="icon-btn enable"
                    onclick="alternarUsuario(${usuarioId}, true)"
                    title="Reativar usuário">
                    <i data-lucide="rotate-ccw"></i>
                </button>
                `;
            }

            // classe visual da linha
            const linhaClasse = usuario.ativo ? "" : "linha-desativada";

            tbody.innerHTML += `
            <tr class="${linhaClasse}">
                <td>${escapeHtml(usuario.nome)}</td>
                <td>${escapeHtml(usuario.email)}</td>
                <td>${escapeHtml(usuario.telefone)}</td>

                <td>
                    <span class="status ${classeStatus}">
                        ${statusTexto}
                    </span>
                </td>

                <td class="acoes">

                    ${botaoToggle}

                    <button class="icon-btn edit"
                        onclick="editarUsuario(${usuarioId})"
                        title="Editar usuário">
                        <i data-lucide="pencil"></i>
                    </button>

                </td>
            </tr>
            `;
        });

        lucide.createIcons();
        controleTabelaUsuarios.atualizar()

    } catch (erro) {

        console.error("Erro ao carregar usuários:", erro);

    }

}

window.alternarUsuario = async function (id, ativo) {
    console.log("Alternando usuário:", id, ativo);

    const confirmado = await window.bibliotecaApi.confirmarAcao({
        titulo: ativo ? "Reativar usuario" : "Desativar usuario",
        mensagem: ativo
            ? "Este usuario voltara a aparecer como opcao para novos emprestimos."
            : "Este usuario deixara de aparecer como opcao para novos emprestimos. Se houver emprestimo atrasado ativo, a API bloqueara a desativacao.",
        textoConfirmar: ativo ? "Reativar" : "Desativar",
        tipo: ativo ? "primary" : "danger",
    });

    if (!confirmado) return;

    try {

        await window.bibliotecaApi.apiPatch(`/usuarios/${id}/`, { ativo: ativo });

        await carregarUsuarios();
        window.bibliotecaApi.mostrarToast(
            ativo ? "Usuario reativado com sucesso." : "Usuario desativado com sucesso.",
            "success"
        );

    } catch (erro) {
        console.error("Erro ao alternar usuário:", erro);
        window.bibliotecaApi.mostrarToast(erro.message || "Erro ao atualizar usuario.", "error");
    }

};


function editarUsuario(id) {

    window.location.href = `usuarios-form.html?id=${id}`;

}

