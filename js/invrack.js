const racks = {
    APC01: ["APC0101", "APC0102", "APC0103", "APC0104", "APC0105", "APC0106", "APC0107", "APC0108", "APC0109", "APC0110", "APC0111", "APC0112", "APC0113", "APC0114", "APC0115", "APC0116", "APC0117", "APC0118", "APC0119", "APC0120"],
    APC02: ["APC0201", "APC0202", "APC0203", "APC0204", "APC0205", "APC0206", "APC0211", "APC0212", "APC0213", "APC0214", "APC0215"]
};
const items = {
    APC0101: [
        "L002316235NCPAB",
        "L002401087NCPAC",
        "L002401088NCPAC",
        "L002401089NCPAD",
        "L002401090NCPAD",
        "L002401091NCPAB"
    ],

    APC0102: [
        "L002316236NCPAA",
        "L002316237NCPAA",
        "L002316238NCPAA",
        "L002316951NCPAC",
        "L002401092NCPAA",
        "L002481117NCPAA"
    ],

    APC0103: [
        "5CC-CH-PLF8-645D",
        "L00144987006HAA",
        "L001449870U52AA",
        "L002401093NCPAA",
        "255S5-195A"
    ],

    APC0104: [
        "L00180249345DAA",
        "L001802493GKAAA",
        "L0816049AA0109X",
        "L0816049AA0145D",
        "L0816049AA01GKA"
    ],

    APC0105: [
        "L0571635AA01",
        "L0571636AA01",
        "L0572828AA03",
        "L0591424AA01",
        "L0668944AA01"
    ],

    APC0106: [
        "L002866832NCPAA",
        "L002890609NCPAA",
        "L0571668AA01",
        "L0592046AA01",
        "L0676165AA01"
    ],

    APC0107: [
        "L002866833NCPAA",
        "L002890610NCPAA",
        "L0676192AA01",
        "L0676195AA01"
    ],

    APC0108: [
        "1561-305SAA",
        "1561-345SAA",
        "2232b910F00MA",
        "STFR-415X122FAC"
    ],

    APC0109: [
        "170480",
        "L002162447NCPAA",
        "L0575410AA01",
        "L0633654AA01"
    ],

    APC0110: [
        "190562",
        "KRG25LTCA",
        "L0429142AA02",
        "L0495624AA01",
        "L0549303AA01",
        "L0575409AA01"
    ],

    APC0111: [
        "L001434100NCPAA",
        "L001518304NCPAA",
        "L002312383NCPAC",
        "L002479502NCPAA",
        "L002618780NCPAA",
        "L0430654AA01"
    ],

    APC0112: [
        "L002215045NCPAA",
        "L002312377NCPAA",
        "L002312378NCPAA",
        "L002312379NCPAC",
        "L002396469NCPAA",
        "L002479499NCPAA"
    ],

    APC0113: [
        "255S5-184D",
        "L002215046NCPAA",
        "L002316914NCPAA",
        "L002316915NCPAA",
        "L0449870AA0102F",
        "L0449870AA0164D",
        "L001466311NCPAA"
    ],

    APC0114: [
        "L001797262NCPAA",
        "L002171015NCPAA",
        "L001637636NCPAA",
        "L001676232NCPAA",
        "L001797260NCPAA",
        "L0637636AA01",
        "L0639918AA01",
        "L0676232AA01",
        "L0797260AA01"
    ],

    APC0115: [
        "L0571640AA01",
        "L0592042AA01",
        "L0592045AA04",
        "L0597009AA02",
        "L0682843AA01"
    ],

    APC0116: [
        "L001802491NCPAA",
        "L001802492NCPAA",
        "L0681545AA01",
        "L0681546AA01",
        "L0681547AA01",
        "L0685445AA01"
    ],

    APC0117: [
        "L0649100AA01",
        "L0649101AA01",
        "L0676166AA01",
        "L0676168AA01",
        "L0676177AA01"
    ],

    APC0118: [
        "L002460234NCPAA",
        "L002798840NCPAB",
        "L002798841NCPAB",
        "L002806946NCPAA",
        "L002806947NCPAA",
        "L002807250NCPAA",
        "L002907223NCPAA"
    ],

    APC0119: [
        "794-100SAA",
        "L00180970202FAA",
        "L00180970206HAA",
        "L00180970209XAA",
        "L00180970245DAA",
        "L00180970264DAA",
        "L001809702GKAAA",
        "L001809702HXWAA",
        "L002618822NCPAA"
    ],

    APC0120: [
        "WRG16HMAA",
        "WRG16LBAA",
        "WRG25LBAA",
        "WRG25MAAA"
    ],

    APC0201: [
        "L0698195AA01",
        "L0706492AA02",
        "L0724597AA01",
        "L0736063AA01",
        "L0736066AA01"
    ],

    APC0202: [
        "L002194708NCPAA",
        "L0676258AA05",
        "L0706490AA03",
        "L0706491AA03",
        "L0776538AA01",
        "L0780891AA01"
    ],

    APC0203: [
        "346779",
        "346803",
        "0010686",
        "5CC-DF6SLSEP",
        "L0672525AA01"
    ],

    APC0204: [
        "25ZZ5",
        "L0148229AA02",
        "L0269501AA01",
        "L0617164AA01",
        "L0697064AA01",
        "Q010000839",
        "Q92K204G19",
        "Q92K204G20"
    ],

    APC0205: [
        "L002799380NCPAA",
        "L002806896NCPAA",
        "L002806897NCPAA",
        "L002914716NCPAA",
        "L003142004NCPAA",
        "L003142005NCPAA"
    ],

    APC0206: [
        "L001698202NCPAA",
        "L002053089NCPAA",
        "L002799378NCPAA",
        "L002799379NCPAB",
        "L002907225NCPAB",
        "L002914905NCPAA",
        "L0609247AA01"
    ],

    APC0211: [
        "L0698200AA01",
        "L0698203AA01",
        "L0797678AA01",
        "L0797679AA01"
    ],

    APC0212: [
        "L0654899AA01",
        "L0797825AA01",
        "L0806941AA01",
        "L0806942AA01",
        "L0806943AA01",
        "L0806944AA01"
    ],

    APC0213: [
        "L002798842NCPAC",
        "L0701143AA01",
        "L0753466AA01",
        "L0802979AA01",
        "L0802980AA01",
        "L0802981AA01"
    ],

    APC0214: [
        "L001423285NCPAA",
        "L001450016NCPAA",
        "L001553609NCPAA",
        "L001614470NCPAA",
        "L001676174NCPAA",
        "L001676224NCPAA"
    ],

    APC0215: [
        "L003141998NCPAA",
        "L003141999NCPAA",
        "L003142000NCPAA",
        "L003142001NCPAA",
        "L003142002NCPAA",
        "L003142003NCPAA"
    ]
};

