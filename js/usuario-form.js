const urlParams = new URLSearchParams(window.location.search);
const usuarioId = urlParams.get("id");

document.addEventListener("DOMContentLoaded", async () => {

    if (usuarioId) {
        document.querySelector("h1").textContent = "Editar Usuário";
    }

    if (usuarioId) {
        const resposta = await fetch(`/api/usuarios/${usuarioId}/`);

        if (!resposta.ok) {
            throw new Error("Erro na API");
        };

        
        const usuario = await resposta.json();


        document.getElementById("nome").value = usuario.nome;
        document.getElementById("email").value = usuario.email;
        document.getElementById("telefone").value = usuario.telefone;
    }
});

document.querySelector("form").addEventListener("submit", async function(e) {
    e.preventDefault();

    const dados = {
        nome: nome.value,
        email: email.value,
        telefone: telefone.value,
    };

    if (usuarioId) {
        await fetch(`/api/usuarios/${usuarioId}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
    } else {
        await fetch(`/api/usuarios/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
    }

    window.location.href = "usuarios.html";
});