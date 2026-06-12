let optionsMap = {};
let allPartsIndex = [];
let partSearchModalInstance = null;
let fullMenu3List = [];
let itemToDelete = null;

const STORAGE_KEY = 'ajuste_entries';
document.addEventListener('DOMContentLoaded', () => {
  M.updateTextFields();
  M.Sidenav.init(document.querySelectorAll('.sidenav'));
  M.Modal.init(document.querySelectorAll('.modal'));
  loadEntriesFromLocalStorage();

  partSearchModalInstance = M.Modal.getInstance(
    document.getElementById('part-search-modal')
  );

  buildPartIndex();   // FROM partsDB
  populateMenu2();    // dynamic categories
  updateRackOptions();
  updateMenu3();

const qtyInput = document.getElementById('quantity');
  qtyInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEntry();
    }
  });
  document
  .getElementById('confirm-delete-btn')
  .addEventListener('click', () => {
    if (itemToDelete) {
      itemToDelete.remove();
      saveEntriesToLocalStorage();

      M.toast({
        html: 'Borrado',
        classes: 'red lighten-1',
        displayLength: 2000
      });

      itemToDelete = null;
    }

    const modal = M.Modal.getInstance(
      document.getElementById('delete-confirm-modal')
    );
    modal.close();
  });
});



function updateRackOptions() {
    const section = document.getElementById('section').value;
    const rackSelect = document.getElementById('rack');
    rackSelect.innerHTML = ''; // Clear previous options

    const rackRanges = {
        'Rack 1': [121, 140],
        'Rack 2': [221, 240],
        'Rack 3': [303, 304],
        'Rack 4': ['Bodpatio', 'Pisopc', 'Velcros', 'Produccion', 'Caja']
    };

    const range = rackRanges[section];

    if (Array.isArray(range)) {
        if (typeof range[0] === 'number') {
            const [start, end] = range;
            for (let i = start; i <= end; i++) {
                const option = document.createElement('option');
                option.value = option.text = `APC0${i}`;
                rackSelect.appendChild(option);
            }
        } else {
            range.forEach(item => {
                const option = document.createElement('option');
                option.value = option.text = item;
                rackSelect.appendChild(option);
            });
        }
    }
}

function changeRack(direction) {
    const rackSelect = document.getElementById('rack');
    const newIndex = rackSelect.selectedIndex + direction;
    if (newIndex >= 0 && newIndex < rackSelect.options.length) {
        rackSelect.selectedIndex = newIndex;
        updateSelectedItems();
    }
}
function buildPartIndex() {
  optionsMap = {};
  allPartsIndex = [];

  // ---------- PARTS ----------
  if (!window.partsDB) {
    console.error('partsDB not loaded');
  } else {
    Object.entries(window.partsDB).forEach(([partNumber, partData]) => {
      const category = partData.line.toUpperCase();

      if (!optionsMap[category]) {
        optionsMap[category] = [];
      }

      optionsMap[category].push(partNumber);

      allPartsIndex.push({
        part: partNumber,
        category,
        type: 'PARTS'
      });
    });
  }

  // ---------- HILOS ----------
  if (!window.hilosDB) {
    console.error('hilosDB not loaded');
  } else {
    Object.keys(window.hilosDB).forEach(hiloNumber => {
      allPartsIndex.push({
        part: hiloNumber,
        category: 'HILOS',
        type: 'HILOS'
      });
    });
  }

  // Sort parts categories
  Object.keys(optionsMap).forEach(category => {
    optionsMap[category].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  });

  // Sort unified search list
  allPartsIndex.sort((a, b) =>
    a.part.localeCompare(b.part, undefined, { numeric: true, sensitivity: 'base' })
  );
}


