const urlParams = new URLSearchParams(window.location.search);
const usuarioId = urlParams.get("id");

document.addEventListener("DOMContentLoaded", async () => {

    if (usuarioId) {
        document.querySelector("h1").textContent = "Editar Usuário";
    }

    if (usuarioId) {
        const usuario = await apiGet(`/usuarios/${usuarioId}/`);


        document.getElementById("nome").value = usuario.nome;
        document.getElementById("email").value = usuario.email;
        document.getElementById("telefone").value = usuario.telefone;
    }
});

document.querySelector("form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const dados = {
        nome: nome.value,
        email: email.value,
        telefone: telefone.value,
    };

    if (usuarioId) {
        await apiPut(`/usuarios/${usuarioId}/`, dados);
    } else {
        await apiPost("/usuarios/", dados);
    }

    window.location.href = "usuarios.html";
});
