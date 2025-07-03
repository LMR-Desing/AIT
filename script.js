let infracoes = [];

fetch('infracoes_renainf.json')
    .then(response => response.json())
    .then(data => {
        infracoes = data;
    });

document.getElementById('pergunta').addEventListener('input', function () {
    const termo = this.value.toLowerCase().trim();
    const palavras = termo.split(/\s+/);

    const resultados = infracoes.filter(infracao => {
        const texto = Object.values(infracao).join(' ').toLowerCase();
        return palavras.every(palavra => texto.includes(palavra));
    });

    const container = document.getElementById('respostas');
    container.innerHTML = '';

    resultados.forEach(infracao => {
        const div = document.createElement('div');
        div.className = 'resultado';
        div.innerHTML = `
            <strong>Código:</strong> ${infracao.codigo}<br>
            <strong>Desdobramento:</strong> ${infracao.desdobramento}<br>
            <strong>Descrição:</strong> ${infracao.descricao}<br>
            <strong>Artigo CTB:</strong> ${infracao.artigo_ctb}<br>
            <strong>Infrator:</strong> ${infracao.infrator}<br>
            <strong>Gravidade:</strong> ${infracao.gravidade}<br>
            <strong>Órgão Competente:</strong> ${infracao.orgao_competente}
        `;
        container.appendChild(div);
    });
});
