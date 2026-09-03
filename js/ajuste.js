let allPartsIndex = [];
let partSearchModalInstance = null;
let itemToDelete = null;
const STORAGE_KEY = 'ajuste_entries';
const rackRanges = {
    'Rack 1': [121, 140],
    'Rack 2': [221, 240],
    'Rack 3': [303, 304],
    'Rack 4': ['Bodpatio', 'Pisopc', 'Velcros', 'Produccion', 'Caja']
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.M) {
        M.updateTextFields();
        M.Sidenav.init(document.querySelectorAll('.sidenav'));
        M.Modal.init(document.querySelectorAll('.modal'));
    }
    buildPartIndex();
    updateRackOptions();
    loadEntriesFromLocalStorage();
    if (mobileCaptureQuery.matches) document.getElementById('capture-panel').setAttribute('aria-hidden', 'true');
    partSearchModalInstance = M.Modal.getInstance(document.getElementById('part-search-modal'));
    const selectedPart = document.getElementById('selectedPart');
    selectedPart.addEventListener('input', e => {
        e.target.value = e.target.value.toUpperCase();
        renderInlinePartResults();
    });
    selectedPart.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            const first = document.querySelector('#partSearchResults .part-result');
            if (first) { e.preventDefault(); first.click(); }
            else if (document.getElementById('quantity').value) { e.preventDefault(); addEntry(); }
        }
        if (e.key === 'Escape') document.getElementById('partSearchResults').innerHTML = '';
    });
    document.getElementById('addEntryBtn').addEventListener('click', addEntry);
    document.addEventListener('click', e => {
        if (!e.target.closest('.part-search-field')) document.getElementById('partSearchResults').innerHTML = '';
    });
    document.getElementById('quantity').addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addEntry();
        }
    });
    document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);
    document.getElementById('confirm-clear-btn').addEventListener('click', confirmClear);
    document.getElementById('modalPartSearch').addEventListener('input', modalSearchParts);
    document.getElementById('exportPreviewSearch').addEventListener('input', renderExportPreviewRows);
    document.getElementById('repeat-last-button').addEventListener('click', requestRepeatLastEntry);
    document.getElementById('confirm-repeat-btn').addEventListener('click', confirmRepeatLastEntry);
    document.getElementById('open-capture-button').addEventListener('click', openCaptureSheet);
    document.getElementById('close-capture-button').addEventListener('click', closeCaptureSheet);
    document.getElementById('capture-backdrop').addEventListener('click', closeCaptureSheet);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && document.getElementById('capture-panel').classList.contains('is-open')) {
            closeCaptureSheet();
        }
    });
});

const mobileCaptureQuery = window.matchMedia('(max-width: 600px)');
let captureSheetReturnFocus = null;

function openCaptureSheet() {
    if (!mobileCaptureQuery.matches) return;

    const panel = document.getElementById('capture-panel');
    const backdrop = document.getElementById('capture-backdrop');
    const trigger = document.getElementById('open-capture-button');

    captureSheetReturnFocus = document.activeElement;
    panel.classList.add('is-open');
    backdrop.classList.add('is-open');
    document.body.classList.add('sheet-open');
    panel.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');

    setTimeout(() => document.getElementById('selectedPart').focus(), 220);
}

function closeCaptureSheet(options = {}) {
    const panel = document.getElementById('capture-panel');
    const backdrop = document.getElementById('capture-backdrop');
    const trigger = document.getElementById('open-capture-button');

    panel.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    document.body.classList.remove('sheet-open');
    trigger.setAttribute('aria-expanded', 'false');

    if (mobileCaptureQuery.matches) panel.setAttribute('aria-hidden', 'true');
    else panel.setAttribute('aria-hidden', 'false');

    if (options.restoreFocus !== false) {
        const target = captureSheetReturnFocus && captureSheetReturnFocus.isConnected
            ? captureSheetReturnFocus
            : trigger;
        setTimeout(() => target.focus(), 210);
    }
}

function scrollRecordsToNewest() {
    const list = document.getElementById('entry-list');
    if (!list) return;
    requestAnimationFrame(() => list.scrollTo({ top: 0, left: 0, behavior: 'smooth' }));
}

mobileCaptureQuery.addEventListener?.('change', event => {
    if (!event.matches) closeCaptureSheet({ restoreFocus: false });
    else document.getElementById('capture-panel').setAttribute('aria-hidden', 'true');
});

function toast(html, classes = 'blue') {
    if (window.M) M.toast({
        html,
        classes,
        displayLength: 2000
    });
}

