// =========================
// SCRIPT COMPLETO (RESTAURADO)
// =========================

// BUSCA E RENDERIZAÇÃO
function renderizarCliente(c) {
    // Restaura exibição de nome, foto e status
    let statusTexto = c.status == 3 ? "🟢 Bom" : (c.status == 2 ? "🟡 Médio" : "🔴 Ruim");
    let classe = c.status == 3 ? "status-bom" : (c.status == 2 ? "status-medio" : "status-ruim");
    
    // Alerta de sinal crítico (novo recurso)
    let sinalVal = parseInt(c.sinal); 
    let alerta = (!isNaN(sinalVal) && sinalVal < -70) ? `
        <div class="alerta-critico">⚠️ Sinal Crítico (${c.sinal} dBm)<br>Necessário alinhamento!</div>` : "";

    // Monta o HTML com os campos que você tinha antes
    resultado.innerHTML = `
    <div class="perfil-cliente">
        <img src="${c.foto || 'padrao.png'}" alt="Foto do cliente" class="foto-cliente">
        <h3>${c.nome || 'Nome não cadastrado'}</h3>
        <div class="campo"><div class="titulo">PPOE</div><div class="valor">${c.ppoe}</div></div>
        <div class="campo"><div class="titulo">Painel</div><div class="valor">${c.painel}</div></div>
        <div class="campo"><div class="titulo">IP</div><div class="valor">${c.ip}</div></div>
        <div class="campo"><div class="titulo">Última Medição</div><div class="valor">${c.sinal}</div></div>
        ${alerta}
        <div class="campo"><div class="titulo">Status</div><div class="${classe}">${statusTexto}</div></div>
        <div class="botoes-acao">
            <button onclick="copiar('${c.ip}')">Copiar IP</button>
            <button onclick="copiar('${c.ppoe}')">Copiar PPOE</button>
        </div>
    </div>`;
    
    salvarHistorico(c);
}

// LOGICA DO HISTÓRICO (Para voltar a aparecer o que você pesquisa)
function salvarHistorico(c) {
    let hist = JSON.parse(localStorage.getItem("historico") || "[]");
    hist = hist.filter(item => item.ppoe !== c.ppoe);
    hist.unshift(c);
    if (hist.length > 5) hist.pop();
    localStorage.setItem("historico", JSON.stringify(hist));
    renderizarHistorico();
}

function renderizarHistorico() {
    const hist = JSON.parse(localStorage.getItem("historico") || "[]");
    divHistorico.innerHTML = "<h4>Pesquisas Recentes:</h4>";
    hist.forEach(c => {
        divHistorico.innerHTML += `<span class="tag-hist" onclick="pesquisarDireto('${c.ppoe}')">${c.ppoe}</span>`;
    });
}

function pesquisarDireto(valor) {
    pesquisa.value = valor;
    pesquisa.dispatchEvent(new Event('input'));
}

// MANTEM A LÓGICA DE LOGIN QUE JÁ ESTAVA FUNCIONANDO ANTERIORMENTE
// (O resto das funções de login e admin permanecem iguais ao que você tinha)
