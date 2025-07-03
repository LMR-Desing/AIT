let infracoes = [];

fetch('infracoes.json')
    .then(response => response.json())
    .then(data => {
        infracoes = data;
    });

document.getElementById('pergunta').addEventListener('input', function () {
    const termo = this.value.toLowerCase();
    const resultados = infracoes.filter(infracao =>
        infracao["DESCRIÇÃO DA INFRAÇÃO"].toLowerCase().includes(termo) ||
        infracao["CÓDIGO DA INFRAÇÃO"].toString().includes(termo)
    );

    const container = document.getElementById('respostas');
    container.innerHTML = '';

    resultados.forEach(infracao => {
        const div = document.createElement('div');
        div.className = 'resultado';
        div.innerHTML = `<strong>${infracao["CÓDIGO DA INFRAÇÃO"]}</strong>: ${infracao["DESCRIÇÃO DA INFRAÇÃO"]}`;
        container.appendChild(div);
    });
});
