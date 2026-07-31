// =========================
// USUÁRIOS
// =========================

// ======================================================
// ATUALIZE TELECOM
// SCRIPT V2
// ======================================================

// =========================
// USUÁRIOS
// =========================

const usuarios = [
    { usuario: "adriano", senha: "180405a", tipo: "admin" },
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
const resultado = document.getElementById("resultado");
const divHistorico = document.getElementById("historicoPesquisas");

// =========================
// DADOS
// =========================

let clientes = [];
let versaoAtual = null;

// =========================
// TOAST
// =========================

function mostrarToast(mensagem, tipo = "sucesso") {

    let toast = document.getElementById("toast");

    if (!toast) {

        toast = document.createElement("div");

        toast.id = "toast";

        toast.className = "toast";

        document.body.appendChild(toast);

    }

    toast.className = `toast ${tipo}`;

    toast.textContent = mensagem;

    toast.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}

// =========================
// LOGIN
// =========================

function entrar() {

    const usuario = usuarioInput.value
        .trim()
        .toLowerCase();

    const senha = senhaInput.value;

    const encontrado = usuarios.find(u =>
        u.usuario === usuario &&
        u.senha === senha
    );

    if (!encontrado) {

        erroLogin.textContent =
            "Usuário ou senha inválidos.";

        usuarioInput.focus();

        return;

    }

    localStorage.setItem(
        "usuarioAtual",
        JSON.stringify(encontrado)
    );

    carregarSistema();

}

btnLogin.addEventListener(
    "click",
    entrar
);

senhaInput.addEventListener(
    "keypress",
    e => {

        if (e.key === "Enter") {

            entrar();

        }

    }
);

function carregarSistema() {

    const salvo = JSON.parse(
        localStorage.getItem("usuarioAtual")
    );

    if (!salvo) {

        loginTela.style.display = "block";

        sistema.style.display = "none";

        painelAdmin.style.display = "none";

        return;

    }

    loginTela.style.display = "none";

    sistema.style.display = "block";

    usuarioLogado.textContent =
        `${salvo.usuario} (${salvo.tipo})`;

    btnAdmin.style.display =
        salvo.tipo === "admin"
            ? "inline-flex"
            : "none";

    renderizarHistorico();

}

btnSair.addEventListener("click", () => {

    localStorage.removeItem("usuarioAtual");

    location.reload();

});

carregarSistema();

// =========================
// CLIENTES & HISTÓRICO
// =========================

// =========================
// CLIENTES
// =========================

function formatarIP(ip) {

    if (!ip) return "";

    ip = String(ip);

    if (ip.includes(".")) return ip;

    ip = ip.replace(/\D/g, "");

    if (ip.length === 12) {

        return ip.replace(
            /(\d{3})(\d{3})(\d{3})(\d{3})/,
            "$1.$2.$3.$4"
        );

    }

    return ip;

}

// =========================
// CARREGA JSON
// =========================

async function carregarClientes() {

    try {

        const resposta = await fetch("clientes.json");

        if (!resposta.ok) {

            throw new Error();

        }

        clientes = await resposta.json();

        atualizarDashboard();

    } catch {

        console.log("clientes.json não encontrado.");

        clientes = [];

    }

}

carregarClientes();

// =========================
// STATUS
// =========================

function obterStatus(status) {

    switch (Number(status)) {

        case 3:

            return {
                texto: "Bom",
                classe: "status-bom",
                icone: "🟢"
            };

        case 2:

            return {
                texto: "Médio",
                classe: "status-medio",
                icone: "🟡"
            };

        default:

            return {
                texto: "Ruim",
                classe: "status-ruim",
                icone: "🔴"
            };

    }

}

// =========================
// ALERTA SINAL
// =========================

function criarAlertaSinal(valor) {

    const sinal = parseInt(valor);

    if (isNaN(sinal)) return "";

    if (sinal <= -81) {

        return `

        <div class="alerta-critico">

            ⚠️ Sinal crítico (${valor} dBm)

            <br>

            Verificar fibra, conector ou ONU.

        </div>

        `;

    }

    if (sinal <= -70) {

        return `

        <div class="alerta-critico alerta-amarelo">

            ⚠️ Atenção (${valor} dBm)

            <br>

            Sinal abaixo do ideal.

        </div>

        `;

    }

    return "";

}

// =========================
// PESQUISA
// =========================

pesquisa.addEventListener("input", pesquisarCliente);

function pesquisarCliente() {

    const texto = pesquisa.value
        .trim()
        .toLowerCase();

    if (!texto) {

        resultado.innerHTML = "";

        return;

    }

    const cliente = clientes.find(c => {

        return (
            String(c.ppoe || "")
                .toLowerCase()
                .includes(texto)

            ||

            String(c.ip || "")
                .toLowerCase()
                .includes(texto)

        );

    });

    if (!cliente) {

        resultado.innerHTML = `

        <div class="nao-encontrado">

            <div class="icone">

                🔍

            </div>

            <h2>

                Cliente não encontrado

            </h2>

            <p>

                Confira o PPOE ou IP informado.

            </p>

        </div>

        `;

        return;

    }

    const status = obterStatus(cliente.status);

    resultado.innerHTML = `

<div class="campo">

<div class="titulo">PPOE</div>

<div class="valor">${cliente.ppoe}</div>

</div>

<div class="campo">

<div class="titulo">Painel</div>

<div class="valor">${cliente.painel}</div>

</div>

<div class="campo">

<div class="titulo">IP</div>

<div class="valor">

${formatarIP(cliente.ip)}

</div>

</div>

<div class="campo">

<div class="titulo">SSID</div>

<div class="valor">

${cliente.ssid || "Não informado"}

</div>

</div>

<div class="campo">

<div class="titulo">

Última Medição

</div>

<div class="valor">

${cliente.sinal}

</div>

</div>

${criarAlertaSinal(cliente.sinal)}

<div class="campo">

<div class="titulo">

Status

</div>

<div class="${status.classe}">

${status.icone} ${status.texto}

</div>

</div>

<div class="botoes-copiar">

<button onclick="copiarEsalvar('${formatarIP(cliente.ip)}','${cliente.ppoe}')">

📋 Copiar IP

</button>

<button onclick="copiarEsalvar('${cliente.ppoe}','${cliente.ppoe}')">

📋 Copiar PPOE

</button>

<button onclick="copiarEsalvar('${cliente.ssid}','${cliente.ppoe}')">

📋 Copiar SSID

</button>

</div>

`;

}

// =========================
// HISTÓRICO
// =========================

window.copiarEsalvar = function(texto, historico) {

    navigator.clipboard.writeText(texto);

    mostrarToast("Copiado!");

    let lista = JSON.parse(
        localStorage.getItem("historico_pesquisas") || "[]"
    );

    lista = lista.filter(i => i !== historico);

    lista.unshift(historico);

    if (lista.length > 5) {

        lista.pop();

    }

    localStorage.setItem(
        "historico_pesquisas",
        JSON.stringify(lista)
    );

    renderizarHistorico();

};

function renderizarHistorico() {

    const lista = JSON.parse(
        localStorage.getItem("historico_pesquisas") || "[]"
    );

    divHistorico.innerHTML = lista
        .map(item => `
            <button
                class="btn-historico"
                onclick="usarHistorico('${item}')">
                🕒 ${item}
            </button>
        `)
        .join("");

}

window.usarHistorico = function(valor) {

    pesquisa.value = valor;

    pesquisarCliente();

};

// =========================
// DASHBOARD ADMIN
// =========================

// ======================================================
// DASHBOARD ADMIN
// ======================================================

btnAdmin.addEventListener("click", abrirPainelAdmin);
fecharAdmin.addEventListener("click", fecharPainelAdministrador);

function abrirPainelAdmin() {

    sistema.style.display = "none";
    painelAdmin.style.display = "block";

    atualizarDashboard();

}

function fecharPainelAdministrador() {

    painelAdmin.style.display = "none";
    sistema.style.display = "block";

}

// ======================================================
// ATUALIZA DASHBOARD
// ======================================================

function atualizarDashboard() {

    if (!clientes.length) return;

    const totalClientes = clientes.length;

    const totalPaineis = new Set(
        clientes.map(c => c.painel)
    ).size;

    const totalBom = clientes.filter(c => Number(c.status) === 3).length;

    const totalMedio = clientes.filter(c => Number(c.status) === 2).length;

    const totalRuim = totalClientes - totalBom - totalMedio;

    document.getElementById("totalClientes").textContent = totalClientes;
    document.getElementById("totalPaineis").textContent = totalPaineis;
    document.getElementById("totalBom").textContent = totalBom;
    document.getElementById("totalMedio").textContent = totalMedio;
    document.getElementById("totalRuim").textContent = totalRuim;

    atualizarRanking();

}

// ======================================================
// RANKING
// ======================================================

function atualizarRanking() {

    const ranking = {};

    clientes.forEach(cliente => {

        ranking[cliente.painel] =
            (ranking[cliente.painel] || 0) + 1;

    });

    const top10 = Object.entries(ranking)

        .sort((a, b) => b[1] - a[1])

        .slice(0, 10);

    const divRanking =
        document.getElementById("rankingPaineis");

    divRanking.innerHTML = "";

    top10.forEach(([painel, quantidade], index) => {

        const item = document.createElement("div");

        item.className = "ranking-item";

        item.innerHTML = `

<div class="ranking-posicao">

${index + 1}º

</div>

<div class="ranking-info">

<strong>${painel}</strong>

<span>

${quantidade} clientes

</span>

</div>

`;

        divRanking.appendChild(item);

    });

}

// ======================================================
// COPIAR ESTATÍSTICAS
// ======================================================

document
.getElementById("copiarEstatisticas")
.addEventListener("click", copiarEstatisticas);

function copiarEstatisticas() {

    const total = clientes.length;

    const bom = clientes.filter(c => Number(c.status) === 3).length;

    const medio = clientes.filter(c => Number(c.status) === 2).length;

    const ruim = total - bom - medio;

    const texto = `

📊 Atualize Telecom

👥 Clientes: ${total}

📡 Painéis: ${new Set(clientes.map(c => c.painel)).size}

🟢 Bom: ${bom}

🟡 Médio: ${medio}

🔴 Ruim: ${ruim}

`;

    navigator.clipboard.writeText(texto.trim());

    mostrarToast("Estatísticas copiadas.");

}

// ======================================================
// DOWNLOAD JSON
// ======================================================

document
.getElementById("baixarJson")
.addEventListener("click", baixarJSON);

function baixarJSON() {

    const blob = new Blob(

        [JSON.stringify(clientes, null, 2)],

        {
            type: "application/json"
        }

    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "clientes.json";

    link.click();

    URL.revokeObjectURL(url);

    mostrarToast("Download iniciado.");

}
// =========================
// IMPORTAÇÃO DE EXCEL
// =========================

// ======================================================
// IMPORTAÇÃO DE EXCEL
// ======================================================

const inputExcel = document.getElementById("inputExcel");
const btnImportarExcel = document.getElementById("btnImportarExcel");

btnImportarExcel.addEventListener("click", importarExcel);

async function importarExcel() {

    const arquivo = inputExcel.files[0];

    if (!arquivo) {

        mostrarToast("Selecione uma planilha.", "erro");

        return;

    }

    try {

        btnImportarExcel.disabled = true;

        btnImportarExcel.textContent = "Importando...";

        const buffer = await arquivo.arrayBuffer();

        const workbook = XLSX.read(buffer, {
            type: "array"
        });

        const novosClientes = [];

        workbook.SheetNames.forEach(nomeAba => {

            const worksheet = workbook.Sheets[nomeAba];

            const painel = String(
                worksheet["A4"]?.v || ""
            ).trim();

            if (!painel) return;

            const nomePainel = "P " + painel;

            const ssid = String(
                worksheet["J4"]?.v || ""
            ).trim();

            const linhas = XLSX.utils.sheet_to_json(
                worksheet,
                {
                    header: 1,
                    defval: ""
                }
            );

            for (let i = 7; i < linhas.length; i++) {

                const linha = linhas[i];

                if (!linha) continue;

                const ppoe = String(linha[0] || "").trim();

                const ip = String(linha[3] || "").trim();

                const sinal = String(linha[6] || "").trim();

                if (!ppoe && !ip && !sinal) continue;

                const valor = Number(sinal);

                let status = 1;

                if (!isNaN(valor)) {

                    if (valor >= -65) {

                        status = 3;

                    } else if (valor >= -75) {

                        status = 2;

                    }

                }

                novosClientes.push({

                    ppoe,

                    painel: nomePainel,

                    ip,

                    ssid,

                    sinal,

                    status

                });

            }

        });

        clientes = novosClientes;

        atualizarDashboard();

        mostrarToast(

            `${clientes.length} clientes importados.`

        );

        inputExcel.value = "";

    } catch (erro) {

        console.error(erro);

        mostrarToast(

            "Erro ao importar planilha.",

            "erro"

        );

    } finally {

        btnImportarExcel.disabled = false;

        btnImportarExcel.innerHTML = `
            Importar Planilha
        `;

    }

}

// ======================================================
// SISTEMA DE ATUALIZAÇÃO
// ======================================================

const banner = document.getElementById("updateBanner");
const btnAtualizar = document.getElementById("btnAtualizarApp");
const versaoTexto = document.getElementById("versaoApp");

async function verificarNovaVersao() {

    try {

        const resposta = await fetch(

            "version.json?v=" + Date.now(),

            {

                cache: "no-store"

            }

        );

        const dados = await resposta.json();

        if (versaoAtual === null) {

            versaoAtual = dados.version;

            versaoTexto.textContent =
                "Versão " + dados.version;

            return;

        }

        if (dados.version !== versaoAtual) {

            banner.style.display = "flex";

        }

    } catch (erro) {

        console.log(

            "Falha ao verificar versão.",

            erro

        );

    }

}

verificarNovaVersao();

setInterval(

    verificarNovaVersao,

    10000

);

// ======================================================
// BOTÃO ATUALIZAR
// ======================================================

btnAtualizar.addEventListener(

    "click",

    async () => {

        const registro =
            await navigator.serviceWorker.getRegistration();

        if (!registro) return;

        await registro.update();

        if (registro.waiting) {

            registro.waiting.postMessage(

                "SKIP_WAITING"

            );

        }

    }

);

// ======================================================
// SERVICE WORKER
// ======================================================

if ("serviceWorker" in navigator) {

    navigator.serviceWorker.addEventListener(

        "controllerchange",

        () => location.reload()

    );

}

// ======================================================
// LUCIDE
// ======================================================

if (window.lucide) {

    lucide.createIcons();

}
