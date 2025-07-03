// Variáveis globais para o estado da aplicação
let infracoesCarregadas = []; // Renomeado para maior clareza
let paginaAtual = 1;
const resultadosPorPagina = 10;
let termoBuscaAtual = ""; // Renomeado para evitar conflito com escopo local

// --- Função para Normalizar Texto ---
// Remove acentos, pontuação, espaços extras e converte para minúsculas
function normalizarTexto(texto) {
    if (typeof texto !== 'string') {
        texto = String(texto || ""); // Garante que é uma string, mesmo que null/undefined
    }
    return texto
        .toLowerCase()
        .normalize("NFD") // Normaliza para decompor caracteres acentuados
        .replace(/[\u0300-\u036f]/g, "") // Remove os diacríticos (acentos)
        .replace(/[.,;:!?()\[\]{}"'-]/g, "") // Remove pontuações comuns
        .replace(/\s+/g, " ") // Substitui múltiplos espaços por um único
        .trim(); // Remove espaços do início e fim
}

// --- Função para Carregar Dados do JSON ---
async function carregarDadosInfracoes() {
    console.log("Iniciando carregamento do arquivo infracoes_renainf.json...");
    try {
        const resposta = await fetch("infracoes_renainf.json");

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status} - ${resposta.statusText}. Verifique o caminho do arquivo.`);
        }

        const dados = await resposta.json();

        if (!Array.isArray(dados)) {
            console.warn("O arquivo JSON carregado não é um array. Isso pode causar problemas. Conteúdo:", dados);
            infracoesCarregadas = [];
        } else {
            infracoesCarregadas = dados;
        }

        console.log(`Carregamento concluído. Total de infrações encontradas no JSON: ${infracoesCarregadas.length}`);
        if (infracoesCarregadas.length > 0) {
            console.log("Primeira infração carregada (para verificação):", infracoesCarregadas[0]);
        } else {
            console.warn("O arquivo infracoes_renainf.json foi carregado, mas está vazio ou não contém infrações.");
        }

    } catch (error) {
        console.error("ERRO CRÍTICO: Falha ao carregar ou parsear infracoes_renainf.json:", error);
        const divRespostas = document.getElementById("respostas");
        if (divRespostas) {
            divRespostas.innerHTML = `<p style="color: red;">Não foi possível carregar os dados das infrações. Por favor, verifique o arquivo 'infracoes_renainf.json' e a conexão.</p><p style="color: red;">Detalhes: ${error.message}</p>`;
        }
    }
}

// --- Função Principal de Busca ---
function buscarInfracoes(termoPesquisa) {
    termoBuscaAtual = normalizarTexto(termoPesquisa);
    const palavrasBusca = termoBuscaAtual.split(" ").filter(p => p.length > 0);

    console.log(`Buscando por: "${termoPesquisa}" (Normalizado: "${termoBuscaAtual}")`);
    console.log("Palavras-chave para busca:", palavrasBusca);

    if (palavrasBusca.length === 0) {
        console.log("Termo de busca vazio. Nenhum resultado será exibido.");
        return [];
    }

    const resultadosFiltrados = infracoesCarregadas.filter(item => {
        const textoCompletoDoItem = [
            item["codigo"],
            item["desdobramento"],
            item["descricao"],
            item["artigo_ctb"],
            item["infrator"],
            item["gravidade"],
            item["orgao_competente"]
        ].map(campo => normalizarTexto(campo)).join(" ");

        const encontrado = palavrasBusca.some(palavra => textoCompletoDoItem.includes(palavra));
        return encontrado;
    });

    console.log(`Busca concluída. ${resultadosFiltrados.length} resultados encontrados.`);
    return resultadosFiltrados;
}

// --- Função para Destacar Termos nos Resultados ---
function destacarTermo(textoOriginal) {
    // Garante que termoBuscaAtual está definido e tem palavras
    const palavrasParaDestacar = termoBuscaAtual.split(" ").filter(p => p.length > 0);
    let textoProcessado = textoOriginal;

    if (!textoProcessado) { // Se o texto original for nulo ou vazio, não há o que destacar
        return "N/A";
    }

    // Cria uma única regex para todos os termos de busca
    // Isso garante que a substituição seja feita de uma vez, evitando problemas de sobreposição
    // ou de termos não encontrados após a primeira marcação.
    // O 'map' normaliza cada palavra da busca e escapa para uso em regex.
    // O 'join("|")' cria uma expressão OR para buscar qualquer uma das palavras.
    const termosRegex = palavrasParaDestacar
        .map(palavra => palavra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escapa caracteres especiais
        .join("|"); // Junta com OR para buscar qualquer um dos termos

    if (termoBuscaAtual.length === 0 || termosRegex.length === 0) {
        return textoOriginal; // Não faz nada se não houver termos para destacar
    }

    try {
        // A regex buscará qualquer um dos termos de forma global e case-insensitive
        // Usamos '(?:' para um grupo de não-captura se não precisarmos de $1.
        // Mas para manter a capitalização original (match), podemos usar o grupo de captura.
        const regexCompleta = new RegExp(`(${termosRegex})`, "gi");

        // Substitui todas as ocorrências de qualquer um dos termos.
        // A função de substituição 'match' garante que o texto encontrado seja usado para marcar.
        textoProcessado = textoProcessado.replace(regexCompleta, (match) => `<mark>${match}</mark>`);
    } catch (e) {
        console.error(`Erro ao criar ou usar RegExp para destacar termos: "${termoBuscaAtual}"`, e);
        return textoOriginal; // Em caso de erro, retorna o texto original sem destaque
    }

    return textoProcessado;
}


// --- Função para Mostrar os Resultados na Interface ---
function mostrarResultados(resultadosParaExibir) {
    const divRespostas = document.getElementById("respostas");
    if (!divRespostas) {
        console.error("Erro: Elemento '#respostas' não encontrado no DOM. Certifique-se de que ele existe no seu HTML.");
        return;
    }

    divRespostas.innerHTML = ""; // Limpa resultados anteriores

    if (resultadosParaExibir.length === 0) {
        divRespostas.innerHTML = `<p>Nenhuma infração encontrada para a sua pesquisa "${termoBuscaAtual}".</p>`;
        return;
    }

    const inicio = (paginaAtual - 1) * resultadosPorPagina;
    const fim = inicio + resultadosPorPagina;
    const resultadosNaPagina = resultadosParaExibir.slice(inicio, fim);

    resultadosNaPagina.forEach(item => {
        const bloco = document.createElement("div");
        bloco.className = "resultado-infracao";
        bloco.innerHTML = `
            <strong>Código:</strong> ${item["codigo"] || "N/A"}<br>
            <strong>Desdobramento:</strong> ${item["desdobramento"] ? destacarTermo(item["desdobramento"]) : "N/A"}<br>
            <strong>Descrição:</strong> ${item["descricao"] ? destacarTermo(item["descricao"]) : "N/A"}<br>
            <strong>Artigo CTB:</strong> ${item["artigo_ctb"] ? destacarTermo(item["artigo_ctb"]) : "N/A"}<br>
            <strong>Infrator:</strong> ${item["infrator"] ? destacarTermo(item["infrator"]) : "N/A"}<br>
            <strong>Gravidade:</strong> ${item["gravidade"] ? destacarTermo(item["gravidade"]) : "N/A"}<br>
            <strong>Órgão Competente:</strong> ${item["orgao_competente"] ? destacarTermo(item["orgao_competente"]) : "N/A"}
        `;
        divRespostas.appendChild(bloco);
    });

    mostrarPaginacao(resultadosParaExibir.length);
}

// --- Função para Gerenciar a Paginação ---
function mostrarPaginacao(totalResultados) {
    const divRespostas = document.getElementById("respostas");
    if (!divRespostas) return;

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

    const navPaginacao = document.createElement("div");
    navPaginacao.className = "paginacao";

    const inputPesquisa = document.getElementById("pergunta");

    if (paginaAtual > 1) {
        const btnAnterior = document.createElement("button");
        btnAnterior.textContent = "⬅ Anterior";
        btnAnterior.onclick = () => {
            paginaAtual--;
            if (inputPesquisa) {
                mostrarResultados(buscarInfracoes(inputPesquisa.value));
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        navPaginacao.appendChild(btnAnterior);
    }

    for (let i = 1; i <= totalPaginas; i++) {
        const btnPagina = document.createElement("button");
        btnPagina.textContent = i;
        btnPagina.className = paginaAtual === i ? "active" : "";
        btnPagina.onclick = () => {
            paginaAtual = i;
            if (inputPesquisa) {
                mostrarResultados(buscarInfracoes(inputPesquisa.value));
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        navPaginacao.appendChild(btnPagina);
    }

    if (paginaAtual < totalPaginas) {
        const btnProximo = document.createElement("button");
        btnProximo.textContent = "Próximo ➡";
        btnProximo.onclick = () => {
            paginaAtual++;
            if (inputPesquisa) {
                mostrarResultados(buscarInfracoes(inputPesquisa.value));
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        navPaginacao.appendChild(btnProximo);
    }

    divRespostas.appendChild(navPaginacao);
}

// --- Inicialização da Aplicação ---
document.addEventListener("DOMContentLoaded", () => {
    carregarDadosInfracoes().then(() => {
        const inputBusca = document.getElementById("pergunta");
        if (inputBusca) {
            inputBusca.addEventListener("input", () => {
                paginaAtual = 1;
                const resultados = buscarInfracoes(inputBusca.value);
                mostrarResultados(resultados);
            });
        } else {
            console.error("ERRO: Elemento de input com ID 'pergunta' não encontrado. Verifique seu HTML.");
        }
    });
});
