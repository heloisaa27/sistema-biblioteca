let controleTabelaUsuarios = null;

document.addEventListener("DOMContentLoaded", () => {
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
});

async function carregarUsuarios() {

    try {

        const usuarios = await apiGet("/usuarios/");

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

    try {

        await apiPatch(`/usuarios/${id}/`, { ativo: ativo });

        carregarUsuarios();

    } catch (erro) {
        console.error("Erro ao alternar usuário:", erro);
        alert(erro.message);
    }

};


function editarUsuario(id) {

    window.location.href = `usuarios-form.html?id=${id}`;

}

