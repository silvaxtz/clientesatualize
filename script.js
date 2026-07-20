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
// CLIENTES & FILTROS
// =========================
let clientes = [];
function formatarIP(ip){ if(!ip) return ""; ip = String(ip); if(ip.includes(".")) return ip; ip = ip.replace(/\D/g,""); return ip.length===12 ? ip.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/,"$1.$2.$3.$4") : ip; }

fetch("clientes.json").then(res => res.json()).then(data => { clientes = data; atualizarFiltro(); atualizarDashboard(); }).catch(err => console.log("Carregando..."));

// Busca por PPOE ou IP
pesquisa.addEventListener("input", () => {
    const texto = pesquisa.value.toLowerCase().trim();
    if (texto === "") { resultado.innerHTML = ""; return; }
    filtroPainel.value = ""; 
    const cliente = clientes.find(c => (c.ppoe || "").toLowerCase().includes(texto) || String(c.ip || "").includes(texto));
    if (!cliente) { resultado.innerHTML = `<div class="nao-encontrado"><h2>Cliente não encontrado</h2></div>`; return; }
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
        resultado.innerHTML += `<div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 5px;"><strong>${c.ppoe}</strong> | ${c.ip} <br><span>Última Medição: ${c.sinal}</span></div>`;
    });
});

function renderizarCliente(c) {
    let status = c.status == 3 ? "🟢 Bom" : (c.status == 2 ? "🟡 Médio" : "🔴 Ruim");
    let classe = c.status == 3 ? "status-bom" : (c.status == 2 ? "status-medio" : "status-ruim");
    let sinalVal = parseInt(c.sinal); 
    let alerta = (!isNaN(sinalVal) && sinalVal < -70) ? `<div class="alerta-critico">⚠️ Sinal Crítico (${c.sinal} dBm)<br>Última medição aponta necessidade de alinhamento!</div>` : "";

    resultado.innerHTML = `
    <div class="campo"><div class="titulo">PPOE</div><div class="valor">${c.ppoe}</div></div>
    <div class="campo"><div class="titulo">Painel</div><div class="valor">${c.painel}</div></div>
    <div class="campo"><div class="titulo">IP</div><div class="valor">${formatarIP(c.ip)}</div></div>
    <div class="campo"><div class="titulo">Última Medição</div><div class="valor">${c.sinal}</div></div>
    ${alerta}
    <div class="campo"><div class="titulo">Status</div><div class="${classe}">${status}</div></div>
    <button onclick="copiarEsalvar('${formatarIP(c.ip)}', '${c.ppoe}')">Copiar IP</button>
    <button onclick="copiarEsalvar('${c.ppoe}', '${c.ppoe}')">Copiar PPOE</button>`;
}

function atualizarFiltro() {
    const paineis = [...new Set(clientes.map(c => c.painel))].sort();
    filtroPainel.innerHTML = '<option value="">Filtrar por Painel (Torre)...</option>';
    paineis.forEach(p => { filtroPainel.innerHTML += `<option value="${p}">${p}</option>`; });
}

// Manter o restante (Copiar/Colar, Admin, Importação) igual ao seu original.
// Se precisar de alguma destas funções que você já tinha, me avise e eu colo aqui!
