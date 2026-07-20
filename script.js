// =========================
// SISTEMA ATUALIZE TELECOM
// =========================

let clientes = [];
const pesquisa = document.getElementById("pesquisa");
const filtroPainel = document.getElementById("filtroPainel");
const resultado = document.getElementById("resultado");

// Carrega dados
fetch("clientes.json")
.then(res => res.json())
.then(data => { 
    clientes = data; 
    atualizarFiltro(); 
})
.catch(err => console.log("Aguardando carregamento de clientes..."));

// Busca por PPOE ou IP
pesquisa.addEventListener("input", () => {
    const texto = pesquisa.value.toLowerCase().trim();
    if (texto === "") { resultado.innerHTML = ""; return; }
    
    filtroPainel.value = ""; 
    const cliente = clientes.find(c => (c.ppoe || "").toLowerCase().includes(texto) || String(c.ip || "").includes(texto));
    
    if (!cliente) {
        resultado.innerHTML = `<div class="nao-encontrado"><h2>Cliente não encontrado</h2></div>`;
        return;
    }
    renderizarCliente(cliente);
});

// Filtro por Painel
filtroPainel.addEventListener("change", () => {
    const p = filtroPainel.value;
    pesquisa.value = ""; 
    if (p === "") { resultado.innerHTML = ""; return; }
    
    const lista = clientes.filter(c => c.painel === p);
    resultado.innerHTML = `<h3>Clientes em: ${p} (${lista.length})</h3>`;
    
    lista.forEach(c => {
        resultado.innerHTML += `
            <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
                <strong>${c.ppoe}</strong> | ${c.ip} <br>
                <span>Última Medição: ${c.sinal}</span>
            </div>`;
    });
});

function renderizarCliente(c) {
    let status = c.status == 3 ? "🟢 Bom" : (c.status == 2 ? "🟡 Médio" : "🔴 Ruim");
    let classe = c.status == 3 ? "status-bom" : (c.status == 2 ? "status-medio" : "status-ruim");
    
    // Alerta de sinal crítico
    let sinalVal = parseInt(c.sinal); 
    let alerta = (!isNaN(sinalVal) && sinalVal < -70) ? `
        <div class="alerta-critico">⚠️ Sinal Crítico (${c.sinal} dBm)<br>Última medição aponta necessidade de alinhamento!</div>` : "";

    resultado.innerHTML = `
    <div class="campo"><div class="titulo">PPOE</div><div class="valor">${c.ppoe}</div></div>
    <div class="campo"><div class="titulo">Painel</div><div class="valor">${c.painel}</div></div>
    <div class="campo"><div class="titulo">IP</div><div class="valor">${c.ip}</div></div>
    <div class="campo"><div class="titulo">Última Medição</div><div class="valor">${c.sinal}</div></div>
    ${alerta}
    <div class="campo"><div class="titulo">Status</div><div class="${classe}">${status}</div></div>
    <button onclick="copiar('${c.ip}')">Copiar IP</button>
    <button onclick="copiar('${c.ppoe}')">Copiar PPOE</button>`;
}

function copiar(texto) { 
    navigator.clipboard.writeText(texto); 
    alert("Copiado!"); 
}

function atualizarFiltro() {
    const paineis = [...new Set(clientes.map(c => c.painel))].sort();
    filtroPainel.innerHTML = '<option value="">Filtrar por Painel (Torre)...</option>';
    paineis.forEach(p => { 
        filtroPainel.innerHTML += `<option value="${p}">${p}</option>`; 
    });
}
