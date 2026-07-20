let clientes = [];

// Formata IP
function formatarIP(ip) {

    if (!ip) return "";

    ip = String(ip);

    // Se já estiver com pontos
    if (ip.includes(".")) return ip;

    // Mantém apenas números
    ip = ip.replace(/\D/g, "");

    // Formata IP de 12 dígitos
    if (ip.length === 12) {
        return ip.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, "$1.$2.$3.$4");
    }

    return ip;
}

// Carrega a lista de clientes
fetch("clientes.json")
    .then(res => res.json())
    .then(data => {
        clientes = data;
    });

const pesquisa = document.getElementById("pesquisa");
const resultado = document.getElementById("resultado");

pesquisa.addEventListener("input", () => {

    const texto = pesquisa.value.toLowerCase().trim();

    if(texto === ""){
        resultado.innerHTML = "";
        return;
    }

    const cliente = clientes.find(c =>
        (c.ppoe || "").toLowerCase().includes(texto) ||
        String(c.ip || "").includes(texto)
    );

    if(!cliente){
        resultado.innerHTML = "<h3>Cliente não encontrado.</h3>";
        return;
    }

    let status = cliente.status;
    let classe = "";

    if(status == 3 || status == "3"){
        status = "🟢 Bom";
        classe = "status-bom";
    }else if(status == 2 || status == "2"){
        status = "🟡 Médio";
        classe = "status-medio";
    }else{
        status = "🔴 Ruim";
        classe = "status-ruim";
    }

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
