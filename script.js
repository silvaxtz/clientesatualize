// =========================
// USUÁRIOS (SEU ORIGINAL)
// =========================
const usuarios = [
    { usuario: "adriano", senha: "Atlz@Adm2026", tipo: "admin" },
    { usuario: "julio", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "kristian", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "jeciana", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "nubia", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "jerbson", senha: "suporteatlz", tipo: "tecnico" }
];

// Elementos
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
const resultado = document.getElementById("resultado");
const divHistorico = document.getElementById("historicoPesquisas");
// NOVO ELEMENTO DO FILTRO
const filtroPainel = document.getElementById("filtroPainel");

// [LÓGICA DE LOGIN E SISTEMA MANTIDA IGUAL]
function entrar() {
    const usuario = usuarioInput.value.trim().toLowerCase();
    const senha = senhaInput.value;
    const encontrado = usuarios.find(u => u.usuario === usuario && u.senha === senha);
    if (!encontrado) { erroLogin.textContent = "Usuário ou senha inválidos."; return; }
    localStorage.setItem("usuarioAtual", JSON.stringify(encontrado));
    carregarSistema();
}
btnLogin.addEventListener("click", entrar);
senhaInput.addEventListener("keypress", e => { if (e.key === "Enter") entrar(); });

function carregarSistema() {
    const salvo = JSON.parse(localStorage.getItem("usuarioAtual"));
    if (!salvo) { loginTela.style.display = "block"; sistema.style.display = "none"; painelAdmin.style.display = "none"; return; }
    loginTela.style.display = "none";
    sistema.style.display = "block";
    usuarioLogado.innerHTML = `👤 ${salvo.usuario} (${salvo.tipo})`;
    btnAdmin.style.display = salvo.tipo === "admin" ? "inline-block" : "none";
    renderizarHistorico();
}
btnSair.addEventListener("click", () => { localStorage.removeItem("usuarioAtual"); location.reload(); });
carregarSistema();

// =========================
// CLIENTES & FILTRO (MODIFICADO)
// =========================
let clientes = [];
function formatarIP(ip){ if(!ip) return ""; ip = String(ip); if(ip.includes(".")) return ip; ip = ip.replace(/\D/g,""); return ip.length===12 ? ip.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/,"$1.$2.$3.$4") : ip; }

fetch("clientes.json").then(res => res.json()).then(data => { 
    clientes = data; 
    atualizarDashboard(); 
    atualizarMenuTorres(); // Atualiza o select de torres
}).catch(err => console.log("Aguardando..."));

// NOVO: Função para popular o menu de torres
function atualizarMenuTorres() {
    const paineis = [...new Set(clientes.map(c => c.painel))].sort();
    filtroPainel.innerHTML = '<option value="">Filtrar por Painel (Torre)...</option>';
    paineis.forEach(p => filtroPainel.innerHTML += `<option value="${p}">${p}</option>`);
}

// NOVO: Ação do filtro
filtroPainel.addEventListener("change", () => {
    const p = filtroPainel.value;
    if (!p) return;
    pesquisa.value = "";
    const lista = clientes.filter(c => c.painel === p);
    resultado.innerHTML = `<h3>Clientes em: ${p} (${lista.length})</h3>`;
    lista.forEach(c => resultado.innerHTML += `<div class="campo"><strong>${c.ppoe}</strong> | Última Medição: ${c.sinal}</div>`);
});

// Busca por PPOE/IP (Mantida com "Última Medição" e Alerta)
pesquisa.addEventListener("input", () => {
    const texto = pesquisa.value.toLowerCase().trim();
    if (texto === "") { resultado.innerHTML = ""; return; }
    filtroPainel.value = "";
    const cliente = clientes.find(c => (c.ppoe || "").toLowerCase().includes(texto) || String(c.ip || "").includes(texto));
    if (!cliente) { resultado.innerHTML = `<h2>Cliente não encontrado</h2>`; return; }

    let status = cliente.status == 3 ? "🟢 Bom" : (cliente.status == 2 ? "🟡 Médio" : "🔴 Ruim");
    let classe = cliente.status == 3 ? "status-bom" : (cliente.status == 2 ? "status-medio" : "status-ruim");
    let alertaHtml = (parseInt(cliente.sinal) < -70) ? `<div class="alerta-critico">⚠️ Sinal Crítico (${cliente.sinal} dBm)<br>Ajuste necessário!</div>` : "";

    resultado.innerHTML = `
    <div class="campo"><div class="titulo">PPOE</div><div class="valor">${cliente.ppoe}</div></div>
    <div class="campo"><div class="titulo">Painel</div><div class="valor">${cliente.painel}</div></div>
    <div class="campo"><div class="titulo">IP</div><div class="valor">${formatarIP(cliente.ip)}</div></div>
    <div class="campo"><div class="titulo">Última Medição</div><div class="valor">${cliente.sinal}</div></div>
    ${alertaHtml}
    <div class="campo"><div class="titulo">Status</div><div class="${classe}">${status}</div></div>
    <button onclick="copiarEsalvar('${formatarIP(cliente.ip)}', '${cliente.ppoe}')">Copiar IP</button>
    <button onclick="copiarEsalvar('${cliente.ppoe}', '${cliente.ppoe}')">Copiar PPOE</button>`;
});

// [MANTENHA O RESTANTE DO SEU CÓDIGO ORIGINAL AQUI: copiarEsalvar, renderizarHistorico, usarHistorico, Dashboard, Importação...]
