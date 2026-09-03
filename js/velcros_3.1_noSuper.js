let orders = JSON.parse(localStorage.getItem('velcro_v3') || '[]');
let monitorUnlocked = false;
let draft = {
    worker: '',
    area: '',
    mat: '',
    qty: '',
    unit: ''
};
let currentTab = 'material';
let wipeUnlocked = false;
let wipeTimer = null;

const WIPE_PASSWORD = "test";

const unidades = {
    "Unidad 1": [
        "Modulo 1 Rsc 60%",
        "Modulo 2 Rsc 60%",
        "Modulo 3 Rsb 100%",
        "Modulo 4 Rsb 100%",
        "Modulo 5 Rsb 100%",
        "Modulo 6 Rsb 100%",
        "Modulo 7 40% Rsc",
        "Modulo 8 40% Rsc",
        "Modulo 9 Rsc 40%/60%",
        "Modulo 10 40% Rsc",
        "Modulo 11 Rsb Fixed",
        "Modulo 12 Rsb 100%",
        "Modulo 13 Rsb 40%",
        "Modulo 14 Rsb 40%",
        "Modulo 15 Rsc 60%",
        "Modulo 16 Rsc 60%",
        "Modulo 17 Rsc 40%/60% Fixed Back",
        "Modulo 18 Rsb 40%/60% Flip over",
        "Modulo 19 Savana Fsc"
    ],
    "Unidad 2": [
        "Modulo 1 Asiento Trasero 40%/60%",
        "Modulo 2 Asiento Trasero 40%/60%",
        "Modulo 3 Asiento Trasero 40%/60%",
        "Modulo 4 Asiento Trasero 40%/60%",
        "Modulo 5 Respaldo Trasero 40%/60%",
        "Modulo 6 Respaldo Trasero 40%/60%",
        "Modulo 7 Respaldo Trasero 40%/60%",
        "Modulo 8 Respaldo Trasero 40%/60%",
        "Modulo 10 Respaldo Trasero 60%",
        "Modulo 11 Asiento Trasero 60%",
        "Modulo 12 Asiento Trasero 40%",
        "Modulo 13 Respaldo Trasero 100%",
        "Modulo 14 Respaldo Trasero 100%"
    ]
};


const materialCatalog = {
    Velcros: [
        "170480", "L0575410AA01", "L0633654AA01", "190562", "KRG25LTCA",
        "L0429142AA02", "L0575409AA01", "WRG16HMAA", "WRG16LBAA",
        "WRG25LBAA", "WRG25MAAA"
    ],
    PullStrap: [
        "L00180970202FAA", "L00180970209XAA", "L00180970245DAA",
        "L00180970264DAA", "L001809702GKAAA", "L00180970206HAA",
        "L001809702HXWAA"
    ],
    Lace: [
        "L002618822NCPAA", "L0672525AA01", "L0549303AA01"
    ],
    Elastico: [
        "L002162447NCPAA", "L0495624AA01"
    ],
    Binding: [
        "346779", "346803"
    ],
    Etiqueta: [
        "L0617164AA01", "L0697064AA01", "L0148229AA02"
    ],
    Boton: [
        "Q010000839", "Q92K204G19", "Q92K204G20"
    ],
    Hilos: ["291577X33-110D", "291577X33-149B", "291577X33-848", "41577X69-110D", "41577X69-8927", "91577X92-110D", "91577X92-119X", "91577X92-309X", "91577X92-313N", "91577X92-341M", "91577X92-395A", "91577X92-645D", "91577X92-834T", "91577X92-8927", "91577X92-9936", "91577X92-999K", "L001583835C46AA", "L001583852C46AA", "L00162055706HAA", "L00162055731EAA", "L00162055763JAA", "L00162055773DAA", "L00162055776CAA", "L00162055788TAA", "L001620557CAMAA", "L001620557E03AA", "L001620557G32AA", "L001620557GSBAA", "L001620557HXWAA", "L00162055906HAA", "L00162055931EAA", "L00162055963JAA", "L00162055973DAA", "L00162055988TAA", "L001620559CAMAA", "L001620559E03AA", "L001620559G32AA", "L001620559GSBAA", "L001620559HXWAA", "L0620557AA0101F", "L0620557AA0102F", "L0620557AA0164D", "L0620557AA0173D", "L0620557AA01E02", "L0620557AA01X07", "L0620557AA01XTS", "L0620559AA0101F", "L0620559AA0102F", "L0620559AA0164D", "L0620559AA01E02", "L0620559AA01X07", "L0620559AA01XTS", "L0749224AA01", "M15H60ATLBXEZ", "M15H63AWSB", "N03425756033", "T35WCWHITE", "WYNGB3-119X", "WYNGB3-167A", "WYNGB3-309X", "WYNGB3-313N", "WYNGB3-341M", "WYNGB3-395A", "WYNGB3-400C", "WYNGB3-645D", "WYNGB3-834T", "WYNGB3-9936", "WYNGB3-999K"

    ]
};

