// =========================
// USUÁRIOS
// =========================

const usuarios = [
    { usuario: "adriano", senha: "Atlz@Adm2026", tipo: "admin" },
    { usuario: "julio", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "kristian", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "jeciana", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "nubia", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "jerbson", senha: "suporteatlz", tipo: "tecnico" }
];

// =========================
// ELEMENTOS
// =========================

const loginTela = document.getElementById("loginTela");
const sistema = document.getElementById("sistema");
const painelAdmin = document.getElementById("painelAdmin"); 

const usuarioInput = document.getElementById("usuario");
const senhaInput = document.getElementById("senha");
const erroLogin = document.getElementById("erroLogin");

const btnLogin = document.getElementById("btnLogin");
const btnSair = document.getElementById("btnSair");
const btnAdmin = document.getElementById("btnAdmin");
const fecharAdmin = document.getElementById("fecharAdmin"); 
const usuarioLogado = document.getElementById("usuarioLogado");

const pesquisa = document.getElementById("pesquisa");
const filtroPainel = document.getElementById("filtroPainel");
const resultado = document.getElementById("resultado");
const divHistorico = document.getElementById("historicoPesquisas");

// =========================
// LOGIN
// =========================

function entrar() {
    const usuario = usuarioInput.value.trim().toLowerCase();
    const senha = senhaInput.value;
    const encontrado = usuarios.find(u => u.usuario === usuario && u.senha === senha);

    if (!encontrado) {
        erroLogin.textContent = "Usuário ou senha inválidos.";
        return;
    }
    localStorage.setItem("usuarioAtual", JSON.stringify(encontrado));
    carregarSistema();
}

btnLogin.addEventListener("click", entrar);
senhaInput.addEventListener("keypress", e => { if (e.key === "Enter") entrar(); });

function carregarSistema() {
    const salvo = JSON.parse(localStorage.getItem("usuarioAtual"));
    if (!salvo) {
        loginTela.style.display = "block";
        sistema.style.display = "none";
        painelAdmin.style.display = "none";
        return;
    }
    loginTela.style.display = "none";
    sistema.style.display = "block";
    usuarioLogado.innerHTML = `👤 ${salvo.usuario} (${salvo.tipo})`;
    btnAdmin.style.display = salvo.tipo === "admin" ? "inline-block" : "none";
    renderizarHistorico();
}

btnSair.addEventListener("click", () => { localStorage.removeItem("usuarioAtual"); location.reload(); });
carregarSistema();

// =========================
// CLIENTES & FILTROS
// =========================

let clientes = [];

function formatarIP(ip){
    if(!ip) return "";
    ip = String(ip);
    if(ip.includes(".")) return ip;
    ip = ip.replace(/\D/g,"");
    if(ip.length===12){
        return ip.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/,"$1.$2.$3.$4");
    }
    return ip;
}

fetch("clientes.json")
.then(res => res.json())
.then(data => { clientes = data; atualizarDashboard(); })
.catch(err => console.log("Carregando..."));

// Busca por PPOE ou IP
pesquisa.addEventListener("input", () => {
    const texto = pesquisa.value.toLowerCase().trim();
    if (texto === "") { resultado.innerHTML = ""; return; }
    
    filtroPainel.value = ""; // Limpa filtro de torre ao buscar por texto

    const cliente = clientes.find(c =>
        (c.ppoe || "").toLowerCase().includes(texto) ||
        String(c.ip || "").includes(texto)
    );

    if (!cliente) {
        resultado.innerHTML = `<div class="nao-encontrado"><h2>Cliente não encontrado</h2></div>`;
        return;
    }

    renderizarCliente(cliente);
});

