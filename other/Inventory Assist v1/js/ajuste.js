let optionsMap = {};
let allPartsIndex = [];
let partSearchModalInstance = null;
let itemToDelete = null;
let selectedPart = '';

const STORAGE_KEY = 'ajuste_entries';

document.addEventListener('DOMContentLoaded', () => {
  M.updateTextFields();
  M.Sidenav.init(document.querySelectorAll('.sidenav'));
  M.Modal.init(document.querySelectorAll('.modal'));

  loadEntriesFromLocalStorage();

  partSearchModalInstance = M.Modal.getInstance(
    document.getElementById('part-search-modal')
  );

  buildPartIndex();
  updateRackOptions();

  document.getElementById('quantity').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEntry();
    }
  });

  document
    .getElementById('confirm-delete-btn')
    .addEventListener('click', confirmDelete);
});
document
  .getElementById('selectedPart')
  .addEventListener('input', e => {
    selectedPart = e.target.value.trim().toUpperCase();
  });

function confirmDelete() {
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

  M.Modal.getInstance(
    document.getElementById('delete-confirm-modal')
  ).close();
}

function createDeleteButton(entryElement) {
  const button = document.createElement('button');

  button.innerText = 'Borrar';
  button.className = 'btn red delete-button';

  button.onclick = () => {
    itemToDelete = entryElement;

    M.Modal.getInstance(
      document.getElementById('delete-confirm-modal')
    ).open();
  };

  return button;
}

function updateRackOptions() {
  const section = document.getElementById('section').value;
  const rackSelect = document.getElementById('rack');

  rackSelect.innerHTML = '';

  const rackRanges = {
    'Rack 1': [121, 140],
    'Rack 2': [221, 240],
    'Rack 3': [303, 304],
    'Rack 4': ['Bodpatio', 'Pisopc', 'Velcros', 'Produccion', 'Caja']
  };

  const range = rackRanges[section];

  if (!Array.isArray(range)) return;

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

function changeRack(direction) {
  const rackSelect = document.getElementById('rack');
  const newIndex = rackSelect.selectedIndex + direction;

  if (newIndex >= 0 && newIndex < rackSelect.options.length) {
    rackSelect.selectedIndex = newIndex;
  }
}

function buildPartIndex() {
  optionsMap = {};
  allPartsIndex = [];

  if (window.partsDB) {
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
  } else {
    console.error('partsDB not loaded');
  }

  if (window.hilosDB) {
    Object.keys(window.hilosDB).forEach(hiloNumber => {
      allPartsIndex.push({
        part: hiloNumber,
        category: 'HILOS',
        type: 'HILOS'
      });
    });
  } else {
    console.error('hilosDB not loaded');
  }

  Object.keys(optionsMap).forEach(category => {
    optionsMap[category].sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: 'base'
      })
    );
  });

  allPartsIndex.sort((a, b) =>
    a.part.localeCompare(b.part, undefined, {
      numeric: true,
      sensitivity: 'base'
    })
  );
}

function calculateBoxes() {
  const partNumber = document.getElementById('selectedPart').value.trim().toUpperCase();
  const quantity = parseFloat(document.getElementById('quantity').value);

  if (!partNumber || !quantity) return null;

  const partData = partsDB[partNumber];

  if (!partData || !partData.pack) return null;

  return quantity / partData.pack;
}

function addEntry() {
  const rack = document.getElementById('rack').value;
  const partNumber = document.getElementById('selectedPart').value.trim().toUpperCase();
  const quantity = document.getElementById('quantity').value;

  if (!rack || !partNumber || !quantity) {
    M.toast({
      html: 'Por favor llena todos los campos',
      classes: 'orange lighten-1',
      displayLength: 2000
    });

    return;
  }

  const boxes = calculateBoxes();
  const boxesText = boxes ? ` | Cajas: ${boxes.toFixed(2)}` : '';

  const text = `${rack} ${partNumber} ${quantity}${boxesText}`;

  const li = document.createElement('li');
  li.className = 'collection-item';
  li.innerText = text;

  li.appendChild(createDeleteButton(li));

  const entryList = document.getElementById('entry-list');
  entryList.insertBefore(li, entryList.firstChild);

  saveEntriesToLocalStorage();

  M.toast({
    html: `Agregado <strong>${rack} ${partNumber} (${quantity})</strong>`,
    classes: 'green lighten-1',
    displayLength: 2000
  });

  selectedPart = '';

  document.getElementById('selectedPart').value = '';
  document.getElementById('quantity').value = '';

  M.updateTextFields();
}

function getFormattedTimestamp() {
  const now = new Date();

  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 8).replace(/:/g, '-');

  return `${date}_${time}`;
}

function generateCSV() {
  const entryList = document.getElementById('entry-list');

  let csvContent = 'Localizacion,Numero De Parte,Cantidad\n';

  Array.from(entryList.children).forEach(li => {
    const text = li.childNodes[0].nodeValue.trim();
    const values = text.split(' ');

    if (values.length >= 3) {
      csvContent += `${values[0]},${values[1]},${values[2]}\n`;
    }
  });

  return csvContent;
}

function downloadData() {
  const csvContent = generateCSV();
  const filename = `Ajuste_${getFormattedTimestamp()}.csv`;

  const blob = new Blob([csvContent], {
    type: 'text/csv'
  });

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
  const csvContent = generateCSV();

  const filename = `Ajuste_${getFormattedTimestamp()}.csv`;

  const blob = new Blob([csvContent], {
    type: 'text/csv'
  });

  const file = new File([blob], filename, {
    type: 'text/csv'
  });

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Ajuste File',
        text: 'Archivo generado',
        files: [file]
      });

      M.toast({
        html: 'Compartido archivo',
        classes: 'green'
      });

      return;
    } catch (err) {
      console.log('File share failed, trying fallback...');
    }
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Ajuste Data',
        text: csvContent.substring(0, 2000)
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

  downloadData();

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
    .slice(0, 100);

  matches.forEach(({ part }) => {
    const li = document.createElement('li');

    li.className = 'collection-item modal-close';
    li.innerText = part;

    li.onclick = () => selectPartFromModal(part);

    resultsList.appendChild(li);
  });
}

function selectPartFromModal(partNumber) {
  selectedPart = partNumber;

  document.getElementById('selectedPart').value = partNumber;

  const qty = document.getElementById('quantity');

  setTimeout(() => {
    qty.focus();
    qty.select();
  }, 100);

  document.getElementById('modalPartSearch').value = '';
  document.getElementById('modalSearchResults').innerHTML = '';

  M.updateTextFields();

  if (partSearchModalInstance) {
    partSearchModalInstance.close();
  }
}

function saveEntriesToLocalStorage() {
  const entryList = document.getElementById('entry-list');

  const entries = Array.from(entryList.children).map(
    li => li.childNodes[0].nodeValue.trim()
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function loadEntriesFromLocalStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) return;

  const entryList = document.getElementById('entry-list');

  JSON.parse(stored).forEach(text => {
    const li = document.createElement('li');

    li.className = 'collection-item';
    li.innerText = text;

    li.appendChild(createDeleteButton(li));

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
    const parts = text.split(/\s+/);

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
    li.innerHTML =
      `<strong>${part}</strong>` +
      `<span class="right">${qty}</span>`;

    totalsList.appendChild(li);
  });

  grandTotalEl.textContent = grandTotal;
}