function updateSelectedItems() {
    const section = document.getElementById('section').value;
    const rack = document.getElementById('rack').value;
    const menu2 = document.getElementById('menu2').value;
    const menu3 = document.getElementById('menu3').value;
    const quantity = document.getElementById('quantity').value;
    document.getElementById('selected-items').innerText = `${section}, ${rack}, ${menu2}, ${menu3}, ${quantity}`;

}
function calculateBoxes() {
  const partNumber = document.getElementById('menu3').value;
  const quantity = parseFloat(document.getElementById('quantity').value);

  if (!partNumber || !quantity) return null;

  const partData = partsDB[partNumber];
  if (!partData || !partData.pack) return null;

  return quantity / partData.pack;
}
function addEntry() {
  const rack = document.getElementById('rack').value;
  const menu3 = document.getElementById('menu3').value;
  const quantity = document.getElementById('quantity').value;

  // Validation
  if (!rack || !menu3 || !quantity) {
    M.toast({
      html: 'Por favor llena todos los campos',
      classes: 'orange lighten-1',
      displayLength: 2000
    });
    return;
  }

  const boxes = calculateBoxes();
  const boxesText = boxes ? ` | Cajas: ${boxes.toFixed(2)}` : '';
  const selectedItems = `${rack} ${menu3} ${quantity}${boxesText}`;
  const entryList = document.getElementById('entry-list');

  const newEntry = document.createElement('li');
  newEntry.className = 'collection-item';
  newEntry.innerText = selectedItems;

  // Delete button
  const deleteButton = document.createElement('button');
deleteButton.innerText = 'Borrar';
deleteButton.className = 'btn red delete-button';

deleteButton.onclick = () => {
  itemToDelete = newEntry;

  const modal = M.Modal.getInstance(
    document.getElementById('delete-confirm-modal')
  );
  modal.open();
};

  newEntry.appendChild(deleteButton);
  entryList.insertBefore(newEntry, entryList.firstChild);

    saveEntriesToLocalStorage();

  // Success toast
  M.toast({
    html: `Agregado <strong>${rack} ${menu3} (${quantity})</strong>`,
    classes: 'green lighten-1',
    displayLength: 2000
  });
}

function getFormattedTimestamp() {
  const now = new Date();

  const date = now.toISOString().slice(0, 10); // YYYY-MM-DD

  const time = now.toTimeString().slice(0, 8); // HH:MM:SS
  const safeTime = time.replace(/:/g, '-');    // HH-MM-SS

  return `${date}_${safeTime}`;
}

function downloadData() {
  const entryList = document.getElementById('entry-list');
  let csvContent = "Localizacion,Numero De Parte,Cantidad\n";

  for (let i = 0; i < entryList.children.length; i++) {
    const entryText = entryList.children[i].childNodes[0].nodeValue.trim();
    const values = entryText.split(' ');
    if (values.length >= 3) {
      csvContent += `${values[0]},${values[1]},${values[2]}\n`;
    }
  }

  const timestamp = getFormattedTimestamp();
  const filename = `Ajuste_${timestamp}.csv`;

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  M.toast({
    html: `Descargado: ${filename}`,
    classes: 'blue'
  });
}

async function shareData() {
  const entryList = document.getElementById('entry-list');
  let csvContent = "Localizacion,Numero De Parte,Cantidad\n";

  for (let i = 0; i < entryList.children.length; i++) {
    const entryText = entryList.children[i].childNodes[0].nodeValue.trim();
    const values = entryText.split(' ');
    if (values.length >= 3) {
      csvContent += `${values[0]},${values[1]},${values[2]}\n`;
    }
  }

  const timestamp = getFormattedTimestamp();
  const filename = `Ajuste_${timestamp}.csv`;
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const file = new File([blob], filename, { type: 'text/csv' });

  // 1. Try file sharing (may fail in PWA)
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Ajuste File',
        text: 'Archivo generado',
        files: [file]
      });

      M.toast({
        html: `Compartido archivo`,
        classes: 'green'
      });
      return;
    } catch (err) {
      console.log('File share failed, trying fallback...');
    }
  }

  // 2. Fallback: share TEXT (works in PWA)
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Ajuste Data',
        text: csvContent.substring(0, 2000) // limit for safety
      });

      M.toast({
        html: 'Compartido como texto',
        classes: 'blue'
      });
      return;
    } catch (err) {
      console.log('Text share failed');
    }
  }

  // 3. FINAL fallback → download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  M.toast({
    html: 'Archivo descargado',
    classes: 'orange'
  });
}



