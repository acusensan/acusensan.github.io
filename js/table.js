let deleteTarget = null;
let currentIndex = 0;
let allParts = [];
let groupedData = {};
let orderedLocations = [];
window.checkedState = {};
const STORAGE_KEY = "verificar_data2";
document.addEventListener('DOMContentLoaded', () => {
    if (window.M) {
        M.Modal.init(document.querySelectorAll('.modal'));
        M.Sidenav.init(document.querySelectorAll('.sidenav'));
    }
    allParts = [...new Set([...Object.keys(window.partsDB || {}), ...Object.keys(window.hilosDB || {})])].sort((a, b) => a.localeCompare(b, undefined, {
        numeric: true
    }));
    bindEvents();
    loadData();
    render();
});

function bindEvents() {
    document.getElementById('csvFile').addEventListener('change', importCSV);
    document.getElementById('add-location-btn').addEventListener('click', addLocation);
    const quickLocationToggle = document.getElementById('quickLocationToggle');
    if (quickLocationToggle) quickLocationToggle.addEventListener('click', () => {
        const control = document.getElementById('newLocationControl');
        const isOpen = control.classList.toggle('is-open');
        quickLocationToggle.setAttribute('aria-expanded', String(isOpen));
        quickLocationToggle.textContent = isOpen ? 'Cerrar' : '+ Ubicacion';
        if (isOpen) document.getElementById('new-location').focus();
    });
    document.getElementById('new-location').addEventListener('keydown', e => {
        if (e.key === 'Enter') addLocation();
    });
    document.getElementById('backBtn').addEventListener('click', () => moveLocation(-1));
    document.getElementById('nextBtn').addEventListener('click', () => moveLocation(1));
    document.getElementById('locationPickerBtn').addEventListener('click', openLocationPicker);
    document.getElementById('locationSearch').addEventListener('input', renderLocationList);
    document.getElementById('partSearch').addEventListener('input', renderPartResults);
    document.getElementById('partSearch').addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            const first = document.querySelector('.part-result');
            if (first) {
                e.preventDefault();
                first.click();
            } else if (document.getElementById('partQty').value) addPart();
        }
    });
    document.getElementById('partQty').addEventListener('keydown', e => {
        if (e.key === 'Enter') addPart();
    });
    document.getElementById('addPartBtn').addEventListener('click', addPart);
    document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);
    document.getElementById('confirm-clear-btn').addEventListener('click', clearStoredData);
}

function toast(html, classes = 'blue') {
    if (window.M) M.toast({
        html,
        classes,
        displayLength: 2200
    });
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        groupedData,
        orderedLocations,
        checkedState: window.checkedState
    }));
}

function loadData() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        if (saved) {
            groupedData = saved.groupedData || {};
            orderedLocations = saved.orderedLocations || [];
            window.checkedState = saved.checkedState || {};
        }
        sanitizeState();
    } catch (error) {
        console.error('Could not load verification data', error);
        localStorage.removeItem(STORAGE_KEY);
    }
}

function sanitizeState() {
    orderedLocations = orderedLocations.filter(loc => Array.isArray(groupedData[loc]));
    if (currentIndex >= orderedLocations.length) currentIndex = Math.max(0, orderedLocations.length - 1);
    orderedLocations.forEach(loc => {
        if (!Array.isArray(window.checkedState[loc])) window.checkedState[loc] = [];
        while (window.checkedState[loc].length < groupedData[loc].length) window.checkedState[loc].push(false);
        window.checkedState[loc] = window.checkedState[loc].slice(0, groupedData[loc].length);
    });
}

function render() {
    sanitizeState();
    const hasLocations = orderedLocations.length > 0;
    document.getElementById('emptyState').hidden = hasLocations;
    document.getElementById('verificationWorkspace').hidden = !hasLocations;
    if (!hasLocations) {
        updateOverallProgress();
        return;
    }
    const loc = orderedLocations[currentIndex],
        items = groupedData[loc] || [],
        checks = window.checkedState[loc] || [],
        done = checks.filter(Boolean).length;
    document.getElementById('currentLocation').textContent = loc;
    document.getElementById('locationDone').textContent = done;
    document.getElementById('locationTotal').textContent = `de ${items.length}`;
    const progress = document.getElementById('locationProgressBar');
    progress.max = Math.max(items.length, 1);
    progress.value = done;
    document.getElementById('locationPosition').textContent = `${currentIndex+1} de ${orderedLocations.length}`;
    document.getElementById('backBtn').disabled = currentIndex === 0;
    document.getElementById('nextBtn').disabled = currentIndex === orderedLocations.length - 1;
    renderRows(loc, items);
    updateOverallProgress();
}

