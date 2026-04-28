"use strict";

/*=== MATERIALIZE INITIALIZATION ===*/
document.addEventListener("DOMContentLoaded", () => {
  if (window.M) M.AutoInit();
});

/*=== CONSTANTS / CONFIG ===*/
const STORAGE_KEY = "scan_state_v1";
const AUTO_EXPORT_EVERY = 20;
const LOCATIONS = ["pcgrears", "pcgbt1cc", "pcg31xx", "pcgsavan"];
const PARTS = Object.keys(partsDB);

/*=== GLOBAL STATE ===*/
const scanLogData = [];
const totalsMap = {};
const csvTotalsMap = {};


let scanCount = 0;
let waitingForQty = false;
let focusTimer = null;
let lastDeletedScan = null;
let undoTimer = null;

/*=== DOM ELEMENTS ===*/
const partInput = document.getElementById("scanPart");
const qtyInput = document.getElementById("scanQty");
const scanLogBody = document.getElementById("scanLog");
const scanTotalsBody = document.getElementById("scanTotals");
const scanStatusEl = document.getElementById("scanStatus");
const csvFileInput = document.getElementById("csvFile");

/*=== SCAN STATUS UI ===*/
function setScanStatus(state, text) {
  scanStatusEl.classList.remove("ready", "waiting", "lost");
  scanStatusEl.classList.add(state);
  scanStatusEl.querySelector(".text").textContent = text;
}

/*=== CSV LOADING ===*/
csvFileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => processCSV(reader.result);
  reader.readAsText(file);
});

function processCSV(text) {
  PARTS.forEach(p => (csvTotalsMap[p] = 0));

  text.split(/\r?\n/).forEach(line => {
    const [location, part, qty] = line.split(",");
    if (
      LOCATIONS.includes(location?.trim().toLowerCase()) &&
      PARTS.includes(part?.trim()) &&
      !isNaN(qty)
    ) {
      csvTotalsMap[part.trim()] += Number(qty);
    }
  });

  renderTotals();
  saveState();
}

/*=== LOCAL STORAGE ===*/
function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ scanLogData, totalsMap, csvTotalsMap, scanCount })
  );
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const state = JSON.parse(raw);
    scanLogData.push(...(state.scanLogData || []));
    Object.assign(totalsMap, state.totalsMap || {});
    Object.assign(csvTotalsMap, state.csvTotalsMap || {});
    scanCount = state.scanCount || 0;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/*=== SCANNING LOGIC ===*/
partInput.addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  e.preventDefault();

  const part = partInput.value.trim().toUpperCase();
  if (!part) {
    M.toast({ html: "Número de parte vacío", classes: "red darken-2" });
    return;
  }

  if (!partsDB[part]) {
    M.toast({
      html: `${part} no está en la base de datos`,
      classes: "orange darken-2",
      displayLength: 2500
    });
  }

  waitingForQty = true;
  qtyInput.focus();
  qtyInput.select();
  setScanStatus("waiting", "Ingrese cantidad");
});

qtyInput.addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  e.preventDefault();

  const part = partInput.value.trim().toUpperCase();
  if (!part) {
    M.toast({ html: "Número de parte vacío", classes: "red darken-2" });
    return;
  }

  const isKnownPart = !!partsDB[part];
  const isHilo = !!hilosDB[part];
  //HILO SCAN (always quantity = 1)
if (isHilo) {
  recordScan(part, 1);

  M.toast({
    html: `🧵 ${part} +1 (HILO)`,
    classes: "blue darken-2"
  });

  // Reset inputs
  partInput.value = "";
  qtyInput.value = "";
  waitingForQty = false;
  setScanStatus("ready", "Listo para escanear");
  focusPartInput(50);
  return;
}

  const inputValue = qtyInput.value.trim().toUpperCase();
  let finalQty = 0;

  // CASE 1: Pack scan (ONLY if part is known)
  if (isKnownPart && partsDB[inputValue]) {
    const packQty = partsDB[inputValue].pack;
    if (!packQty || packQty <= 0) {
      M.toast({ html: "Pack estándar no definido", classes: "orange darken-2" });
      return;
    }

    finalQty = packQty;
    recordScan(part, finalQty);

    M.toast({
      html: ` ${part} +${finalQty} (Pack automático)`,
      classes: "green darken-2"
    });
  }
  // CASE 2: Manual quantity (known OR unknown part)
  else {
    const qty = Number(inputValue);
    if (isNaN(qty) || qty <= 0) {
      M.toast({ html: "Cantidad inválida", classes: "orange darken-2" });
      return;
    }

    finalQty = qty;
    recordScan(part, finalQty);

    //  Different toast for unknown parts
    M.toast({
      html: isKnownPart
        ? ` ${part} +${finalQty} agregado`
        : `⚠️ ${part} +${finalQty} (NO está en DB)`,
      classes: isKnownPart ? "green darken-2" : "orange darken-2",
      displayLength: 3000
    });
  }

  // Reset for next scan
  partInput.value = "";
  qtyInput.value = "";
  waitingForQty = false;
  setScanStatus("ready", "Listo para escanear");
  focusPartInput(50);
});

