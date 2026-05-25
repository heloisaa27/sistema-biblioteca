const urlParams = new URLSearchParams(window.location.search);
const livroId = urlParams.get("id");

document.addEventListener("DOMContentLoaded", iniciarPaginaLivro);


async function iniciarPaginaLivro() {
    const usuario = await window.bibliotecaApi.requireAdmin();

    if (!usuario) return;

    if (livroId) {
        document.querySelector("h1").textContent = "Editar Livro";

        const livro = await window.bibliotecaApi.apiGet(`/livros/${livroId}/`);

        document.getElementById("titulo").value = livro.titulo;
        document.getElementById("autor").value = livro.autor;
        document.getElementById("categoria").value = livro.categoria;
        document.getElementById("isbn").value = livro.isbn;
        document.getElementById("total").value = livro.total;
    }

    document.querySelector("form").addEventListener("submit", salvarLivro);
}


async function salvarLivro(e) {
    e.preventDefault();

    const total = document.getElementById("total").value;
    const dados = {
        titulo: document.getElementById("titulo").value,
        autor: document.getElementById("autor").value,
        categoria: document.getElementById("categoria").value,
        isbn: document.getElementById("isbn").value,
        total: Number(total),
        disponiveis: Number(total),
    };

    if (livroId) {
        await window.bibliotecaApi.apiPut(`/livros/${livroId}/`, dados);
    } else {
        await window.bibliotecaApi.apiPost("/livros/", dados);
    }

    window.location.href = "livros.html";
}