const itemAmounts = {};
const STORAGE_KEY = 'invrack_itemAmounts';
document.addEventListener('DOMContentLoaded', () => {
    if (window.M) {
        M.Modal.init(document.querySelectorAll('.modal'));
        M.Sidenav.init(document.querySelectorAll('.sidenav'));
    }
    loadFromLocalStorage();
    const column = document.getElementById('columnSelect'),
        rack = document.getElementById('rackSelect');
    column.addEventListener('change', updateRacks);
    rack.addEventListener('change', displayItems);
    document.getElementById('prevRackBtn').onclick = prevRack;
    document.getElementById('prevRackBottom').onclick = prevRack;
    document.getElementById('nextRackBtn').onclick = nextRack;
    document.getElementById('nextRackBottom').onclick = nextRack;
    document.getElementById('confirmResetBtn').onclick = confirmReset;
    updateRacks();
});

function toast(html, classes = 'blue') {
    if (window.M) M.toast({
        html,
        classes,
        displayLength: 2000
    });
}

function loadFromLocalStorage() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        if (saved && typeof saved === 'object') Object.assign(itemAmounts, saved);
    } catch (error) {
        console.error('Could not load rack inventory', error);
        localStorage.removeItem(STORAGE_KEY);
    }
}

function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itemAmounts));
    updateProgress();
}

function updateRacks() {
    const group = document.getElementById('columnSelect').value,
        select = document.getElementById('rackSelect'),
        previous = select.value;
    select.innerHTML = '';
    (racks[group] || []).forEach(value => select.add(new Option(value, value)));
    if ([...select.options].some(option => option.value === previous)) select.value = previous;
    displayItems();
}

