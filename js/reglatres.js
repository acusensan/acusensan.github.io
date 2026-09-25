const STORAGE_KEY = 'reglaTresHistory';
const EXPORT_NAME_KEY = 'reglaTresExportName';
let historyData = [];
let partsData = [];
let historyEditIndex = null;
let historyDeleteIndex = null;
document.addEventListener('DOMContentLoaded', () => {
    if (window.M) {
        M.Modal.init(document.querySelectorAll('.modal'));
        M.Sidenav.init(document.querySelectorAll('.sidenav'));
    }
    loadHistory();
    buildPartsData();
    bindEvents();
    renderHistory();
    updateCalculationState();
});

function toast(html, classes = 'blue') {
    if (window.M) M.toast({
        html,
        classes,
        displayLength: 2200
    });
}

function loadHistory() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        historyData = Array.isArray(saved) ? saved : [];
    } catch (error) {
        historyData = [];
        localStorage.removeItem(STORAGE_KEY);
    }
}

function saveHistory() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historyData));
}

function buildPartsData() {
    if (!window.partsDB) {
        console.error('partsDB not loaded');
        toast('No se pudo cargar la base de partes', 'red');
        return;
    }
    partsData = Object.entries(window.partsDB).sort(([a], [b]) => a.localeCompare(b, undefined, {
        numeric: true
    })).map(([partNumber, part]) => ({
        partNumber,
        line: part.line ?? 'Sin linea',
        description: part.description ?? '',
        piecesPerUnit: part.piecesPerUnit ?? part.pack ?? null,
        weight: part.weight ?? null
    }));
}

function bindEvents() {
    const partInput = document.getElementById('parte');
    partInput.addEventListener('input', event => {
        event.target.value = event.target.value.toUpperCase();
        renderPartResults();
        handlePartChange();
    });
    partInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            const first = document.querySelector('#partSearchResults .part-result');
            if (first) {
                event.preventDefault();
                first.click();
            }
        }
        if (event.key === 'Escape') closePartResults();
    });
    document.addEventListener('click', event => {
        if (!event.target.closest('.part-search-field')) closePartResults();
    });
    document.getElementById('userInput').addEventListener('input', updateCalculationState);
    document.getElementById('userInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') calcular();
    });
    document.getElementById('calculateBtn').addEventListener('click', calcular);
    document.getElementById('openTotalsBtn').addEventListener('click', renderTotals);
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', openClearModal);
    }
    document.getElementById('confirmClearHistory').addEventListener('click', confirmClearHistory);
    document.getElementById('saveHistoryEdit').addEventListener('click', saveHistoryEdit);
    document.getElementById('confirmDeleteHistory').addEventListener('click', confirmDeleteHistory);
    document.getElementById('editHistoryPart').addEventListener('input', event => {
        event.target.value = event.target.value.toUpperCase();
        document.getElementById('editHistoryError').hidden = true;
    });
    document.getElementById('editHistoryInput').addEventListener('keydown', event => {
        if (event.key === 'Enter') saveHistoryEdit();
    });
    const exportNameInput = document.getElementById('exportFileName');
    exportNameInput.value = localStorage.getItem(EXPORT_NAME_KEY) || 'regla_de_tres';
    exportNameInput.addEventListener('input', updateExportNamePreview);
    exportNameInput.addEventListener('change', saveExportName);
    updateExportNamePreview();
}

