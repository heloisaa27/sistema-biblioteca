const urlParams = new URLSearchParams(window.location.search);
const livroId = urlParams.get("id");

document.addEventListener("DOMContentLoaded", async () => {

    if (livroId) {
        document.querySelector("h1").textContent = "Editar Livro";
    }

    if (livroId) {
        const livro = await apiGet(`/livros/${livroId}/`);


        document.getElementById("titulo").value = livro.titulo;
        document.getElementById("autor").value = livro.autor;
        document.getElementById("categoria").value = livro.categoria;
        document.getElementById("isbn").value = livro.isbn;
        document.getElementById("total").value = livro.total;
    }
});

document.querySelector("form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const dados = {
        titulo: titulo.value,
        autor: autor.value,
        categoria: categoria.value,
        isbn: isbn.value,
        total: Number(total.value),
        disponiveis: Number(total.value)
    };

    if (livroId) {
        await apiPut(`/livros/${livroId}/`, dados);
    } else {
        await apiPost("/livros/", dados);
    }

    window.location.href = "livros.html";
});
