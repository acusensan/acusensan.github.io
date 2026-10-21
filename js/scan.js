"use strict";

/*=== MATERIALIZE INITIALIZATION ===*/
document.addEventListener("DOMContentLoaded", () => {
  if (window.M) M.AutoInit();

  if (document.getElementById("partSearchInput")) {
    initPartSearch();
  }

  loadState();
  renderScanLog();
  renderTotals();
  updateTotalsHeaderIcons();

  focusPartInput(100);
  setScanStatus("ready", "Listo para escanear");

  initGlobalEvents(); // NEW
});


/*=== CONSTANTS / CONFIG ===*/
const STORAGE_KEY = "scan_state_v1";
const AUTO_EXPORT_EVERY = 20;
const LOCATIONS = ["pcgrears", "pcgbt1cc", "pcg31xx", "pcgsavan"];
const PARTS = Object.keys(partsDB || {});

/*=== GLOBAL STATE ===*/
const scanLogData = [];
const totalsMap = {};
const csvTotalsMap = {};


let scanCount = 0;
let waitingForQty = false;
let focusTimer = null;
let lastDeletedScan = null;
let undoTimer = null;
let partSearchClearTimer = null;
let isSearchPaused = false;
let lastTransferredBatch = [];

let totalsSort = {
  column: "color",   // default column
  direction: "asc"  // or "desc"
};


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

  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const [location, part, qty] = lines[i].split(",");

    if (!location || !part || !qty) continue;

    const loc = location.trim().toLowerCase();
    const p = part.trim();

    if (LOCATIONS.includes(loc) && PARTS.includes(p)) {
      const num = Number(qty);
      if (!isNaN(num)) {
        csvTotalsMap[p] += num;
      }
    }
  }

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

  /*===if (!partsDB[part]) {
    M.toast({
      html: `${part} no está en la base de datos`,
      classes: "orange darken-2",
      displayLength: 2500
    });
  }===*/

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
  const qty = Number(qtyInput.value.trim());

  if (isNaN(qty) || qty <= 0) {
    M.toast({ html: "Cantidad inválida", classes: "red darken-2" });
    return;
  }

  recordScan(part, qty);

  M.toast({
    html: `${part} +${qty} (HILO)`,
    classes: "blue darken-2"
  });

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
  // CASE 2: Manual quantity (FIXED)
