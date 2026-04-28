// ==========================================
// Regla de Tres - With localStorage + Reset
// ==========================================

// --------------------
// localStorage
// --------------------
const STORAGE_KEY = "reglaTresHistory";
const historyData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(historyData));
}

// --------------------
// Init Materialize
// --------------------
document.addEventListener("DOMContentLoaded", () => {
  M.FormSelect.init(document.querySelectorAll("select"));
  renderHistory();
});

// --------------------
// Validate partsDB
// --------------------
if (!window.partsDB) {
  console.error("partsDB not loaded. Make sure partsdb.js is included BEFORE reglatres.js");
}

// --------------------
// Build normalized data from partsDB
// --------------------
const partsData = Object.entries(window.partsDB)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([partNumber, part]) => ({
    partNumber,
    line: part.line ?? "Unknown",
    description: part.description ?? "",

    // Semantic alias
    piecesPerUnit: part.piecesPerUnit ?? part.pack ?? null,

    weight: part.weight ?? null
  }));

// --------------------
// DOM Elements
// --------------------
const lineSelect = document.getElementById("tipo");
const partSelect = document.getElementById("parte");
const infoContainer = document.getElementById("info");
const resultContainer = document.getElementById("resultado");

// --------------------
// Populate Line Select
// --------------------
const lines = [...new Set(partsData.map(p => p.line))].sort();

lines.forEach(line => {
  const option = document.createElement("option");
  option.value = line;
  option.textContent = line;
  lineSelect.appendChild(option);
});

M.FormSelect.init(lineSelect);

// --------------------
// Line Change Handler
// --------------------
lineSelect.addEventListener("change", () => {
  partSelect.innerHTML = '<option value="" disabled selected>Choose part</option>';
  infoContainer.innerHTML = "";
  resultContainer.textContent = "";

  const filteredParts = partsData
    .filter(p => p.line === lineSelect.value)
    .sort((a, b) => a.partNumber.localeCompare(b.partNumber));

  filteredParts.forEach(part => {
    const option = document.createElement("option");
    option.value = part.partNumber;
    option.textContent = part.partNumber;
    partSelect.appendChild(option);
  });

  M.FormSelect.init(partSelect);
});

// --------------------
// Part Change Handler
// --------------------
partSelect.addEventListener("change", () => {
  const part = partsData.find(p => p.partNumber === partSelect.value);
  if (!part) return;

  infoContainer.innerHTML = `
    <div class="info-line"><b>Descripción:</b> ${part.description || "n/a"}</div>
    <div class="info-line"><b>Piezas (Pack):</b> ${part.pack ?? "n/a"}</div>
    <div class="info-line"><b>Peso:</b> ${part.weight ?? "n/a"}</div>
  `;
});

// --------------------
// Calculation
// --------------------
function calcular() {
  const part = partsData.find(p => p.partNumber === partSelect.value);
  const userInput = Number(document.getElementById("userInput").value);

  if (
    !part ||
    part.piecesPerUnit == null ||
    part.weight == null ||
    part.weight === 0 ||
    isNaN(userInput)
  ) {
    M.toast({ html: "No se puede calcular (datos inválidos)" });
    return;
  }

  const result = (userInput * part.piecesPerUnit) / part.weight;
  resultContainer.textContent = "Resultado: " + result.toFixed(2);

  historyData.push({
    partNumber: part.partNumber,
    input: userInput,
    result: result.toFixed(2)
  });

  saveHistory();
  renderHistory();
}

// --------------------
// Render History
// --------------------
function renderHistory() {
  const container = document.getElementById("history");
  container.innerHTML = "";

  historyData.forEach(row => {
    const div = document.createElement("div");
    div.className = "card-panel grey lighten-4";
    div.innerHTML = `
      <div><strong>Parte:</strong> ${row.partNumber}</div>
      <div><strong>Input:</strong> ${row.input}</div>
      <div><strong>Resultado:</strong> ${row.result}</div>
    `;
    container.appendChild(div);
  });
}

// --------------------
// Clear History
// --------------------
function clearHistory() {
  if (!confirm("¿Seguro que deseas borrar todo el historial?")) return;

  historyData.length = 0;
  localStorage.removeItem(STORAGE_KEY);

  document.getElementById("history").innerHTML = "";
  document.getElementById("resultado").textContent = "";

  M.toast({ html: "Historial borrado correctamente" });
}

// --------------------
// Download CSV
// --------------------
function downloadHistory() {
  if (historyData.length === 0) {
    M.toast({ html: "No hay datos para descargar" });
    return;
  }

  let csv = "Parte,Input,Resultado\n";

  historyData.forEach(row => {
    csv += `${row.partNumber},${row.input},${row.result}\n`;
  });

  const now = new Date();
  const timestamp =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0") + "_" +
    String(now.getHours()).padStart(2, "0") + "-" +
    String(now.getMinutes()).padStart(2, "0") + "-" +
    String(now.getSeconds()).padStart(2, "0");

  const filename = `regla_de_tres_${timestamp}.csv`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}