/*=== SCAN RECORDING ===*/
function recordScan(part, qty) {
  scanCount++;

  const shift = getCurrentShift();

  scanLogData.push({
    part,
    qty,
    time: new Date().toLocaleTimeString(),
    shift
  });

  totalsMap[part] = (totalsMap[part] || 0) + qty;

  renderScanLog();
  renderTotals();
  saveState();

  if (scanCount % AUTO_EXPORT_EVERY === 0) autoExportScanLog();
}


/*=== RENDERING ===*/
function renderScanLog() {
  scanLogBody.innerHTML = "";
  const transferredBody = document.getElementById("scanTransferred");

  if (transferredBody) {
    transferredBody.innerHTML = "";
  }

  let activeIndex = 1;
  let transferredIndex = 1;

  // NEWEST → OLDEST
  for (let i = scanLogData.length - 1; i >= 0; i--) {
    const e = scanLogData[i];

    // ACTIVE (top list)
    if (!e.transferred) {
      scanLogBody.insertAdjacentHTML(
        "beforeend",
        `
        <tr>
          <td>${activeIndex++}</td>
          <td>${e.part}</td>
          <td>${e.qty}</td>
          <td>${e.time}</td>
          <td>
            <button class="btn red" onclick="deleteScan(${i})">
              Borrar
            </button>
          </td>
        </tr>
        `
      );
    }
    // TRANSFERRED (bottom list)
    else if (transferredBody) {
      transferredBody.insertAdjacentHTML(
        "beforeend",
        `
        <tr class="transferred">
          <td>${transferredIndex++}</td>
          <td>${e.part}</td>
          <td>${e.qty}</td>
          <td>${e.time}</td>
        </tr>
        `
      );
    }
  }
}

function renderTotals() {
  scanTotalsBody.innerHTML = "";
  let i = 1;

  Object.keys(totalsMap).forEach(part => {
    const scanned = totalsMap[part] || 0;
    const daily = partsDB[part]?.daily || 0;
    const csv = csvTotalsMap[part] || 0;
    const exceeded = scanned + csv > daily;

    scanTotalsBody.insertAdjacentHTML(
      "beforeend",
      `
      <tr class="${exceeded ? "exceeded" : ""}">
        <td>${i++}</td>
        <td>${part}</td>
        <td>${scanned}</td>
        <td>${daily}</td>
        <td>${csv}</td>
      </tr>
    `
    );
  });
}

/*=== DELETE / UNDO ===*/
function deleteScan(index) {
  const entry = scanLogData.splice(index, 1)[0];
  if (!entry) return;

  totalsMap[entry.part] -= entry.qty;
  if (totalsMap[entry.part] <= 0) delete totalsMap[entry.part];

  lastDeletedScan = entry;
  renderScanLog();
  renderTotals();
  saveState();
  focusPartInput(100);
}

/*=== EXPORTS ===*/
function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function exportScanLogCSV() {
  if (!scanLogData.length) return;

  const shift = getCurrentShift();

  downloadCSV(
    `scan_log_${shift}_${getTimestamp()}.csv`,
    [
      ["#", "Part", "Qty", "Time", "Shift"],
      ...scanLogData.map((e, i) => [
        i + 1,
        e.part,
        e.qty,
        e.time,
        e.shift
      ])
    ]
  );
}


function exportTotalsCSV() {
  const shift = getCurrentShift();
  const rows = [
    ["#", "Numero De Parte", "Total Escaneado", "Daily", "Produccion", "Shift"]
  ];

  let i = 1;
  Object.keys(totalsMap).forEach(p =>
    rows.push([
      i++,
      p,
      totalsMap[p],
      partsDB[p]?.daily || 0,
      csvTotalsMap[p] || 0,
      shift
    ])
  );

  if (rows.length > 1) {
    downloadCSV(`scan_totals_${shift}_${getTimestamp()}.csv`, rows);
  }
}

function autoExportScanLog() {
  exportScanLogCSV();
  M.toast({ html: `Auto-exportar despues de ${scanCount} escaneos`, classes: "green" });
}

/*=== UTILITIES ===*/
function getTimestamp() {
  const d = new Date();
  return d.toISOString().replace(/[:.]/g, "-");
}