function displayItems() {
    const select = document.getElementById('rackSelect'),
        rack = select.value,
        list = document.getElementById('itemDisplay'),
        selected = items[rack] || [];
    document.getElementById('rackTitle').textContent = rack || 'Sin ubicacion';
    document.getElementById('rackPosition').textContent = select.options.length ? `${select.selectedIndex+1} de ${select.options.length}` : '';
    document.getElementById('emptyRack').hidden = selected.length > 0;
    list.innerHTML = '';
    selected.forEach(item => {
        const row = document.createElement('div');
        row.className = 'inventory-item';
        const name = document.createElement('span');
        name.className = 'item-number';
        name.textContent = item;
        const control = document.createElement('label');
        control.className = 'quantity-control';
        const hint = document.createElement('span');
        hint.textContent = 'Cant.';
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.step = '1';
        input.inputMode = 'numeric';
        input.value = itemAmounts[item] ?? '';
        input.setAttribute('aria-label', `Cantidad para ${item}`);
        input.addEventListener('input', () => {
            updateAmount(item, input.value);
            row.classList.toggle('completed', input.value !== '');
            updateRackStats(selected);
        });
        input.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const inputs = [...list.querySelectorAll('input')],
                    next = inputs[inputs.indexOf(input) + 1];
                if (next) next.focus();
                else nextRack();
            }
        });
        control.append(hint, input);
        row.append(name, control);
        row.classList.toggle('completed', input.value !== '');
        list.append(row);
    });
    updateRackStats(selected);
    updateProgress();
    updateButtons();
}

function updateAmount(item, value) {
    if (value === '') delete itemAmounts[item];
    else itemAmounts[item] = Math.max(0, Number(value));
    saveToLocalStorage();
}

function updateRackStats(selected) {
    const complete = selected.filter(item => itemAmounts[item] !== undefined && itemAmounts[item] !== '').length;
    document.getElementById('rackCompleted').textContent = complete;
    document.getElementById('rackTotal').textContent = `de ${selected.length}`;
}

function updateProgress() {
    const all = Object.values(items).flat(),
        complete = all.filter(item => itemAmounts[item] !== undefined && itemAmounts[item] !== '').length;
    document.getElementById('completedCount').textContent = complete;
    document.getElementById('totalCount').textContent = `de ${all.length} capturados`;
}

function updateButtons() {
    const select = document.getElementById('rackSelect'),
        first = select.selectedIndex <= 0,
        last = select.selectedIndex >= select.options.length - 1;
    document.getElementById('prevRackBtn').disabled = first;
    document.getElementById('prevRackBottom').disabled = first;
    document.getElementById('nextRackBtn').disabled = last;
    document.getElementById('nextRackBottom').disabled = last;
}

function moveRack(direction) {
    const select = document.getElementById('rackSelect'),
        next = select.selectedIndex + direction;
    if (next >= 0 && next < select.options.length) {
        select.selectedIndex = next;
        displayItems();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } else toast(direction < 0 ? 'Ya estas en el primer rack' : 'Ya estas en el ultimo rack', 'blue-grey');
}

function prevRack() {
    moveRack(-1)
}

function nextRack() {
    moveRack(1)
}

function getFormattedTimestamp() {
    const now = new Date(),
        pad = n => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

function csvCell(value) {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g,'""')}"` : text;
}

function generateCSV() {
    return ['Rack,Item,Amount', ...Object.entries(items).flatMap(([rack, list]) => list.map(item => [rack, item, itemAmounts[item] ?? 0].map(csvCell).join(',')))].join('\n');
}

function createCSV() {
    const filename = `Racks_${getFormattedTimestamp()}.csv`,
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
    } = createCSV(), url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
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
                title: 'Inventario Racks',
                text: `Archivo generado: ${data.filename}`,
                files: [data.file]
            });
            toast(`Compartido: ${data.filename}`, 'green');
            return;
        }
    } catch (error) {
        if (error.name === 'AbortError') return;
    }
    toast('Compartir no disponible; se descargara el archivo', 'orange');
    downloadCSV();
}

function resetData() {
    M.Modal.getInstance(document.getElementById('reset-confirm-modal')).open();
}

function confirmReset() {
    Object.keys(itemAmounts).forEach(key => delete itemAmounts[key]);
    localStorage.removeItem(STORAGE_KEY);
    displayItems();
    M.Modal.getInstance(document.getElementById('reset-confirm-modal')).close();
    toast('Inventario reiniciado', 'red');
	M.Modal.getInstance(document.getElementById('settings-modal')).close();
}