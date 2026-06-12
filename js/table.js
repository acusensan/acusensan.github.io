let currentIndex = 0;
let shouldScroll = false;
let allParts = [];

window.checkedState = {};

// ===== STATE =====
let groupedData = {};
let orderedLocations = [];
const STORAGE_KEY = "verificar_data";

// ===== SAVE / LOAD =====
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    groupedData,
    orderedLocations,
    checkedState
  }));
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  const data = JSON.parse(saved);
  groupedData = data.groupedData || {};
  orderedLocations = data.orderedLocations || [];
  window.checkedState = data.checkedState || {};

  renderOne();
}

// ===== RENDER =====
function renderOne() {
  const container = document.getElementById('table-container');
  const fixedSearchContainer = document.getElementById('fixed-search');

  container.innerHTML = '';
  fixedSearchContainer.innerHTML = '';

  if (orderedLocations.length === 0) return;

  const loc = orderedLocations[currentIndex];
  if (!window.checkedState[loc]) {
  window.checkedState[loc] = [];
}
  const items = groupedData[loc] || [];

  let doneCount = (window.checkedState[loc] || []).filter(v => v).length;

  // =============================
  //  HEADER
  // =============================
  const header = document.createElement('div');
  header.className = 'location-header';

  header.innerHTML = `
    Locatizacion ${currentIndex + 1}/${orderedLocations.length} - ${loc}
    <div class="progress">${doneCount}/${items.length} done</div>
  `;

  //  LOCATION SELECTOR
  header.onclick = () => {
    const menu = document.createElement('div');
    menu.style.position = 'fixed';
    menu.style.top = '0';
    menu.style.left = '0';
    menu.style.width = '100%';
    menu.style.height = '100%';
    menu.style.background = '#f5f7fa';
    menu.style.zIndex = '9999';
    menu.style.display = 'flex';
    menu.style.flexDirection = 'column';

    const topBar = document.createElement('div');
    topBar.textContent = "Select Location";
    topBar.style.padding = '15px';
    topBar.style.background = '#1976d2';
    topBar.style.color = 'white';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cerrar';
    closeBtn.style.float = "right";
    closeBtn.onclick = () => document.body.removeChild(menu);

    topBar.appendChild(closeBtn);
    menu.appendChild(topBar);

    const list = document.createElement('div');
    list.style.flex = '1';
    list.style.overflowY = 'auto';

    orderedLocations.forEach((l, i) => {
      const item = document.createElement('div');
      item.textContent = `${i + 1}. ${l}`;
      item.style.padding = '15px';

      if (i === currentIndex) {
        item.style.background = '#e3f2fd';
      }

      item.onclick = () => {
        currentIndex = i;
        shouldScroll = true;
        document.body.removeChild(menu);
        renderOne();
      };

      list.appendChild(item);
    });

    menu.appendChild(list);
    document.body.appendChild(menu);
  };

  container.appendChild(header);

  // =============================
  //  CARD TABLE
  // =============================
  const card = document.createElement('div');
  card.className = 'location-card';

  const table = document.createElement('table');
  const tbody = document.createElement('tbody');

  items.forEach(([part, qty], i) => {
    const tr = document.createElement('tr');

    if (window.checkedState[loc]?.[i]) {
      tr.classList.add('done');
    }

    const partTd = document.createElement('td');
    partTd.textContent = part;
    partTd.onclick = () => makeEditable(partTd, loc, i, 0);

    const qtyTd = document.createElement('td');
    qtyTd.textContent = qty;
    qtyTd.onclick = () => makeEditable(qtyTd, loc, i, 1);

    const actionTd = document.createElement('td');

    const doneBtn = document.createElement('button');
doneBtn.className = 'done-btn';
doneBtn.textContent = window.checkedState[loc]?.[i] ? 'Undo' : '✓';

    doneBtn.onclick = () => {
      window.checkedState[loc][i] = !window.checkedState[loc][i];
      saveData();
      renderOne();
    };

    const delBtn = document.createElement('button');
delBtn.className = 'delete-btn';
delBtn.textContent = 'Borrar';
    delBtn.onclick = () => {
  groupedData[loc].splice(i, 1);

  if (window.checkedState[loc]) {
    window.checkedState[loc].splice(i, 1);
  }

  saveData();
  renderOne();
};

    actionTd.appendChild(doneBtn);
    actionTd.appendChild(delBtn);

    tr.appendChild(partTd);
    tr.appendChild(qtyTd);
    tr.appendChild(actionTd);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  card.appendChild(table);
  container.appendChild(card);

  // =============================
  //  FIXED SEARCH (FINAL)
  // =============================
  const globalAdd = document.createElement('div');
  globalAdd.className = 'add-inline';
  globalAdd.style.position = 'relative';

  const searchInput = document.createElement('input');
  searchInput.placeholder = "Search part...";

  const inputQty = document.createElement('input');
  inputQty.type = 'number';
  inputQty.placeholder = "Qty";

  const results = document.createElement('div');
  results.style.position = 'absolute';
  results.style.bottom = '50px';
  results.style.left = '0';
  results.style.width = '100%';
  results.style.maxHeight = '200px';
  results.style.overflowY = 'auto';
  results.style.background = 'white';
  results.style.border = '1px solid #ccc';
  results.style.borderTop = 'none';
  results.style.boxShadow = '0 -2px 6px rgba(0,0,0,0.2)';
  results.style.zIndex = '999';

  let selectedPart = null;

  searchInput.oninput = () => {
    const q = searchInput.value.toLowerCase().trim();
    results.innerHTML = '';
    selectedPart = null;

    if (!q) return;

    const matches = allParts
      .filter(p => {
        const pLower = p.toLowerCase();
        return pLower.startsWith(q) || pLower.includes(q);
      })
      .slice(0, 10);

    matches.forEach(part => {
      const item = document.createElement('div');
      item.textContent = part;
      item.style.padding = '10px';

      item.onmouseenter = () => item.style.background = '#e3f2fd';
      item.onmouseleave = () => item.style.background = 'white';

      item.onclick = () => {
        searchInput.value = part;
        selectedPart = part;
        results.innerHTML = '';
        inputQty.focus();
      };

      results.appendChild(item);
    });
  };

  const addBtn = document.createElement('button');
  addBtn.className = 'btn green';
  addBtn.textContent = 'Agregar';

  addBtn.onclick = () => {
    const part = selectedPart || searchInput.value;

    if (!part || !inputQty.value) {
  alert("Enter part and quantity");
  return;
}

    groupedData[loc].push([part, inputQty.value]);
    window.checkedState[loc].push(false);

    searchInput.value = "";
    inputQty.value = "";
    results.innerHTML = "";
    selectedPart = null;

    saveData();
    renderOne();

    setTimeout(() => searchInput.focus(), 50);
  };

  //  ENTER FLOW
  searchInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      const first = results.firstChild;

      if (first) {
        first.click();
      } else if ((selectedPart || searchInput.value) && inputQty.value) {
        addBtn.click();
      }
    }
  };

  inputQty.onkeydown = (e) => {
    if (e.key === 'Enter') addBtn.click();
  };

  globalAdd.appendChild(searchInput);
  globalAdd.appendChild(inputQty);
  globalAdd.appendChild(addBtn);
  globalAdd.appendChild(results);

  fixedSearchContainer.appendChild(globalAdd);

  // =============================
  //  NAV STATE
  // =============================
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (backBtn) backBtn.disabled = currentIndex === 0;
  if (nextBtn) nextBtn.disabled = currentIndex === orderedLocations.length - 1;
}

