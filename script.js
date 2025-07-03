<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Consulta de Infrações de Trânsito</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; }
        h1 { color: #333; }
        input[type="text"] {
            width: 100%;
            padding: 12px;
            font-size: 16px;
            margin-bottom: 20px;
        }
        .resultado {
            background-color: white;
            padding: 15px;
            margin-bottom: 10px;
            border-left: 5px solid #007BFF;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
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
    </style>
</head>
<body>
    <h1>🔎 Consulta de Infrações de Trânsito</h1>
    <input type="text" id="pergunta" placeholder="Digite uma descrição ou código de infração..." aria-label="Campo de busca por infração">
    <div id="respostas"></div>

    <script>
        let dados = [
            {
                "CÓDIGO DA INFRAÇÃO": "12345",
                "DESCRIÇÃO DA INFRAÇÃO": "Estacionar afastado da guia da calçada (meio-fio) de 50cm a 1m"
            },
            {
                "CÓDIGO DA INFRAÇÃO": "67890",
                "DESCRIÇÃO DA INFRAÇÃO": "Avançar o sinal vermelho do semáforo"
            },
            {
                "CÓDIGO DA INFRAÇÃO": "54321",
                "DESCRIÇÃO DA INFRAÇÃO": "Transitar em velocidade superior à máxima permitida em até 20%"
            }
        ];
        let paginaAtual = 1;
        const resultadosPorPagina = 10;
        let termoBusca = "";

        function normalizar(texto) {
            return texto
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
        }

        function buscarInfracoes(pergunta) {
            termoBusca = normalizar(pergunta);
            const palavras = termoBusca.split(" ");

            return dados.filter(item => {
                const cod = normalizar(String(item["CÓDIGO DA INFRAÇÃO"] || ""));
                const desc = normalizar(item["DESCRIÇÃO DA INFRAÇÃO"] || "");
                const texto = cod + " " + desc;
                return palavras.every(palavra => texto.includes(palavra));
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
            const input = document.getElementById("pergunta");
            input.addEventListener("input", () => {
                paginaAtual = 1;
                const resultados = buscarInfracoes(input.value);
                mostrarResultados(resultados);
            });
        });
    </script>
</body>
</html>