const materialUnits = {
    Velcros: ['Bolsa', 'Rollo'],
    PullStrap: ['Bolsa'],
    Elastico: ['Bolsa'],
    Etiqueta: ['Bolsa'],
    Boton: ['Bolsa'],
    Lace: ['Rollo'],
    Binding: ['Rollo'],
    Hilos: ['Rollo', 'Caja']

};

function showToast(m) {
    const t = document.getElementById('toast');
    t.innerText = m;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 2500);
}

function setTab(t) {
    if (t === 'status' && !monitorUnlocked) {
        const pass = prompt("Contraseña Monitor:");
        if (pass === 'test') monitorUnlocked = true;
        else return showToast("Incorrecto");
    }
    currentTab = t;
    if (t !== 'status') {
        wipeUnlocked = false;
        const btn = document.getElementById('wipeBtn');
        if (btn) btn.style.display = 'none';
    }

    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(`nav-${t}`).classList.add('active');
    if (t === 'material') goToStep(1);
    render();
}

function goToStep(s) {
    document.querySelectorAll('.step-container').forEach(div => div.style.display = 'none');
    document.getElementById('step' + s).style.display = 'block';
    if (s === 1) document.getElementById('flow-id').focus();
}

function selectMat(m) {
    draft.mat = m;
    buildMaterialMenu(m);
    goToStep('MaterialDetail');
}

function selectUnit(u) {
    draft.unit = u;
    document.querySelectorAll('#unit-options .option-btn').forEach(b => {
        b.style.background = b.innerText === u ? 'var(--primary-container)' : '#fff';
    });
}


function finishOrder() {
    draft.worker = document.getElementById('flow-id').value.trim();
    draft.qty = document.getElementById('flow-qty').value;
    if (!draft.worker || !draft.qty || !draft.unit) return showToast("Complete todos los campos");

    const o = {
        ...draft,
        id: Date.now(),
        status: 'PENDING',
        created: new Date().toISOString()
    };
    orders.push(o);
    localStorage.setItem('velcro_v3', JSON.stringify(orders));

    // --- SHOW SUCCESS NOTIFICATION & WAIT ---
    const overlay = document.getElementById('successScreen');
    const countSpan = document.getElementById('countdown');
    overlay.style.display = 'flex';

    let seconds = 5;
    countSpan.innerText = seconds;
    const interval = setInterval(() => {
        seconds--;
        countSpan.innerText = seconds;
        if (seconds <= 0) {
            clearInterval(interval);
            overlay.style.display = 'none';
            resetWizard();
        }
    }, 1000);
}

function resetWizard() {
    document.getElementById('flow-id').value = "";
    document.getElementById('flow-qty').value = "";
    document.getElementById('unit-options').innerHTML = "";
    draft = {
        worker: '',
        area: '',
        mat: '',
        qty: '',
        unit: ''
    };
    goToStep(1);
    render();
}

function lockMonitor() {
    monitorUnlocked = false;
    setTab('material');
}

function render() {
    ['material', 'status', 'log'].forEach(t => document.getElementById(`tab-${t}`).style.display = 'none');
    document.getElementById(`tab-${currentTab}`).style.display = 'block';

    if (currentTab === 'status') {
        const activeGrid = document.getElementById('activeGrid');
        const doneGrid = document.getElementById('doneGrid');
        activeGrid.innerHTML = "";
        doneGrid.innerHTML = "";

        const actives = orders.filter(o => o.status !== 'DONE');
        const dones = orders.filter(o => o.status === 'DONE');
        document.getElementById('dash-active').innerText = actives.length;
        document.getElementById('dash-delivered').innerText = dones.length;

        orders.forEach(o => {
            const elapsed = Math.floor((Date.now() - new Date(o.created)) / 60000);
            const htm = `
                    <div class="wide-card ${elapsed > 10 && o.status !== 'DONE' ? 'urgent' : ''}">
                        <div class="card-left">
                            <span style="font-size:1.1rem; font-weight:800">${o.mat}</span>
                            <span>${o.qty} ${o.unit}</span>
                        </div>
                        <div class="card-right">
                            <div class="card-main-info">
                                <b>${o.area} | ID: ${o.worker}</b>
                                <span style="font-size:0.8rem; color:#888">${new Date(o.created).toLocaleTimeString()} (${elapsed}m atrás)</span>
                            </div>
                            <div>
                                ${o.status === 'PENDING' ? `<button class="btn btn-primary" onclick="updateStatus(${o.id},'DELIVERED')">SURTIR</button>` : ''}
                                ${o.status === 'DELIVERED' ? `<input id="confirm-${o.id}"class="confirm-input" type="password" placeholder="Confirmar" onkeydown="if(event.key==='Enter') confirmReceive(${o.id},this)">` : ''}
                                ${o.status === 'DONE' ? `<span>ENTREGADO ✓</span>` : ''}
                            </div>
                        </div>
                    </div>`;
            if (o.status === 'DONE') doneGrid.innerHTML = htm + doneGrid.innerHTML;
            else activeGrid.innerHTML += htm;
        });
    }

    if (currentTab === 'log') {
        const s = document.getElementById('logSearch').value.toLowerCase();
        document.getElementById('logItems').innerHTML = orders.filter(o => o.worker.toLowerCase().includes(s)).reverse().map(o => `
                <div style="padding:12px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; font-size:0.9rem">
                    <span>${new Date(o.created).toLocaleString()} | <b>${o.area}</b> | ID: ${o.worker}</span>
                    <span>${o.qty} ${o.mat} | <b>${o.status}</b></span>
                </div>`).join('');
    }
}

