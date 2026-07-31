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
// TOAST
// =========================

function mostrarToast(texto){

    let toast = document.getElementById("toast");

    if(!toast){

        toast = document.createElement("div");

        toast.id = "toast";

        toast.style.cssText=`
            position:fixed;
            right:20px;
            bottom:20px;
            background:#00b050;
            color:#fff;
            padding:14px 20px;
            border-radius:12px;
            font-weight:600;
            z-index:99999;
            box-shadow:0 10px 25px rgba(0,0,0,.2);
            opacity:0;
            transition:.25s;
        `;

        document.body.appendChild(toast);

    }

    toast.innerHTML=texto;

    toast.style.opacity=1;

    clearTimeout(toast.timer);

    toast.timer=setTimeout(()=>{

        toast.style.opacity=0;

    },2200);

}

// =========================
// LOGIN
// =========================

function entrar(){

    erroLogin.textContent="";

    const usuario=usuarioInput.value.trim().toLowerCase();

    const senha=senhaInput.value;

    const encontrado=usuarios.find(u=>

        u.usuario===usuario &&

        u.senha===senha

    );

    if(!encontrado){

        erroLogin.textContent="Usuário ou senha inválidos.";

        usuarioInput.focus();

        return;

    }

    localStorage.setItem(

        "usuarioAtual",

        JSON.stringify(encontrado)

    );

    carregarSistema();

}

btnLogin.onclick=entrar;

senhaInput.addEventListener("keypress",e=>{

    if(e.key==="Enter"){

        entrar();

    }

});

function carregarSistema(){

    const salvo=JSON.parse(

        localStorage.getItem("usuarioAtual")

    );

    if(!salvo){

        loginTela.style.display="block";

        sistema.style.display="none";

        painelAdmin.style.display="none";

        return;

    }

    loginTela.style.display="none";

    sistema.style.display="block";

    usuarioLogado.textContent=`${salvo.usuario} (${salvo.tipo})`;

    btnAdmin.style.display=

        salvo.tipo==="admin"

        ? "inline-block"

        : "none";

    renderizarHistorico();

}

btnSair.onclick=()=>{

    localStorage.removeItem("usuarioAtual");

    location.reload();

};

carregarSistema();

// =========================
// CLIENTES & HISTÓRICO
// =========================

let clientes = [];

// =========================
// FORMATA IP
// =========================

function formatarIP(ip){

    if(!ip) return "";

    ip=String(ip);

    if(ip.includes(".")) return ip;

    ip=ip.replace(/\D/g,"");

    if(ip.length===12){

        return ip.replace(

            /(\d{3})(\d{3})(\d{3})(\d{3})/,

            "$1.$2.$3.$4"

        );

    }

    return ip;

}

// =========================
// CARREGA CLIENTES
// =========================

async function carregarClientes(){

    try{

        const resposta=await fetch("clientes.json");

        if(!resposta.ok){

            throw new Error();

        }

        clientes=await resposta.json();

        atualizarDashboard();

    }

    catch{

        console.log("clientes.json ainda não existe.");

    }

}

carregarClientes();

// =========================
// STATUS
// =========================

function obterStatus(status){

    status=Number(status);

    if(status===3){

        return{

            texto:"🟢 Bom",

            classe:"status-bom"

        };

    }

    if(status===2){

        return{

            texto:"🟡 Médio",

            classe:"status-medio"

        };

    }

    return{

        texto:"🔴 Ruim",

        classe:"status-ruim"

    };

}

// =========================
// PESQUISA
// =========================

pesquisa.addEventListener("input",pesquisarCliente);

