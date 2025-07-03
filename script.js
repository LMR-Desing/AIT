let infracoes = [];
let paginaAtual = 1;
const resultadosPorPagina = 10;
let termoBusca = "";

function normalizar(texto) {
    // Garante que o texto seja uma string e evita erros com valores nulos/indefinidos
    if (typeof texto !== 'string') {
        texto = String(texto || "");
    }
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove acentos
        .replace(/[.,;:!?()\[\]{}"'-]/g, "") // remove pontuação (mantendo apenas letras e números)
        .replace(/\s+/g, " ") // remove espaços duplicados
        .trim();
}

async function carregarDados() {
    try {
        const resposta = await fetch("infracoes_renainf.json");
        if (!resposta.ok) {
            throw new Error(`Erro ao carregar o arquivo: ${resposta.statusText}`);
        }
        infracoes = await resposta.json();
    } catch (error) {
        console.error("Erro ao carregar dados das infrações:", error);
        document.getElementById("respostas").innerHTML = "<p>Erro ao carregar os dados das infrações. Por favor, tente novamente mais tarde.</p>";
    }
}

function buscarInfracoes(pergunta) {
    termoBusca = normalizar(pergunta);
    const palavras = termoBusca.split(" ").filter(p => p.length > 0); // Filtra palavras vazias

    // Se o termo de busca estiver vazio, não retorna nada ou pode retornar todas as infrações
    if (palavras.length === 0) {
        return []; // Ou infracoes; se quiser mostrar tudo quando a busca está vazia
    }

    return infracoes.filter(item => {
        // Concatena todos os campos relevantes em uma única string normalizada
        const textoCompletoNormalizado = [
            item["codigo"],
            item["desdobramento"],
            item["descricao"],
            item["artigo_ctb"],
            item["infrator"],
            item["gravidade"],
            item["orgao_competente"]
        ].map(campo => normalizar(String(campo || ""))).join(" ");

        // Verifica se QUALQUER palavra do termo de busca está presente no texto normalizado
        return palavras.some(palavra => textoCompletoNormalizado.includes(palavra));
    });
}

function destacarTermo(texto) {
    const palavrasParaDestacar = termoBusca.split(" ").filter(p => p.length > 0);
    let resultado = texto;

    palavrasParaDestacar.forEach(palavra => {
        // Criar uma RegExp para cada palavra, garantindo que o acento e case-insensitivity funcionem
        // Escapar caracteres especiais na palavra para evitar erros na RegExp, ex: "sinal."
        const palavraEscapada = palavra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${palavraEscapada})`, "gi"); // 'gi' para global e case-insensitive

        // Usar uma função de substituição para garantir que apenas o texto correspondente seja marcado
        resultado = resultado.replace(regex, (match) => `<mark>${match}</mark>`);
    });
    return resultado;
}

function mostrarResultados(resultados) {
    const div = document.getElementById("respostas");
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
    const totalPaginas = Math.ceil(totalResultados / resultadosPorPagina);

    // Remove qualquer paginação existente
    const navExistente = divRespostas.querySelector(".paginacao");
    if (navExistente) {
        navExistente.remove();
    }

    if (totalPaginas <= 1 && totalResultados > 0) {
         // Se houver resultados mas apenas uma página, mostra uma mensagem simples de navegação, se desejar.
        // Ou simplesmente não mostra nada se não houver necessidade de navegação.
        return;
    }
    if (totalResultados === 0) {
        return; // Não mostra paginação se não há resultados
    }

    const nav = document.createElement("div");
    nav.className = "paginacao";

    if (paginaAtual > 1) {
        const btnAnterior = document.createElement("button");
        btnAnterior.textContent = "⬅ Anterior";
        btnAnterior.onclick = () => {
            paginaAtual--;
            const inputElement = document.getElementById("pergunta");
            if (inputElement) {
                mostrarResultados(buscarInfracoes(inputElement.value));
            }
        };
        nav.appendChild(btnAnterior);
    }

    // Botões de números de página
    for (let i = 1; i <= totalPaginas; i++) {
        const btnPagina = document.createElement("button");
        btnPagina.textContent = i;
        btnPagina.className = paginaAtual === i ? "active" : "";
        btnPagina.onclick = () => {
            paginaAtual = i;
            const inputElement = document.getElementById("pergunta");
            if (inputElement) {
                mostrarResultados(buscarInfracoes(inputElement.value));
            }
        };
        nav.appendChild(btnPagina);
    }

    if (paginaAtual < totalPaginas) {
        const btnProximo = document.createElement("button");
        btnPro