function buildPartIndex() {
    allPartsIndex = [];
    if (window.partsDB) Object.entries(window.partsDB).forEach(([part, data]) => allPartsIndex.push({
        part,
        category: String(data.line || 'PARTES').toUpperCase(),
        type: 'PARTS'
    }));
    if (window.hilosDB) Object.keys(window.hilosDB).forEach(part => allPartsIndex.push({
        part,
        category: 'HILOS',
        type: 'HILOS'
    }));
    allPartsIndex.sort((a, b) => a.part.localeCompare(b.part, undefined, {
        numeric: true,
        sensitivity: 'base'
    }));
}

function updateRackOptions() {
    const section = document.getElementById('section').value,
        select = document.getElementById('rack'),
        range = rackRanges[section];
    select.innerHTML = '';
    if (typeof range[0] === 'number') {
        for (let i = range[0]; i <= range[1]; i++) select.add(new Option(`APC0${i}`, `APC0${i}`));
    } else range.forEach(value => select.add(new Option(value, value)));
    updateRackPosition();
}

function updateRackPosition() {
    const select = document.getElementById('rack'),
        status = document.getElementById('rack-position');
    status.textContent = select.options.length ? `${select.selectedIndex+1} de ${select.options.length}` : '';
}

function changeRack(direction) {
    const select = document.getElementById('rack'),
        next = select.selectedIndex + direction;
    if (next >= 0 && next < select.options.length) {
        select.selectedIndex = next;
        updateRackPosition();
    } else toast(direction < 0 ? 'Ya estas en la primera ubicacion' : 'Ya estas en la ultima ubicacion', 'blue-grey');
}

function calculateBoxes(part, quantity) {
    const data = window.partsDB && window.partsDB[part];
    return data && Number(data.pack) > 0 ? quantity / Number(data.pack) : null;
}

let entryPendingRepeat = null;

function requestRepeatLastEntry() {
    const lastItem = document.querySelector('#entry-list .record-item');

    if (!lastItem) {
        toast('No hay un registro anterior para repetir', 'blue-grey');
        return;
    }

    entryPendingRepeat = JSON.parse(lastItem.dataset.entry);
    document.getElementById('repeat-confirm-rack').textContent = entryPendingRepeat.rack;
    document.getElementById('repeat-confirm-part').textContent = entryPendingRepeat.part;
    document.getElementById('repeat-confirm-quantity').textContent = entryPendingRepeat.quantity;

    const modal = M.Modal.getInstance(document.getElementById('repeat-confirm-modal'));
    modal.open();
}