function closePartResults() {
    const results = document.getElementById('partSearchResults');
    const input = document.getElementById('parte');
    results.innerHTML = '';
    input.setAttribute('aria-expanded', 'false');
}
function renderPartResults() {
    const input = document.getElementById('parte');
    const query = input.value.trim().toLowerCase();
    const results = document.getElementById('partSearchResults');
    results.innerHTML = '';
    if (!query) {
        input.setAttribute('aria-expanded', 'false');
        return;
    }
    const matches = partsData
        .filter(part => part.partNumber.toLowerCase().includes(query))
        .slice(0, 20);
    matches.forEach(part => {
        const button = document.createElement('button');
        button.className = 'part-result';
        button.type = 'button';
        button.setAttribute('role', 'option');
        const strong = document.createElement('strong');
        strong.textContent = part.partNumber;
        const small = document.createElement('small');
        small.textContent = part.line || 'Sin linea';
        button.append(strong, small);
        button.addEventListener('click', () => {
            input.value = part.partNumber;
            closePartResults();
            handlePartChange();
        });
        results.append(button);
    });
    input.setAttribute('aria-expanded', String(matches.length > 0));
}
function selectedPart() {
    return partsData.find(part => part.partNumber === document.getElementById('parte').value);
}

function handlePartChange() {
    const part = selectedPart(),
        info = document.getElementById('info');
    info.innerHTML = '';
    if (!part) {
        info.hidden = true;
        updateCalculationState();
        return;
    }
    const values = [
        ['Descripcion', part.description || '—'],
        ['Piezas (Pack)', part.piecesPerUnit ?? '—'],
        ['Peso', part.weight ?? '—']
    ];
    values.forEach(([label, value]) => {
        const pair = document.createElement('div');
        pair.className = 'info-pair';
        const span = document.createElement('span'),
            strong = document.createElement('strong');
        span.textContent = label;
        strong.textContent = value;
        pair.append(span, strong);
        info.append(pair);
    });
    info.hidden = false;
    updateCalculationState();
    document.getElementById('userInput').focus();
}

function updateCalculationState() {
    const part = selectedPart(),
        value = Number(document.getElementById('userInput').value);
    document.getElementById('calculateBtn').disabled = !(part && part.piecesPerUnit != null && Number(part.weight) !== 0 && Number.isFinite(value) && value >= 0);
}

function calcular() {
    const part = selectedPart(),
        input = Number(document.getElementById('userInput').value);
    if (!part || part.piecesPerUnit == null || part.weight == null || Number(part.weight) === 0 || !Number.isFinite(input) || input < 0) {
        toast('No se puede calcular: revisa la parte y cantidad', 'orange');
        return;
    }
    const result = input * Number(part.piecesPerUnit) / Number(part.weight),
        formatted = result.toFixed(2);
    historyData.unshift({
        partNumber: part.partNumber,
        input,
        result: formatted,
        timestamp: new Date().toISOString()
    });
    saveHistory();
    renderHistory();
    clearCalculatorInputs();
    toast('Calculo guardado', 'green');
}
function clearCalculatorInputs() {
    const partInput = document.getElementById('parte');
    const quantityInput = document.getElementById('userInput');
    const info = document.getElementById('info');
    partInput.value = '';
    quantityInput.value = '';
    info.innerHTML = '';
    info.hidden = true;
    closePartResults();
    updateCalculationState();
    partInput.focus();
}

function renderHistory() {
    const container = document.getElementById('history'),
        empty = document.getElementById('emptyHistory');
    container.innerHTML = '';
    empty.hidden = historyData.length > 0;
    document.getElementById('historyCount').textContent = historyData.length;
    renderTotals();
    historyData.forEach(row => {
        const item = document.createElement('div');
        item.className = 'history-item';
        const copy = document.createElement('div'),
            part = document.createElement('strong'),
            meta = document.createElement('small'),
            result = document.createElement('div'),
            value = document.createElement('span'),
            unit = document.createElement('small');
        part.textContent = row.partNumber;
        meta.textContent = `Cantidad: ${row.input}${row.timestamp?` · ${new Date(row.timestamp).toLocaleString('es-MX',{dateStyle:'short',timeStyle:'short'})}`:''}`;
        value.textContent = row.result;
        unit.textContent = 'Piezas/YD';
        copy.append(part, meta);
        result.className = 'history-result';
        result.append(value, unit);
        const actions = document.createElement('div');
        actions.className = 'history-actions';
        const editButton = document.createElement('button');
        editButton.className = 'history-edit-button';
        editButton.type = 'button';
        editButton.textContent = 'Editar';
        editButton.setAttribute('aria-label', `Editar calculo de ${row.partNumber}`);
        editButton.addEventListener('click', () => openHistoryEdit(historyData.indexOf(row)));
        const deleteButton = document.createElement('button');
        deleteButton.className = 'history-delete-button';
        deleteButton.type = 'button';
        deleteButton.textContent = 'Eliminar';
        deleteButton.setAttribute('aria-label', `Eliminar calculo de ${row.partNumber}`);
        deleteButton.addEventListener('click', () => openHistoryDelete(historyData.indexOf(row)));
        actions.append(editButton, deleteButton);
        item.append(copy, result, actions);
        container.append(item);
    });
}

