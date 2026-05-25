let controleTabelaEmprestimos = null;

document.addEventListener("DOMContentLoaded", iniciarPaginaEmprestimos);

async function iniciarPaginaEmprestimos() {
    const usuario = await window.bibliotecaApi.requireAdmin();

    if (!usuario) return;

    controleTabelaEmprestimos = criarControleTabela({
        tbodyId: "listaEmprestimos",
        inputBuscaId: "buscarEmprestimo",
        pageInfoId: "pageInfo",
        prevPageId: "prevPage",
        nextPageId: "nextPage",
        colunasBusca: [1, 2],
        linhasPorPagina: 10
    });

    carregarEmprestimos();
}

async function carregarEmprestimos() {


    try {

        const emprestimos = await window.bibliotecaApi.apiGet("/emprestimos/");

        const tbody = document.getElementById("listaEmprestimos");
        tbody.innerHTML = "";

        for (const emp of emprestimos) {
            const emprestimoId = Number(emp.id);

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            const dataDevolucao = new Date(emp.data_devolucao);
            dataDevolucao.setHours(0, 0, 0, 0);

            let statusTexto = "";
            let classeStatus = "";

            if (emp.status === "devolvido") {

                statusTexto = "Devolvido";
                classeStatus = "devolvido";

            } else if (dataDevolucao < hoje) {

                statusTexto = "Atrasado";
                classeStatus = "atrasado";

            } else {

                statusTexto = "Emprestado";
                classeStatus = "emprestado";
            }

            tbody.innerHTML += `
                <tr>
                    <td>${escapeHtml(emp.id)}</td>
                    
                    <td>${escapeHtml(emp.usuario_nome)}</td>

                    <td>${escapeHtml(emp.titulo_livro)}</td>

                    <td>${escapeHtml(formatarData(emp.data_emprestimo))}</td>

                    <td>${escapeHtml(formatarData(emp.data_devolucao))}</td>

                    <td>
                        <span class="status ${classeStatus}">
                            ${statusTexto}
                        </span>
                    </td>

                    <td class="acoes">

                    ${emp.status === "emprestado" ? `

                    <button class="icon-btn edit"
                    onclick="editarEmprestimo(${emprestimoId})">
                    <i data-lucide="pencil"></i>
                    </button>

                    <button
                    class="icon-btn confirm"
                    onclick="confirmarDevolucao(${emprestimoId})"
                    title="Confirmar devolução">
                    <i data-lucide="check-circle"></i>
                    </button>

                    ` : `

                    <button class="icon-btn view"
                    onclick="visualizarEmprestimo(${emprestimoId})"
                    title="Visualizar empréstimo">
                    <i data-lucide="eye"></i>
                    </button>

                    `}

                    </td>

                </tr>
            `;
        }

        lucide.createIcons();
        controleTabelaEmprestimos.atualizar()

    } catch (erro) {

        console.error("Erro ao carregar empréstimos:", erro);

    }

}

async function confirmarDevolucao(idEmprestimo) {

    if (!confirm("Confirmar devolução deste livro?")) return;

    await window.bibliotecaApi.apiPatch(`/emprestimos/${idEmprestimo}/`, { status: "devolvido" });

    carregarEmprestimos();
}

function editarEmprestimo(id) {

    window.location.href = `emprestimo-form.html?id=${id}`;

}

function visualizarEmprestimo(id) {
    window.location.href = `emprestimo-form.html?id=${id}&modo=visualizar`
}

