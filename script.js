let dados = [];
let paginaAtual = 1;
const resultadosPorPagina = 10;
let termoBusca = "";

function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

async function carregarDados() {
    const resposta = await fetch("infracoes 3.json");
    dados = await resposta.json();
}

function buscarInfracoes(pergunta) {
    termoBusca = normalizar(pergunta);
    const palavras = termoBusca.split(" ");

    return dados.filter(item => {
        const campos = [
            item["codigo"],
            item["descricao"],
            item["artigo_ctb"],
            item["infrator"],
            item["gravidade"]
        ].map(campo => normalizar(String(campo || ""))).join(" ");
        return palavras.every(palavra => campos.includes(palavra));
    });
}

function destacarTermo(texto) {
    const palavras = termoBusca.split(" ").filter(p => p.length > 1);
    let resultado = texto;
    palavras.forEach(palavra => {
        const regex = new RegExp("(" + palavra + ")", "gi");
        resultado = resultado.replace(regex, "<mark>$1</mark>");
    });
    return resultado;
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
            <strong>Código:</strong> ${item["codigo"]}<br>
            <strong>Descrição:</strong> ${destacarTermo(item["descricao"])}<br>
            <strong>Amparo Legal (CTB):</strong> ${destacarTermo(item["artigo_ctb"] || "")}<br>
            <strong>Infrator:</strong> ${destacarTermo(item["infrator"] || "")}<br>
            <strong>Gravidade:</strong> ${destacarTermo(item["gravidade"] || "")}
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