function getPartTotals() {
    const totals = new Map();
    historyData.forEach(row => {
        const partNumber = String(row.partNumber || '').trim().toUpperCase();
        if (!partNumber) return;
        const current = totals.get(partNumber) || {
            partNumber,
            records: 0,
            inputTotal: 0,
            resultTotal: 0
        };
        current.records += 1;
        current.inputTotal += Number(row.input) || 0;
        current.resultTotal += Number(row.result) || 0;
        totals.set(partNumber, current);
    });
    return Array.from(totals.values()).sort((a, b) =>
        a.partNumber.localeCompare(b.partNumber, undefined, { numeric: true })
    );
}
function formatTotal(value) {
    return Number(value).toLocaleString('es-MX', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}
function renderTotals() {
    const body = document.getElementById('totalsTableBody');
    const table = document.getElementById('totalsTable');
    const empty = document.getElementById('emptyTotals');
    if (!body || !table || !empty) return;
    const totals = getPartTotals();
    body.innerHTML = '';
    table.hidden = totals.length === 0;
    empty.hidden = totals.length > 0;
    totals.forEach(total => {
        const row = document.createElement('tr');
        [
            total.partNumber,
            total.records,
            formatTotal(total.inputTotal),
            formatTotal(total.resultTotal)
        ].forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.append(cell);
        });
        body.append(row);
    });
}
function openHistoryEdit(index) {
    const row = historyData[index];
    if (!row) return;
    historyEditIndex = index;
    document.getElementById('editHistoryPart').value = row.partNumber;
    document.getElementById('editHistoryInput').value = row.input;
    document.getElementById('editHistoryError').hidden = true;
    M.Modal.getInstance(document.getElementById('edit-history-modal')).open();
    setTimeout(() => document.getElementById('editHistoryPart').focus(), 150);
}
function saveHistoryEdit() {
    if (historyEditIndex == null || !historyData[historyEditIndex]) return;
    const partNumber = document.getElementById('editHistoryPart').value.trim().toUpperCase();
    const input = Number(document.getElementById('editHistoryInput').value);
    const part = partsData.find(item => item.partNumber === partNumber);
    const error = document.getElementById('editHistoryError');
    if (!part) {
        error.textContent = 'Selecciona un numero de parte valido del catalogo.';
        error.hidden = false;
        return;
    }
    if (!Number.isFinite(input) || input < 0 || part.piecesPerUnit == null || part.weight == null || Number(part.weight) === 0) {
        error.textContent = 'Revisa la cantidad y los datos configurados para esta parte.';
        error.hidden = false;
        return;
    }
    historyData[historyEditIndex] = {
        ...historyData[historyEditIndex],
        partNumber,
        input,
        result: (input * Number(part.piecesPerUnit) / Number(part.weight)).toFixed(2),
        timestamp: new Date().toISOString()
    };
    historyEditIndex = null;
    saveHistory();
    renderHistory();
    M.Modal.getInstance(document.getElementById('edit-history-modal')).close();
    toast('Calculo actualizado', 'green');
}
function openHistoryDelete(index) {
    const row = historyData[index];
    if (!row) return;
    historyDeleteIndex = index;
    document.getElementById('deleteHistoryText').textContent = `Eliminar el calculo de ${row.partNumber}, cantidad ${row.input}, resultado ${row.result} Piezas/YD.`;
    M.Modal.getInstance(document.getElementById('delete-history-modal')).open();
}
function confirmDeleteHistory() {
    if (historyDeleteIndex == null || !historyData[historyDeleteIndex]) return;
    historyData.splice(historyDeleteIndex, 1);
    historyDeleteIndex = null;
    saveHistory();
    renderHistory();
    M.Modal.getInstance(document.getElementById('delete-history-modal')).close();
    toast('Calculo eliminado', 'red lighten-1');
}
function openClearModal() {
    if (!historyData.length) {
        toast('No hay historial para limpiar', 'blue-grey');
        return;
    }
    M.Modal.getInstance(document.getElementById('clear-history-modal')).open();
}

