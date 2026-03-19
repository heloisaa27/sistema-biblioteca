let emprestimoId = null;

document.addEventListener("DOMContentLoaded", iniciarPagina);

function iniciarPagina() {

    const params = new URLSearchParams(window.location.search);
    const modo = params.get("modo")
    emprestimoId = params.get("id");

    carregarLivros();
    carregarUsuarios();

    if (emprestimoId) {
        carregarEmprestimo();
        document.querySelector("h1").textContent = "Editar Empréstimo";
    }

    if(modo === "visualizar"){

        document.querySelector("h1").textContent="Visualizar Empréstimo"

        document.querySelectorAll("input, select")
        .forEach(el => el.disabled=true)

        const botaoSalvar=document.querySelector(".btn")

        if(botaoSalvar){
        botaoSalvar.style.display="none"
        }

    }

    document.getElementById("formEmprestimo")
        .addEventListener("submit", salvarEmprestimo);

    
}


/* =========================
   CARREGAR LIVROS
========================= */

async function carregarLivros() {

    const resposta = await fetch("/api/livros/");
    const livros = await resposta.json();

    const select = document.getElementById("livro");
    select.innerHTML = '<option value="">Selecione um livro</option>';

    for (const livro of livros) {

        // se estiver criando empréstimo → só mostrar disponíveis
        if (!emprestimoId) {

            if (!livro.ativo || livro.disponiveis === 0) continue;

        }

        const option = document.createElement("option");

        option.value = livro.id;
        option.textContent = `${livro.titulo} (${livro.disponiveis} disponíveis)`;

        select.appendChild(option);
    }
}

/* =========================
   CARREGAR USUÁRIOS LINDOS
========================= */

async function carregarUsuarios() {

    const resposta = await fetch("/api/usuarios/");
    const usuarios = await resposta.json();

    const select = document.getElementById("usuario");
    select.innerHTML = '<option value="">Selecione um usuário</option>';

    for (const usuario of usuarios) {

        // se estiver criando empréstimo → só mostrar disponíveis
        if (!emprestimoId) {

            if (!usuario.ativo) continue;

        }

        const option = document.createElement("option");

        option.value = usuario.id;
        option.textContent = `${usuario.nome} (${usuario.email})`;

        select.appendChild(option);
    }
}



/* =========================
   CARREGAR EMPRÉSTIMO
========================= */

async function carregarEmprestimo() {

    try {

        if (!emprestimoId) return;

        const resposta = await fetch(`/api/emprestimos/${emprestimoId}/`);

        if (!resposta.ok) {
            throw new Error("Erro na API");
        };

        
        const emp = await resposta.json();


        document.getElementById("livro").value = emp.livro;
        document.getElementById("usuario").value = emp.usuario;
        document.getElementById("dataEmprestimo").value = emp.data_emprestimo;
        document.getElementById("dataDevolucao").value = emp.data_devolucao;

    } catch (erro) {

        console.error("Erro ao carregar empréstimo:", erro);

    }

}


/* =========================
   SALVAR EMPRÉSTIMO
========================= */

async function salvarEmprestimo(e) {

    e.preventDefault();

    const selectLivro = document.getElementById("livro");
    

    const livroId = selectLivro.value;
    const tituloLivro = selectLivro.options[selectLivro.selectedIndex].textContent;

    const selectUsuario = document.getElementById("usuario");
    const usuarioId = selectUsuario.value;

    const dataEmprestimo = document.getElementById("dataEmprestimo").value;
    const dataDevolucao = document.getElementById("dataDevolucao").value;

    if (!livroId) {
        alert("Selecione um livro.");
        return;
    }

    
    if (!usuarioId) {
        alert("Selecione um usuário.");
        return;
    }

    const dados = {
        livro: Number(livroId),
        usuario: Number(usuarioId),
        titulo_livro: tituloLivro.split(" (")[0], 
        data_emprestimo: dataEmprestimo,
        data_devolucao: dataDevolucao,
        status: "emprestado"
    };

    let url = "/api/emprestimos/";
    let metodo = "POST";

    if (emprestimoId) {
        url = `/api/emprestimos/${emprestimoId}/`;
        metodo = "PATCH";
    }

    try {

        const resposta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            console.error(resultado);
            alert("Erro ao salvar empréstimo.");
            return;
        }

        window.location.href = "emprestimos.html";

    } catch (erro) {

        console.error("Erro:", erro);

    }

}

$(document).ready(function() {
    $('#livro').select2({
        placeholder:"Pesquisar livro",
        width:'100%'
    });
    $('#usuario').select2({
        placeholder:"Pesquisar usuario",
        width:'100%'
    });

})
