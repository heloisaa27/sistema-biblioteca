async function apiRequest(path, options = {}) {
    const resposta = await fetch(apiUrl(path), {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });

    if (!resposta.ok) {
        throw new Error(await extrairMensagemErro(resposta));
    }

    return resposta.json();
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
