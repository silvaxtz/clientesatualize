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

const usuarioInput = document.getElementById("usuario");
const senhaInput = document.getElementById("senha");
const erroLogin = document.getElementById("erroLogin");

const btnLogin = document.getElementById("btnLogin");
const btnSair = document.getElementById("btnSair");
const btnAdmin = document.getElementById("btnAdmin");
const usuarioLogado = document.getElementById("usuarioLogado");

// =========================
// LOGIN
// =========================

function entrar() {

    const usuario = usuarioInput.value.trim().toLowerCase();
    const senha = senhaInput.value;

    const encontrado = usuarios.find(u =>
        u.usuario === usuario &&
        u.senha === senha
    );

    if (!encontrado) {
        erroLogin.textContent = "Usuário ou senha inválidos.";
        return;
    }

    localStorage.setItem("usuarioAtual", JSON.stringify(encontrado));

    carregarSistema();
}

btnLogin.addEventListener("click", entrar);

senhaInput.addEventListener("keypress", e => {
    if (e.key === "Enter") entrar();
});

function carregarSistema() {

    const salvo = JSON.parse(localStorage.getItem("usuarioAtual"));

    if (!salvo) {
        loginTela.style.display = "block";
        sistema.style.display = "none";
        return;
    }

    loginTela.style.display = "none";
    sistema.style.display = "block";

    usuarioLogado.innerHTML =
        `👤 ${salvo.usuario} (${salvo.tipo})`;

    btnAdmin.style.display =
        salvo.tipo === "admin"
            ? "inline-block"
            : "none";
}

btnSair.addEventListener("click", () => {

    localStorage.removeItem("usuarioAtual");

    location.reload();

});

carregarSistema();

// =========================
// CLIENTES
// =========================

let clientes = [];

// Formata IP
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

// Carrega clientes
fetch("clientes.json")
.then(res=>res.json())
.then(data=>{
    clientes=data;
});

const pesquisa=document.getElementById("pesquisa");
const resultado=document.getElementById("resultado");

pesquisa.addEventListener("input",()=>{

    const texto=pesquisa.value.toLowerCase().trim();

    if(texto===""){
        resultado.innerHTML="";
        return;
    }

    const cliente=clientes.find(c=>
        (c.ppoe||"").toLowerCase().includes(texto) ||
        String(c.ip||"").includes(texto)
    );

    if(!cliente){
        resultado.innerHTML="<h3>Cliente não encontrado.</h3>";
        return;
    }

    let status=cliente.status;
    let classe="";

    if(status==3){
        status="🟢 Bom";
        classe="status-bom";
    }else if(status==2){
        status="🟡 Médio";
        classe="status-medio";
    }else{
        status="🔴 Ruim";
        classe="status-ruim";
    }

    resultado.innerHTML=`

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
        <div class="valor">${formatarIP(cliente.ip)}</div>
    </div>

    <div class="campo">
        <div class="titulo">Sinal</div>
        <div class="valor">${cliente.sinal}</div>
    </div>

    <div class="campo">
        <div class="titulo">Status</div>
        <div class="${classe}">${status}</div>
    </div>

    <button onclick="copiar('${formatarIP(cliente.ip)}')">
        Copiar IP
    </button>

    <button onclick="copiar('${cliente.ppoe}')">
        Copiar PPOE
    </button>

    `;

});

function copiar(texto){

    navigator.clipboard.writeText(texto);

    alert("Copiado!");

}
