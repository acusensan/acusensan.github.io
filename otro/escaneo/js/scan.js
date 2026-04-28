 "use strict";

    /**************** MATERIALIZE INIT ****************/
    document.addEventListener("DOMContentLoaded", function () {
      if (window.M) {
        M.AutoInit();
      }
    });

    /**************** GLOBAL STATE ****************/
    const scanLogData = [];
    const LOCATIONS = ["pcgrears", "pcgbt1cc", "pcg31xx", "pcgsavan"];
    const PARTS = Object.keys(partsDB);
    const AUTO_EXPORT_EVERY = 10; // export every 10 scans

    let lastDeletedScan = null;
    let undoTimer = null;
    let scanCount = 0;
    const totalsMap = {};
    const csvTotalsMap = {};
    let waitingForQty = false;

    /**************** ELEMENTS ****************/
    const partInput = document.getElementById("scanPart");
    const qtyInput = document.getElementById("scanQty");
    const scanLogBody = document.getElementById("scanLog");
    const scanTotalsBody = document.getElementById("scanTotals");

    /**************** CSV LOAD ****************/
    document.getElementById("csvFile").addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => processCSV(reader.result);
      reader.readAsText(file);
    });

    function processCSV(text) {
      PARTS.forEach(p => csvTotalsMap[p] = 0);
      const lines = text.split(/\r?\n/);

      for (const line of lines) {
        const cols = line.split(",");
        if (cols.length < 3) continue;

        const location = cols[0].trim().toLowerCase();
        const part = cols[1].trim();
        const qty = parseFloat(cols[2]);

        if (
          LOCATIONS.includes(location) &&
          PARTS.includes(part) &&
          !isNaN(qty)
        ) {
          csvTotalsMap[part] += qty;
        }
      }
      renderTotals();
    }

    /**************** SCANNING ****************/
    partInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        const part = partInput.value.trim().toUpperCase();
        if (!part) return;

        if (!partsDB[part]) {
          M.toast({ html: "❌ Part not found in database", classes: "red darken-2" });
          partInput.value = "";
          return;
        }
        waitingForQty = true;
        qtyInput.focus();
        qtyInput.select();
      }
    });

    qtyInput.addEventListener("keydown", e => {
      if (e.key === "Enter" && waitingForQty) {
        const part = partInput.value.trim().toUpperCase();
        const qty = parseFloat(qtyInput.value || 1);

        if (isNaN(qty) || qty <= 0) {
          M.toast({ html: "⚠️ Invalid quantity", classes: "orange darken-2" });
          qtyInput.value = "";
          return;
        }
        recordScan(part, qty);
        partInput.value = "";
        qtyInput.value = "";
        waitingForQty = false;
        partInput.focus();
      }
    });

    function recordScan(part, qty) {
  scanCount++;
  const time = new Date().toLocaleTimeString();

  scanLogData.push({ part, qty, time });
  totalsMap[part] = (totalsMap[part] || 0) + qty;

  renderScanLog();
  renderTotals();

  // visual feedback
  partInput.style.background = "#c8ffc8";
  setTimeout(() => partInput.style.background = "", 150);

  // AUTO EXPORT EVERY N SCANS
  if (scanCount % AUTO_EXPORT_EVERY === 0) {
    autoExportScanLog();
  }
}

    /**************** RENDERERS ****************/
    function renderTotals() {
      scanTotalsBody.innerHTML = "";
      let i = 1;

      for (const part in totalsMap) {
        const scanned = totalsMap[part] || 0;
        const csvTotal = csvTotalsMap[part] || 0;
        const daily = partsDB[part]?.daily || 0;
        const exceeded = (scanned + csvTotal) > daily;

        scanTotalsBody.insertAdjacentHTML(
          "beforeend",
          `<tr class="${exceeded ? "exceeded" : ""}">
            <td>${i++}</td>
            <td>${part}</td>
            <td>${scanned}</td>
            <td>${daily}</td>
            <td>${csvTotal}</td>
          </tr>`
        );
      }
    }

    function renderScanLog() {
      scanLogBody.innerHTML = "";
      scanLogData.forEach((entry, index) => {
        scanLogBody.insertAdjacentHTML(
          "beforeend",
          `<tr>
            <td>${index + 1}</td>
            <td>${entry.part}</td>
            <td>${entry.qty}</td>
            <td>${entry.time}</td>
            <td>
              <button class="btn red" onclick="deleteScan(${index})">Borrar</button>
            </td>
          </tr>`
        );
      });
    }

    /**************** DELETE / UNDO ****************/
    function deleteScan(index) {
      const entry = scanLogData[index];
      if (!entry) return;

      lastDeletedScan = { ...entry, index };
      totalsMap[entry.part] -= entry.qty;
      if (totalsMap[entry.part] <= 0) delete totalsMap[entry.part];

      scanLogData.splice(index, 1);
      renderScanLog();
      renderTotals();
      showUndoButton();
    }

    function showUndoButton() {
      const container = document.getElementById("undoContainer");
      container.style.display = "block";
      if (undoTimer) clearTimeout(undoTimer);

      undoTimer = setTimeout(() => {
        lastDeletedScan = null;
        container.style.display = "none";
      }, 10000);
    }

    function undoDelete() {
      if (!lastDeletedScan) return;

      const { part, qty, time, index } = lastDeletedScan;
      scanLogData.splice(index, 0, { part, qty, time });
      totalsMap[part] = (totalsMap[part] || 0) + qty;

      lastDeletedScan = null;
      document.getElementById("undoContainer").style.display = "none";
      renderScanLog();
      renderTotals();
    }

    partInput.focus();

function downloadCSV(filename, rows) {
  const csvContent = rows.map(r =>
    r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ===== EXPORT SCAN LOG ===== */
function exportScanLogCSV() {
  if (!scanLogData.length) {
    M.toast({ html: "No scan data to export", classes: "orange" });
    return;
  }

  const rows = [
    ["#", "Part", "Quantity", "Time"],
    ...scanLogData.map((e, i) => [
      i + 1,
      e.part,
      e.qty,
      e.time
    ])
  ];

  downloadCSV("scan_log.csv", rows);
}

/* ===== EXPORT TOTALS ===== */
function exportScanLogCSV() {
  if (!scanLogData.length) {
    M.toast({ html: "No scan data to export", classes: "orange" });
    return;
  }

  const timestamp = getTimestamp();

  const rows = [
    ["#", "Part", "Quantity", "Time"],
    ...scanLogData.map((e, i) => [
      i + 1,
      e.part,
      e.qty,
      e.time
    ])
  ];

  downloadCSV(`scan_log_${timestamp}.csv`, rows);
}
function getTimestamp() {
  const d = new Date();

  const pad = n => String(n).padStart(2, "0");

  return (
    d.getFullYear() + "-" +
    pad(d.getMonth() + 1) + "-" +
    pad(d.getDate()) + "_" +
    pad(d.getHours()) + "-" +
    pad(d.getMinutes()) + "-" +
    pad(d.getSeconds())
  );
}
function autoExportScanLog() {
  const timestamp = getTimestamp();

  const rows = [
    ["#", "Part", "Quantity", "Time"],
    ...scanLogData.map((e, i) => [
      i + 1,
      e.part,
      e.qty,
      e.time
    ])
  ];

  downloadCSV(`scan_log_${timestamp}.csv`, rows);

  M.toast({
    html: `✅ Auto-exported after ${scanCount} scans`,
    classes: "green"
  });
}