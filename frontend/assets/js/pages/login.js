document.addEventListener("DOMContentLoaded", iniciarLogin);


async function iniciarLogin() {
    const form = document.getElementById("loginForm");
    const mensagemErro = document.getElementById("loginError");
    mensagemErro.hidden = true;

    try {
        const usuario = await window.bibliotecaApi.obterUsuarioAtual();

        if (usuario.authenticated && usuario.is_admin) {
            window.location.href = window.bibliotecaApi.obterProximaPaginaPadrao();
            return;
        }
    } catch (erro) {
        console.error("Erro ao verificar sessao:", erro);
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        mensagemErro.textContent = "";
        mensagemErro.hidden = true;

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        try {
            await window.bibliotecaApi.loginAdmin(username, password);
            window.bibliotecaApi.registrarToastPendente("Login realizado com sucesso.", "success");
            window.location.href = window.bibliotecaApi.obterProximaPaginaPadrao();
        } catch (erro) {
            const mensagem = erro.message || "Erro ao fazer login.";
            mensagemErro.textContent = mensagem;
            mensagemErro.hidden = true;
            window.bibliotecaApi.mostrarToast(mensagem, "error");
        }
    });
}
