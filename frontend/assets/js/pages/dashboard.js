document.addEventListener("DOMContentLoaded", iniciarDashboard);
let graficoLinha = null;
let graficoBarra = null;
let graficoStatus = null;

async function iniciarDashboard() {
    const usuario = await window.bibliotecaApi.requireAdmin();

    if (!usuario) return;

    carregarDashboard("mes")

    document.getElementById("btnTrimestre")
        .addEventListener("click", () => carregarDashboard("trimestre"))

    document.getElementById("btnMes")
        .addEventListener("click", () => carregarDashboard("mes"))

    document.getElementById("btnSemana")
        .addEventListener("click", () => carregarDashboard("semana"))

}

async function carregarDashboard(periodo = "mes") {

    let url = "/dashboard/"

    if (periodo) {
        url += `?periodo=${periodo}`
    }

    try {
        const dados = await window.bibliotecaApi.apiGet(url);


        atualizarCards(dados.cards);

        criarGraficoLinha(dados.emprestimos_por_data);

        criarGraficoBarra(dados.livros_populares);

        criarGraficoStatus(dados.status_distribution);

        preencherTabelaAtrasados(dados.atrasados_recentes);

    } catch (erro) {

        console.error("Erro ao carregar dashboard:", erro);

    }

}


// =========================
// CARDS
// =========================

function atualizarCards(cards) {

    document.querySelector("#cardAtivos").textContent =
        cards.emprestimos_ativos;

    document.querySelector("#cardAtrasados").textContent =
        cards.emprestimos_atrasados;

    document.querySelector("#cardTotalLivros").textContent =
        cards.total_livros;

    document.querySelector("#cardDisponiveis").textContent =
        cards.livros_disponiveis;

}


// =========================
// GRÁFICO DE LINHA
// =========================

function criarGraficoLinha(dados) {

    const ctx = document.getElementById("lineChart");

    if (graficoLinha) {
        graficoLinha.destroy();
    }


    graficoLinha = new Chart(ctx, {

        type: "line",

        data: {

            labels: dados.map(e => formatarData(e.data_emprestimo)),

            datasets: [{

                label: "Empréstimos por dia",

                data: dados.map(e => e.total),

                borderColor: "#2563eb",

                backgroundColor: "rgba(37,99,235,0.15)",

                tension: 0.35,

                fill: true,

                pointRadius: 4

            }]

        },

        options: {

            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: true
                }
            },

            scales: {

                y: {
                    beginAtZero: true,
                    grid: {
                        color: "#e5e7eb"
                    }
                },

                x: {
                    grid: {
                        display: false
                    }
                }

            }

        }

    });

}


// =========================
// GRÁFICO DE BARRA
// =========================

function criarGraficoBarra(dados) {

    const ctx = document.getElementById("barChart");

    if (graficoBarra) {
        graficoBarra.destroy();
    }

    graficoBarra = new Chart(ctx, {

        type: "bar",

        data: {

            labels: dados.map(l => l.livro__titulo),

            datasets: [{

                label: "Quantidade de empréstimos",

                data: dados.map(l => l.total),

                backgroundColor: "#16a34a",

                borderRadius: 6

            }]

        },

        options: {

            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {

                y: {
                    beginAtZero: true,
                    grid: {
                        color: "#e5e7eb"
                    }
                },

                x: {
                    grid: {
                        display: false
                    }
                }

            }

        }

    });

}


// =========================
// GRÁFICO STATUS
// =========================

function criarGraficoStatus(dados) {

    const ctx = document.getElementById("pieChart");

    if (graficoStatus) {
        graficoStatus.destroy();
    }

    graficoStatus = new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: dados.map(s => capitalizar(s.status)),

            datasets: [{

                data: dados.map(s => s.total),

                backgroundColor: [

                    "#2563eb",

                    "#16a34a",

                    "#dc2626"

                ],

                borderWidth: 0

            }]

        },

        options: {

            responsive: true,
            maintainAspectRatio: false,

            cutout: "70%",

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });

}


// =========================
// TABELA ATRASADOS
// =========================

function preencherTabelaAtrasados(atrasados) {

    const tbody = document.getElementById("tabelaAtrasados");

    tbody.innerHTML = "";

    if (!atrasados || atrasados.length === 0) {

        tbody.innerHTML = `
        <tr>
        <td colspan="5" style="text-align:center;">
        Nenhum empréstimo atrasado
        </td>
        </tr>
        `;

        return;

    }

    atrasados.forEach(emp => {

        tbody.innerHTML += `

        <tr>

        <td>${escapeHtml(emp.usuario_nome)}</td>

        <td>${escapeHtml(emp.livro)}</td>

        <td>${escapeHtml(formatarData(emp.data_devolucao))}</td>

        <td>${escapeHtml(emp.dias_atraso)}</td>

        <td>R$ ${escapeHtml(emp.multa.toFixed(2))}</td>

        </tr>

        `;

    });

}


