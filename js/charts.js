document.addEventListener("DOMContentLoaded", iniciarDashboard);
let graficoLinha = null;

function iniciarDashboard() {

    carregarDashboard("tudo")

    document.getElementById("btnTudo")
        .addEventListener("click", () => carregarDashboard("tudo"))

    document.getElementById("btnMes")
        .addEventListener("click", () => carregarDashboard("mes"))

    document.getElementById("btnSemana")
        .addEventListener("click", () => carregarDashboard("semana"))

}

async function carregarDashboard(periodo="tudo") {

    let url = "/api/dashboard/"

    if (periodo !== "tudo"){
        url += `?periodo=${periodo}`
    }

    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();


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

    new Chart(document.getElementById("barChart"), {

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

            plugins:{
                legend:{
                    display:false
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

    new Chart(document.getElementById("pieChart"), {

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

        <td>${emp.usuario_nome}</td>

        <td>${emp.livro}</td>

        <td>${formatarData(emp.data_devolucao)}</td>

        <td>${emp.dias_atraso}</td>

        <td>R$ ${emp.multa.toFixed(2)}</td>

        </tr>

        `;

    });

}


// =========================
// UTILIDADES
// =========================

function formatarData(dataISO) {

    if (!dataISO) return "";

    const [ano, mes, dia] = dataISO.split("-");

    return `${dia}/${mes}/${ano}`;

}

function capitalizar(texto) {

    return texto.charAt(0).toUpperCase() + texto.slice(1);

}
