window.checkedState = {};
// ===============================
// GLOBAL STATE
// ===============================
let groupedData = {};
let orderedLocations = [];
let currentIndex = 0;
let rowPendingDelete = null;
let modalSelectedPart = null;

const STORAGE_KEY = "verificar_data";

function saveData() {
  const data = {
    groupedData,
    orderedLocations,
    currentIndex,
    checkedState: window.checkedState
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return;

  try {
    const data = JSON.parse(saved);

    groupedData = data.groupedData || {};
    orderedLocations = data.orderedLocations || [];
    currentIndex = data.currentIndex || 0;
    window.checkedState = data.checkedState || {};

    if (orderedLocations.length > 0) {
      renderGroup(currentIndex);
    }

    M.toast({ html: "Data restored", classes: "green" });
  } catch (e) {
    console.error("Error loading data", e);
  }
}

// ===============================
// INIT
// ===============================
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(loadData, 100);
  const jumpSelect = document.getElementById('locationJump');
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');

if (backBtn) {
  backBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderGroup(currentIndex);
    }
  });
}

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    if (currentIndex < orderedLocations.length - 1) {
      currentIndex++;
      renderGroup(currentIndex);
    }
  });
}
if (jumpSelect) {
  jumpSelect.addEventListener('change', function () {
    const index = parseInt(this.value);
    if (!isNaN(index)) {
      currentIndex = index;
      renderGroup(currentIndex);
    }
  });
}
  M.Modal.init(document.querySelectorAll('.modal'));

  // ===============================
  // SEARCH LOGIC
  // ===============================
  const input = document.getElementById('partSearchInput');
  const results = document.getElementById('partSearchResults');

  const allParts = Object.keys(window.partsDB || {});

  input.addEventListener('input', () => {

    const q = input.value.toLowerCase().trim();
    results.innerHTML = '';

    if (!q) return;

    const matches = allParts.filter(p => p.toLowerCase().includes(q));

    matches.forEach(part => {
      const li = document.createElement('li');
      li.className = 'collection-item';
      li.textContent = part;

      li.onclick = () => openQtyModal(part);

      results.appendChild(li);
    });
  });

});

// ===============================
// OPEN QTY MODAL
// ===============================
function openQtyModal(part) {

  modalSelectedPart = part;

  document.getElementById('selected-part-label').textContent = `Part: ${part}`;
  document.getElementById('modalQty').value = '';

  const locSelect = document.getElementById('modalLoc');
  locSelect.innerHTML = '<option value="" disabled selected>Select Location</option>';

  // existing locations
  orderedLocations.forEach(loc => {
    const opt = document.createElement('option');
    opt.value = loc;
    opt.textContent = loc;
    locSelect.appendChild(opt);
  });

  M.FormSelect.init(locSelect);

  M.Modal.getInstance(document.getElementById('qty-modal')).open();
  M.Modal.getInstance(document.getElementById('part-search-modal')).close();
}

// ===============================
// CONFIRM ADD
// ===============================
document.getElementById('confirm-add-btn').addEventListener('click', () => {

  const qty = document.getElementById('modalQty').value.trim();
  const selectedLoc = document.getElementById('modalLoc').value;

  if (!modalSelectedPart || !qty) {
    M.toast({ html: 'Enter quantity', classes: 'red' });
    return;
  }

  let targetLoc = selectedLoc || orderedLocations[currentIndex];

  if (!groupedData[targetLoc]) {
    groupedData[targetLoc] = [];
    orderedLocations.push(targetLoc);
    window.checkedState[targetLoc] = [];
  }

  groupedData[targetLoc].push([modalSelectedPart, qty]);
  saveData();
  window.checkedState[targetLoc].push(false);

  renderGroup(currentIndex);

  M.Modal.getInstance(document.getElementById('qty-modal')).close();

  M.toast({
    html: `Added ${modalSelectedPart} (${qty})`,
    classes: 'green'
  });

  modalSelectedPart = null;
});