function renderRows(loc, items) {
    const body = document.getElementById('verificationRows');
    body.innerHTML = '';
    items.forEach(([part, qty], index) => {
        const tr = document.createElement('tr');
        if (window.checkedState[loc][index]) tr.classList.add('done');
        const partTd = document.createElement('td');
        partTd.className = 'part-number';
        partTd.textContent = part;
        partTd.onclick = () => makeEditable(partTd, loc, index, 0);
        const qtyTd = document.createElement('td');
        qtyTd.textContent = qty;
        qtyTd.onclick = () => makeEditable(qtyTd, loc, index, 1);
        const packTd = document.createElement('td');
        packTd.className = 'pack-value';
        const pack = Number((window.partsDB || {})[part]?.pack),
            amount = Number(qty);
        packTd.textContent = pack > 0 && Number.isFinite(amount) ? (amount / pack).toFixed(2) : '—';
        const statusTd = document.createElement('td');
        statusTd.textContent = window.checkedState[loc][index] ? 'Verificado' : 'Pendiente';
        const actionTd = document.createElement('td');
        actionTd.className = 'row-actions';
        const done = document.createElement('button');
        done.className = window.checkedState[loc][index] ? 'undo-btn' : 'done-btn';
        done.textContent = window.checkedState[loc][index] ? 'Deshacer' : '✓ Verificar';
        done.onclick = () => {
            window.checkedState[loc][index] = !window.checkedState[loc][index];
            saveData();
            render();
        };
        const del = document.createElement('button');
        del.className = 'delete-btn';
        del.textContent = 'Eliminar';
        del.onclick = () => requestDelete(loc, index);
        actionTd.append(done, del);
        tr.append(partTd, qtyTd, packTd, statusTd, actionTd);
        body.append(tr);
    });
}

function updateOverallProgress() {
    let total = 0,
        done = 0;
    orderedLocations.forEach(loc => {
        total += (groupedData[loc] || []).length;
        done += (window.checkedState[loc] || []).filter(Boolean).length;
    });
    document.getElementById('overallDone').textContent = done;
    document.getElementById('overallTotal').textContent = `de ${total} verificados`;
}

function makeEditable(td, loc, row, col) {
    if (td.querySelector('input')) return;
    const original = td.textContent,
        input = document.createElement('input');
    input.className = 'editable-input';
    input.value = original;
    td.textContent = '';
    td.append(input);
    input.focus();
    input.select();
    let saved = false;
    const commit = () => {
        if (saved) return;
        saved = true;
        const value = input.value.trim();
        if (value) groupedData[loc][row][col] = value;
        saveData();
        render();
    };
    input.addEventListener('blur', commit);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') input.blur();
        if (e.key === 'Escape') {
            saved = true;
            render();
        }
    });
}

function addLocation() {
    const input = document.getElementById('new-location'),
        loc = input.value.trim().toUpperCase();
    if (!loc) {
        toast('Escribe una ubicacion', 'orange');
        return;
    }
    if (groupedData[loc]) {
        currentIndex = orderedLocations.indexOf(loc);
        input.value = '';
        render();
        toast('La ubicacion ya existe', 'blue-grey');
        return;
    }
    groupedData[loc] = [];
    window.checkedState[loc] = [];
    orderedLocations.push(loc);
    orderedLocations.sort((a, b) => a.localeCompare(b, undefined, {
        numeric: true
    }));
    currentIndex = orderedLocations.indexOf(loc);
    input.value = '';
    const mobileControl = document.getElementById('newLocationControl');
    const mobileToggle = document.getElementById('quickLocationToggle');
    if (mobileControl) mobileControl.classList.remove('is-open');
    if (mobileToggle) {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.textContent = '+ Ubicacion';
    }
    saveData();
    render();
    toast(`Ubicacion ${loc} agregada`, 'green');
}

function moveLocation(direction) {
    const next = currentIndex + direction;
    if (next < 0 || next >= orderedLocations.length) return;
    currentIndex = next;
    render();
    document.getElementById('partSearch').focus();
}

function openLocationPicker() {
    document.getElementById('locationSearch').value = '';
    renderLocationList();
    M.Modal.getInstance(document.getElementById('location-modal')).open();
    setTimeout(() => document.getElementById('locationSearch').focus(), 150);
}

function renderLocationList() {
    const query = document.getElementById('locationSearch').value.trim().toLowerCase(),
        list = document.getElementById('locationList');
    list.innerHTML = '';
    orderedLocations.forEach((loc, index) => {
        if (query && !loc.toLowerCase().includes(query)) return;
        const button = document.createElement('button');
        button.className = `location-option${index===currentIndex?' active':''}`;
        const count = (window.checkedState[loc] || []).filter(Boolean).length,
            total = (groupedData[loc] || []).length;
        const name = document.createElement('strong');
        name.textContent = loc;
        const status = document.createElement('small');
        status.textContent = `${count}/${total}`;
        button.append(name, status);
        button.onclick = () => {
            currentIndex = index;
            M.Modal.getInstance(document.getElementById('location-modal')).close();
            render();
        };
        list.append(button);
    });
}

