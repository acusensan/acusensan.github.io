
let table;

let rowPendingDelete = null;

document.addEventListener('DOMContentLoaded', function () {
  M.Modal.init(document.querySelectorAll('.modal'));
});

document.addEventListener('DOMContentLoaded', function () {
// ===============================
// BUILD partOptions FROM partsDB
// ===============================
const partOptions = {};

// Normalize category names to match <select> options
function normalizeCategory(line) {
  return line.trim().toUpperCase();
}

Object.entries(window.partsDB).forEach(([partNumber, data]) => {
  if (!data.line) return;

  const category = normalizeCategory(data.line);

  if (!partOptions[category]) {
    partOptions[category] = [];
  }

  partOptions[category].push(partNumber);
});

// ===============================
// PART SEARCH MODAL LOGIC
// ===============================

const partSearchInput = document.getElementById('partSearchInput');
const partSearchResults = document.getElementById('partSearchResults');
const newPartSelect = document.getElementById('newPart');

// Combine all part numbers into one arra
const allParts = Object.keys(window.partsDB);

if (partSearchInput) {
  partSearchInput.addEventListener('input', () => {
    const query = partSearchInput.value.toLowerCase().trim();
    partSearchResults.innerHTML = '';

    if (!query) return;

    const matches = allParts.filter(part =>
      part.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      partSearchResults.innerHTML =
        '<li class="collection-item grey-text">Sin resultados</li>';
      return;
    }

    matches.forEach(part => {
      const li = document.createElement('li');
      li.className = 'collection-item';
      li.style.cursor = 'pointer';
      li.textContent = part;

      li.onclick = () => {
        selectPart(part);
        M.Modal.getInstance(
          document.getElementById('part-search-modal')
        ).close();
      };

      partSearchResults.appendChild(li);
    });
  });
}

function selectPart(part) {
  const partData = window.partsDB[part];
  if (!partData) return;

  // Add part option if missing
  let exists = [...newPartSelect.options].some(o => o.value === part);
  if (!exists) {
    const option = document.createElement('option');
    option.value = part;
    option.textContent = part;
    newPartSelect.appendChild(option);
  }

  newPartSelect.value = part;
  M.FormSelect.init(newPartSelect);

  // Auto‑select Category
  const category = normalizeCategory(partData.line);
  categorySelect.value = category;
  M.FormSelect.init(categorySelect);

  // Auto‑select Location (if exists)
  if (partData.location) {
    locSelect.value = partData.location;
    M.FormSelect.init(locSelect);
  }
}

  const rackRanges = {
    'Rack 1': [121, 140],
    'Rack 2': [221, 240],
    'Rack 3': [303, 304]
  };

  const categorySelect = document.getElementById('categorySelect');
  const partSelect = document.getElementById('newPart');
  const rackSelect = document.getElementById('rackSelect');
  const locSelect = document.getElementById('newLoc');

  function updatePartOptions(category) {
    partSelect.innerHTML = '<option value="" disabled selected>Selecciona Numero De Parte</option>';
    if (partOptions[category]) {
      partOptions[category].forEach(part => {
        const option = document.createElement('option');
        option.value = part;
        option.textContent = part;
        partSelect.appendChild(option);
      });
    }
    M.FormSelect.init(partSelect);
  }

  function updateLocOptions(rack) {
    locSelect.innerHTML = '<option value="" disabled selected>Selecciona Localizacion</option>';
    if (rackRanges[rack]) {
      const [start, end] = rackRanges[rack];
      for (let i = start; i <= end; i++) {
        const padded = i.toString().padStart(4, '0');
        const code = `APC${padded}`;
        const option = document.createElement('option');
        option.value = code;
        option.textContent = code;
        locSelect.appendChild(option);
      }
    }
    M.FormSelect.init(locSelect);
  }

  categorySelect.addEventListener('change', function () {
    updatePartOptions(this.value);
  });

  rackSelect.addEventListener('change', function () {
    updateLocOptions(this.value);
  });

  M.FormSelect.init(document.querySelectorAll('select'));
  M.Collapsible.init(document.querySelectorAll('.collapsible'));
});