// ===============================
// CSV WORKFLOW
// ===============================
document.getElementById('csvFile').addEventListener('change', function (e) {

  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {

    const rows = e.target.result.trim().split('\n');

    groupedData = {};
    orderedLocations = [];
    currentIndex = 0;
    window.checkedState = {};

    rows.slice(1).forEach(row => {

      const [loc, part, qty] = row.split(/[,;\t]/).map(c => c.trim());
      if (!loc || !part || !qty) return;

      if (!groupedData[loc]) {
        groupedData[loc] = [];
        orderedLocations.push(loc);
        window.checkedState[loc] = [];
      }

      groupedData[loc].push([part, qty]);
    });
    saveData();

    const container = document.getElementById('table-container');
    container.innerHTML = '';

    const workflowDiv = document.createElement('div');

    window.renderGroup = function renderGroup(index) {
// UPDATE DROPDOWN



const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');

if (backBtn) backBtn.disabled = index === 0;
if (nextBtn) nextBtn.disabled = index === orderedLocations.length - 1;
const select = document.getElementById('locationJump');

if (select) {
  const currentValue = select.value;

  if (select.options.length !== orderedLocations.length) {
    select.innerHTML = '';

    orderedLocations.forEach((loc, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `(${i + 1}) ${loc}`;
      select.appendChild(opt);
    });

    M.FormSelect.init(select);
  }

  select.value = currentIndex;
}

      workflowDiv.innerHTML = '';

      const loc = orderedLocations[index];
      const items = groupedData[loc];
const header = document.getElementById('locationHeader');

if (header) {
  header.textContent = `Location ${index + 1} of ${orderedLocations.length}: ${loc}`;
}
      const card = document.createElement('div');
      card.className = 'card';

      card.innerHTML = `
        <div class="card-content">
        </div>
      `;

      const table = document.createElement('table');
      table.className = 'highlight';

      table.innerHTML = `
        <thead>
          <tr>
            <th>Part</th>
            <th>Qty</th>
            <th>Actions</th>
          </tr>
        </thead>
      `;

      const tbody = document.createElement('tbody');

      items.forEach(([part, qty], rowIndex) => {

  const tr = document.createElement('tr');

  // normal cells
  [part, qty].forEach(text => {
    const td = document.createElement('td');
    td.textContent = text;
    tr.appendChild(td);
  });

  // ACTION CELL
  const actionCell = document.createElement('td');

  // EDIT BUTTON
  const editBtn = document.createElement('button');
  editBtn.className = 'btn-small green';
  editBtn.textContent = 'Editar';

  editBtn.onclick = () => {
    toggleEdit(tr, loc, rowIndex);
  };

  // DELETE BUTTON (keep your existing logic)
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-small red';
  deleteBtn.textContent = 'Borrar';

  deleteBtn.onclick = () => {
    rowPendingDelete = { loc, rowIndex };

    document.getElementById('delete-preview').innerHTML =
      `<p>${loc}</p><p>${part}</p><p>${qty}</p>`;

    M.Modal.getInstance(
      document.getElementById('delete-confirm-modal')
    ).open();
  };

  // OK BUTTON
  const okBtn = document.createElement('button');
  okBtn.className = 'btn-small grey';
  okBtn.textContent = 'OK';

  okBtn.onclick = () => {
    saveData();
    const state = tr.classList.toggle('grayed-out');
    okBtn.textContent = state ? 'Undo' : 'OK';
    window.checkedState[loc][rowIndex] = state;
  };

  // append buttons
  actionCell.appendChild(editBtn);
  actionCell.appendChild(deleteBtn);
  actionCell.appendChild(okBtn);

  tr.appendChild(actionCell);

  // restore state (VERY IMPORTANT)
  if (window.checkedState[loc]?.[rowIndex]) {
    tr.classList.add('grayed-out');
    okBtn.textContent = 'Undo';
  }

  tbody.appendChild(tr);
});

      table.appendChild(tbody);

      card.querySelector('.card-content').appendChild(table);

      workflowDiv.appendChild(card);
    };

    container.appendChild(workflowDiv);
    renderGroup(0);
  };

  reader.readAsText(file);
});

// ===============================
// DELETE CONFIRM
// ===============================
document.getElementById('confirm-delete-btn').addEventListener('click', () => {

  if (!rowPendingDelete) return;

  const { loc, rowIndex } = rowPendingDelete;

  groupedData[loc].splice(rowIndex, 1);
  saveData();
  window.checkedState[loc].splice(rowIndex, 1);

  renderGroup(currentIndex);

  rowPendingDelete = null;

  M.Modal.getInstance(document.getElementById('delete-confirm-modal')).close();
});
function toggleEdit(row, loc, rowIndex) {

  const editing = row.classList.toggle('editing');
  const cells = row.querySelectorAll('td');

  cells.forEach((cell, i) => {
    if (i < 2) {

      if (editing) {

        const input = document.createElement('input');
        input.value = cell.textContent;
        cell.innerHTML = '';
        cell.appendChild(input);

        input.addEventListener('keydown', e => {
          if (e.key === 'Enter') toggleEdit(row, loc, rowIndex);
        });

      } else {

        const input = cell.querySelector('input');
        if (!input) return;

        const val = input.value.trim();
        cell.textContent = val;

        groupedData[loc][rowIndex][i] = val;
        saveData();
      }
    }
  });
}
// ===============================
// DOWNLOAD CSV
// ===============================
function downloadCSV() {
  let csv = "Location,Part,Qty\n";

  Object.keys(groupedData).forEach(loc => {
    groupedData[loc].forEach(([part, qty]) => {
      csv += `${loc},${part},${qty}\n`;
    });
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "verificar.csv");
  link.click();

  M.toast({ html: "CSV downloaded", classes: "green" });
}

// ===============================
// SHARE CSV (mobile)
// ===============================
async function shareCSV() {
  let csv = "Location,Part,Qty\n";

  Object.keys(groupedData).forEach(loc => {
    groupedData[loc].forEach(([part, qty]) => {
      csv += `${loc},${part},${qty}\n`;
    });
  });

  const file = new File([csv], "verificar.csv", {
    type: "text/csv",
  });

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Verificar CSV",
        text: "Archivo generado",
        files: [file]
      });
    } catch (err) {
      M.toast({ html: "Share cancelled", classes: "orange" });
    }
  } else {
    M.toast({ html: "Sharing not supported", classes: "red" });
  }
}

// ===============================
// CLEAR DATA
// ===============================
function clearStoredData() {
  if (!confirm("Are you sure you want to clear everything?")) return;

  localStorage.removeItem(STORAGE_KEY);

  groupedData = {};
  orderedLocations = [];
  currentIndex = 0;
  window.checkedState = {};

  document.getElementById("table-container").innerHTML = "";

  M.toast({ html: "Data cleared", classes: "red" });
}

