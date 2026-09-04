let deleteTarget = null;
let currentIndex = 0;
let allParts = [];
let groupedData = {};
let orderedLocations = [];
window.checkedState = {};
window.scannedState = {};
let labelDetector=null, labelBusy=false, labelUrl="";
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
    if (mobileAddPartQuery.matches) document.getElementById('add-part-panel').setAttribute('aria-hidden', 'true');
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
    document.getElementById('open-add-part-button').addEventListener('click', openAddPartSheet);
    document.getElementById('close-add-part-button').addEventListener('click', closeAddPartSheet);
    document.getElementById('add-part-backdrop').addEventListener('click', closeAddPartSheet);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && document.getElementById('add-part-panel').classList.contains('is-open')) {
            closeAddPartSheet();
        }
    });
    document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);
    document.getElementById('confirm-clear-btn').addEventListener('click', clearStoredData);
    document.getElementById('openScannerBtn')?.addEventListener('click', openLabelPhoto);
    document.getElementById('closeScannerBtn')?.addEventListener('click', closeLabelPhoto);
    document.getElementById('stopScannerBtn')?.addEventListener('click', closeLabelPhoto);
    document.getElementById('resetScannerBtn')?.addEventListener('click', resetLabelPhoto);
    document.getElementById('labelPhotoInput')?.addEventListener('change', analyzeLabelPhoto);
    document.getElementById('useScannerBtn')?.addEventListener('click', useScannerResult);
    document.getElementById('scannerPartValue')?.addEventListener('input', updateScannerUseButton);
    document.getElementById('scannerQtyValue')?.addEventListener('input', updateScannerUseButton);
}

const mobileAddPartQuery = window.matchMedia('(max-width: 700px)');
let addPartReturnFocus = null;

function openAddPartSheet() {
    if (!mobileAddPartQuery.matches) return;

    if (!orderedLocations.length) {
        const settingsModal = M.Modal.getInstance(document.getElementById('settings-modal'));
        settingsModal?.open();
        toast('Importa un CSV o crea una ubicacion primero', 'blue-grey');
        return;
    }

    const panel = document.getElementById('add-part-panel');
    const backdrop = document.getElementById('add-part-backdrop');
    const trigger = document.getElementById('open-add-part-button');
    const location = orderedLocations[currentIndex];

    addPartReturnFocus = document.activeElement;
    document.getElementById('sheetCurrentLocation').textContent = `Agregar a ${location}`;
    panel.classList.add('is-open');
    backdrop.classList.add('is-open');
    document.body.classList.add('sheet-open');
    panel.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    setTimeout(() => document.getElementById('partSearch').focus(), 220);
}

function closeAddPartSheet(options = {}) {
    const panel = document.getElementById('add-part-panel');
    const backdrop = document.getElementById('add-part-backdrop');
    const trigger = document.getElementById('open-add-part-button');

    panel.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    document.body.classList.remove('sheet-open');
    trigger.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', mobileAddPartQuery.matches ? 'true' : 'false');

    if (options.restoreFocus !== false) {
        const target = addPartReturnFocus && addPartReturnFocus.isConnected ? addPartReturnFocus : trigger;
        setTimeout(() => target.focus(), 210);
    }
}

mobileAddPartQuery.addEventListener?.('change', event => {
    if (!event.matches) closeAddPartSheet({ restoreFocus: false });
    else document.getElementById('add-part-panel').setAttribute('aria-hidden', 'true');
});

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
        checkedState: window.checkedState,
        scannedState: window.scannedState
    }));
}

function loadData() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        if (saved) {
            groupedData = saved.groupedData || {};
            orderedLocations = saved.orderedLocations || [];
            window.checkedState = saved.checkedState || {};
            window.scannedState = saved.scannedState || {};
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
        if (!Array.isArray(window.scannedState[loc])) window.scannedState[loc] = [];
        while (window.checkedState[loc].length < groupedData[loc].length) window.checkedState[loc].push(false);
        while (window.scannedState[loc].length < groupedData[loc].length) window.scannedState[loc].push(false);
        window.checkedState[loc] = window.checkedState[loc].slice(0, groupedData[loc].length);
        window.scannedState[loc] = window.scannedState[loc].slice(0, groupedData[loc].length);
    });
}