// Filtro por Painel
filtroPainel.addEventListener("change", () => {
    const painelSelecionado = filtroPainel.value;
    pesquisa.value = ""; 
    if (painelSelecionado === "") { resultado.innerHTML = ""; return; }

    const lista = clientes.filter(c => c.painel === painelSelecionado);
    resultado.innerHTML = `<h3>Clientes em: ${painelSelecionado} (${lista.length})</h3>`;
    
    lista.forEach(c => {
        resultado.innerHTML += `
            <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
                <strong>${c.ppoe}</strong> | ${c.ip} <br>
                <span>Última Medição: ${c.sinal}</span>
            </div>
        `;
    });
});

function renderizarCliente(cliente) {
    let status = cliente.status == 3 ? "🟢 Bom" : (cliente.status == 2 ? "🟡 Médio" : "🔴 Ruim");
    let classe = cliente.status == 3 ? "status-bom" : (cliente.status == 2 ? "status-medio" : "status-ruim");

    let sinalValor = parseInt(cliente.sinal); 
    let alertaHtml = (!isNaN(sinalValor) && sinalValor < -70) ? `
        <div class="alerta-critico">
            ⚠️ Sinal Crítico (${cliente.sinal} dBm)<br>
            Última medição aponta necessidade de alinhamento!
        </div>` : "";

    resultado.innerHTML = `
    <div class="campo"><div class="titulo">PPOE</div><div class="valor">${cliente.ppoe}</div></div>
    <div class="campo"><div class="titulo">Painel</div><div class="valor">${cliente.painel}</div></div>
    <div class="campo"><div class="titulo">IP</div><div class="valor">${formatarIP(cliente.ip)}</div></div>
    <div class="campo"><div class="titulo">Última Medição</div><div class="valor">${cliente.sinal}</div></div>
    ${alertaHtml}
    <div class="campo"><div class="titulo">Status</div><div class="${classe}">${status}</div></div>
    <button onclick="copiarEsalvar('${formatarIP(cliente.ip)}', '${cliente.ppoe}')">Copiar IP</button>
    <button onclick="copiarEsalvar('${cliente.ppoe}', '${cliente.ppoe}')">Copiar PPOE</button>
    `;
}

// =========================
// DEMAIS FUNÇÕES (Histórico, Dashboard, Importação)
// =========================

window.copiarEsalvar = function(texto, ppoe) {
    navigator.clipboard.writeText(texto);
    alert("Copiado!");
    let historico = JSON.parse(localStorage.getItem("historico_pesquisas") || "[]");
    historico = historico.filter(h => h !== ppoe);
    historico.unshift(ppoe);
    if(historico.length > 5) historico.pop();
    localStorage.setItem("historico_pesquisas", JSON.stringify(historico));
    renderizarHistorico();
};

function renderizarHistorico() {
    let historico = JSON.parse(localStorage.getItem("historico_pesquisas") || "[]");
    divHistorico.innerHTML = historico.map(h => `<button class="btn-historico" onclick="usarHistorico('${h}')">🕒 ${h}</button>`).join("");
}

window.usarHistorico = function(termo) { pesquisa.value = termo; pesquisa.dispatchEvent(new Event('input')); };

function atualizarDashboard() {
    if (clientes.length === 0) return;
    
    // Atualiza o menu de filtro
    const paineis = [...new Set(clientes.map(c => c.painel))].sort();
    filtroPainel.innerHTML = '<option value="">Filtrar por Painel (Torre)...</option>';
    paineis.forEach(p => { filtroPainel.innerHTML += `<option value="${p}">${p}</option>`; });

    const total = clientes.length;
    document.getElementById("totalClientes").textContent = total;
    document.getElementById("totalPaineis").textContent = paineis.length;
    document.getElementById("totalBom").textContent = clientes.filter(c => Number(c.status) === 3).length;
    document.getElementById("totalMedio").textContent = clientes.filter(c => Number(c.status) === 2).length;
    document.getElementById("totalRuim").textContent = clientes.filter(c => Number(c.status) !== 3 && Number(c.status) !== 2).length;
}

// ... (Resto das funções: copiarEstatisticas, baixarJson, btnImportarExcel seguem iguais)
// NOTA: Certifique-se de manter as funções de Admin abaixo aqui no seu arquivo.