function clearHistory() {
    openClearModal();
}

function confirmClearHistory() {
    historyData = [];
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
    M.Modal.getInstance(document.getElementById('clear-history-modal')).close();
    toast('Historial eliminado', 'red');
}

function csvCell(value) {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g,'""')}"` : text;
}

function generateCSV() {
    const detailRows = historyData.map(row =>
        [row.partNumber, row.input, row.result].map(csvCell).join(',')
    );
    const totalRows = getPartTotals().map(total =>
        [total.partNumber, total.resultTotal.toFixed(2)].map(csvCell).join(',')
    );
    return [
        'DETALLE',
        'Parte,Cantidad,Resultado Piezas/YD',
        ...detailRows,
        '',
        'TOTALES POR PARTE',
        'Parte,Total Piezas/YD',
        ...totalRows
    ].join('\n');
}

function sanitizeExportName(value) {
    return String(value || '')
        .trim()
        .replace(/\.csv$/i, '')
        .replace(/[\\/:*?"<>|]+/g, '_')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^[_\-.]+|[_\-.]+$/g, '')
        .slice(0, 80) || 'regla_de_tres';
}
function getExportBaseName() {
    const input = document.getElementById('exportFileName');
    return sanitizeExportName(input ? input.value : localStorage.getItem(EXPORT_NAME_KEY));
}
function saveExportName() {
    const input = document.getElementById('exportFileName');
    if (!input) return;
    input.value = getExportBaseName();
    localStorage.setItem(EXPORT_NAME_KEY, input.value);
    updateExportNamePreview();
}
function updateExportNamePreview() {
    const preview = document.getElementById('exportNamePreview');
    if (preview) preview.textContent = `${getExportBaseName()}_FECHA_HORA.csv`;
}
function createHistoryFile() {
    saveExportName();
    const now = new Date(),
        pad = n => String(n).padStart(2, '0'),
        filename = `${getExportBaseName()}_${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}.csv`,
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

function downloadHistory() {
    if (!historyData.length) {
        toast('No hay datos para descargar', 'orange');
        return;
    }
    const {
        filename,
        blob
    } = createHistoryFile(), url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`Descargado: ${filename}`, 'blue');
}
async function shareHistory() {
    if (!historyData.length) {
        toast('No hay datos para compartir', 'orange');
        return;
    }
    const data = createHistoryFile();
    try {
        if (navigator.canShare && navigator.canShare({
                files: [data.file]
            })) {
            await navigator.share({
                title: 'Regla de Tres',
                text: `Archivo generado: ${data.filename}`,
                files: [data.file]
            });
            toast('Archivo compartido', 'green');
            return;
        }
    } catch (error) {
        if (error.name === 'AbortError') return;
    }
    toast('Compartir no disponible; se descargara el archivo', 'orange');
    downloadHistory();
}