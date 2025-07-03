@media (max-width: 600px) {
    input[type="text"] {
        font-size: 14px;
        padding: 10px;
    }
    .resultado {
        font-size: 14px;
    }
}

mark {
    background-color: yellow;
    padding: 0 2px;
}

.paginacao {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 10px;
}

.paginacao button {
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
}

let dados = [];
let paginaAtual = 1;
const resultadosPorPagina = 10;
let termoBusca = "";

async function carregarDados() {
    const resposta = await fetch("infracoes 1.json");
    dados = await resposta.json();
}

function buscarInfracoes(pergunta) {
    termoBusca = pergunta.toLowerCase();
    return dados.filter(item =>
        (item["CÓDIGO DA INFRAÇÃO"] && item["CÓDIGO DA INFRAÇÃO"].toString().includes(termoBusca)) ||
        (item["DESCRIÇÃO DA INFRAÇÃO"] && item["DESCRIÇÃO DA INFRAÇÃO"].toLowerCase().includes(termoBusca))
    );
}

function destacarTermo(texto) {
    const regex = new RegExp(`(${termoBusca})`, "gi");
    return texto.replace(regex, "<mark>$1</mark>");
}

function mostrarResultados(resultados) {
    const div = document.getElementById("respostas");
    div.innerHTML = "";

    if (resultados.length === 0) {
        div.innerHTML = "<p>Nenhuma infração encontrada.</p>";
        return;
    }

    const inicio = (paginaAtual - 1) * resultadosPorPagina;
    const fim = inicio + resultadosPorPagina;
    const pagina = resultados.slice(inicio, fim);

    pagina.forEach(item => {
        const bloco = document.createElement("div");
        bloco.className = "resultado";
        bloco.innerHTML = `
            <strong>Código:</strong> ${item["CÓDIGO DA INFRAÇÃO"]}<br>
            <strong>Descrição:</strong> ${destacarTermo(item["DESCRIÇÃO DA INFRAÇÃO"])}
        `;
        div.appendChild(bloco);
    });

    mostrarPaginacao(resultados.length);
}

function mostrarPaginacao(totalResultados) {
    const div = document.getElementById("respostas");
    const totalPaginas = Math.ceil(totalResultados / resultadosPorPagina);

    if (totalPaginas <= 1) return;

    const nav = document.createElement("div");
    nav.className = "paginacao";

    if (paginaAtual > 1) {
        const btnAnterior = document.createElement("button");
        btnAnterior.textContent = "⬅ Anterior";
        btnAnterior.onclick = () => {
            paginaAtual--;
            mostrarResultados(buscarInfracoes(termoBusca));
        };
        nav.appendChild(btnAnterior);
    }

    if (paginaAtual < totalPaginas) {
        const btnProximo = document.createElement("button");
        btnProximo.textContent = "Próximo ➡";
        btnProximo.onclick = () => {
            paginaAtual++;
            mostrarResultados(buscarInfracoes(termoBusca));
        };
        nav.appendChild(btnProximo);
    }

    div.appendChild(nav);
}

document.addEventListener("DOMContentLoaded", () => {
    carregarDados();

    const input = document.getElementById("pergunta");
    input.addEventListener("input", () => {
        paginaAtual = 1;
        const resultados = buscarInfracoes(input.value);
        mostrarResultados(resultados);
    });
});