function render() {
    sanitizeState();
    const hasLocations = orderedLocations.length > 0;
    document.getElementById('emptyState').hidden = hasLocations;
    document.getElementById('verificationWorkspace').hidden = !hasLocations;
    const addMaterialButton = document.getElementById('open-add-part-button');
    if (addMaterialButton) {
        addMaterialButton.hidden = false;
        addMaterialButton.setAttribute(
            'aria-label',
            hasLocations ? 'Agregar material' : 'Preparar verificacion'
        );
    }
    if (addMaterialButton) {
        addMaterialButton.lastChild.textContent = hasLocations ? ' Material' : ' Preparar';
    }
    if (!hasLocations) {
        updateOverallProgress();
        return;
    }
    const loc = orderedLocations[currentIndex],
        items = groupedData[loc] || [],
        checks = window.checkedState[loc] || [],
        done = checks.filter(Boolean).length;
    document.getElementById('currentLocation').textContent = loc;
    const sheetLocation = document.getElementById('sheetCurrentLocation');
    if (sheetLocation) sheetLocation.textContent = `Agregar a ${loc}`;
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
        if (window.scannedState[loc]?.[index]) { const dot=document.createElement('span'); dot.className='scanned-dot'; dot.title='Agregado por foto'; partTd.append(dot); }
        const text=document.createElement('span'); text.textContent=part; partTd.append(text);
        partTd.onclick = () => makeEditable(partTd, loc, index, 0);
        const qtyTd = document.createElement('td');
        qtyTd.textContent = qty;
        qtyTd.onclick = () => makeEditable(qtyTd, loc, index, 1);
        const packTd = document.createElement('td');
        packTd.className = 'pack-value';
        const pack = Number((window.partsDB || {})[part]?.pack),
            amount = Number(qty);
        packTd.textContent = pack > 0 && Number.isFinite(amount) ? `${(amount / pack).toFixed(2)} cajas` : 'No disponible';
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
    const original = groupedData[loc][row][col],
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
    window.scannedState[loc] = [];
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

    if (!mobileAddPartQuery.matches) {
        document.getElementById('partSearch').focus();
    }
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

            if (mobileAddPartQuery.matches) {
                document.querySelector('.location-toolbar')?.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth'
                });
            }
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
    window.scannedState[loc].push(partInput.dataset.scanned === 'true');
    delete partInput.dataset.scanned;
    partInput.value = '';
    qtyInput.value = '';
    document.getElementById('partSearchResults').innerHTML = '';
    saveData();
    render();
    if (mobileAddPartQuery.matches) closeAddPartSheet();
    else partInput.focus();
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
    window.scannedState[loc]?.splice(index, 1);
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
            nextChecks = {}, nextScanned = {};
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
                nextScanned[loc] = [];
            }
            nextData[loc].push([part, qty]);
            nextChecks[loc].push(false); nextScanned[loc].push(false);
        });
        if (!nextOrder.length) {
            toast('El archivo no contiene filas validas', 'red');
            return;
        }
        groupedData = nextData;
        orderedLocations = nextOrder.sort((a, b) => a.localeCompare(b, undefined, {
            numeric: true
        }));
        window.checkedState = nextChecks; window.scannedState = nextScanned;
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


