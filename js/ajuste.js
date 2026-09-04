let allPartsIndex = [];
let partSearchModalInstance = null;
let itemToDelete = null;
const STORAGE_KEY = 'ajuste_entries';
let labelDetector = null;
let labelPhotoUrl = '';
let labelScannerBusy = false;
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
    document.getElementById('open-label-scanner')?.addEventListener('click', openLabelScanner);
    document.getElementById('close-label-scanner')?.addEventListener('click', closeLabelScanner);
    document.getElementById('cancel-label-scanner')?.addEventListener('click', closeLabelScanner);
    document.getElementById('reset-label-scanner')?.addEventListener('click', resetLabelScanner);
    document.getElementById('use-label-result')?.addEventListener('click', useLabelResult);
    document.getElementById('label-photo-input')?.addEventListener('change', analyzeLabelPhoto);
    document.getElementById('label-part-value')?.addEventListener('input', updateLabelUseButton);
    document.getElementById('label-qty-value')?.addEventListener('input', updateLabelUseButton);
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
    if (entry.scanned) {
        const dot = document.createElement('span');
        dot.className = 'scanned-dot';
        dot.title = 'Agregado desde una foto';
        dot.setAttribute('aria-label', 'Escaneado');
        title.append(dot);
    }
    title.append(document.createTextNode(entry.part));
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


function normalizeLabelValue(value) {
    return String(value || '').trim().replace(/\s+/g, '').toUpperCase();
}

function extractLabelTag(rawValue, tag) {
    const value = normalizeLabelValue(rawValue);
    const patterns = [
        new RegExp(`^\\(${tag}\\)[:=\\-]?(.*)$`),
        new RegExp(`^${tag}[:=\\-](.*)$`)
    ];
    for (const pattern of patterns) {
        const match = value.match(pattern);
        if (match?.[1]) return match[1];
    }
    return '';
}

function isValidLabelPart(value) {
    const normalized = normalizeLabelValue(value);
    return normalized.length >= 6 && normalized.length <= 30 &&
        /[A-Z]/.test(normalized) && /\d/.test(normalized) &&
        /^[A-Z0-9._\-/]+$/.test(normalized);
}

function isValidLabelQuantity(value) {
    const normalized = normalizeLabelValue(value).replace(/EA$/, '');
    return /^\d+(?:\.\d+)?$/.test(normalized) &&
        Number.isFinite(Number(normalized)) && Number(normalized) > 0 && Number(normalized) <= 10000000;
}

function hasExcludedLabelPrefix(value) {
    return /^[(]?[QSVTM][):=\-]?/.test(normalizeLabelValue(value));
}

function makeLabelCanvas(image) {
    const maxSide = 2200;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
}

function createLabelCrop(sourceCanvas, region) {
    const sourceX = Math.round(sourceCanvas.width * region.x);
    const sourceY = Math.round(sourceCanvas.height * region.y);
    const sourceWidth = Math.max(1, Math.round(sourceCanvas.width * region.width));
    const sourceHeight = Math.max(1, Math.round(sourceCanvas.height * region.height));
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = sourceWidth;
    cropCanvas.height = sourceHeight;
    const context = cropCanvas.getContext('2d', { willReadFrequently: true });
    context.fillStyle = '#fff';
    context.fillRect(0, 0, cropCanvas.width, cropCanvas.height);
    context.drawImage(sourceCanvas, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, cropCanvas.width, cropCanvas.height);
    return cropCanvas;
}

function enhanceLabelCanvas(sourceCanvas, contrast = 1.35, brightness = 6) {
    const canvas = document.createElement('canvas');
    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(sourceCanvas, 0, 0);
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = image.data;
    for (let index = 0; index < pixels.length; index += 4) {
        let gray = pixels[index] * .299 + pixels[index + 1] * .587 + pixels[index + 2] * .114;
        gray = Math.max(0, Math.min(255, (gray - 128) * contrast + 128 + brightness));
        pixels[index] = pixels[index + 1] = pixels[index + 2] = gray;
    }
    context.putImageData(image, 0, 0);
    return canvas;
}

