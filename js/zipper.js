const parts = ['5CC-CH-PLF8-645D', 'L00144987006HAA', 'L001449870U52AA', '255S5-195A', '255S5-184D', 'L0449870AA0102F', 'L0449870AA0164D'];
let selectedParts = [],
    currentPart = '',
    modalTimeout;
const MODAL_TIMEOUT_MINUTES = 5;
parts.forEach(p => {
    let b = document.createElement('button');
    b.className = 'part-btn';
    b.textContent = p;
    b.onclick = () => openQtyModal(p);
    partGrid.appendChild(b);
});

function showStep(s) {
    document.querySelectorAll('.step').forEach(x => x.classList.remove('active'));
    document.getElementById(s).classList.add('active');
}

function openWorkflow() {
    selectedParts = [];
    selectedList.innerHTML = '';
    worker1.value = '';
    worker2.value = '';
    workflowModal.style.display = 'block';
    showStep('step1');
    resetModalTimer();
    setTimeout(() => worker1.focus(), 100)
}

function closeWorkflow() {
    clearTimeout(modalTimeout);
    workflowModal.style.display = 'none'
}

function resetModalTimer() {
    clearTimeout(modalTimeout);
    modalTimeout = setTimeout(() => {
        if (workflowModal.style.display === 'block') closeWorkflow()
    }, MODAL_TIMEOUT_MINUTES * 60000)
}

function goStep2() {

    let value =
        worker1.value.trim();

    if (!/^\d{5,}$/.test(value)) {
        return alert(
            'Por favor, escanee un número de identificación válido.'
        );
    }

    showStep('step2');
}

function goStep3() {
    if (!selectedParts.length) return alert('Select a part');
    showStep('step3');
    setTimeout(() => worker2.focus(), 100)
}

function openQtyModal(p) {
    currentPart = p;
    qtyPartName.textContent = p;
    qtyInput.value = 1;
    qtyModal.style.display = 'block';
    setTimeout(() => {
        qtyInput.focus();
        qtyInput.select()
    }, 100)
}

function addPartToList() {
    selectedParts.push({
        part: currentPart,
        packs: +qtyInput.value
    });
    selectedList.innerHTML = selectedParts.map(i => '<div>' + i.part + ' - ' + i.packs + ' Packs</div>').join('');
    qtyModal.style.display = 'none'
}

function saveRecord() {

    let value =
        worker2.value.trim();

    if (!/^\d{5,}$/.test(value)) {
        return alert(
            'Por favor, escanee un número de identificación válido.'
        );
    }

    let r = JSON.parse(
        localStorage.getItem('workflowRecords') || '[]'
    );

    r.push({
        worker1: worker1.value,
        worker2: worker2.value,
        dateTime: new Date().toLocaleString(),
        createdTimestamp: new Date().toISOString(),
        parts: selectedParts,
        completed: false
    });

    localStorage.setItem(
        'workflowRecords',
        JSON.stringify(r)
    );

    closeWorkflow();
    loadHistory();
    loadRequestList();
}

function markCompleted(i) {
    let r = JSON.parse(localStorage.getItem('workflowRecords') || '[]');
    r[i].completed = true;
    r[i].completedTime = new Date().toLocaleString();
    localStorage.setItem('workflowRecords', JSON.stringify(r));
    loadHistory();
    loadRequestList();
}

function loadRequestList() {
    let r = JSON.parse(localStorage.getItem('workflowRecords') || '[]');
    requestList.innerHTML = '';
    r.slice().reverse().forEach(x => {
        let mins = Math.floor((Date.now() - new Date(x.createdTimestamp)) / 60000);
        requestList.innerHTML += `<div class="request-card ${x.completed?'completed':''}"><b>${x.completed?'SURTIDO':'PENDING'}</b><br>Creado: ${x.dateTime}<br>Transcurrido: ${mins} min<ul>${x.parts.map(p=>`<li>${p.part} - ${p.packs} Cajas</li>`).join('')}</ul></div>`
    })
}

function loadHistory() {
    let r = JSON.parse(localStorage.getItem('workflowRecords') || '[]');
    historyBody.innerHTML = '';
    r.slice().reverse().forEach((rec, ri) => {
        let idx = r.length - 1 - ri;
        rec.parts.forEach(p => historyBody.innerHTML += `<tr><td>${p.part}</td><td>${p.packs}</td><td>${rec.worker1}</td><td>${rec.worker2}</td><td>${rec.dateTime}</td><td>${rec.completed?'SURTIDO':`<button class='surtido-btn' onclick='markCompleted(${idx})'>SURTIDO</button>`}</td></tr>`)
    })
}
const RESET_PASSWORD = "789123";

function resetRecords() {

    const password = prompt(
        'Ingrese la contraseña para eliminar todos los registros.'
    );

    if (password !== RESET_PASSWORD) {
        alert('Contraseña incorrecta');
        return;
    }

    if (confirm('Borrar registro?')) {
        localStorage.removeItem('workflowRecords');
        loadHistory();
        loadRequestList();
    }
}
worker1.addEventListener('keydown', e => {
    if (e.key === 'Enter') goStep2()
});
worker2.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveRecord()
});
qtyInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') addPartToList()
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeWorkflow();
    resetModalTimer()
});
document.addEventListener('click', resetModalTimer);
document.addEventListener('mousemove', resetModalTimer);
workflowModal.addEventListener('click', e => {
    if (e.target === workflowModal) closeWorkflow()
});
loadHistory();
loadRequestList();
setInterval(loadRequestList, 60000);

function exportToExcel() {
    let records = JSON.parse(localStorage.getItem('workflowRecords') || '[]');

    let csv =
        'Part,Cajas,Produccion,Materiales,FechaHora,Status\n';

    records.forEach(rec => {
        rec.parts.forEach(p => {
            csv +=
                `${p.part},${p.packs},${rec.worker1},${rec.worker2},${rec.dateTime},${rec.completed ? 'SURTIDO' : 'PENDING'}\n`;
        });
    });

    const blob = new Blob([csv], {
        type: 'text/csv;charset=utf-8;'
    });

    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = 'workflow_records.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.getElementById('current-year').textContent = new Date().getFullYear();
const originalLoadHistory = loadHistory;
loadHistory = function() {
    originalLoadHistory();
    const records = JSON.parse(localStorage.getItem('workflowRecords') || '[]');
    document.getElementById('pendingCount').textContent = records.filter(r => !r.completed).length;
    document.getElementById('completeCount').textContent = records.filter(r => r.completed).length;
    document.getElementById('recordCount').textContent = records.reduce((n, r) => n + r.parts.length, 0);
    document.getElementById('emptyHistory').hidden = records.length > 0;
};
const originalShowStep = showStep;
showStep = function(s) {
    originalShowStep(s);
    ['1', '2', '3'].forEach(n => document.getElementById('progress' + n)?.classList.toggle('active', s === 'step' + n));
};
loadHistory();