document.getElementById('csvFile').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const rows = text.trim().split('\n');
    const headers = rows[0].split(/\t|,/).map(h => h.trim());

    const groupedData = {};

    rows.slice(1).forEach(row => {
      const [loc, part, qty] = row.split(/\t|,/).map(cell => cell.trim());
      if (!groupedData[loc]) groupedData[loc] = [];
      groupedData[loc].push([part, qty]);
    });

    const container = document.getElementById('table-container');
    container.innerHTML = '';

    const collapsible = document.createElement('ul');
    collapsible.className = 'collapsible';

    Object.entries(groupedData).forEach(([loc, items]) => {
      const li = document.createElement('li');

      const header = document.createElement('div');
      header.className = 'collapsible-header';
      header.textContent = loc;

      const body = document.createElement('div');
      body.className = 'collapsible-body';

      const table = document.createElement('table');
      table.className = 'highlight centered striped';
      const thead = document.createElement('thead');
      thead.innerHTML = '<tr><th>Numero De Parte</th><th>Qty</th><th>Actions</th></tr>';
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      items.forEach(([part, qty]) => {
        const tr = document.createElement('tr');
        [part, qty].forEach(text => {
          const td = document.createElement('td');
          td.textContent = text;
          tr.appendChild(td);
        });
        appendActions(tr);
        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      body.appendChild(table);

      li.appendChild(header);
      li.appendChild(body);
      collapsible.appendChild(li);
    });

    container.appendChild(collapsible);
    M.Collapsible.init(collapsible);
  };

  reader.readAsText(file);
});

function appendActions(tr) {
  const actionCell = document.createElement('td');

  const editBtn = document.createElement('button');
  editBtn.innerHTML = 'Editar';
  editBtn.className = 'btn-small green action-btn';
  editBtn.onclick = () => toggleEdit(tr);

  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = 'Borrar';
  deleteBtn.className = 'btn-small red action-btn';
  deleteBtn.onclick = () => {
  rowPendingDelete = tr;

  const preview = document.getElementById('delete-preview');
  preview.innerHTML = '';

  const cells = tr.querySelectorAll('td');
  const groupHeader = tr.closest('li')
    .querySelector('.collapsible-header')
    ?.textContent.trim();

  let loc, part, qty;

  if (groupHeader === 'User Added Data') {
    loc = cells[0].textContent.trim();
    part = cells[1].textContent.trim();
    qty = cells[2].textContent.trim();
  } else {
    loc = groupHeader;
    part = cells[0].textContent.trim();
    qty = cells[1].textContent.trim();
  }

  preview.innerHTML = `
    <p><strong>Location:</strong> ${loc}</p>
    <p><strong>Part Number:</strong> ${part}</p>
    <p><strong>Qty:</strong> ${qty}</p>
  `;

  M.Modal.getInstance(
    document.getElementById('delete-confirm-modal')
  ).open();
};


  const okBtn = document.createElement('button');
  okBtn.innerHTML = 'OK';
  okBtn.className = 'btn-small grey darken-2 action-btn';
  okBtn.onclick = () => {
    tr.classList.toggle('grayed-out');
    okBtn.textContent = tr.classList.contains('grayed-out') ? 'Undo' : 'OK';
  };

  actionCell.appendChild(editBtn);
  actionCell.appendChild(deleteBtn);
  actionCell.appendChild(okBtn);
  tr.appendChild(actionCell);
}


function toggleEdit(row) {
  const isEditing = row.classList.toggle('editing');
  const cells = row.querySelectorAll('td');

  cells.forEach((cell, index) => {
    if (index < 2) {
      if (isEditing) {
        const input = document.createElement('input');
        input.value = cell.textContent;
        input.style.width = '100%';
        cell.textContent = '';
        cell.appendChild(input);

        // 👇 Focus the first input (Numero De Parte)
        if (index === 0) {
          input.focus();
        }
      } else {
        const input = cell.querySelector('input');
        if (input) {
          cell.textContent = input.value;
        }
      }
    }
  });

  const editBtn = row.querySelector('.btn-small.green');
  editBtn.innerHTML = isEditing
    ? 'Save'
    : 'Edit';
}