function modalSearchParts() {
  const input = document
    .getElementById('modalPartSearch')
    .value
    .toLowerCase();

  const resultsList = document.getElementById('modalSearchResults');
  resultsList.innerHTML = '';

  if (!input) return;

  const matches = allPartsIndex
    .filter(item => item.part.toLowerCase().includes(input))
    .slice(0, 100); // safety limit

  matches.forEach(({ part, category, type }) => {
  const li = document.createElement('li');
  li.className = 'collection-item modal-close';
  li.innerText = part;

  //  tag the item
  li.dataset.type = type;
  li.dataset.category = category;

  li.onclick = () => selectPartFromModal(part, category, type);
  resultsList.appendChild(li);
});
}
function selectPartFromModal(partNumber, category, type) {
  const menu2 = document.getElementById('menu2');
  const menu3 = document.getElementById('menu3');

  if (type === 'HILOS') {
    menu2.value = 'HILOS';
  } else {
    menu2.value = category;
  }

  updateMenu3();
  menu3.value = partNumber;
  updateSelectedItems();

  // AUTO-FOCUS quantity
  const qty = document.getElementById('quantity');
  setTimeout(() => {
    qty.focus();
    qty.select();
  }, 100);

  document.getElementById('modalPartSearch').value = '';
  document.getElementById('modalSearchResults').innerHTML = '';

  if (partSearchModalInstance) {
    partSearchModalInstance.close();
  }
}
function populateMenu2() {
  const menu2 = document.getElementById('menu2');
  menu2.innerHTML = '';

  //  Existing partsDB categories
  Object.keys(optionsMap)
    .sort()
    .forEach(category => {
      const option = document.createElement('option');
      option.value = option.text = category;
      menu2.appendChild(option);
    });

  //  Extra item: HILOS
  const hilosOption = document.createElement('option');
  hilosOption.value = 'HILOS';
  hilosOption.text = 'HILOS';
  menu2.appendChild(hilosOption);
}

function updateMenu3() {
  const menu2Value = document.getElementById('menu2').value;
  const menu3 = document.getElementById('menu3');
  menu3.innerHTML = '';

  //  SPECIAL CASE FIRST: HILOS
  if (menu2Value === 'HILOS') {
    if (!window.hilosDB) {
      console.error('hilosDB not loaded');
      return;
    }

    Object.entries(window.hilosDB)
      .sort(([a], [b]) =>
        a.localeCompare(b, undefined, { numeric: true })
      )
      .forEach(([partNumber, hilo]) => {
        const option = document.createElement('option');
        option.value = partNumber;
        option.textContent = partNumber;
        menu3.appendChild(option);
      });

    return; //  stop here
  }

  //  NORMAL CASE: partsDB categories
  if (!optionsMap[menu2Value]) return;

  optionsMap[menu2Value].forEach(part => {
    const option = document.createElement('option');
    option.value = option.text = part;
    menu3.appendChild(option);
  });
}

function saveEntriesToLocalStorage() {
  const entryList = document.getElementById('entry-list');
  const entries = [];

  Array.from(entryList.children).forEach(li => {
    const text = li.childNodes[0].nodeValue.trim();
    entries.push(text);
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
function loadEntriesFromLocalStorage() {
  const entryList = document.getElementById('entry-list');
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) return;

  const entries = JSON.parse(stored);

  entries.forEach(text => {
    const li = document.createElement('li');
    li.className = 'collection-item';
    li.innerText = text;

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Borrar';
    deleteButton.className = 'btn red delete-button';
    deleteButton.onclick = () => {
  itemToDelete = li;

  const modal = M.Modal.getInstance(
    document.getElementById('delete-confirm-modal')
  );
  modal.open();
};


    li.appendChild(deleteButton);
    entryList.appendChild(li);
  });
}
function clearAllEntries() {
  if (!confirm('¿Borrar todos los registros?')) return;

  document.getElementById('entry-list').innerHTML = '';
  localStorage.removeItem(STORAGE_KEY);

  M.toast({
    html: 'Lista limpiada',
    classes: 'grey darken-1',
    displayLength: 2000
  });
}

function showTotals() {
  const entryList = document.getElementById('entry-list');
  const totalsList = document.getElementById('totals-list');
  const grandTotalEl = document.getElementById('grand-total');

  totalsList.innerHTML = '';

  const totals = {};
  let grandTotal = 0;

  Array.from(entryList.children).forEach(li => {
    const text = li.childNodes[0].nodeValue.trim();
    const parts = text.trim().split(/\s+/); // APC0123 PART123 5

    if (parts.length >= 3) {
      const partNumber = parts[1];
      const qty = parseInt(parts[2], 10);

      if (!isNaN(qty)) {
        totals[partNumber] = (totals[partNumber] || 0) + qty;
        grandTotal += qty;
      }
    }
  });

  Object.entries(totals).forEach(([part, qty]) => {
    const li = document.createElement('li');
    li.className = 'collection-item';
    li.innerHTML = `<strong>${part}</strong> <span class="right">${qty}</span>`;
    totalsList.appendChild(li);
  });

  grandTotalEl.textContent = grandTotal;
}

