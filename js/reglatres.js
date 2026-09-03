const STORAGE_KEY = 'reglaTresHistory';
let historyData = [];
let partsData = [];
document.addEventListener('DOMContentLoaded', () => {
    if (window.M) {
        M.Modal.init(document.querySelectorAll('.modal'));
        M.Sidenav.init(document.querySelectorAll('.sidenav'));
    }
    loadHistory();
    buildPartsData();
    bindEvents();
    populateLines();
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
    document.getElementById('tipo').addEventListener('change', handleLineChange);
    document.getElementById('parte').addEventListener('change', handlePartChange);
    document.getElementById('userInput').addEventListener('input', updateCalculationState);
    document.getElementById('userInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') calcular();
    });
    document.getElementById('calculateBtn').addEventListener('click', calcular);
    document.getElementById('clearHistoryBtn').addEventListener('click', openClearModal);
    document.getElementById('confirmClearHistory').addEventListener('click', confirmClearHistory);
}

function populateLines() {
    const select = document.getElementById('tipo');
    [...new Set(partsData.map(part => part.line))].sort((a, b) => a.localeCompare(b, undefined, {
        numeric: true
    })).forEach(line => select.add(new Option(line, line)));
}

function handleLineChange() {
    const select = document.getElementById('parte');
    select.innerHTML = '<option value="">Selecciona una parte</option>';
    partsData.filter(part => part.line === document.getElementById('tipo').value).forEach(part => select.add(new Option(part.partNumber, part.partNumber)));
    select.disabled = false;
    document.getElementById('info').hidden = true;
    document.getElementById('resultCard').hidden = true;
    updateCalculationState();
    select.focus();
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
    document.getElementById('resultado').textContent = formatted;
    document.getElementById('resultCard').hidden = false;
    historyData.unshift({
        partNumber: part.partNumber,
        input,
        result: formatted,
        timestamp: new Date().toISOString()
    });
    saveHistory();
    renderHistory();
    toast('Calculo guardado', 'green');
}

function renderHistory() {
    const container = document.getElementById('history'),
        empty = document.getElementById('emptyHistory');
    container.innerHTML = '';
    empty.hidden = historyData.length > 0;
    document.getElementById('historyCount').textContent = historyData.length;
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
        unit.textContent = 'piezas';
        copy.append(part, meta);
        result.className = 'history-result';
        result.append(value, unit);
        item.append(copy, result);
        container.append(item);
    });
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
    document.getElementById('resultCard').hidden = true;
    renderHistory();
    M.Modal.getInstance(document.getElementById('clear-history-modal')).close();
    toast('Historial eliminado', 'red');
}

function csvCell(value) {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g,'""')}"` : text;
}

function generateCSV() {
    return ['Parte,Input,Resultado', ...historyData.map(row => [row.partNumber, row.input, row.result].map(csvCell).join(','))].join('\n');
}

function createHistoryFile() {
    const now = new Date(),
        pad = n => String(n).padStart(2, '0'),
        filename = `regla_de_tres_${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}.csv`,
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