async function detectRegionWithEnhancement(canvas, regionName) {
    const sources = [
        { name: 'original', canvas },
        { name: 'grayscale', canvas: enhanceLabelCanvas(canvas) }
    ];
    const detections = [];
    for (const source of sources) {
        try {
            const results = await labelDetector.detect(source.canvas);
            for (const result of results) {
                const value = normalizeLabelValue(result.rawValue);
                if (!value) continue;
                const box = result.boundingBox || { x: 0, y: 0, width: source.canvas.width, height: source.canvas.height };
                detections.push({
                    value,
                    format: result.format || '',
                    pass: source.name,
                    region: regionName,
                    x: box.x / source.canvas.width,
                    y: box.y / source.canvas.height,
                    width: box.width / source.canvas.width,
                    height: box.height / source.canvas.height
                });
            }
        } catch (error) {
            console.warn(`Detection failed in ${regionName}, ${source.name}`, error);
        }
    }
    return detections;
}

function combineLabelDetections(detections) {
    const combined = new Map();
    for (const detection of detections) {
        const key = `${detection.region}|${detection.value}`;
        if (!combined.has(key)) combined.set(key, { ...detection, count: 0, passes: new Set() });
        const saved = combined.get(key);
        saved.count += 1;
        saved.passes.add(detection.pass);
        if (detection.width > saved.width) Object.assign(saved, {
            x: detection.x, y: detection.y, width: detection.width, height: detection.height
        });
    }
    return [...combined.values()].map(item => ({ ...item, passes: [...item.passes] }))
        .sort((first, second) => second.count - first.count);
}

async function detectLabelBarcodes(image) {
    const sourceCanvas = makeLabelCanvas(image);
    const regions = [
        { name: 'part', x: .06, y: .34, width: .70, height: .37 },
        { name: 'quantity', x: .01, y: .58, width: .45, height: .40 }
    ];
    const detections = [];
    for (const region of regions) {
        const crop = createLabelCrop(sourceCanvas, region);
        const results = await detectRegionWithEnhancement(crop, region.name);
        detections.push(...results.map(result => ({
            ...result,
            x: region.x + result.x * region.width,
            y: region.y + result.y * region.height,
            width: result.width * region.width,
            height: result.height * region.height
        })));
    }
    const hasPart = detections.some(item => item.region === 'part');
    const hasQuantity = detections.some(item => item.region === 'quantity');
    if (!hasPart || !hasQuantity) {
        detections.push(...await detectRegionWithEnhancement(sourceCanvas, 'full'));
    }
    return combineLabelDetections(detections);
}

function knownPartMatch(value) {
    const normalized = normalizeLabelValue(value);
    return allPartsIndex.some(item => normalizeLabelValue(item.part) === normalized);
}

function comparePartCandidates(first, second) {
    const knownDifference = Number(knownPartMatch(second.value)) - Number(knownPartMatch(first.value));
    if (knownDifference) return knownDifference;
    if (first.count !== second.count) return second.count - first.count;
    if (Math.abs(first.width - second.width) > .03) return second.width - first.width;
    return second.value.length - first.value.length;
}

function compareQuantityCandidates(first, second) {
    if (first.count !== second.count) return second.count - first.count;
    const firstValue = first.value.replace(/EA$/, '');
    const secondValue = second.value.replace(/EA$/, '');
    if (firstValue.length !== secondValue.length) return firstValue.length - secondValue.length;
    return first.x - second.x;
}

function classifyLabelDetections(items) {
    let part = '';
    let qty = '';
    for (const item of items) {
        const taggedPart = extractLabelTag(item.value, 'P');
        const taggedQuantity = extractLabelTag(item.value, 'Q').replace(/EA$/, '');
        if (taggedPart && isValidLabelPart(taggedPart)) part = taggedPart;
        if (taggedQuantity && isValidLabelQuantity(taggedQuantity)) qty = String(Number(taggedQuantity));
    }
    if (!part) {
        const candidates = items.filter(item => item.region === 'part' && isValidLabelPart(item.value) && !hasExcludedLabelPrefix(item.value));
        candidates.sort(comparePartCandidates);
        part = candidates[0]?.value || '';
    }
    if (!part) {
        const candidates = items.filter(item => item.region === 'full' && isValidLabelPart(item.value) && !hasExcludedLabelPrefix(item.value));
        candidates.sort(comparePartCandidates);
        part = candidates[0]?.value || '';
    }
    if (!qty) {
        const candidates = items.filter(item => item.region === 'quantity' && isValidLabelQuantity(item.value));
        candidates.sort(compareQuantityCandidates);
        if (candidates.length) qty = String(Number(candidates[0].value.replace(/EA$/, '')));
    }
    return { part, qty };
}

function setLabelScannerMessage(text, type = '') {
    const element = document.getElementById('label-scanner-message');
    element.textContent = text;
    element.className = `label-scanner-message${type ? ` ${type}` : ''}`;
}

