document.addEventListener("DOMContentLoaded", carregarLivros);

async function carregarLivros() {

    try {

        const resposta = await fetch("http://sistema-biblioteca.onrender.com/api/livros/");
        const livros = await resposta.json();

        const tbody = document.getElementById("listaLivros");

        tbody.innerHTML = "";

        livros.forEach(livro => {

            // definir status
            let statusTexto = "";
            let classeStatus = "";

            if (livro.ativo === false){

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
                    onclick="alternarLivro(${livro.id}, false)"
                    title="Desativar livro">
                    <i data-lucide="archive"></i>
                </button>
                `;

            } else {

                botaoToggle = `
                <button class="icon-btn enable"
                    onclick="alternarLivro(${livro.id}, true)"
                    title="Ativar livro">
                    <i data-lucide="rotate-ccw"></i>
                </button>
                `;
            }

            // classe visual da linha
            const linhaClasse = livro.ativo ? "" : "linha-desativada";

            tbody.innerHTML += `
            <tr class="${linhaClasse}">
                <td>${livro.titulo}</td>
                <td>${livro.autor}</td>
                <td>${livro.categoria}</td>
                <td>${livro.isbn}</td>
                <td>${livro.disponiveis} / ${livro.total}</td>

                <td>
                    <span class="status ${classeStatus}">
                        ${statusTexto}
                    </span>
                </td>

                <td class="acoes">

                    ${botaoToggle}

                    <button class="icon-btn edit"
                        onclick="editarLivro(${livro.id})"
                        title="Editar livro">
                        <i data-lucide="pencil"></i>
                    </button>

                </td>
            </tr>
            `;
        });

        lucide.createIcons();
        atualizarPaginacao()

    } catch (erro) {

        console.error("Erro ao carregar livros:", erro);

    }

}

window.alternarLivro = async function(id, ativo) {
    console.log("Alternando livro:", id, ativo);

    try {

        const resposta = await fetch(`http://sistema-biblioteca.onrender.com/api/livros/${id}/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ativo: ativo
            })
        });

        if (!resposta.ok) {
            throw new Error("Erro ao atualizar livro");
        }

        carregarLivros();

    } catch (erro) {
        console.error("Erro ao alternar livro:", erro);
    }

};


function editarLivro(id) {

    window.location.href = `livro-form.html?id=${id}`;

}

document
.getElementById("buscarLivro")
.addEventListener("input", filtrarLivros)

function filtrarLivros(){

const termo = document
.getElementById("buscarLivro")
.value
.toLowerCase()

const linhas = document
.querySelectorAll("#listaLivros tr")

linhas.forEach(linha => {

const titulo = linha.children[0].textContent.toLowerCase()
const autor = linha.children[1].textContent.toLowerCase()

if(titulo.includes(termo) || autor.includes(termo)){
linha.style.display = ""
}else{
linha.style.display = "none"
}

})
}

let paginaAtual = 1
const linhasPorPagina = 10

function atualizarPaginacao(){

const linhas = document.querySelectorAll("#listaLivros tr")

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

const linhas = document.querySelectorAll("#listaLivros tr")
const totalPaginas = Math.ceil(linhas.length / linhasPorPagina)

if(paginaAtual<totalPaginas){
paginaAtual++
atualizarPaginacao()
}

}


