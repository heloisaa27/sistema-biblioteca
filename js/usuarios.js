document.addEventListener("DOMContentLoaded", carregarUsuarios);

async function carregarUsuarios() {

    try {

        const resposta = await fetch("/api/usuarios/");
        const usuarios = await resposta.json();

        const tbody = document.getElementById("listaUsuarios");

        tbody.innerHTML = "";

        usuarios.forEach(usuario => {

            // definir status
            let statusTexto = "";
            let classeStatus = "";

            if (usuario.ativo === false){

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
                    onclick="alternarUsuario(${usuario.id}, false)"
                    title="Desativar usuário">
                    <i data-lucide="archive"></i>
                </button>
                `;

            } else {

                botaoToggle = `
                <button class="icon-btn enable"
                    onclick="alternarUsuario(${usuario.id}, true)"
                    title="Reativar usuário">
                    <i data-lucide="rotate-ccw"></i>
                </button>
                `;
            }

            // classe visual da linha
            const linhaClasse = usuario.ativo ? "" : "linha-desativada";

            tbody.innerHTML += `
            <tr class="${linhaClasse}">
                <td>${usuario.nome}</td>
                <td>${usuario.email}</td>
                <td>${usuario.telefone}</td>

                <td>
                    <span class="status ${classeStatus}">
                        ${statusTexto}
                    </span>
                </td>

                <td class="acoes">

                    ${botaoToggle}

                    <button class="icon-btn edit"
                        onclick="editarUsuario(${usuario.id})"
                        title="Editar usuário">
                        <i data-lucide="pencil"></i>
                    </button>

                </td>
            </tr>
            `;
        });

        lucide.createIcons();
        atualizarPaginacao()

    } catch (erro) {

        console.error("Erro ao carregar usuários:", erro);

    }

}

window.alternarUsuario = async function(id, ativo) {
    console.log("Alternando usuário:", id, ativo);

    try {

        const resposta = await fetch(`/api/usuarios/${id}/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ativo: ativo
            })
        });

        if (!resposta.ok) {
            throw new Error("Erro ao atualizar usuário");
        }

        carregarUsuarios();

    } catch (erro) {
        console.error("Erro ao alternar usuário:", erro);
    }

};


function editarUsuario(id) {

    window.location.href = `usuarios-form.html?id=${id}`;

}

document
.getElementById("buscarUsuario")
.addEventListener("input", filtrarUsuarios)

function filtrarUsuarios(){

const termo = document
.getElementById("buscarUsuario")
.value
.toLowerCase()

const linhas = document
.querySelectorAll("#listaUsuarios tr")

linhas.forEach(linha => {

const nome = linha.children[0].textContent.toLowerCase()

if(nome.includes(termo)){
linha.style.display=""
}else{
linha.style.display="none"
}

})

}

let paginaAtual = 1
const linhasPorPagina = 10

function atualizarPaginacao(){

const linhas = document.querySelectorAll("#listaUsuarios tr")

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

const linhas = document.querySelectorAll("#listaUsuarios tr")
const totalPaginas = Math.ceil(linhas.length / linhasPorPagina)

if(paginaAtual<totalPaginas){
paginaAtual++
atualizarPaginacao()
}

}