function updateLabelUseButton() {
    const part = normalizeLabelValue(document.getElementById('label-part-value').value);
    const qty = document.getElementById('label-qty-value').value.trim();
    document.getElementById('use-label-result').disabled = !(isValidLabelPart(part) && isValidLabelQuantity(qty));
    document.getElementById('label-part-warning').hidden = !part || knownPartMatch(part);
}

function resetLabelScanner() {
    labelScannerBusy = false;
    const input = document.getElementById('label-photo-input');
    if (input) input.value = '';
    if (labelPhotoUrl) URL.revokeObjectURL(labelPhotoUrl);
    labelPhotoUrl = '';
    document.getElementById('label-photo-panel').hidden = true;
    document.getElementById('label-part-value').value = '';
    document.getElementById('label-qty-value').value = '';
    document.getElementById('label-raw-values').textContent = 'Ninguno';
    document.getElementById('label-part-warning').hidden = true;
    document.getElementById('use-label-result').disabled = true;
    setLabelScannerMessage('Toma una foto clara de la etiqueta completa.');
}

async function setupLabelDetector() {
    if (!('BarcodeDetector' in window)) throw new Error('BarcodeDetector unavailable');
    const supported = await BarcodeDetector.getSupportedFormats();
    const formats = ['code_128', 'code_39', 'code_93', 'codabar', 'itf'].filter(format => supported.includes(format));
    labelDetector = new BarcodeDetector(formats.length ? { formats } : undefined);
}

async function openLabelScanner() {
    resetLabelScanner();
    if (mobileCaptureQuery.matches) closeCaptureSheet({ restoreFocus: false });
    M.Modal.getInstance(document.getElementById('label-scanner-modal'))?.open();
    try {
        await setupLabelDetector();
    } catch (error) {
        setLabelScannerMessage('Usa Chrome en Android mediante HTTPS o como PWA instalada.', 'warning');
    }
}

async function analyzeLabelPhoto(event) {
    const file = event.target.files?.[0];
    if (!file || labelScannerBusy) return;
    labelScannerBusy = true;
    setLabelScannerMessage('Analizando las zonas de Parte y Cantidad...');
    if (labelPhotoUrl) URL.revokeObjectURL(labelPhotoUrl);
    labelPhotoUrl = URL.createObjectURL(file);
    const image = document.getElementById('label-photo-preview');
    image.src = labelPhotoUrl;
    document.getElementById('label-photo-panel').hidden = false;
    try {
        await image.decode();
        if (!labelDetector) await setupLabelDetector();
        const detections = await detectLabelBarcodes(image);
        document.getElementById('label-raw-values').textContent = detections.length
            ? detections.map(item => `${item.region}: ${item.value} (${item.count})`).join(' | ')
            : 'Ninguno';
        const result = classifyLabelDetections(detections);
        document.getElementById('label-part-value').value = result.part;
        document.getElementById('label-qty-value').value = result.qty;
        updateLabelUseButton();
        if (!result.part || !result.qty) {
            labelScannerBusy = false;
            setLabelScannerMessage('No se detectaron ambos datos. Revisa o corrige los campos, o toma otra foto mas horizontal y sin reflejos.', 'warning');
            return;
        }
        labelScannerBusy = false;
        setLabelScannerMessage(`Detectado: ${result.part}, cantidad ${result.qty}. Revisa los campos y pulsa Usar datos.`, 'success');
    } catch (error) {
        console.error('Could not analyze label photo', error);
        labelScannerBusy = false;
        setLabelScannerMessage('No se pudo leer la foto. Intenta con mejor enfoque e iluminacion.', 'warning');
    }
}

function useLabelResult() {
    const part = normalizeLabelValue(document.getElementById('label-part-value').value);
    const qty = document.getElementById('label-qty-value').value.trim();
    if (!isValidLabelPart(part) || !isValidLabelQuantity(qty)) return;
    document.getElementById('selectedPart').value = part;
    document.getElementById('quantity').value = String(Number(qty));
    M.updateTextFields();
    closeLabelScanner();
    if (mobileCaptureQuery.matches) openCaptureSheet();
    toast(`Etiqueta leida: <strong>${part} (${Number(qty)})</strong>`, 'blue');
}

function closeLabelScanner() {
    labelDetector = null;
    M.Modal.getInstance(document.getElementById('label-scanner-modal'))?.close();
    setTimeout(resetLabelScanner, 220);
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