function confirmRepeatLastEntry() {
    if (!entryPendingRepeat) {
        M.Modal.getInstance(document.getElementById('repeat-confirm-modal')).close();
        return;
    }

    const entry = {
        ...entryPendingRepeat,
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`
    };

    renderEntry(entry, true);
    saveEntriesToLocalStorage();
    scrollRecordsToNewest();
    entryPendingRepeat = null;

    M.Modal.getInstance(document.getElementById('repeat-confirm-modal')).close();
    toast(`Registro repetido: <strong>${entry.rack} ${entry.part} (${entry.quantity})</strong>`, 'green darken-1');
}

function addEntry() {
    const rack = document.getElementById('rack').value,
        part = document.getElementById('selectedPart').value.trim().toUpperCase(),
        quantity = Number(document.getElementById('quantity').value);
    if (!rack || !part || !Number.isFinite(quantity) || quantity <= 0) {
        toast('Completa la ubicacion, parte y una cantidad valida', 'orange darken-1');
        return;
    }
    const boxes = calculateBoxes(part, quantity),
        entry = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            rack,
            part,
            quantity,
            boxes
        };
    renderEntry(entry, true);
    saveEntriesToLocalStorage();
    document.getElementById('selectedPart').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('partSearchResults').innerHTML = '';
    M.updateTextFields();
    scrollRecordsToNewest();
    if (mobileCaptureQuery.matches) closeCaptureSheet();
    else document.getElementById('selectedPart').focus();
    toast(`Agregado: <strong>${rack} ${part} (${quantity})</strong>`, 'green darken-1');
}

function renderEntry(entry, prepend = false) {
    const li = document.createElement('li');
    li.className = 'record-item';
    li.dataset.entry = JSON.stringify(entry);
    const main = document.createElement('div');
    main.className = 'record-main';
    const location = document.createElement('span');
    location.className = 'record-location';
    location.textContent = entry.rack;
    const copy = document.createElement('span');
    copy.className = 'record-copy';
    const title = document.createElement('strong');
    title.textContent = entry.part;
    const detail = document.createElement('small');
    detail.textContent = `Cantidad: ${entry.quantity}${entry.boxes?` · Cajas: ${Number(entry.boxes).toFixed(2)}`:''}`;
    copy.append(title, detail);
    main.append(location, copy);
    const button = document.createElement('button');
    button.className = 'delete-record';
    button.type = 'button';
    button.textContent = 'Eliminar';
    button.setAttribute('aria-label', `Eliminar ${entry.part} de ${entry.rack}`);
    button.onclick = () => {
        itemToDelete = li;
        M.Modal.getInstance(document.getElementById('delete-confirm-modal')).open();
    };
    li.append(main, button);
    const list = document.getElementById('entry-list');
    prepend ? list.prepend(li) : list.append(li);
    updateRecordState();
}

function confirmDelete() {
    if (itemToDelete) {
        itemToDelete.remove();
        itemToDelete = null;
        saveEntriesToLocalStorage();
        toast('Registro eliminado', 'red lighten-1');
    }
    M.Modal.getInstance(document.getElementById('delete-confirm-modal')).close();
}

function getEntries() {
    return [...document.querySelectorAll('#entry-list .record-item')].map(li => JSON.parse(li.dataset.entry));
}

function saveEntriesToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getEntries()));
    updateRecordState();
}

function loadEntriesFromLocalStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        updateRecordState();
        return;
    }
    try {
        const parsed = JSON.parse(raw);
        parsed.forEach(item => {
            if (typeof item === 'string') {
                const parts = item.split(/\s+/);
                renderEntry({
                    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
                    rack: parts[0],
                    part: parts[1],
                    quantity: Number(parts[2]),
                    boxes: null
                });
            } else renderEntry(item);
        });
        saveEntriesToLocalStorage();
    } catch (error) {
        console.error('Could not load adjustment entries', error);
        localStorage.removeItem(STORAGE_KEY);
        updateRecordState();
    }
}

function updateRecordState() {
    const count = document.querySelectorAll('#entry-list .record-item').length;
    document.getElementById('entry-count').textContent = count;
    document.getElementById('empty-records').hidden = count > 0;
    const repeatButton = document.getElementById('repeat-last-button');
    if (repeatButton) repeatButton.disabled = count === 0;
}

function clearAllEntries() {
    if (!getEntries().length) {
        toast('No hay registros para limpiar', 'blue-grey');
        return;
    }
    M.Modal.getInstance(document.getElementById('clear-confirm-modal')).open();
	
}

function confirmClear() {
    document.getElementById('entry-list').innerHTML = '';
    localStorage.removeItem(STORAGE_KEY);
    updateRecordState();
    M.Modal.getInstance(document.getElementById('clear-confirm-modal')).close();
    toast('Lista limpiada', 'grey darken-1');
	M.Modal.getInstance(document.getElementById('settings-modal')).close();
}

function showExportPreview() {
    const search = document.getElementById('exportPreviewSearch');
    search.value = '';
    renderExportPreviewRows();
    setTimeout(() => search.focus(), 180);
}

function renderExportPreviewRows() {
    const entries = getEntries();
    const query = document.getElementById('exportPreviewSearch').value.trim().toLowerCase();
    const filteredEntries = query
        ? entries.filter(entry => String(entry.part).toLowerCase().includes(query))
        : entries;
    const list = document.getElementById('export-preview-list');
    const empty = document.getElementById('export-preview-empty');
    list.innerHTML = '';

    filteredEntries.forEach(entry => {
        const row = document.createElement('div');
        row.className = 'export-form-row';

        const location = document.createElement('output');
        location.setAttribute('aria-label', 'Localizacion');
        location.textContent = entry.rack;

        const part = document.createElement('output');
        part.setAttribute('aria-label', 'Numero de parte');
        part.textContent = entry.part;

        const quantity = document.createElement('output');
        quantity.setAttribute('aria-label', 'Cantidad');
        quantity.textContent = entry.quantity;

        row.append(location, part, quantity);
        list.append(row);
    });

    empty.hidden = filteredEntries.length > 0;
    empty.textContent = entries.length && query
        ? 'No se encontraron numeros de parte.'
        : 'No hay registros para mostrar.';
    document.getElementById('preview-row-count').textContent = filteredEntries.length;
    document.getElementById('preview-filename').textContent = `Ajuste_${getFormattedTimestamp()}.csv`;
}

function showTotals() {
    const totals = {};
    let grand = 0;
    getEntries().forEach(({
        part,
        quantity
    }) => {
        totals[part] = (totals[part] || 0) + Number(quantity);
        grand += Number(quantity);
    });
    const list = document.getElementById('totals-list');
    list.innerHTML = '';
    Object.entries(totals).sort(([a], [b]) => a.localeCompare(b, undefined, {
        numeric: true
    })).forEach(([part, qty]) => {
        const li = document.createElement('li');
        li.className = 'collection-item';
        const strong = document.createElement('strong');
        strong.textContent = part;
        const span = document.createElement('span');
        span.className = 'right';
        span.textContent = qty;
        li.append(strong, span);
        list.append(li);
    });
    if (!Object.keys(totals).length) {
        const li = document.createElement('li');
        li.className = 'collection-item';
        li.textContent = 'No hay registros.';
        list.append(li);
    }
    document.getElementById('grand-total').textContent = grand;
}

function csvCell(value) {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g,'""')}"` : text;
}

function generateCSV() {
    return ['Localizacion,Numero De Parte,Cantidad', ...getEntries().map(e => [e.rack, e.part, e.quantity].map(csvCell).join(','))].join('\n');
}

function getFormattedTimestamp() {
    const now = new Date(),
        pad = n => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

function createCSVFile() {
    const filename = `Ajuste_${getFormattedTimestamp()}.csv`,
        blob = new Blob(['\ufeff', generateCSV()], {
            type: 'text/csv;charset=utf-8'
        });
    return {
        filename,
        blob,
        file: new File([blob], filename, {
            type: 'text/csv'
        })
    };
}

function downloadData() {
    const {
        filename,
        blob
    } = createCSVFile(), url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`Descargado: ${filename}`, 'blue');
}
async function shareData() {
    const data = createCSVFile();
    try {
        if (navigator.canShare && navigator.canShare({
                files: [data.file]
            })) {
            await navigator.share({
                title: 'Ajuste',
                text: 'Archivo de ajuste',
                files: [data.file]
            });
            toast('Archivo compartido', 'green');
            return;
        }
        if (navigator.share) {
            await navigator.share({
                title: 'Ajuste',
                text: generateCSV().slice(0, 2000)
            });
            toast('Datos compartidos', 'green');
            return;
        }
    } catch (error) {
        if (error.name === 'AbortError') return;
    }
    downloadData();
}

function renderInlinePartResults() {
    const input = document.getElementById('selectedPart');
    const query = input.value.trim().toLowerCase();
    const results = document.getElementById('partSearchResults');
    results.innerHTML = '';
    if (!query) return;
    allPartsIndex.filter(item => item.part.toLowerCase().includes(query)).slice(0, 20).forEach(item => {
        const button = document.createElement('button');
        button.className = 'part-result';
        button.type = 'button';
        const strong = document.createElement('strong');
        strong.textContent = item.part;
        const small = document.createElement('small');
        small.textContent = item.category;
        button.append(strong, small);
        button.onclick = () => {
            input.value = item.part;
            results.innerHTML = '';
            document.getElementById('quantity').focus();
        };
        results.append(button);
    });
}
function modalSearchParts() {
    const query = document.getElementById('modalPartSearch').value.trim().toLowerCase(),
        list = document.getElementById('modalSearchResults'),
        hint = document.getElementById('search-hint');
    list.innerHTML = '';
    if (!query) {
        hint.textContent = 'Escribe al menos un caracter para buscar.';
        return;
    }
    const matches = allPartsIndex.filter(item => item.part.toLowerCase().includes(query)).slice(0, 75);
    hint.textContent = matches.length ? `${matches.length} resultado${matches.length===1?'':'s'}${matches.length===75?' (mostrando los primeros 75)':''}` : 'No se encontraron coincidencias.';
    matches.forEach(item => {
        const li = document.createElement('li');
        li.className = 'search-result modal-close';
        li.tabIndex = 0;
        const strong = document.createElement('strong');
        strong.textContent = item.part;
        const small = document.createElement('small');
        small.textContent = item.category;
        li.append(strong, small);
        li.onclick = () => selectPartFromModal(item.part);
        li.onkeydown = e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectPartFromModal(item.part);
            }
        };
        list.append(li);
    });
}

function selectPartFromModal(part) {
    document.getElementById('selectedPart').value = part;
    document.getElementById('modalPartSearch').value = '';
    document.getElementById('modalSearchResults').innerHTML = '';
    M.updateTextFields();
    if (partSearchModalInstance) partSearchModalInstance.close();
    setTimeout(() => document.getElementById('quantity').focus(), 100);
}