// ===== EDIT =====
function makeEditable(td, loc, rowIndex, colIndex) {
  const input = document.createElement('input');
  input.value = td.textContent;

  td.innerHTML = '';
  td.appendChild(input);

  input.focus();

  input.onblur = () => {
    groupedData[loc][rowIndex][colIndex] = input.value.trim();
    saveData();
    renderOne();
  };

  input.onkeydown = (e) => {
    if (e.key === 'Enter') input.blur();
  };
}

// ===== CSV IMPORT =====
document.getElementById('csvFile').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    const rows = e.target.result.split('\n');

    groupedData = {};
    orderedLocations = [];
    window.checkedState = {};

    rows.slice(1).forEach(row => {
      const [loc, part, qty] = row.split(/[,;\t]/).map(v => v?.trim());

      if (!loc || !part || !qty) return;

      if (!groupedData[loc]) {
        groupedData[loc] = [];
        orderedLocations.push(loc);
        window.checkedState[loc] = [];
      }

      groupedData[loc].push([part.trim(), qty.trim()]);
      window.checkedState[loc].push(false);
    });

    saveData();
    renderOne();
  };

  reader.readAsText(file);
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {

  const partsDB = window.partsDB || {};
  const hilosDB = window.hilosDB || {};

  allParts = [
    ...Object.keys(partsDB),
    ...Object.keys(hilosDB)
  ];

  loadData();

  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (backBtn) {
    backBtn.onclick = () => {
      if (currentIndex > 0) {
        currentIndex--;
        shouldScroll = true;
        renderOne();
      }
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      if (currentIndex < orderedLocations.length - 1) {
        currentIndex++;
        shouldScroll = true;
        renderOne();
      }
    };
  }
});

// ===== DOWNLOAD CSV =====
function downloadCSV() {
  let csv = "Location,Part,Qty\n";

  orderedLocations.forEach(loc => {
    const items = groupedData[loc] || [];
    items.forEach(([part, qty]) => {
      csv += `${loc},${part},${qty}\n`;
    });
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "verificar_data.csv";
  a.click();

  URL.revokeObjectURL(url);
}

// ===== SHARE CSV (mobile-friendly) =====
function shareCSV() {
  let csv = "Location,Part,Qty\n";

  orderedLocations.forEach(loc => {
    const items = groupedData[loc] || [];
    items.forEach(([part, qty]) => {
      csv += `${loc},${part},${qty}\n`;
    });
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const file = new File([blob], "verificar_data.csv", { type: "text/csv" });

  if (navigator.share) {
    navigator.share({
      files: [file],
      title: "Verificar Data",
      text: "Here is the CSV file"
    }).catch(err => console.log(err));
  } else {
    alert("Sharing not supported on this device");
  }
}

// ===== CLEAR DATA =====
function clearStoredData() {
  if (!confirm("Are you sure you want to delete all data?")) return;

  localStorage.removeItem(STORAGE_KEY);

  groupedData = {};
  orderedLocations = [];
  window.checkedState = {};
  currentIndex = 0;

  renderOne();
}
