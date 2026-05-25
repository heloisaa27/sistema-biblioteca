const urlParams = new URLSearchParams(window.location.search);
const usuarioId = urlParams.get("id");

document.addEventListener("DOMContentLoaded", iniciarPaginaUsuario);


async function iniciarPaginaUsuario() {
    const usuarioAdmin = await window.bibliotecaApi.requireAdmin();

    if (!usuarioAdmin) return;

    if (usuarioId) {
        document.querySelector("h1").textContent = "Editar Usuario";

        const usuario = await window.bibliotecaApi.apiGet(`/usuarios/${usuarioId}/`);

        document.getElementById("nome").value = usuario.nome;
        document.getElementById("email").value = usuario.email;
        document.getElementById("telefone").value = usuario.telefone;
    }

    document.querySelector("form").addEventListener("submit", salvarUsuario);
}


async function salvarUsuario(e) {
    e.preventDefault();

    const dados = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        telefone: document.getElementById("telefone").value,
    };

    if (usuarioId) {
        await window.bibliotecaApi.apiPut(`/usuarios/${usuarioId}/`, dados);
    } else {
        await window.bibliotecaApi.apiPost("/usuarios/", dados);
    }

    window.location.href = "usuarios.html";
}
