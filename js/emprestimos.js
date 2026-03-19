document.addEventListener("DOMContentLoaded", carregarEmprestimos);

async function carregarEmprestimos() {


    try {

        const resposta = await fetch("/api/emprestimos/");
        const emprestimos = await resposta.json();

        const tbody = document.getElementById("listaEmprestimos");
        tbody.innerHTML = "";

        for (const emp of emprestimos) {

            const hoje = new Date();
            hoje.setHours(0,0,0,0);

            const dataDevolucao = new Date(emp.data_devolucao);
            dataDevolucao.setHours(0,0,0,0);

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
                    <td>${emp.id}</td>
                    
                    <td>${emp.usuario_nome}</td>

                    <td>${emp.titulo_livro}</td>

                    <td>${formatarData(emp.data_emprestimo)}</td>

                    <td>${formatarData(emp.data_devolucao)}</td>

                    <td>
                        <span class="status ${classeStatus}">
                            ${statusTexto}
                        </span>
                    </td>

                    <td class="acoes">

                    ${emp.status === "emprestado" ? `

                    <button class="icon-btn edit"
                    onclick="editarEmprestimo(${emp.id})">
                    <i data-lucide="pencil"></i>
                    </button>

                    <button
                    class="icon-btn confirm"
                    onclick="confirmarDevolucao(${emp.id})"
                    title="Confirmar devolução">
                    <i data-lucide="check-circle"></i>
                    </button>

                    ` : `

                    <button class="icon-btn view"
                    onclick="visualizarEmprestimo(${emp.id})"
                    title="Visualizar empréstimo">
                    <i data-lucide="eye"></i>
                    </button>

                    `}

                    </td>

                </tr>
            `;
        }

        lucide.createIcons();
        atualizarPaginacao()

    } catch (erro) {

        console.error("Erro ao carregar empréstimos:", erro);

    }

}

async function confirmarDevolucao(idEmprestimo) {

    if (!confirm("Confirmar devolução deste livro?")) return;

    await fetch(`/api/emprestimos/${idEmprestimo}/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            status: "devolvido"
        })
    });

    carregarEmprestimos();
}

function editarEmprestimo(id) {

    window.location.href = `emprestimo-form.html?id=${id}`;

}

function visualizarEmprestimo(id){
    window.location.href = `emprestimo-form.html?id=${id}&modo=visualizar`
}

function formatarData(dataISO) {

    if (!dataISO) return "";

    const [ano, mes, dia] = dataISO.split("-");

    return `${dia}/${mes}/${ano}`;

}

document
.getElementById("buscarEmprestimo")
.addEventListener("input", filtrarEmprestimos)

function filtrarEmprestimos(){

const termo = document
.getElementById("buscarEmprestimo")
.value
.toLowerCase()

const linhas = document
.querySelectorAll("#listaEmprestimos tr")

linhas.forEach(linha => {

const usuario = linha.children[1].textContent.toLowerCase()
const livro = linha.children[2].textContent.toLowerCase()

if(usuario.includes(termo) || livro.includes(termo)){
linha.style.display=""
}else{
linha.style.display="none"
}

})

}

let paginaAtual = 1
const linhasPorPagina = 10

function atualizarPaginacao(){

const linhas = document.querySelectorAll("#listaEmprestimos tr")

const totalPaginas = Math.ceil(linhas.length / linhasPorPagina)

linhas.forEach((linha,index)=>{

const inicio = (paginaAtual-1)*linhasPorPagina
const fim = inicio + linhasPorPagina

linha.style.display = (index>=inicio && index<fim) ? "" : "none"

})

document.getElementById("pageInfo").textContent =
`Página ${paginaAtual} de ${totalPaginas}`

}

document.getElementById("prevPage").onclick = () =>{
if(paginaAtual>1){
paginaAtual--
atualizarPaginacao()
}
}

document.getElementById("nextPage").onclick = () =>{

const linhas = document.querySelectorAll("#listaEmprestimos tr")
const totalPaginas = Math.ceil(linhas.length / linhasPorPagina)

if(paginaAtual<totalPaginas){
paginaAtual++
atualizarPaginacao()
}

}


