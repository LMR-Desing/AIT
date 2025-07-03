
let dados = [];

async function carregarDados() {
    const resposta = await fetch("infracoes.json");
    dados = await resposta.json();
}

function buscarInfracoes(pergunta) {
    const termo = pergunta.toLowerCase();
    return dados.filter(item =>
        (item["CÓDIGO"] && item["CÓDIGO"].toString().includes(termo)) ||
        (item["DESCRIÇÃO"] && item["DESCRIÇÃO"].toLowerCase().includes(termo))
    );
}

function mostrarResultados(resultados) {
    const div = document.getElementById("respostas");
    div.innerHTML = "";

    if (resultados.length === 0) {
        div.innerHTML = "<p>Nenhuma infração encontrada.</p>";
        return;
    }

    resultados.forEach(item => {
        const bloco = document.createElement("div");
        bloco.className = "resultado";
        bloco.innerHTML = `<strong>Código:</strong> ${item["CÓDIGO"]}<br><strong>Descrição:</strong> ${item["DESCRIÇÃO"]}`;
        div.appendChild(bloco);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    carregarDados();

    const input = document.getElementById("pergunta");
    input.addEventListener("input", () => {
        const resultados = buscarInfracoes(input.value);
        mostrarResultados(resultados);
    });
});