function addRow() {
  const loc = document.getElementById('newLoc').value.trim();
  const part = document.getElementById('newPart').value.trim();
  const qty = document.getElementById('newQty').value.trim();

  if (!loc || !part || !qty) {
    M.toast({ html: 'Please fill in all fields.', classes: 'red' });
    return;
  }

  const collapsible = document.querySelector('.collapsible');
  let userGroup = Array.from(collapsible.children).find(li =>
    li.querySelector('.collapsible-header')?.textContent === 'User Added Data'
  );

  if (!userGroup) {
    userGroup = document.createElement('li');

    const header = document.createElement('div');
    header.className = 'collapsible-header';
    header.textContent = 'User Added Data';

    const body = document.createElement('div');
    body.className = 'collapsible-body';

    const table = document.createElement('table');
    table.className = 'highlight centered striped';
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Localizacion</th><th>Numero De Parte</th><th>Qty</th><th>Actions</th></tr>';
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    body.appendChild(table);

    userGroup.appendChild(header);
    userGroup.appendChild(body);
    collapsible.appendChild(userGroup);
    M.Collapsible.init(collapsible);
  }

  const tbody = userGroup.querySelector('tbody');
  const tr = document.createElement('tr');

  [loc, part, qty].forEach(value => {
    const td = document.createElement('td');
    td.textContent = value;
    tr.appendChild(td);
  });

  appendActions(tr);
  tbody.appendChild(tr);
  M.toast({
  html: `Added <strong>${part}</strong> (Qty: ${qty})`,
  classes: 'green lighten-1'
});
  
// to clear inputs
  //document.getElementById('rackSelect').selectedIndex = 0;
  //document.getElementById('newLoc').innerHTML = '<option value="" disabled selected>Selecciona Localizacion</option>';
  //document.getElementById('categorySelect').selectedIndex = 0;
  //document.getElementById('newPart').innerHTML = '<option value="" disabled selected>Selecciona Numero De Parte</option>';
  //document.getElementById('newQty').value = '';
  //M.FormSelect.init(document.querySelectorAll('select'));
}

function downloadCSV() {
  const collapsible = document.querySelector('.collapsible');
  if (!collapsible) return;

  let csv = 'Localizacion,Numero De Parte,Qty\n';

  const groups = collapsible.querySelectorAll('li');
  groups.forEach(group => {
    const groupLabel = group.querySelector('.collapsible-header')?.textContent.trim();
    const rows = group.querySelectorAll('tbody tr');

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      let loc, part, qty;
      if (groupLabel === 'User Added Data') {
        loc = cells[0]?.querySelector('input')?.value || cells[0]?.textContent.trim();
        part = cells[1]?.querySelector('input')?.value || cells[1]?.textContent.trim();
        qty = cells[2]?.querySelector('input')?.value || cells[2]?.textContent.trim();
      } else {
        loc = groupLabel;
        part = cells[0]?.querySelector('input')?.value || cells[0]?.textContent.trim();
        qty = cells[1]?.querySelector('input')?.value || cells[1]?.textContent.trim();
      }
      if (loc && part && qty) {
        csv += `${loc},${part},${qty}\n`;
      }
    });
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'table_data.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function searchTable() {
  const input = document.getElementById('searchInput').value.toLowerCase();
  const collapsible = document.querySelector('.collapsible');
  if (!collapsible) return;

  const groups = collapsible.querySelectorAll('li');

  groups.forEach(group => {
    const rows = group.querySelectorAll('tbody tr');
    let groupHasMatch = false;

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      let partCell = null;

      // Try to find the cell that contains 'Numero De Parte'
      if (cells.length >= 2) {
        partCell = cells[0]; // Assuming 'Numero De Parte' is in the first column
      }

      if (!partCell) return;

      const originalText = partCell.textContent;
      const partText = originalText.toLowerCase();
      const match = partText.includes(input);

      row.style.display = match || input === '' ? '' : 'none';

      if (match && input) {
        partCell.innerHTML = originalText.replace(new RegExp(input, 'gi'), match =>
          `<span style="background-color: yellow;">${match}</span>`
        );
        groupHasMatch = true;
      } else {
        partCell.innerHTML = originalText; // Reset highlight
        if (input === '') groupHasMatch = true; // Show all if input is cleared
      }
    });

    group.style.display = groupHasMatch ? '' : 'none';
  });
}

