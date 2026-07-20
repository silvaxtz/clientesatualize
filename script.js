let clientes = [];

fetch("clientes.json")
  .then(res => res.json())
  .then(data => {
    clientes = data;
  });

function formatarIP(ip) {
  if (!ip) return "";

  ip = String(ip).replace(/\D/g, "");

  // Se já estiver com pontos
  if (ip.includes(".")) return ip;

  // IP salvo como 12 dígitos
  if (ip.length === 12) {
    return `${ip.slice(0,3)}.${ip.slice(3,6)}.${ip.slice(6,9)}.${ip.slice(9,12)}`;
  }

  return ip;
}

function pesquisar() {

  const texto = document
    .getElementById("pesquisa")
    .value
    .toLowerCase()
    .trim();

  const resultado = document.getElementById("resultado");

  if (texto === "") {
    resultado.innerHTML = "";
    return;
  }

  const encontrados = clientes.filter(c =>
    (c.ppoe || "").toLowerCase().includes(texto) ||
    String(c.ip || "").includes(texto)
  );

  if (encontrados.length === 0) {
    resultado.innerHTML =
      "<p style='text-align:center'>Nenhum cliente encontrado.</p>";
    return;
  }

  resultado.innerHTML = encontrados.map(cliente => `
    <div class="card">

      <h2>${cliente.ppoe}</h2>

      <p><strong>Painel:</strong> ${cliente.painel}</p>

      <p><strong>IP:</strong> ${formatarIP(cliente.ip)}</p>

      <p><strong>Sinal:</strong> ${cliente.sinal || "-"}</p>

      <p><strong>Status:</strong> ${cliente.status}</p>

      <button onclick="copiar('${formatarIP(cliente.ip)}')">
        Copiar IP
      </button>

    </div>
  `).join("");
}

function copiar(texto) {
  navigator.clipboard.writeText(texto);
  alert("IP copiado!");
}

document
  .getElementById("pesquisa")
  .addEventListener("input", pesquisar);