function updateStatus(id, s) {
    orders = orders.map(o => {
        if (o.id !== id) return o;
        const nowIso = new Date().toISOString();
        return {
            ...o,
            status: s,
            ...(s === 'DELIVERED' ? {
                deliveredAt: nowIso
            } : {}),
            ...(s === 'DONE' ? {
                doneAt: nowIso
            } : {})
        };
    });
    localStorage.setItem('velcro_v3', JSON.stringify(orders));
    render();

    if (s === 'DELIVERED') {
        setTimeout(() => {
            const input = document.getElementById(`confirm-${id}`);
            if (input) input.focus();
        }, 50); // small delay to allow DOM render
    }

}

// inside render() when currentTab === 'status'
const today = new Date().toISOString().slice(0, 10);
const donesToday = orders.filter(o => o.status === 'DONE' && o.doneAt && o.doneAt.slice(0, 10) === today).length;
document.getElementById('dash-delivered').innerText = String(donesToday);

function confirmReceive(id, input) {
    const o = orders.find(x => x.id === id);
    if (input.value === o.worker) updateStatus(id, 'DONE');
    else {
        showToast("ID incorrecto");
        input.value = "";
    }
}

function downloadCSV() {
    let csv = "Fecha,Hora,Area,ID,Material,Cant,Status\n";
    orders.forEach(o => {
        const d = new Date(o.created);
        csv += `${d.toLocaleDateString()},${d.toLocaleTimeString()},${o.area},${o.worker},${o.mat},${o.qty},${o.status}\n`;
    });
    const blob = new Blob([csv], {
        type: 'text/csv'
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Reporte_Velcros.csv';
    a.click();
}

function buildMaterialMenu(material) {
    const container = document.getElementById("material-options");
    container.innerHTML = "";

    (materialCatalog[material] || []).forEach(code => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.innerText = code;
        btn.onclick = () => selectMaterialCode(code);
        container.appendChild(btn);
    });
}

function selectMaterialCode(code) {
    draft.mat = `${draft.mat} - ${code}`;
    document.getElementById('summary-text').innerText = `${draft.mat} - Cantidad`;
    buildUnitOptions(draft.mat);
    goToStep(4);
}

function buildUnitOptions(material) {
    const container = document.getElementById('unit-options');
    container.innerHTML = "";
    draft.unit = "";

    const baseMaterial = material.split(' - ')[0]; // removes part number
    const units = materialUnits[baseMaterial] || [];

    units.forEach(u => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = u;
        btn.onclick = () => selectUnit(u);
        container.appendChild(btn);
    });
    if (units.length === 1) {
        selectUnit(units[0]);
        container.firstChild.style.background = 'var(--primary-container)';
    }
}

function startWipeUnlock() {
    if (wipeUnlocked) return;

    wipeTimer = setTimeout(() => {
        wipeUnlocked = true;
        document.getElementById("wipeBtn").style.display = "block";
        showToast("WIPE desbloqueado");
    }, 5000); // 5 seconds
}

function cancelWipeUnlock() {
    clearTimeout(wipeTimer);
}

function clearData() {
    const pass = prompt("Contraseña WIPE:");

    if (pass !== WIPE_PASSWORD) {
        showToast("Contraseña incorrecta");
        return;
    }

    if (!confirm("¿WIPE total? Esta acción NO se puede deshacer")) return;

    orders = [];
    localStorage.setItem('velcro_v3', '[]');
    render();
    showToast("Datos eliminados");
}

function selectUnidad(unidad) {
    buildModuloMenu(unidad);
    goToStep('2b');
}

function buildModuloMenu(unidad) {
    const container = document.getElementById("modulo-options");
    container.innerHTML = "";
    document.getElementById("modulo-title").innerText = unidad;

    (unidades[unidad] || []).forEach(modulo => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.innerText = modulo;
        btn.onclick = () => selectModulo(unidad, modulo);
        container.appendChild(btn);
    });
}

function selectModulo(unidad, modulo) {
    draft.area = `${unidad} - ${modulo}`;
    goToStep(3);
}

function addDigit(d) {
    const input = document.getElementById('flow-qty');
    if (input.value === "0") input.value = d;
    else input.value += d;
}

function clearQty() {
    document.getElementById('flow-qty').value = "";
}

function backspaceQty() {
    const input = document.getElementById('flow-qty');
    input.value = input.value.slice(0, -1);
}
setInterval(() => {
    if (currentTab === 'status') render();
}, 15000);


document.addEventListener('DOMContentLoaded', () => {
    render();
    setTimeout(() => document.getElementById('flow-id')?.focus(), 80);
});