document.getElementById('confirm-delete-btn').addEventListener('click', () => {
  if (rowPendingDelete) {
    rowPendingDelete.remove();

    M.toast({
      html: 'Row deleted',
      classes: 'red lighten-1'
    });

    rowPendingDelete = null;
  }

  M.Modal.getInstance(
    document.getElementById('delete-confirm-modal')
  ).close();
});

function clearStoredData() {
  if (!confirm('Esto eliminará toda la información actual. ¿Continuar?')) {
    return;
  }
  // 1. Clear table
  const container = document.getElementById('table-container');
  if (container) {
    container.innerHTML = '';
  }

  // 2. Reset file input
  const csvInput = document.getElementById('csvFile');
  if (csvInput) {
    csvInput.value = '';
  }

  // 3. Reset search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = '';
  }

  // 4. Reset form fields
  document.getElementById('newQty').value = '';

  const selects = [
    'rackSelect',
    'newLoc',
    'categorySelect',
    'newPart'
  ];

  selects.forEach(id => {
    const select = document.getElementById(id);
    if (select) {
      select.selectedIndex = 0;
    }
  });

  // Reinitialize Materialize selects
  M.FormSelect.init(document.querySelectorAll('select'));

  // 5. Clear delete state
  rowPendingDelete = null;

  // 6. Close settings modal
  const modal = document.getElementById('settings-modal');
  const instance = M.Modal.getInstance(modal);
  if (instance) instance.close();

  // 7. Feedback
  M.toast({ html: 'Página reiniciada', classes: 'blue lighten-1' });
}
const STORAGE_KEY = 'verificar_table_data';

function saveToStorage() {
  const collapsible = document.querySelector('.collapsible');
  if (!collapsible) return;

  const data = { groups: {} };

  collapsible.querySelectorAll('li').forEach(group => {
    const label = group.querySelector('.collapsible-header')?.textContent.trim();
    const rows = [];

    group.querySelectorAll('tbody tr').forEach(tr => {
      const cells = tr.querySelectorAll('td');
      const ok = tr.classList.contains('grayed-out');

      if (label === 'User Added Data') {
        rows.push({
          loc: getCellValue(cells[0]),
          part: getCellValue(cells[1]),
          qty: getCellValue(cells[2]),
          ok
        });
      } else {
        rows.push({
          part: getCellValue(cells[0]),
          qty: getCellValue(cells[1]),
          ok
        });
      }
    });

    if (rows.length) data.groups[label] = rows;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function getCellValue(cell) {
  const input = cell.querySelector('input');
  return input ? input.value.trim() : cell.textContent.trim();
}
function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  const data = JSON.parse(raw);
  const container = document.getElementById('table-container');
  container.innerHTML = '';

  const collapsible = document.createElement('ul');
  collapsible.className = 'collapsible';

  Object.entries(data.groups).forEach(([label, rows]) => {
    const li = document.createElement('li');

    const header = document.createElement('div');
    header.className = 'collapsible-header';
    header.textContent = label;

    const body = document.createElement('div');
    body.className = 'collapsible-body';

    const table = document.createElement('table');
    table.className = 'highlight centered striped';

    const thead = document.createElement('thead');
    thead.innerHTML = label === 'User Added Data'
      ? `<tr><th>Localizacion</th><th>Numero De Parte</th><th>Qty</th><th>Actions</th></tr>`
      : `<tr><th>Numero De Parte</th><th>Qty</th><th>Actions</th></tr>`;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    rows.forEach(row => {
      const tr = document.createElement('tr');

      if (label === 'User Added Data') {
        ['loc', 'part', 'qty'].forEach(k => {
          const td = document.createElement('td');
          td.textContent = row[k];
          tr.appendChild(td);
        });
      } else {
        ['part', 'qty'].forEach(k => {
          const td = document.createElement('td');
          td.textContent = row[k];
          tr.appendChild(td);
        });
      }

      appendActions(tr);

      if (row.ok) tr.classList.add('grayed-out');

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    body.appendChild(table);
    li.appendChild(header);
    li.appendChild(body);
    collapsible.appendChild(li);
  });

  container.appendChild(collapsible);
  M.Collapsible.init(collapsible);
}