function pesquisarCliente(){

    const texto=pesquisa.value

    .trim()

    .toLowerCase();

    if(texto===""){

        resultado.innerHTML="";

        return;

    }

    const cliente=clientes.find(c=>{

        return(

            String(c.ppoe)

            .toLowerCase()

            .includes(texto)

            ||

            String(c.ip)

            .toLowerCase()

            .includes(texto)

        );

    });

    if(!cliente){

        resultado.innerHTML=`

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

    const status=obterStatus(cliente.status);

    let alerta="";

    const sinal=parseInt(cliente.sinal);

    if(!isNaN(sinal)){

        if(sinal<=-81){

            alerta=`

<div class="alerta-critico">

⚠️ Sinal crítico (${cliente.sinal})

</div>

`;

        }

        else if(sinal<=-70){

            alerta=`

<div class="alerta-critico alerta-amarelo">

⚠️ Atenção (${cliente.sinal})

</div>

`;

        }

    }

resultado.innerHTML=`

<div class="campo">

<div class="titulo">

PPOE

</div>

<div class="valor">

${cliente.ppoe}

</div>

</div>

<div class="campo">

<div class="titulo">

Painel

</div>

<div class="valor">

${cliente.painel}

</div>

</div>

<div class="campo">

<div class="titulo">

IP

</div>

<div class="valor">

${formatarIP(cliente.ip)}

</div>

</div>

<div class="campo">

<div class="titulo">

SSID

</div>

<div class="valor">

${cliente.ssid||"Não informado"}

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

${alerta}

<div class="campo">

<div class="titulo">

Status

</div>

<div class="${status.classe}">

${status.texto}

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

window.copiarEsalvar=function(texto,historico){

    navigator.clipboard.writeText(texto);

    mostrarToast("✔ Copiado");

    let lista=JSON.parse(

        localStorage.getItem("historico_pesquisas")||"[]"

    );

    lista=lista.filter(h=>h!==historico);

    lista.unshift(historico);

    if(lista.length>5){

        lista.pop();

    }

    localStorage.setItem(

        "historico_pesquisas",

        JSON.stringify(lista)

    );

    renderizarHistorico();

};

function renderizarHistorico(){

    const lista=JSON.parse(

        localStorage.getItem("historico_pesquisas")||"[]"

    );

    divHistorico.innerHTML=lista.map(item=>`

<button

class="btn-historico"

onclick="usarHistorico('${item}')">

🕒 ${item}

</button>

`).join("");

}

window.usarHistorico=function(item){

    pesquisa.value=item;

    pesquisarCliente();

};

// =========================
// DASHBOARD ADMIN
// =========================

btnAdmin.addEventListener("click", abrirPainelAdmin);
fecharAdmin.addEventListener("click", fecharPainelAdmin);

function abrirPainelAdmin() {

    sistema.style.display = "none";
    painelAdmin.style.display = "block";

    atualizarDashboard();

}

function fecharPainelAdmin() {

    painelAdmin.style.display = "none";
    sistema.style.display = "block";

}

// =========================
// ANIMAÇÃO DOS NÚMEROS
// =========================

function animarNumero(elemento, valorFinal){

    const inicio = 0;
    const duracao = 700;
    const inicioTempo = performance.now();

    function atualizar(tempo){

        const progresso = Math.min((tempo - inicioTempo) / duracao, 1);

        elemento.textContent = Math.floor(
            inicio + (valorFinal - inicio) * progresso
        );

        if(progresso < 1){

            requestAnimationFrame(atualizar);

        }

    }

    requestAnimationFrame(atualizar);

}

// =========================
// DASHBOARD
// =========================

function atualizarDashboard(){

    if(!clientes.length) return;

    const totalClientes = clientes.length;

    const totalPaineis = new Set(
        clientes.map(c => c.painel)
    ).size;

    const totalBom = clientes.filter(
        c => Number(c.status) === 3
    ).length;

    const totalMedio = clientes.filter(
        c => Number(c.status) === 2
    ).length;

    const totalRuim = totalClientes - totalBom - totalMedio;

    animarNumero(
        document.getElementById("totalClientes"),
        totalClientes
    );

    animarNumero(
        document.getElementById("totalPaineis"),
        totalPaineis
    );

    animarNumero(
        document.getElementById("totalBom"),
        totalBom
    );

    animarNumero(
        document.getElementById("totalMedio"),
        totalMedio
    );

    animarNumero(
        document.getElementById("totalRuim"),
        totalRuim
    );

    atualizarRanking();

}

// =========================
// RANKING
// =========================

function atualizarRanking(){

    const ranking = {};

    clientes.forEach(cliente=>{

        ranking[cliente.painel] =
            (ranking[cliente.painel] || 0) + 1;

    });

    const top10 = Object.entries(ranking)

        .sort((a,b)=>b[1]-a[1])

        .slice(0,10);

    const div = document.getElementById("rankingPaineis");

    div.innerHTML = "";

    top10.forEach(([painel,total],indice)=>{

        const porcentagem =
            (total / clientes.length) * 100;

        div.innerHTML += `

<div class="itemPainel">

<span>

<strong>${indice+1}º ${painel}</strong>

<strong>${total}</strong>

</span>

<div class="barraPainel">

<div
class="preenchimento"
style="width:${porcentagem}%">

</div>

</div>

</div>

`;

    });

}

// =========================
// COPIAR ESTATÍSTICAS
// =========================

document
.getElementById("copiarEstatisticas")
.onclick = ()=>{

    const total = clientes.length;

    const bom = clientes.filter(
        c=>Number(c.status)===3
    ).length;

    const medio = clientes.filter(
        c=>Number(c.status)===2
    ).length;

    const ruim = total - bom - medio;

    navigator.clipboard.writeText(

`📊 Atualize Telecom

👥 Clientes: ${total}

🟢 Bom: ${bom}

🟡 Médio: ${medio}

🔴 Ruim: ${ruim}`

    );

    mostrarToast("✔ Estatísticas copiadas");

};

// =========================
// DOWNLOAD JSON
// =========================

document
.getElementById("baixarJson")
.onclick = ()=>{

    const blob = new Blob(

        [
            JSON.stringify(
                clientes,
                null,
                2
            )
        ],

        {
            type:"application/json"
        }

    );

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "clientes.json";

    link.click();

    URL.revokeObjectURL(link.href);

    mostrarToast("✔ Download iniciado");

};

// =========================
// IMPORTAÇÃO DE EXCEL
// =========================

const inputExcel = document.getElementById("inputExcel");
const btnImportarExcel = document.getElementById("btnImportarExcel");

btnImportarExcel.addEventListener("click", importarPlanilha);

async function importarPlanilha(){

    const arquivo = inputExcel.files[0];

    if(!arquivo){

        mostrarToast("Selecione uma planilha.");

        return;

    }

    btnImportarExcel.disabled = true;

    const textoOriginal = btnImportarExcel.innerHTML;

    btnImportarExcel.innerHTML = "⏳ Importando...";

    try{

        const buffer = await arquivo.arrayBuffer();

        const workbook = XLSX.read(buffer,{
            type:"array"
        });

        let novosClientes = [];

        workbook.SheetNames.forEach(nomeAba=>{

            const sheet = workbook.Sheets[nomeAba];

            const painel = String(
                sheet["A4"]?.v || ""
            ).trim();

            if(!painel) return;

            const nomePainel = "P " + painel;

            const ssid = String(
                sheet["J4"]?.v || ""
            ).trim();

            const linhas = XLSX.utils.sheet_to_json(
                sheet,
                {
                    header:1,
                    defval:""
                }
            );

            for(let i=7;i<linhas.length;i++){

                const linha = linhas[i];

                if(!linha) continue;

                const ppoe = String(
                    linha[0] || ""
                ).trim();

                const ip = String(
                    linha[3] || ""
                ).trim();

                const sinal = String(
                    linha[6] || ""
                ).trim();

                if(
                    !ppoe &&
                    !ip &&
                    !sinal
                ){
                    continue;
                }

                let status = 1;

                const valor = Number(sinal);

                if(!isNaN(valor)){

                    if(valor >= -65){

                        status = 3;

                    }else if(valor >= -75){

                        status = 2;

                    }

                }

                novosClientes.push({

                    ppoe,

                    painel:nomePainel,

                    ip,

                    ssid,

                    sinal,

                    status

                });

            }

        });

        clientes = novosClientes;

        atualizarDashboard();

        inputExcel.value = "";

        mostrarToast(

            `✔ ${clientes.length} clientes carregados`

        );

    }

    catch(erro){

        console.error(erro);

        mostrarToast(

            "Erro ao importar planilha."

        );

    }

    finally{

        btnImportarExcel.disabled = false;

        btnImportarExcel.innerHTML = textoOriginal;

    }

}
