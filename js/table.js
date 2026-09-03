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
    window.scannedState[loc].push(false);
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


function barcodeText(v){return String(v||'').trim().replace(/\s+/g,'').toUpperCase();}
function taggedValue(raw,tag){const v=barcodeText(raw);let m=v.match(new RegExp('^\\('+tag+'\\)[:=\\-]?(.*)$'));if(!m)m=v.match(new RegExp('^'+tag+'[:=\\-](.*)$'));return m&&m[1]?m[1]:'';}
function chooseLabelData(values){const rows=values.map(raw=>({raw:barcodeText(raw),p:taggedValue(raw,'P'),q:taggedValue(raw,'Q')}));let part=(rows.find(x=>x.p)?.p||'').replace(/EA$/,'');let qty=(rows.find(x=>x.q)?.q||'').replace(/EA$/,'');if(!part){part=rows.map(x=>x.raw).filter(v=>!/^[(]?[QVSM][):=\-]?/.test(v)&&/[A-Z]/.test(v)&&/\d/.test(v)&&/^[A-Z0-9._\-/]+$/.test(v)).sort((a,b)=>b.length-a.length)[0]||'';}if(!qty){let q=rows.map(x=>x.raw).filter(v=>/^\d+(?:\.\d+)?(?:EA)?$/.test(v)).map(v=>v.replace(/EA$/,''));qty=(q.filter(v=>Number(v)>9).length?q.filter(v=>Number(v)>9):q).sort((a,b)=>Number(b)-Number(a))[0]||'';}if(!/^[A-Z0-9._\-/]+$/.test(part)||!/[A-Z]/.test(part)||!/[0-9]/.test(part))part='';if(!/^\d+(?:\.\d+)?$/.test(qty)||Number(qty)<=0)qty='';return{part,qty:qty?String(Number(qty)):''};}
function makeCanvas(img,rotation=0){const side=rotation===90||rotation===270,cv=document.createElement('canvas');cv.width=side?img.naturalHeight:img.naturalWidth;cv.height=side?img.naturalWidth:img.naturalHeight;const x=cv.getContext('2d',{willReadFrequently:true});x.translate(cv.width/2,cv.height/2);x.rotate(rotation*Math.PI/180);x.drawImage(img,-img.naturalWidth/2,-img.naturalHeight/2);return cv;}
function enhanceCanvas(source,{contrast=1,brightness=0,threshold=null}={}){const cv=document.createElement('canvas');cv.width=source.width;cv.height=source.height;const x=cv.getContext('2d',{willReadFrequently:true});x.drawImage(source,0,0);const im=x.getImageData(0,0,cv.width,cv.height),d=im.data;for(let i=0;i<d.length;i+=4){let g=.299*d[i]+.587*d[i+1]+.114*d[i+2];g=(g-128)*contrast+128+brightness;g=Math.max(0,Math.min(255,g));if(threshold!==null)g=g>=threshold?255:0;d[i]=d[i+1]=d[i+2]=g;}x.putImageData(im,0,0);return cv;}
async function multiPassDetect(img){const profiles=[{name:'original',original:true},{name:'gray'},{name:'contrast135',contrast:1.35,brightness:5},{name:'contrast170',contrast:1.7,brightness:8},{name:'brighter',contrast:1.45,brightness:20},{name:'threshold110',contrast:1.2,threshold:110},{name:'threshold135',contrast:1.2,threshold:135},{name:'threshold160',contrast:1.2,threshold:160}],hits=[];for(const rotation of [0,90,180,270]){const base=makeCanvas(img,rotation);for(const p of profiles){const cv=p.original?base:enhanceCanvas(base,p);try{for(const r of await labelDetector.detect(cv)){const value=barcodeText(r.rawValue);if(value)hits.push({value,profile:p.name,rotation});}}catch(e){console.warn('Decode pass skipped',p.name,rotation,e);}}}return hits;}
function voteDetections(hits){const m=new Map();for(const h of hits){if(!m.has(h.value))m.set(h.value,{value:h.value,count:0,profiles:new Set(),rotations:new Set()});const x=m.get(h.value);x.count++;x.profiles.add(h.profile);x.rotations.add(h.rotation);}return [...m.values()].map(x=>({value:x.value,count:x.count,profiles:[...x.profiles],rotations:[...x.rotations]})).sort((a,b)=>b.count-a.count);}
function editDistance(a,b){const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let prev=row[0];row[0]=i;for(let k=1;k<=b.length;k++){const old=row[k];row[k]=Math.min(row[k]+1,row[k-1]+1,prev+(a[i-1]===b[k-1]?0:1));prev=old;}}return row[b.length];}
function correctKnownPart(value){const v=barcodeText(value);if(window.partsDB?.[v]||window.hilosDB?.[v])return v;let best=null;for(const p of allParts){const k=barcodeText(p);if(Math.abs(k.length-v.length)>1)continue;const d=editDistance(v,k);if(!best||d<best.d)best={part:k,d};}return best&&best.d<=1?best.part:v;}
function labelMessage(t,type=''){const e=document.getElementById('scannerMessage');e.textContent=t;e.className='scanner-message'+(type?' '+type:'');}
function resetLabelPhoto(){labelBusy=false;const i=document.getElementById('labelPhotoInput');if(i)i.value='';if(labelUrl)URL.revokeObjectURL(labelUrl);labelUrl='';document.getElementById('photoPanel').hidden=true;document.getElementById('scannerPartValue').textContent='Pendiente';document.getElementById('scannerQtyValue').textContent='Pendiente';document.getElementById('scannerRawValue').textContent='Ninguno';labelMessage('Toma una foto clara de la etiqueta completa.');}
async function setupLabelDetector(){if(!('BarcodeDetector'in window))throw Error('unsupported');const s=await BarcodeDetector.getSupportedFormats();const f=['code_128','code_39','code_93','codabar','ean_13','ean_8','itf'].filter(x=>s.includes(x));labelDetector=new BarcodeDetector(f.length?{formats:f}:undefined);}
async function openLabelPhoto(){if(!orderedLocations.length){toast('Importa un CSV o crea una ubicacion primero','orange');return;}resetLabelPhoto();M.Modal.getInstance(document.getElementById('scanner-modal'))?.open();try{await setupLabelDetector();}catch(e){labelMessage('Usa Chrome en Android mediante HTTPS o como PWA instalada.','warning');}}
async function analyzeLabelPhoto(e){const file=e.target.files?.[0];if(!file||labelBusy)return;labelBusy=true;labelMessage('Analizando color, grises, contraste y rotaciones...');labelUrl=URL.createObjectURL(file);const img=document.getElementById('labelPhotoPreview');img.src=labelUrl;document.getElementById('photoPanel').hidden=false;try{await img.decode();if(!labelDetector)await setupLabelDetector();const votes=voteDetections(await multiPassDetect(img));document.getElementById('scannerRawValue').textContent=votes.map(x=>`${x.value} (${x.count})`).join(' | ')||'Ninguno';let{part,qty}=chooseLabelData(votes.map(x=>x.value));if(part)part=correctKnownPart(part);document.getElementById('scannerPartValue').textContent=part||'No detectado';document.getElementById('scannerQtyValue').textContent=qty||'No detectada';if(!part||!qty){labelBusy=false;labelMessage('No se identificaron ambos datos. Evita reflejos y toma otra foto mas cerca.','warning');return;}labelMessage(`Detectado: ${part}, cantidad ${qty}`,'success');savePhotoMaterial(part,qty);setTimeout(closeLabelPhoto,900);}catch(err){console.error(err);labelBusy=false;labelMessage('No se pudo leer la foto. Intenta con mejor enfoque e iluminacion.','warning');}}
function closeLabelPhoto(){labelDetector=null;M.Modal.getInstance(document.getElementById('scanner-modal'))?.close();setTimeout(resetLabelPhoto,250);}
function savePhotoMaterial(part,qty){const loc=orderedLocations[currentIndex];if(!Array.isArray(window.scannedState[loc]))window.scannedState[loc]=[];const i=groupedData[loc].findIndex(([p])=>barcodeText(p)===part);if(i>=0){groupedData[loc][i][1]=qty;window.scannedState[loc][i]=true;}else{groupedData[loc].push([part,qty]);window.checkedState[loc].push(false);window.scannedState[loc].push(true);}saveData();render();toast(`${part}, cantidad ${qty}, guardado en ${loc}`,'blue');}

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