let infracoes = [];
let paginaAtual = 1;
const resultadosPorPagina = 10;
let termoBusca = "";

function normalizar(texto) {
    if (typeof texto !== 'string') {
        texto = String(texto || "");
    }
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.,;:!?()\[\]{}"'-]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

async function carregarDados() {
    try {
        const resposta = await fetch("infracoes_renainf.json");
        if (!resposta.ok) {
            throw new Error(`Erro ao carregar o arquivo: ${resposta.statusText}`);
        }
        infracoes = await resposta.json();
        console.log("JSON carregado com sucesso. Número de infrações:", infracoes.length);
        if (infracoes.length > 0) {
            console.log("Primeira infração carregada para inspeção:", infracoes[0]);
        }
    } catch (error) {
        console.error("Erro ao carregar dados das infrações:", error);
        const respostasDiv = document.getElementById("respostas");
        if (respostasDiv) {
            respostasDiv.innerHTML = "<p>Erro ao carregar os dados das infrações. Por favor, tente novamente mais tarde.</p>";
        }
    }
}

function buscarInfracoes(pergunta) {
    termoBusca = normalizar(pergunta);
    const palavras = termoBusca.split(" ").filter(p => p.length > 0);

    console.log("Termo de busca normalizado:", termoBusca);
    console.log("Palavras da busca:", palavras);

    if (palavras.length === 0) {
        console.log("Termo de busca vazio, retornando array vazio.");
        return [];
    }

    const resultados = infracoes.filter(item => {
        const textoCompletoNormalizado = [
            item["codigo"],
            item["desdobramento"],
            item["descricao"],
            item["artigo_ctb"],
            item["infrator"],
            item["gravidade"],
            item["orgao_competente"]
        ].map(campo => normalizar(String(campo || ""))).join(" ");

        // console.log("Texto normalizado do item:", textoCompletoNormalizado); // Descomente para depurar item a item
        const match = palavras.some(palavra => textoCompletoNormalizado.includes(palavra));
        // if (match) {
        //     console.log("Match encontrado para o item:", item["descricao"]); // Descomente para ver os matches
        // }
        return match;
    });

    console.log("Total de resultados encontrados:", resultados.length);
    return resultados;
}

function destacarTermo(texto) {
    const palavrasParaDestacar = termoBusca.split(" ").filter(p => p.length > 0);
    let resultado = texto;

    palavrasParaDestacar.forEach(palavra => {
        const palavraEscapada = palavra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        try {
            const regex = new RegExp(`(${palavraEscapada})`, "gi");
            resultado = resultado.replace(regex, (match) => `<mark>${match}</mark>`);
        } catch (e) {
            console.error("Erro ao criar ou usar RegExp para a palavra:", palavra, e);
        }
    });
    return resultado;
}

function mostrarResultados(resultados) {
    const div = document.getElementById("respostas");
    if (!div) {
        console.error("Elemento 'respostas' não encontrado no HTML.");
        return;
    }
    div.innerHTML = "";

    if (resultados.length === 0) {
        div.innerHTML = "<p>Nenhuma infração encontrada para o termo digitado.</p>";
        return;
    }

    const inicio = (paginaAtual - 1) * resultadosPorPagina;
    const fim = inicio + resultadosPorPagina;
    const pagina = resultados.slice(inicio, fim);

    pagina.forEach(item => {
        const bloco = document.createElement("div");
        bloco.className = "resultado";
        bloco.innerHTML = `
            <strong>Código:</strong> ${item["codigo"] || "N/A"}<br>
            <strong>Desdobramento:</strong> ${item["desdobramento"] || "N/A"}<br>
            <strong>Descrição:</strong> ${destacarTermo(item["descricao"] || "N/A")}<br>
            <strong>Artigo CTB:</strong> ${destacarTermo(item["artigo_ctb"] || "N/A")}<br>
            <strong>Infrator:</strong> ${destacarTermo(item["infrator"] || "N/A")}<br>
            <strong>Gravidade:</strong> ${destacarTermo(item["gravidade"] || "N/A")}<br>
            <strong>Órgão Competente:</strong> ${destacarTermo(item["orgao_competente"] || "N/A")}
        `;
        div.appendChild(bloco);
    });

    mostrarPaginacao(resultados.length);
}

function mostrarPaginacao(totalResultados) {
    const divRespostas = document.getElementById("respostas");
    if (!divRespostas) return; // Garante que a div existe

    const totalPaginas = Math.ceil(totalResultados / resultadosPorPagina);

    const navExistente = divRespostas.querySelector(".paginacao");
    if (navExistente) {
        navExistente.remove();
    }

    if (totalPaginas <= 1 && totalResultados > 0) {
        return;
    }
    if (totalResultados === 0) {
        return;
    }

    const nav = document.createElement("div");
    nav.className = "paginacao";

    const inputElement = document.getElementById("pergunta"); // Busca o input uma vez

    if (paginaAtual > 1) {
        const btnAnterior = document.createElement("button");
        btnAnterior.textContent = "⬅ Anterior";
        btnAnterior.onclick = () => {
            paginaAtual--;
            if (inputElement) {
                mostrarResultados(buscarInfracoes(inputElement.value));
            }
        };
        nav.appendChild(btnAnterior);
    }

    for (let i = 1; i <= totalPaginas; i++) {
        const btnPagina = document.createElement("button");
        btnPagina.textContent = i;
        btnPagina.className = paginaAtual === i ? "active" : "";
        btnPagina.onclick = () => {
            paginaAtual = i;
            if (inputElement) {
                mostrarResultados(buscarInfracoes(inputElement.value));
            }
        };
        nav.appendChild(btnPagina);
    }

    if (paginaAtual < totalPaginas) {
        const btnProximo = document.createElement("button");
        btnProximo.textContent = "Próximo ➡";
        btnProximo.onclick = () => {
            paginaAtual++;
            if (inputElement) {
                mostrarResultados(buscarInfracoes(inputElement.value));
            }
        };
        nav.appendChild(btnProximo);
    }

    divRespostas.appendChild(nav);
}

document.addEventListener("DOMContentLoaded", () => {
    carregarDados();

    const input = document.getElementById("pergunta");
    if (input) {
        input.addEventListener("input", () => {
            paginaAtual = 1;
            const resultados = buscarInfracoes(input.value);
            mostrarResultados(resultados);
        });
    } else {
        console.error("Elemento 'pergunta' não encontrado no HTML. Verifique o ID do seu input.");
    }
});