function renderPartResults() {
    const query = document.getElementById('partSearch').value.trim().toLowerCase(),
        results = document.getElementById('partSearchResults');
    results.innerHTML = '';
    if (!query) return;
    allParts.filter(part => part.toLowerCase().includes(query)).slice(0, 20).forEach(part => {
        const button = document.createElement('button');
        button.className = 'part-result';
        const strong = document.createElement('strong');
        strong.textContent = part;
        const small = document.createElement('small');
        small.textContent = (window.partsDB || {})[part]?.line || (window.hilosDB || {})[part]?.calibre || '';
        button.append(strong, small);
        button.onclick = () => {
            document.getElementById('partSearch').value = part;
            results.innerHTML = '';
            document.getElementById('partQty').focus();
        };
        results.append(button);
    });
}

function addPart() {
    if (!orderedLocations.length) return;
    const partInput = document.getElementById('partSearch'),
        qtyInput = document.getElementById('partQty'),
        part = partInput.value.trim().toUpperCase(),
        qty = qtyInput.value.trim();
    if (!part || !qty || Number(qty) <= 0) {
        toast('Completa una parte y cantidad valida', 'orange');
        return;
    }
    const loc = orderedLocations[currentIndex];
    groupedData[loc].push([part, qty]);
    window.checkedState[loc].push(false);
    partInput.value = '';
    qtyInput.value = '';
    document.getElementById('partSearchResults').innerHTML = '';
    saveData();
    render();
    partInput.focus();
    toast(`${part} agregado a ${loc}`, 'green');
}

function requestDelete(loc, index) {
    deleteTarget = {
        loc,
        index
    };
    const [part, qty] = groupedData[loc][index];
    document.getElementById('delete-text').textContent = `Eliminar ${part}, cantidad ${qty}, de ${loc}.`;
    M.Modal.getInstance(document.getElementById('delete-modal')).open();
}

function confirmDelete() {
    if (!deleteTarget) return;
    const {
        loc,
        index
    } = deleteTarget;
    groupedData[loc].splice(index, 1);
    window.checkedState[loc].splice(index, 1);
    deleteTarget = null;
    saveData();
    render();
    M.Modal.getInstance(document.getElementById('delete-modal')).close();
    toast('Material eliminado', 'red lighten-1');
}

function parseCSVLine(line) {
    const result = [];
    let value = '',
        quoted = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (quoted && line[i + 1] === '"') {
                value += '"';
                i++;
            } else quoted = !quoted;
        } else if ((ch === ',' || ch === ';' || ch === '\t') && !quoted) {
            result.push(value.trim());
            value = '';
        } else value += ch;
    }
    result.push(value.trim());
    return result;
}

function importCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        const nextData = {},
            nextOrder = [],
            nextChecks = {};
        String(reader.result).split(/\r?\n/).slice(1).forEach(line => {
            const [locRaw, partRaw, qtyRaw] = parseCSVLine(line);
            const loc = (locRaw || '').trim(),
                part = (partRaw || '').trim(),
                qty = (qtyRaw || '').trim();
            if (!loc || !part || !qty) return;
            if (!nextData[loc]) {
                nextData[loc] = [];
                nextOrder.push(loc);
                nextChecks[loc] = [];
            }
            nextData[loc].push([part, qty]);
            nextChecks[loc].push(false);
        });
        if (!nextOrder.length) {
            toast('El archivo no contiene filas validas', 'red');
            return;
        }
        groupedData = nextData;
        orderedLocations = nextOrder.sort((a, b) => a.localeCompare(b, undefined, {
            numeric: true
        }));
        window.checkedState = nextChecks;
        currentIndex = 0;
        saveData();
        render();

        // Close the settings form after a successful CSV import.
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal && window.M) {
            M.Modal.getInstance(settingsModal)?.close();
        }

        // Confirm the successful import and allow the same file to be selected again.
        toast(`${orderedLocations.length} ubicaciones importadas correctamente`, 'green');
        event.target.value = '';
    };
    reader.readAsText(file);
}

function csvCell(value) {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g,'""')}"` : text;
}

function generateCSV() {
    return ['Location,Part,Qty', ...orderedLocations.flatMap(loc => (groupedData[loc] || []).map(([part, qty]) => [loc, part, qty].map(csvCell).join(',')))].join('\n');
}

function createCSV() {
    const now = new Date(),
        pad = n => String(n).padStart(2, '0'),
        filename = `verificar_${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}.csv`,
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

function downloadCSV() {
    const {
        filename,
        blob
    } = createCSV(), url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`Descargado: ${filename}`, 'blue');
}
async function shareCSV() {
    const data = createCSV();
    try {
        if (navigator.canShare && navigator.canShare({
                files: [data.file]
            })) {
            await navigator.share({
                title: 'Verificar',
                text: 'Archivo de verificacion',
                files: [data.file]
            });
            toast('Archivo compartido', 'green');
            return;
        }
    } catch (error) {
        if (error.name === 'AbortError') return;
    }
    toast('Compartir no disponible; se descargara el archivo', 'orange');
    downloadCSV();
}

function clearStoredData() {
    localStorage.removeItem(STORAGE_KEY);
    groupedData = {};
    orderedLocations = [];
    window.checkedState = {};
    currentIndex = 0;
    render();
    M.Modal.getInstance(document.getElementById('clear-modal')).close();
	M.Modal.getInstance(document.getElementById('settings-modal')).close();
    toast('Datos eliminados', 'red');
	
}