else {

  // BLANK → default to 1
  if (!inputValue) {
    finalQty = 1;
  } else {
    const normalized = inputValue.replace(/,/g, "");

    const match = normalized.match(/[\d.]+/);
	const qty = match ? Number(match[0]) : NaN;

    if (isNaN(qty) || qty <= 0) {
      M.toast({ html: "Cantidad inválida", classes: "orange darken-2" });
      return;
    }

    finalQty = qty;
  }

  recordScan(part, finalQty);

    //  Different toast for unknown parts
    M.toast({
      html: isKnownPart
        ? ` ${part} +${finalQty} agregado`
        : `${part} +${finalQty} (NO está en Base de datos)`,
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

  const entry = {
    part,
    qty,
    time: new Date().toLocaleTimeString(),
    shift: getCurrentShift()
  };

  scanLogData.push(entry);

  totalsMap[part] = (totalsMap[part] || 0) + qty;

  renderScanLog(); 
  renderTotals();

  saveState();

  /*===if (scanCount % AUTO_EXPORT_EVERY === 0) {
    autoExportScanLog();
  }===*/
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
        <tr class="${e.justRestored ? "restored" : ""}">
          <td>${activeIndex++}</td>
          <td>
  <input 
    type="text"
    value="${e.part}"
    style="width:200px; text-align:center;"
    onclick="this.select()"
    onkeydown="handlePartEdit(event, ${i})"
    onchange="updatePartEdit(${i}, this.value)"
  >
</td>
          <td><input type="number" min="1" value="${e.qty}" style="width:70px; text-align:center;" onclick="this.select()" onkeydown="handleQtyEdit(event, ${i})" onchange="updateQtyEdit(${i}, this.value)"></td>
          <td>${e.transferTime || e.time}</td>
          <td>
            <button class="btn red" onclick="deleteScan(${i})">Borrar</button>
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
          <td style="color: green; font-weight: 600;">${e.time}</td>
          <td style="color: red; font-weight: 600;">${e.transferTime || "-"}</td>
        </tr>
        `
      );
    }
  }
}

function renderTotals() {
  const fragment = document.createDocumentFragment();

  let rows = [];

  // Build rows array FIRST
  for (const part in totalsMap) {
    const scanned = totalsMap[part] || 0;
    const daily = partsDB[part]?.daily || 0;
    const prod = csvTotalsMap[part] || 0;

    rows.push({
      part,
      scanned,
      daily,
      prod,
      exceeded: scanned + prod > daily
    });
  }

  // SORTING 
  rows.sort((a, b) => {
    if (totalsSort.column === "color") {
      return totalsSort.direction === "asc"
        ? (b.exceeded - a.exceeded)
        : (a.exceeded - b.exceeded);
    }

    let valA = a[totalsSort.column];
    let valB = b[totalsSort.column];

    if (typeof valA === "string") {
      valA = valA.toUpperCase();
      valB = valB.toUpperCase();
    }

    if (valA < valB) return totalsSort.direction === "asc" ? -1 : 1;
    if (valA > valB) return totalsSort.direction === "asc" ? 1 : -1;
    return 0;
  });

  // BUILD TABLE
  let i = 1;

  rows.forEach(row => {
    const tr = document.createElement("tr");

    if (row.exceeded) tr.classList.add("exceeded");

    tr.innerHTML = `
      <td>${i++}</td>
      <td><button type="button" class="part-number-button" data-part="${escapeHtml(row.part)}" onclick="openPartDetails(this.dataset.part)" aria-label="Ver detalles de ${escapeHtml(row.part)}">${escapeHtml(row.part)}</button></td>
      <td>${row.scanned}</td>
      <td>${row.daily}</td>
      <td>${row.prod}</td>
    `;

    fragment.appendChild(tr);
  });

  scanTotalsBody.innerHTML = "";
  scanTotalsBody.appendChild(fragment);
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

  // Download notification
  M.toast({
    html: `Descargado: ${filename}`,
    classes: "green darken-2",
    displayLength: 3000
  });
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

  const date =
    d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");

  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  })
  .replace(" ", "");

  return `${date}_${time}`;
}

function getCurrentShift(date = new Date()) {
  const h = date.getHours();
  const m = date.getMinutes();
  const minutes = h * 60 + m;

  const SHIFT1_START = 6 * 60;        // 06:00
  const SHIFT1_END   = 15 * 60 + 30;  // 15:30
  const SHIFT2_START = 15 * 60 + 35;  // 15:35
  const SHIFT2_END   = 25 * 60;       // 01:00 next day 

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
  // Optional confirmation 
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
  M.Modal.getInstance(document.getElementById('settings-modal')).close();
}

function sendScanLogToBottom() {
  const pending = scanLogData.filter(e => !e.transferred);

  if (!pending.length) {
    M.toast({
      html: "No hay escaneos para transferir",
      classes: "blue grey darken-1"
    });
    return;
  }

  //  SAVE batch for undo
  lastTransferredBatch = [...pending];

  //  MOVE them
  pending.forEach(e => {
    e.transferred = true;
    e.transferTime = new Date().toLocaleTimeString();
  });


  renderScanLog();
  saveState();
  
  const modalElem = document.querySelector('.modal.open');
  const instance = M.Modal.getInstance(modalElem);
  instance.close();

  //  TOAST WITH UNDO BUTTON
  M.toast({
    html: `
      ${pending.length} transferidos
      <button class="btn-flat white-text" onclick="undoTransfer()">
        Deshacer
      </button>
    `,
    classes: "green darken-2",
    displayLength: 10000
  });
}
function undoTransfer() {
  if (!lastTransferredBatch.length) return;

  lastTransferredBatch.forEach(e => {
    e.transferred = false;
    e.justRestored = true; // highlight
  });

  renderScanLog();
  saveState();

  M.toast({
    html: "Transferencia deshecha",
    classes: "orange darken-2"
  });

  //  clear batch
  lastTransferredBatch = [];

  //  remove highlight after 2s
  setTimeout(() => {
    scanLogData.forEach(e => delete e.justRestored);
    renderScanLog();
  }, 2000);
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

/*=== Summary ===*/
function renderScanSummary() {
  const body = document.getElementById("scanSummaryBody");
  body.innerHTML = "";

  const totals = {};

  //  Build totals per part (ONLY active scans)
  scanLogData.forEach(e => {
    if (e.transferred) return;

    totals[e.part] = (totals[e.part] || 0) + e.qty;
  });

  let index = 1;

  //  Render rows (one per part)
  Object.keys(totals).forEach(part => {
    const total = totals[part];

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
  const text = `${part}\t${total}`; 

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
  const statusChip = document.getElementById("searchStatus");
  const pauseBtn = document.getElementById("toggleSearchPause");
  const input = document.getElementById("partSearchInput");
  const results = document.getElementById("partSearchResults");

  // MATERIAL STYLE BUTTON
  pauseBtn.style.borderRadius = "999px";
  pauseBtn.style.color = "#fff";
  pauseBtn.style.border = "none";
  pauseBtn.style.fontWeight = "500";
  pauseBtn.style.boxShadow = "0 2px 6px rgba(0,0,0,.25)";

  // INITIAL STATE
  if (isSearchPaused) {
    statusChip.textContent = "Auto-Limpiar Pausado";
    statusChip.style.backgroundColor = "#F44336";
    statusChip.style.color = "#fff";

    pauseBtn.textContent = "Reanudar Auto-Limpiar";
    pauseBtn.style.backgroundColor = "#4CAF50";
  } else {
    statusChip.textContent = "Auto-Limpiar Activo";
    statusChip.style.backgroundColor = "#4CAF50";
    statusChip.style.color = "#fff";

    pauseBtn.textContent = "Pausar Auto-Limpiar";
    pauseBtn.style.backgroundColor = "#607D8B";
  }

  // BUTTON TOGGLE
  pauseBtn.onclick = () => {
    isSearchPaused = !isSearchPaused;

    if (isSearchPaused) {
      pauseBtn.textContent = "Reanudar Auto-Limpiar";
      pauseBtn.style.backgroundColor = "#4CAF50";

      statusChip.textContent = "Auto-Limpiar Pausado";
      statusChip.style.backgroundColor = "#F44336";
      statusChip.style.color = "#fff";
    } else {
      pauseBtn.textContent = "Pausar Auto-Limpiar";
      pauseBtn.style.backgroundColor = "#607D8B";

      statusChip.textContent = "Auto-Limpiar Activo";
      statusChip.style.backgroundColor = "#4CAF50";
      statusChip.style.color = "#fff";
    }

    // CANCEL TIMER IF PAUSED
    if (isSearchPaused && partSearchClearTimer) {
      clearTimeout(partSearchClearTimer);
      partSearchClearTimer = null;
    }
  };

  input.value = "";
  results.innerHTML = "";
  input.focus();

  // INPUT HANDLER
  let searchTimer;

  input.oninput = () => {
    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {
      const term = input.value.trim().toUpperCase();
      renderPartSearchResults(term);
    }, 200);

    if (partSearchClearTimer) {
      clearTimeout(partSearchClearTimer);
    }

    if (!isSearchPaused) {
      partSearchClearTimer = setTimeout(() => {
        input.classList.add("slide-up");
        results.classList.add("slide-up");

        setTimeout(() => {
          input.value = "";
          results.innerHTML = "";
          input.classList.remove("slide-up");
          results.classList.remove("slide-up");
        }, 450);

      }, 10000);
    }
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
        <!-- DATA ROW -->
        <tr>
          <td>
            <span class="chip ${type === "PARTE" ? "green" : "blue"} white-text">
              ${type}
            </span>
          </td>
          <td><strong>${key}</strong></td>
          <td>${location}</td>
          <td>${pack}</td>
          <td></td>
        </tr>


        <!-- BUTTON ROW -->
        <tr class="grey lighten-4">
          <td colspan="6" class="center-align">
            <button class="btn tiny orange" onclick="copyText('${location}')">Loc</button>
            <button class="btn tiny blue" onclick="copyText('${key}')">Parte</button>
            <button class="btn tiny green" onclick="copyText('${pack}')">Qty</button>
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

let modalSelectedPart = null;

function addPartFromSearch(part) {
  if (!partsDB[part]) {
    M.toast({
      html: `Parte no válida: ${part}`,
      classes: "red darken-2"
    });
    return;
  }

  const pack = partsDB[part].pack;

  modalSelectedPart = part;

  document.getElementById("modalPartTitle").textContent = part;
  document.getElementById("modalPackInfo").textContent =
    `Standard Pack: ${pack}`;

  const input = document.getElementById("modalQtyInput");
  input.value = 1;

  updateModalTotal();

  const modal = M.Modal.getInstance(document.getElementById("addPartModal"));
  modal.open();

  // Focus input
  setTimeout(() => {
    input.focus();
    input.select();
  }, 200);
}

/* === +/- BUTTONS === */
function changeModalQty(change) {
  const input = document.getElementById("modalQtyInput");

  let value = Number(input.value) || 1;
  value += change;

  if (value < 1) value = 1;

  input.value = value;

  updateModalTotal();
}

/* === LIVE TOTAL === */
function updateModalTotal() {
  if (!modalSelectedPart) return;

  const pack = partsDB[modalSelectedPart].pack;
  const qty = Number(document.getElementById("modalQtyInput").value) || 1;

  const total = pack * qty;

  document.getElementById("modalTotal").textContent =
    `Total: ${total}`;
}

/* === CONFIRM === */
function confirmAddFromModal() {
  if (!modalSelectedPart) return;

  const pack = partsDB[modalSelectedPart].pack;

  if (!pack || pack <= 0) {
    M.toast({
      html: "Pack inválido",
      classes: "red darken-2"
    });
    return;
  }

  const qty = Number(document.getElementById("modalQtyInput").value) || 1;
  const totalQty = pack * qty;

  recordScan(modalSelectedPart, totalQty);

  M.toast({
    html: `${modalSelectedPart} +${totalQty} (${qty} packs)`,
    classes: "green darken-2"
  });

  M.Modal.getInstance(document.getElementById("addPartModal")).close();

  modalSelectedPart = null;

  setScanStatus("ready", "Listo para escanear");
  focusPartInput(100);
}

/* === INPUT EVENTS (TYPE + ENTER) === */
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("modalQtyInput");

  if (!input) return;

  input.addEventListener("input", updateModalTotal);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      confirmAddFromModal();
    }
  });
});

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

function handleQtyEdit(event, index) {
  if (event.key === "Enter") {
    event.preventDefault();
    updateQtyEdit(index, event.target.value);
    event.target.blur(); // remove focus
  }
}
function handlePartEdit(event, index) {
  if (event.key === "Enter") {
    event.preventDefault();
    updatePartEdit(index, event.target.value);
    event.target.blur();
  }
}

function updateQtyEdit(index, value) {
  const entry = scanLogData[index];
  if (!entry) return;

  const newQty = Number(value);

  if (isNaN(newQty) || newQty <= 0) {
    M.toast({
      html: "Cantidad inválida",
      classes: "red darken-2"
    });
    return;
  }

  // remove old qty
  totalsMap[entry.part] -= entry.qty;

  // update
  entry.qty = newQty;

  // add new qty
  totalsMap[entry.part] = (totalsMap[entry.part] || 0) + newQty;

  renderScanLog();
  renderTotals();
  saveState();
}
function updatePartEdit(index, value) {
  const entry = scanLogData[index];
  if (!entry) return;

  const newPart = value.trim().toUpperCase();

  if (!newPart) {
    M.toast({
      html: "Parte inválida",
      classes: "red darken-2"
    });
    return;
  }

  const oldPart = entry.part;

  // remove old qty from old part
  totalsMap[oldPart] -= entry.qty;
  if (totalsMap[oldPart] <= 0) delete totalsMap[oldPart];

  // update part
  entry.part = newPart;

  // add qty to new part
  totalsMap[newPart] = (totalsMap[newPart] || 0) + entry.qty;

  renderScanLog();
  renderTotals();
  saveState();

  M.toast({
    html: `Parte actualizada: ${newPart}`,
    classes: "blue darken-2"
  });
}
function openTransferredModal() {
  const modal = M.Modal.getInstance(
    document.getElementById("transferredModal")
  );

  renderScanLog();
  modal.open();
}
function sortTotals(column) {
  if (totalsSort.column === column) {
    totalsSort.direction =
      totalsSort.direction === "asc" ? "desc" : "asc";
  } else {
    totalsSort.column = column;
    totalsSort.direction = "asc";
  }

  updateTotalsHeaderIcons(); 
  renderTotals();
}
function getSortIcon(column) {
  if (totalsSort.column !== column) return "";
  return totalsSort.direction === "asc" ? " ▲" : " ▼";
}
function updateTotalsHeaderIcons() {
  const headers = {
    part: document.querySelector('th[onclick="sortTotals(\'part\')"]'),
    scanned: document.querySelector('th[onclick="sortTotals(\'scanned\')"]'),
    daily: document.querySelector('th[onclick="sortTotals(\'daily\')"]'),
    prod: document.querySelector('th[onclick="sortTotals(\'prod\')"]')
  };

  Object.keys(headers).forEach(key => {
    const th = headers[key];
    if (!th) return;

    let label = th.textContent.replace(/ ▲| ▼/g, "");

    if (totalsSort.column === key) {
      label += totalsSort.direction === "asc" ? " ▲" : " ▼";
    }

    th.innerHTML = label;
  });
}
function initGlobalEvents() {
  window.addEventListener("beforeunload", () => {
    if (focusTimer) clearTimeout(focusTimer);
    if (partSearchClearTimer) clearTimeout(partSearchClearTimer);
    saveState();
  });
}


/* =========================
   COMPARATIVO PART DETAILS
   Shows every field available in partsDB.js for the selected part.
========================= */
let selectedDetailsPart = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatPartFieldLabel(key) {
  const labels = {
    location: "Ubicacion",
    pack: "Standard pack",
    daily: "Demanda diaria",
    type: "Tipo",
    description: "Descripcion",
    supplier: "Proveedor",
    family: "Familia",
    area: "Area",
    line: "Linea",
    station: "Estacion",
    unit: "Unidad",
    uom: "Unidad de medida"
  };
  return labels[key] || String(key)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function formatPartFieldValue(value) {
  if (value === null || value === undefined || value === "") return "Sin dato";
  if (typeof value === "boolean") return value ? "Si" : "No";
  if (typeof value === "object") {
    try { return JSON.stringify(value, null, 2); }
    catch { return String(value); }
  }
  return String(value);
}

function createPartMetric(label, value, danger = false) {
  const card = document.createElement("div");
  card.className = `part-metric${danger ? " danger" : ""}`;
  const labelEl = document.createElement("span");
  labelEl.textContent = label;
  const valueEl = document.createElement("strong");
  valueEl.textContent = value;
  valueEl.title = String(value);
  card.append(labelEl, valueEl);
  return card;
}

function openPartDetails(part) {
  const data = partsDB?.[part];
  if (!data) {
    M.toast({ html: `No se encontro informacion para ${escapeHtml(part)}`, classes: "orange darken-2" });
    return;
  }

  selectedDetailsPart = part;
  const scanned = Number(totalsMap[part] || 0);
  const daily = Number(data.daily || 0);
  const prod = Number(csvTotalsMap[part] || 0);
  const combined = scanned + prod;
  const packSize = Number(data.pack || 0);
  const scannedPacks = packSize > 0 ? Math.floor(scanned / packSize) : 0;
  const looseScanned = packSize > 0 ? scanned % packSize : scanned;
  const packSummary = packSize > 0
    ? `${scannedPacks}${looseScanned ? ` + ${looseScanned} pcs` : ""}`
    : "Sin pack";
  const remaining = Math.max(daily - combined, 0);
  const exceeded = daily > 0 && combined > daily;

  document.getElementById("partDetailsTitle").textContent = part;
  document.getElementById("partDetailsSubtitle").textContent =
    data.description || data.descripcion || "Informacion completa del catalogo de partes";

  const metrics = document.getElementById("partDetailsMetrics");
  metrics.replaceChildren(
    createPartMetric("Escaneado", scanned),
    createPartMetric("Packs escaneados", packSummary),
    createPartMetric("Produccion", prod),
    createPartMetric("Daily", daily || "Sin dato"),
    createPartMetric(exceeded ? "Excedente" : "Restante", exceeded ? combined - daily : remaining, exceeded)
  );

  const entries = Object.entries(data);
  const preferredOrder = ["description", "descripcion", "location", "pack", "daily", "supplier", "proveedor"];
  entries.sort(([a], [b]) => {
    const ai = preferredOrder.indexOf(a);
    const bi = preferredOrder.indexOf(b);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    return a.localeCompare(b, "es");
  });

  const grid = document.getElementById("partDetailsGrid");
  grid.replaceChildren();
  entries.forEach(([key, value]) => {
    const field = document.createElement("div");
    const formatted = formatPartFieldValue(value);
    const isWide = typeof value === "object" || formatted.length > 70;
    field.className = `part-detail-field${isWide ? " wide" : ""}`;

    const label = document.createElement("span");
    label.className = "part-detail-label";
    label.textContent = formatPartFieldLabel(key);

    const valueEl = document.createElement("span");
    valueEl.className = `part-detail-value${formatted === "Sin dato" ? " empty" : ""}`;
    valueEl.textContent = formatted;
    field.append(label, valueEl);
    grid.appendChild(field);
  });

  document.getElementById("partDetailsFieldCount").textContent =
    `${entries.length} ${entries.length === 1 ? "campo" : "campos"}`;

  const addBtn = document.getElementById("addPartDetailsBtn");
  addBtn.disabled = !(Number(data.pack) > 0);
  addBtn.title = addBtn.disabled ? "Esta parte no tiene un pack valido" : "Agregar usando el standard pack";

  const modalEl = document.getElementById("part-details-modal");
  let modal = M.Modal.getInstance(modalEl);
  if (!modal) modal = M.Modal.init(modalEl, { dismissible: true, opacity: 0.45 });
  modal.open();
}

function copySelectedPartDetails() {
  if (!selectedDetailsPart || !partsDB[selectedDetailsPart]) return;
  const data = partsDB[selectedDetailsPart];
  const lines = [`Numero de parte\t${selectedDetailsPart}`];
  Object.entries(data).forEach(([key, value]) => {
    lines.push(`${formatPartFieldLabel(key)}\t${formatPartFieldValue(value).replace(/\n/g, " ")}`);
  });
  const scanned = Number(totalsMap[selectedDetailsPart] || 0);
  const packSize = Number(data.pack || 0);
  const packs = packSize > 0 ? Math.floor(scanned / packSize) : 0;
  const loose = packSize > 0 ? scanned % packSize : scanned;
  lines.push(`Escaneado\t${scanned}`);
  lines.push(`Packs escaneados\t${packSize > 0 ? `${packs}${loose ? ` + ${loose} pcs` : ""}` : "Sin pack"}`);
  lines.push(`Produccion\t${csvTotalsMap[selectedDetailsPart] || 0}`);

  navigator.clipboard.writeText(lines.join("\n")).then(() => {
    M.toast({ html: `Informacion de ${escapeHtml(selectedDetailsPart)} copiada`, classes: "green darken-2" });
  }).catch(() => {
    M.toast({ html: "No fue posible copiar la informacion", classes: "red darken-2" });
  });
}

function addSelectedPartFromDetails() {
  if (!selectedDetailsPart) return;
  const modalEl = document.getElementById("part-details-modal");
  const modal = M.Modal.getInstance(modalEl);
  if (modal) modal.close();
  addPartFromSearch(selectedDetailsPart);
}

document.addEventListener("DOMContentLoaded", () => {
  const modalEl = document.getElementById("part-details-modal");
  if (modalEl && window.M) M.Modal.init(modalEl, { dismissible: true, opacity: 0.45 });
  document.getElementById("copyPartDetailsBtn")?.addEventListener("click", copySelectedPartDetails);
  document.getElementById("addPartDetailsBtn")?.addEventListener("click", addSelectedPartFromDetails);
});