function getCurrentShift(date = new Date()) {
  const h = date.getHours();
  const m = date.getMinutes();
  const minutes = h * 60 + m;

  const SHIFT1_START = 6 * 60;        // 06:00
  const SHIFT1_END   = 15 * 60 + 30;  // 15:30
  const SHIFT2_START = 15 * 60 + 35;  // 15:35
  const SHIFT2_END   = 25 * 60;       // 01:00 next day (treated as 25:00)

  // Normalize after midnight
  const normalizedMinutes = minutes < 60 ? minutes + 24 * 60 : minutes;

  if (minutes >= SHIFT1_START && minutes <= SHIFT1_END) {
    return "Shift_1";
  }
  if (normalizedMinutes >= SHIFT2_START && normalizedMinutes <= SHIFT2_END) {
    return "Shift_2";
  }
  return "Outside_Shift";
}

function focusPartInput(delay = 0) {
  setTimeout(() => {
    partInput.focus();
    partInput.select();
  }, delay);
}
function startAutoRefocus(delay = 5000) {
  // Clear any existing timer
  if (focusTimer) {
    clearTimeout(focusTimer);
    focusTimer = null;
  }

  focusTimer = setTimeout(() => {
    waitingForQty = false;
    setScanStatus("ready", "Listo para escanear");
    focusPartInput();
    focusTimer = null;
  }, delay);
}

function clearForNextShift() {
  // Optional confirmation (recommended)
  if (!confirm("¿Seguro que desea limpiar todo para el siguiente turno?")) {
    return;
  }

  // Clear in-memory data
  scanLogData.length = 0;

  Object.keys(totalsMap).forEach(k => delete totalsMap[k]);
  Object.keys(csvTotalsMap).forEach(k => delete csvTotalsMap[k]);

  scanCount = 0;
  waitingForQty = false;

  // Clear inputs
  partInput.value = "";
  qtyInput.value = "";

  // Clear local storage
  localStorage.removeItem(STORAGE_KEY);

  // Re-render UI
  renderScanLog();
  renderTotals();

  // Reset focus & status
  setScanStatus("ready", "Listo para escanear");
  focusPartInput(100);

  M.toast({
    html: "Turno reiniciado correctamente",
    classes: "green darken-2"
  });
}

function sendScanLogToBottom() {
  const pending = scanLogData.filter(e => !e.transferred);

  if (!pending.length) {
    M.toast({
      html: " No hay escaneos para transferir",
      classes: "blue grey darken-1"
    });
    return;
  }

  pending.forEach(e => {
    e.transferred = true;
  });

  renderScanLog();
  saveState();

  M.toast({
    html: "Escaneos enviados a partes transferidas",
    classes: "green darken-2"
  });
}

/*=== FOCUS & INIT ===*/

// Detect focus loss and auto-refocus after 2 seconds
document.addEventListener("click", () => {
  if (![partInput, qtyInput].includes(document.activeElement)) {
    setScanStatus("lost", "Enfoque perdido");
    startAutoRefocus(5000); 
  }
});

