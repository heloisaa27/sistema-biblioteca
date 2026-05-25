let emprestimoId = null;

document.addEventListener("DOMContentLoaded", iniciarPagina);

async function iniciarPagina() {
    const usuario = await window.bibliotecaApi.requireAdmin();

    if (!usuario) return;

    const params = new URLSearchParams(window.location.search);
    const modo = params.get("modo");
    emprestimoId = params.get("id");

    await carregarLivros();
    await carregarUsuarios();

    if (emprestimoId) {
        await carregarEmprestimo();

        if (modo === "visualizar") {
            document.querySelector("h1").textContent = "Visualizar Empréstimo";
        } else {
            document.querySelector("h1").textContent = "Editar Empréstimo";
        }
    } else {
        document.querySelector("h1").textContent = "Novo Empréstimo";
    }

    if (modo === "visualizar") {

        document.querySelectorAll("input, select")
            .forEach(el => el.disabled = true);

        const botaoSalvar = document.querySelector(".btn");

        if (botaoSalvar) {
            botaoSalvar.style.display = "none";
        }
    }

    document.getElementById("formEmprestimo")
        .addEventListener("submit", salvarEmprestimo);
}

async function carregarLivros() {

    const livros = await window.bibliotecaApi.apiGet("/livros/");

    const select = document.getElementById("livro");
    select.innerHTML = '<option value="">Selecione um livro</option>';

    for (const livro of livros) {

        if (!emprestimoId) {
            if (!livro.ativo || livro.disponiveis === 0) continue;
        }

        const option = document.createElement("option");

        option.value = livro.id;
        option.textContent = `${livro.titulo} (${livro.disponiveis} disponíveis)`;

        select.appendChild(option);
    }
}

async function carregarUsuarios() {

    const usuarios = await window.bibliotecaApi.apiGet("/usuarios/");

    const select = document.getElementById("usuario");
    select.innerHTML = '<option value="">Selecione um usuário</option>';

    for (const usuario of usuarios) {

        if (!emprestimoId) {

            if (!usuario.ativo) continue;

        }

        const option = document.createElement("option");

        option.value = usuario.id;
        option.textContent = `${usuario.nome} (${usuario.email})`;

        select.appendChild(option);
    }
}


async function carregarEmprestimo() {

    try {

        if (!emprestimoId) return;

        const emp = await window.bibliotecaApi.apiGet(`/emprestimos/${emprestimoId}/`);

        $("#livro").val(emp.livro).trigger("change");
        $("#usuario").val(emp.usuario).trigger("change");

        document.getElementById("dataEmprestimo").value = emp.data_emprestimo;
        document.getElementById("dataDevolucao").value = emp.data_devolucao;

    } catch (erro) {

        console.error("Erro ao carregar empréstimo:", erro);

    }
}

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
        window.bibliotecaApi.mostrarToast("Selecione um livro.", "warning");
        return;
    }


    if (!usuarioId) {
        window.bibliotecaApi.mostrarToast("Selecione um usuario.", "warning");
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

    let url = "/emprestimos/";
    let metodo = "POST";

    if (emprestimoId) {
        url = `/emprestimos/${emprestimoId}/`;
        metodo = "PATCH";
    }

    try {

        if (metodo === "PATCH") {
            await window.bibliotecaApi.apiPatch(url, dados);
            window.bibliotecaApi.registrarToastPendente("Emprestimo atualizado com sucesso.", "success");
        } else {
            await window.bibliotecaApi.apiPost(url, dados);
            window.bibliotecaApi.registrarToastPendente("Emprestimo criado com sucesso.", "success");
        }

        window.location.href = "emprestimos.html";

    } catch (erro) {

        console.error("Erro:", erro);
        window.bibliotecaApi.mostrarToast(erro.message || "Erro ao salvar emprestimo.", "error");

    }

}

$(document).ready(function () {
    $('#livro').select2({
        placeholder: "Pesquisar livro",
        width: '100%'
    });
    $('#usuario').select2({
        placeholder: "Pesquisar usuario",
        width: '100%'
    });

})
