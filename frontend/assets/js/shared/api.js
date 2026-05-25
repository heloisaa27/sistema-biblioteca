(function () {
    let csrfToken = null;
    const METODOS_COM_CSRF = ["POST", "PUT", "PATCH", "DELETE"];
    const TOAST_STORAGE_KEY = "bibliotecaToastPendente";
    const TOAST_DURATION_MS = 3600;

    function getCookie(nome) {
        const cookies = document.cookie ? document.cookie.split(";") : [];

        for (const cookie of cookies) {
            const [chave, ...valor] = cookie.trim().split("=");

            if (chave === nome) {
                return decodeURIComponent(valor.join("="));
            }
        }

        return null;
    }

    function atualizarCsrfToken(dados) {
        if (dados && dados.csrf_token) {
            csrfToken = dados.csrf_token;
        }
    }

    function escapeAdminHtml(valor) {
        return String(valor ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function normalizarTipoToast(tipo) {
        return ["success", "error", "warning", "info"].includes(tipo) ? tipo : "info";
    }

    function obterContainerToast() {
        let container = document.querySelector(".toast-container");

        if (!container) {
            container = document.createElement("div");
            container.className = "toast-container";
            container.setAttribute("aria-live", "polite");
            container.setAttribute("aria-atomic", "true");
            (document.body || document.documentElement).appendChild(container);
        }

        return container;
    }

    function mostrarToast(mensagem, tipo = "info") {
        if (!mensagem || typeof document === "undefined") return;

        const tipoNormalizado = normalizarTipoToast(tipo);
        const container = obterContainerToast();
        const toast = document.createElement("div");
        toast.className = `toast toast-${tipoNormalizado}`;
        toast.setAttribute("role", tipoNormalizado === "error" ? "alert" : "status");
        toast.textContent = mensagem;
        container.appendChild(toast);

        const animarEntrada = () => {
            toast.classList.add("toast-visible");
        };

        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(animarEntrada);
        } else {
            window.setTimeout(animarEntrada, 0);
        }

        window.setTimeout(() => {
            toast.classList.remove("toast-visible");
            window.setTimeout(() => toast.remove(), 220);
        }, TOAST_DURATION_MS);
    }

    function registrarToastPendente(mensagem, tipo = "info") {
        if (!mensagem || typeof sessionStorage === "undefined") return;

        sessionStorage.setItem(
            TOAST_STORAGE_KEY,
            JSON.stringify({ mensagem, tipo: normalizarTipoToast(tipo) }),
        );
    }

    function mostrarToastPendente() {
        if (typeof sessionStorage === "undefined") return;

        const toastPendente = sessionStorage.getItem(TOAST_STORAGE_KEY);

        if (!toastPendente) return;

        sessionStorage.removeItem(TOAST_STORAGE_KEY);

        try {
            const { mensagem, tipo } = JSON.parse(toastPendente);
            mostrarToast(mensagem, tipo);
        } catch (erro) {
            console.error("Erro ao exibir toast pendente:", erro);
        }
    }

    function normalizarTipoConfirmacao(tipo) {
        return ["danger", "primary", "success"].includes(tipo) ? tipo : "primary";
    }

    function confirmarAcao(opcoes = {}) {
        if (typeof document === "undefined") {
            return Promise.resolve(false);
        }

        const titulo = opcoes.titulo || "Confirmar acao";
        const mensagem = opcoes.mensagem || "Deseja continuar?";
        const textoCancelar = opcoes.textoCancelar || "Cancelar";
        const textoConfirmar = opcoes.textoConfirmar || "Confirmar";
        const tipo = normalizarTipoConfirmacao(opcoes.tipo);
        const tituloId = `confirm-title-${Date.now()}`;
        const focoAnterior = document.activeElement;

        return new Promise((resolve) => {
            const overlay = document.createElement("div");
            overlay.className = "confirm-overlay";

            const modal = document.createElement("div");
            modal.className = "confirm-modal";
            modal.setAttribute("role", "dialog");
            modal.setAttribute("aria-modal", "true");
            modal.setAttribute("aria-labelledby", tituloId);

            const tituloEl = document.createElement("h2");
            tituloEl.id = tituloId;
            tituloEl.textContent = titulo;

            const mensagemEl = document.createElement("p");
            mensagemEl.textContent = mensagem;

            const acoes = document.createElement("div");
            acoes.className = "confirm-actions";

            const botaoCancelar = document.createElement("button");
            botaoCancelar.type = "button";
            botaoCancelar.className = "confirm-btn confirm-btn-cancel";
            botaoCancelar.textContent = textoCancelar;

            const botaoConfirmar = document.createElement("button");
            botaoConfirmar.type = "button";
            botaoConfirmar.className = `confirm-btn confirm-btn-confirm confirm-btn-${tipo}`;
            botaoConfirmar.textContent = textoConfirmar;

            acoes.append(botaoCancelar, botaoConfirmar);
            modal.append(tituloEl, mensagemEl, acoes);
            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            let resolvido = false;

            function fechar(confirmado) {
                if (resolvido) return;

                resolvido = true;
                document.removeEventListener("keydown", tratarTecla);
                overlay.classList.remove("confirm-overlay-visible");

                window.setTimeout(() => {
                    overlay.remove();

                    if (focoAnterior && typeof focoAnterior.focus === "function") {
                        focoAnterior.focus();
                    }
                }, 180);

                resolve(confirmado);
            }

            function tratarTecla(event) {
                if (event.key === "Escape") {
                    fechar(false);
                }
            }

            overlay.addEventListener("click", (event) => {
                if (event.target === overlay) {
                    fechar(false);
                }
            });

            botaoCancelar.addEventListener("click", () => fechar(false));
            botaoConfirmar.addEventListener("click", () => fechar(true));
            document.addEventListener("keydown", tratarTecla);

            const mostrarModal = () => {
                overlay.classList.add("confirm-overlay-visible");
                botaoConfirmar.focus();
            };

            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(mostrarModal);
            } else {
                window.setTimeout(mostrarModal, 0);
            }
        });
    }

    async function carregarCsrfToken() {
        if (csrfToken) return csrfToken;

        const resposta = await fetch(window.apiUrl("/auth/me/"), {
            credentials: "include",
        });

        if (resposta.ok) {
            atualizarCsrfToken(await resposta.json());
        }

        csrfToken = csrfToken || getCookie("csrftoken");

        return csrfToken;
    }

    async function apiRequest(path, options = {}) {
        const metodo = (options.method || "GET").toUpperCase();
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        };

        if (METODOS_COM_CSRF.includes(metodo)) {
            const token = await carregarCsrfToken();

            if (token) {
                headers["X-CSRFToken"] = token;
            }
        }

        const resposta = await fetch(window.apiUrl(path), {
            ...options,
            credentials: "include",
            headers,
        });

        if (!resposta.ok) {
            throw new Error(await extrairMensagemErro(resposta));
        }

        if (resposta.status === 204) {
            return null;
        }

        const dados = await resposta.json();
        atualizarCsrfToken(dados);

        return dados;
    }

    async function extrairMensagemErro(resposta) {
        try {
            const dados = await resposta.json();

            if (typeof dados === "string") {
                return dados;
            }

            if (Array.isArray(dados)) {
                return dados.join("\n");
            }

            if (dados && typeof dados === "object") {
                if (dados.error) {
                    return dados.error;
                }

                const mensagens = Object.values(dados).flat();

                if (mensagens.length > 0) {
                    return mensagens.join("\n");
                }
            }
        } catch (erro) {
            console.error("Erro ao ler resposta da API:", erro);
        }

        return "Erro na API";
    }

    function apiGet(path) {
        return apiRequest(path);
    }

    function apiPost(path, dados) {
        return apiRequest(path, {
            method: "POST",
            body: JSON.stringify(dados),
        });
    }

    function apiPut(path, dados) {
        return apiRequest(path, {
            method: "PUT",
            body: JSON.stringify(dados),
        });
    }

    function apiPatch(path, dados) {
        return apiRequest(path, {
            method: "PATCH",
            body: JSON.stringify(dados),
        });
    }

    function obterUsuarioAtual() {
        return apiGet("/auth/me/");
    }

    function loginAdmin(username, password) {
        return apiPost("/auth/login/", { username, password });
    }

    async function logoutAdmin() {
        try {
            await apiPost("/auth/logout/", {});
            registrarToastPendente("Logout realizado com sucesso.", "success");
        } catch (erro) {
            console.error("Erro ao encerrar sessao:", erro);
            registrarToastPendente("Sessao encerrada localmente.", "info");
        } finally {
            window.location.replace(obterCaminhoLogin());
        }
    }

    function obterCaminhoLogin() {
        return window.location.protocol === "file:" ? "login.html" : "/login.html";
    }

    function obterProximaPaginaPadrao() {
        const params = new URLSearchParams(window.location.search);
        const next = params.get("next");

        if (
            next
            && !next.includes("://")
            && !next.startsWith("//")
            && !next.startsWith("/")
        ) {
            return next;
        }

        return "dashboard.html";
    }

    function redirecionarParaLogin() {
        const paginaAtual = window.location.pathname.split("/").pop() || "dashboard.html";

        if (paginaAtual === "login.html") return;

        const next = `${paginaAtual}${window.location.search}`;
        window.location.replace(`${obterCaminhoLogin()}?next=${encodeURIComponent(next)}`);
    }

    function adicionarLogoutAdmin(username) {
        const sidebar = document.querySelector(".sidebar");

        if (!sidebar || document.getElementById("adminLogout")) return;

        const area = document.createElement("div");
        area.className = "admin-session";
        area.innerHTML = `
            <span class="admin-session-label">Conectado como</span>
            <strong class="admin-session-user" title="${escapeAdminHtml(username || "admin")}">${escapeAdminHtml(username || "admin")}</strong>
            <button type="button" id="adminLogout" class="logout-btn">Sair</button>
        `;

        const footer = sidebar.querySelector("footer");

        if (footer) {
            sidebar.insertBefore(area, footer);
        } else {
            sidebar.appendChild(area);
        }

        document.getElementById("adminLogout").addEventListener("click", logoutAdmin);
    }

    async function requireAdmin() {
        try {
            const usuario = await obterUsuarioAtual();

            if (usuario.authenticated !== true || usuario.is_admin !== true) {
                registrarToastPendente("Faca login para acessar a area administrativa.", "warning");
                redirecionarParaLogin();
                return null;
            }

            adicionarLogoutAdmin(usuario.username);

            return usuario;
        } catch (erro) {
            console.error("Erro ao verificar autenticacao:", erro);
            registrarToastPendente("Sessao expirada ou acesso nao autorizado.", "warning");
            redirecionarParaLogin();
            return null;
        }
    }

    if (typeof document !== "undefined") {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", mostrarToastPendente);
        } else {
            mostrarToastPendente();
        }
    }

    window.bibliotecaApi = {
        apiGet,
        apiPost,
        apiPut,
        apiPatch,
        obterUsuarioAtual,
        loginAdmin,
        logoutAdmin,
        requireAdmin,
        obterProximaPaginaPadrao,
        mostrarToast,
        registrarToastPendente,
        confirmarAcao,
    };
})();