// Cancel auto-refocus if user focuses an input manually
[partInput, qtyInput].forEach(input => {
  input.addEventListener("focus", () => {
    if (focusTimer) {
      clearTimeout(focusTimer);
      focusTimer = null;
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  renderScanLog();
  renderTotals();
  focusPartInput(100);
  setScanStatus("ready", "Listo para escanear");
});

window.addEventListener("beforeunload", saveState);

/*=== Summar ===*/
function renderScanSummary() {
  const body = document.getElementById("scanSummaryBody");
  body.innerHTML = "";

  const activeTotals = getActiveScanTotals();
  let index = 1;

  Object.keys(activeTotals).forEach(part => {
    const total = activeTotals[part];

    body.insertAdjacentHTML(
      "beforeend",
      `
      <tr>
        <td>${index++}</td>
        <td>${part}</td>
        <td>${total}</td>
        <td>
          <button class="btn small green" onclick="copyScanItem('${part}', ${total})">
            Copiar
          </button>
        </td>
      </tr>
      `
    );
  });
}
function copyScanItem(part, total) {
  const text = `${part}\t${total}`; // 👈 TAB between columns

  navigator.clipboard.writeText(text).then(() => {
    M.toast({
      html: `Copiado a Excel: ${part} | ${total}`,
      classes: "green darken-2"
    });
  }).catch(() => {
    M.toast({
      html: "Error al copiar",
      classes: "red darken-2"
    });
  });
}

function copyAllScanTotals() {
  const activeTotals = getActiveScanTotals();
  const lines = [];

  Object.keys(activeTotals).forEach(part => {
    lines.push(`${part}\t${activeTotals[part]}`);
  });

  if (!lines.length) {
    M.toast({
      html: " No hay registros activos para copiar",
      classes: "blue grey darken-1"
    });
    return;
  }

  navigator.clipboard.writeText(lines.join("\n")).then(() => {
    M.toast({
      html: `${lines.length} filas copiadas (Excel)`,
      classes: "green darken-2"
    });
  });
}

function getActiveScanTotals() {
  const map = {};

  scanLogData.forEach(e => {
    if (!e.transferred) {
      map[e.part] = (map[e.part] || 0) + e.qty;
    }
  });

  return map;
}
/* =========================
   PART SEARCH MODAL (DB QTY)
========================= */

function initPartSearch() {
  const input = document.getElementById("partSearchInput");
  const results = document.getElementById("partSearchResults");

  input.value = "";
  results.innerHTML = "";
  input.focus();

  input.oninput = () => {
    const term = input.value.trim().toUpperCase();
    renderPartSearchResults(term);
  };
}

function renderPartSearchResults(term) {
  const results = document.getElementById("partSearchResults");
  results.innerHTML = "";
  if (!term) return;

  let index = 1;

  // Combine PARTS + HILOS into one list
  const combined = [
    ...Object.entries(partsDB).map(([key, value]) => ({
      key,
      data: value,
      type: "PARTE"
    })),
    ...Object.entries(hilosDB).map(([key, value]) => ({
      key,
      data: value,
      type: "HILO"
    }))
  ];

  combined
    .filter(item => item.key.includes(term))
    .slice(0, 50)
    .forEach(item => {
      const { key, data, type } = item;

      const location = data.location || "-";
      const pack = type === "PARTE" ? data.pack || 0 : "-";

      results.insertAdjacentHTML(
        "beforeend",
        `
        <tr>
          <td>${index++}</td>
          <td>
            <span class="chip ${type === "PARTE" ? "green" : "blue"} white-text">
              ${type}
            </span>
          </td>
          <td><strong>${key}</strong></td>
          <td>${location}</td>
          <td>${pack}</td>
          <td>
            <button class="btn tiny blue" onclick="copyText('${key}')">Parte</button>
            <button class="btn tiny orange" onclick="copyText('${location}')">Loc</button>
            ${
              type === "PARTE"
                ? `<button class="btn tiny purple" onclick="addPartFromSearch('${key}')">Agregar</button>`
                : ""
            }
          </td>
        </tr>
        `
      );
    });
}


/* =========================
   CLIPBOARD HELPER
========================= */

function copyText(text) {
  navigator.clipboard.writeText(String(text)).then(() => {
    M.toast({
      html: `Copiado: ${text}`,
      classes: "green darken-2"
    });
  }).catch(() => {
    M.toast({
      html: "Error al copiar",
      classes: "red darken-2"
    });
  });
}

/* =========================
   ADD FROM SEARCH MODAL
========================= */

function addPartFromSearch(part) {
  // Explicit validation
  if (!partsDB[part]) {
    M.toast({
      html: `Parte no válida: ${part}`,
      classes: "red darken-2"
    });
    return;
  }

  const qty = partsDB[part]?.pack;

  if (!qty || qty <= 0) {
    M.toast({
      html: `Pack inválido para ${part}`,
      classes: "red darken-2"
    });
    return;
  }

  // Record exactly like a valid scan
  recordScan(part, qty);

  M.toast({
    html: `Agregado: ${part} +${qty} (Pack)`,
    classes: "green darken-2"
  });

  // Close search modal
  const modalEl = document.getElementById("part-search-modal");
  const instance = M.Modal.getInstance(modalEl);
  if (instance) instance.close();

  // Restore scan-ready state
  waitingForQty = false;
  setScanStatus("ready", "Listo para escanear");
  focusPartInput(100);
}

/* =========================
   NAVIGATION PASSWORD LOCK
========================= */

const NAV_PASSWORD = "963"; 

document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const modalEl = document.getElementById("nav-password-modal");

  if (modalEl) M.Modal.init(modalEl);

  menuBtn.addEventListener("click", () => {
    const instance = M.Modal.getInstance(modalEl);
    instance.open();

    setTimeout(() => {
      document.getElementById("navPasswordInput").focus();
    }, 200);
  });
});

function checkNavPassword() {
  const input = document.getElementById("navPasswordInput");
  const value = input.value;

  if (value === NAV_PASSWORD) {
    input.value = "";
    M.Modal.getInstance(
      document.getElementById("nav-password-modal")
    ).close();

    // OPEN SIDENAV PROGRAMMATICALLY
    const sidenavEl = document.getElementById("slide-out");
    const instance = M.Sidenav.getInstance(sidenavEl);
    instance.open();

  } else {
    M.toast({
      html: "Contraseña incorrecta",
      classes: "red darken-2"
    });
    input.select();
  }
}