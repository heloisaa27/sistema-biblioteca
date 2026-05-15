function criarControleTabela(config) {
    let paginaAtual = 1;
    const linhasPorPagina = config.linhasPorPagina || 10;

    const tbody = document.getElementById(config.tbodyId);
    const inputBusca = document.getElementById(config.inputBuscaId);
    const pageInfo = document.getElementById(config.pageInfoId);
    const prevPage = document.getElementById(config.prevPageId);
    const nextPage = document.getElementById(config.nextPageId);
    const colunasBusca = config.colunasBusca || [];

    function obterLinhas() {
        return Array.from(tbody.querySelectorAll("tr"));
    }

    function linhaCorrespondeBusca(linha, termo) {
        if (!termo) return true;

        return colunasBusca.some(indice => {
            const coluna = linha.children[indice];
            return coluna && coluna.textContent.toLowerCase().includes(termo);
        });
    }

    function filtrar() {
        const termo = inputBusca ? inputBusca.value.toLowerCase() : "";
        const linhas = obterLinhas();

        linhas.forEach(linha => {
            linha.style.display = linhaCorrespondeBusca(linha, termo) ? "" : "none";
        });
    }

    function atualizar() {
        const linhas = obterLinhas();
        const totalPaginas = Math.ceil(linhas.length / linhasPorPagina);

        if (paginaAtual > totalPaginas && totalPaginas > 0) {
            paginaAtual = totalPaginas;
        }

        const inicio = (paginaAtual - 1) * linhasPorPagina;
        const fim = inicio + linhasPorPagina;

        linhas.forEach((linha, index) => {
            linha.style.display = (index >= inicio && index < fim) ? "" : "none";
        });

        if (pageInfo) {
            pageInfo.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
        }
    }

    function resetar() {
        paginaAtual = 1;
        atualizar();
    }

    if (inputBusca) {
        inputBusca.addEventListener("input", filtrar);
    }

    if (prevPage) {
        prevPage.onclick = () => {
            if (paginaAtual > 1) {
                paginaAtual--;
                atualizar();
            }
        };
    }

    if (nextPage) {
        nextPage.onclick = () => {
            const totalPaginas = Math.ceil(obterLinhas().length / linhasPorPagina);

            if (paginaAtual < totalPaginas) {
                paginaAtual++;
                atualizar();
            }
        };
    }

    return {
        atualizar,
        filtrar,
        resetar
    };
}
