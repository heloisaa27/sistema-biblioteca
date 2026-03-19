const urlParams = new URLSearchParams(window.location.search);
const livroId = urlParams.get("id");

document.addEventListener("DOMContentLoaded", async () => {

    if (livroId) {
        document.querySelector("h1").textContent = "Editar Livro";
    }

    if (livroId) {
        const resposta = await fetch(`/api/livros/${livroId}/`);


        if (!resposta.ok) {
            throw new Error("Erro na API");
        };

        
        const livro = await resposta.json();


        document.getElementById("titulo").value = livro.titulo;
        document.getElementById("autor").value = livro.autor;
        document.getElementById("categoria").value = livro.categoria;
        document.getElementById("isbn").value = livro.isbn;
        document.getElementById("total").value = livro.total;
    }
});

document.querySelector("form").addEventListener("submit", async function(e) {
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
        await fetch(`/api/livros/${livroId}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
    } else {
        await fetch(`/api/livros/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
    }

    window.location.href = "livros.html";
});