function barcodeText(value){return String(value||'').replace(/[\x00-\x1F\x7F]/g,'').trim().replace(/\s+/g,'').toUpperCase();}
function taggedValue(raw,tag){const v=barcodeText(raw);let m=v.match(new RegExp(`^\\(${tag}\\)[:=\\-]?(.*)$`));if(m?.[1])return m[1];m=v.match(new RegExp(`^${tag}[:=\\-](.*)$`));if(m?.[1])return m[1];if(tag==='Q'){m=v.match(/^Q(\d+(?:\.\d+)?)(?:EA)?$/);if(m?.[1])return m[1];}return '';}
function knownTablePart(value){const v=barcodeText(value);return allParts.some(part=>barcodeText(part)===v);}
function normalizeDetectedPart(value){const raw=barcodeText(value),tagged=taggedValue(raw,'P');if(tagged)return tagged;if(raw.startsWith('P')&&raw.length>7){const noP=raw.slice(1);if(knownTablePart(noP)||/^L[A-Z0-9._\-/]*\d[A-Z0-9._\-/]*$/.test(noP))return noP;}return raw;}
function validPart(v){v=normalizeDetectedPart(v);return v.length>=6&&v.length<=30&&/[A-Z]/.test(v)&&/\d/.test(v)&&/^[A-Z0-9._\-/]+$/.test(v);}
function validQty(v){v=barcodeText(v).replace(/EA$/,'');return /^\d+(?:\.\d+)?$/.test(v)&&Number(v)>0&&Number(v)<=10000000;}
function makeBaseCanvas(img){const max=2200,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(img.naturalWidth*scale));cv.height=Math.max(1,Math.round(img.naturalHeight*scale));const x=cv.getContext('2d',{willReadFrequently:true});x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);x.drawImage(img,0,0,cv.width,cv.height);return cv;}
function makeCrop(source,r){const cv=document.createElement('canvas'),sx=Math.round(source.width*r.x),sy=Math.round(source.height*r.y);cv.width=Math.max(1,Math.round(source.width*r.width));cv.height=Math.max(1,Math.round(source.height*r.height));const x=cv.getContext('2d',{willReadFrequently:true});x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);x.drawImage(source,sx,sy,cv.width,cv.height,0,0,cv.width,cv.height);return cv;}
function grayscaleContrast(source){const cv=document.createElement('canvas');cv.width=source.width;cv.height=source.height;const x=cv.getContext('2d',{willReadFrequently:true});x.drawImage(source,0,0);const im=x.getImageData(0,0,cv.width,cv.height),d=im.data;for(let i=0;i<d.length;i+=4){let g=.299*d[i]+.587*d[i+1]+.114*d[i+2];g=Math.max(0,Math.min(255,(g-128)*1.35+134));d[i]=d[i+1]=d[i+2]=g;}x.putImageData(im,0,0);return cv;}
async function detectCrop(source,region){const hits=[];for(const pass of [{name:'original',canvas:source},{name:'gray',canvas:grayscaleContrast(source)}]){try{for(const result of await labelDetector.detect(pass.canvas)){const value=barcodeText(result.rawValue);if(!value)continue;const box=result.boundingBox||{x:0,y:0,width:pass.canvas.width,height:pass.canvas.height};hits.push({value,region,pass:pass.name,x:box.x/pass.canvas.width,y:box.y/pass.canvas.height,width:box.width/pass.canvas.width});}}catch(error){console.warn('Detection pass skipped',region,pass.name,error);}}return hits;}
function combineHits(hits){const map=new Map();for(const hit of hits){const key=`${hit.region}|${hit.value}`;if(!map.has(key))map.set(key,{...hit,count:0});map.get(key).count++;}return[...map.values()].sort((a,b)=>b.count-a.count);}
async function targetedDetect(img){const base=makeBaseCanvas(img),regions=[{name:'part',x:.05,y:.31,width:.73,height:.40},{name:'quantity',x:0,y:.60,width:.42,height:.38},{name:'quantity',x:0,y:.52,width:.50,height:.46}],hits=[];for(const region of regions)hits.push(...await detectCrop(makeCrop(base,region),region.name));try{for(const result of await labelDetector.detect(base)){const value=barcodeText(result.rawValue);if(!value)continue;const box=result.boundingBox||{x:0,y:0,width:0,height:0};hits.push({value,region:'full',pass:'original',x:box.x/base.width,y:box.y/base.height,width:box.width/base.width});}}catch(error){console.warn('Full pass skipped',error);}return combineHits(hits);}
function classifyHits(items){let part='',qty='';for(const item of items){const p=taggedValue(item.value,'P'),q=taggedValue(item.value,'Q').replace(/EA$/,'');if(p&&validPart(p))part=normalizeDetectedPart(p);if(q&&validQty(q))qty=String(Number(q));}if(!part){const candidates=items.filter(i=>i.region==='part').map(i=>({...i,value:normalizeDetectedPart(i.value)})).filter(i=>validPart(i.value)&&!/^[(]?[QSVTM][):=\-]?/.test(i.value));candidates.sort((a,b)=>Number(knownTablePart(b.value))-Number(knownTablePart(a.value))||b.count-a.count||b.width-a.width||b.value.length-a.value.length);part=candidates[0]?.value||'';}if(!part){const candidates=items.filter(i=>i.region==='full').map(i=>({...i,value:normalizeDetectedPart(i.value)})).filter(i=>validPart(i.value)&&!/^[(]?[QSVTM][):=\-]?/.test(i.value));candidates.sort((a,b)=>Number(knownTablePart(b.value))-Number(knownTablePart(a.value))||b.width-a.width);part=candidates[0]?.value||'';}if(!qty){let candidates=items.filter(i=>i.region==='quantity'&&validQty(i.value)&&barcodeText(i.value).replace(/EA$/,'').length<=7);candidates.sort((a,b)=>b.count-a.count||barcodeText(a.value).length-barcodeText(b.value).length||a.x-b.x);if(!candidates.length)candidates=items.filter(i=>i.region==='full'&&i.x<.52&&i.y>.48&&validQty(i.value)&&barcodeText(i.value).replace(/EA$/,'').length<=7);if(candidates.length)qty=String(Number(barcodeText(candidates[0].value).replace(/EA$/,'')));}return{part:normalizeDetectedPart(part),qty};}
function labelMessage(text,type=''){const e=document.getElementById('scannerMessage');e.textContent=text;e.className='scanner-message'+(type?' '+type:'');}
function updateScannerUseButton(){const part=normalizeDetectedPart(document.getElementById('scannerPartValue').value),qty=document.getElementById('scannerQtyValue').value.trim();document.getElementById('useScannerBtn').disabled=!(validPart(part)&&validQty(qty));}
function resetLabelPhoto(){labelBusy=false;const input=document.getElementById('labelPhotoInput');if(input)input.value='';if(labelUrl)URL.revokeObjectURL(labelUrl);labelUrl='';document.getElementById('photoPanel').hidden=true;document.getElementById('scannerPartValue').value='';document.getElementById('scannerQtyValue').value='';document.getElementById('scannerRawValue').textContent='Ninguno';document.getElementById('useScannerBtn').disabled=true;labelMessage('Toma una foto clara de la etiqueta completa.');}
async function setupLabelDetector(){if(!('BarcodeDetector'in window))throw Error('unsupported');const supported=await BarcodeDetector.getSupportedFormats();const formats=['code_128','code_39','code_93','codabar','itf'].filter(x=>supported.includes(x));labelDetector=new BarcodeDetector(formats.length?{formats}:undefined);}
async function openLabelPhoto(){if(!orderedLocations.length){toast('Importa un CSV o crea una ubicacion primero','orange');return;}resetLabelPhoto();if(mobileAddPartQuery.matches)closeAddPartSheet({restoreFocus:false});M.Modal.getInstance(document.getElementById('scanner-modal'))?.open();try{await setupLabelDetector();}catch(error){labelMessage('Usa Chrome en Android mediante HTTPS o como PWA instalada.','warning');}}
async function analyzeLabelPhoto(event){const file=event.target.files?.[0];if(!file||labelBusy)return;labelBusy=true;labelMessage('Analizando las zonas de Parte y Cantidad...');labelUrl=URL.createObjectURL(file);const img=document.getElementById('labelPhotoPreview');img.src=labelUrl;document.getElementById('photoPanel').hidden=false;try{await img.decode();if(!labelDetector)await setupLabelDetector();const hits=await targetedDetect(img);document.getElementById('scannerRawValue').textContent=hits.map(x=>`${x.region}: ${x.value} (${x.count})`).join(' | ')||'Ninguno';const result=classifyHits(hits);document.getElementById('scannerPartValue').value=result.part;document.getElementById('scannerQtyValue').value=result.qty;updateScannerUseButton();labelBusy=false;if(!result.part||!result.qty){labelMessage('Revisa o corrige los campos, o toma otra foto mas horizontal y sin reflejos.','warning');return;}labelMessage(`Detectado: ${result.part}, cantidad ${result.qty}. Revisa y pulsa Usar datos.`,'success');}catch(error){console.error(error);labelBusy=false;labelMessage('No se pudo leer la foto. Intenta con mejor enfoque.','warning');}}
function useScannerResult(){const part=normalizeDetectedPart(document.getElementById('scannerPartValue').value),qty=document.getElementById('scannerQtyValue').value.trim();if(!validPart(part)||!validQty(qty))return;const partInput=document.getElementById('partSearch'),qtyInput=document.getElementById('partQty');partInput.value=part;qtyInput.value=String(Number(qty));partInput.dataset.scanned='true';document.getElementById('partSearchResults').innerHTML='';closeLabelPhoto();if(mobileAddPartQuery.matches)setTimeout(openAddPartSheet,260);else setTimeout(()=>qtyInput.focus(),260);toast(`Etiqueta leida: <strong>${part} (${Number(qty)})</strong>`,'blue');}
function closeLabelPhoto(){labelDetector=null;M.Modal.getInstance(document.getElementById('scanner-modal'))?.close();setTimeout(resetLabelPhoto,200);}

function clearStoredData() {
    // Clear both the stored copy and every in-memory reference.
    localStorage.removeItem(STORAGE_KEY);
    groupedData = {};
    orderedLocations = [];
    window.checkedState = {};
    window.scannedState = {};
    currentIndex = 0;
    deleteTarget = null;

    // Clear visible controls immediately before re-rendering the empty state.
    document.getElementById('verificationRows').innerHTML = '';
    document.getElementById('partSearch').value = '';
    document.getElementById('partQty').value = '';
    document.getElementById('partSearchResults').innerHTML = '';
    document.getElementById('new-location').value = '';
    document.getElementById('csvFile').value = '';

    closeAddPartSheet({ restoreFocus: false });
    render();

    const clearModal = M.Modal.getInstance(document.getElementById('clear-modal'));
    const settingsModal = M.Modal.getInstance(document.getElementById('settings-modal'));
    clearModal?.close();
    settingsModal?.close();

    toast('Datos eliminados', 'red');

    // Reload after the modal animation. This also verifies that nothing
    // remains in localStorage and returns the page to a clean initial state.
    window.setTimeout(() => window.location.reload(), 350);
}