document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar'),
        lineFilter = document.getElementById('lineFilter'),
        clearSearch = document.getElementById('clearSearch'),
        dataContainer = document.getElementById('dataContainer'),
        emptyResults = document.getElementById('emptyResults'),
        loadError = document.getElementById('loadError'),
        resultCount = document.getElementById('resultCount'),
        modal = document.getElementById('part-modal'),
        modalImage = document.getElementById('modalImage'),
        details = document.getElementById('barcodeDetails'),
        detailPart = document.getElementById('detailPartNumber'),
        copyButton = document.getElementById('copyPartBtn');
    let selectedPart = '';
    if (window.M) {
        M.Modal.init(document.querySelectorAll('.modal'));
        M.Sidenav.init(document.querySelectorAll('.sidenav'));
    }
    if (!window.partsDB) {
        loadError.hidden = false;
        resultCount.textContent = '0';
        return;
    }
    const data = Object.entries(window.partsDB).map(([partNumber, item]) => ({
        partNumber,
        description: item.description || '',
        pack: item.pack ?? '',
        cost: item.cost ?? '',
        weight: item.weight ?? '',
        line: item.line || '',
        daily: item.daily ?? '',
        kanban: item.kanban ?? '',
        location: item.location || '',
        productionLine: item.productionLine || ''
    })).sort((a, b) => a.location.localeCompare(b.location, undefined, {
        numeric: true
    }) || a.partNumber.localeCompare(b.partNumber, undefined, {
        numeric: true
    }));
    [...new Set(data.map(item => item.line).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, {
        numeric: true
    })).forEach(value => lineFilter.add(new Option(value, value)));
    searchBar.addEventListener('input', applyFilters);
    lineFilter.addEventListener('change', applyFilters);
    clearSearch.addEventListener('click', () => {
        searchBar.value = '';
        clearSearch.hidden = true;
        applyFilters();
        searchBar.focus();
    });
    copyButton.addEventListener('click', () => copyPart(selectedPart));

    function applyFilters() {
        const query = searchBar.value.trim().toLocaleLowerCase('es'),
            line = lineFilter.value;
        clearSearch.hidden = !query;
        const matches = data.filter(item => (!line || item.line === line) && (!query || [item.partNumber, item.description, item.location, item.line, item.productionLine].some(value => String(value).toLocaleLowerCase('es').includes(query))));
        displayData(matches);
    }

    function displayData(items) {
        dataContainer.innerHTML = '';
        resultCount.textContent = items.length;
        emptyResults.hidden = items.length !== 0;
        if (!items.length) return;
        const table = document.createElement('table');
        table.className = 'parts-table';
        table.innerHTML = '<thead><tr><th>Ubicacion</th><th>Numero de parte</th><th>Standard Pack</th><th>Linea</th><th><span class="sr-only">Abrir</span></th></tr></thead>';
        const tbody = document.createElement('tbody');
        items.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'part-row';
            row.tabIndex = 0;
            row.setAttribute('role', 'button');
            row.setAttribute('aria-label', `Abrir ${item.partNumber}`);
            row.innerHTML = '<td class="location-cell"><span class="location-badge"></span></td><td class="part-cell"><strong></strong><small></small></td><td class="pack-cell"><span class="pack-badge"></span></td><td class="color-cell"></td><td class="row-arrow" aria-hidden="true">›</td>';
            row.querySelector('.location-badge').textContent = item.location || '—';
            row.querySelector('.part-cell strong').textContent = item.partNumber;
            row.querySelector('.part-cell small').textContent = item.description;
            row.querySelector('.pack-badge').textContent = item.pack || '—';
            row.querySelector('.color-cell').textContent = item.line || '—';
            row.onclick = () => showPart(item.partNumber);
            row.onkeydown = e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    showPart(item.partNumber);
                }
            };
            tbody.append(row);
        });
        table.append(tbody);
        dataContainer.append(table);
    }

    function showPart(partNumber) {
        const item = window.partsDB[partNumber];
        if (!item) return;
        selectedPart = partNumber;
        detailPart.textContent = partNumber;
        details.innerHTML = '';
        const labels = {
            description: 'Descripcion',
            pack: 'Standard Pack',
            cost: 'Costo',
            weight: 'Peso',
            line: 'Linea',
            daily: 'Daily',
            kanban: 'Kanban',
            location: 'Ubicacion',
            productionLine: 'Linea de produccion'
        };
        Object.entries(labels).forEach(([key, label]) => {
            const pair = document.createElement('div');
            pair.className = 'detail-pair';
            const dt = document.createElement('dt'),
                dd = document.createElement('dd');
            dt.textContent = label;
            dd.textContent = item[key] ?? '—';
            pair.append(dt, dd);
            details.append(pair);
        });
        try {
            JsBarcode(modalImage, `P${partNumber}`, {
                format: 'CODE128',
                displayValue: true,
                text: partNumber,
                height: 90,
                fontSize: 24,
                margin: 10,
                background: '#fff',
                lineColor: '#000'
            });
        } catch (error) {
            console.error('Could not generate barcode', error);
            modalImage.innerHTML = '';
        }
        M.Modal.getInstance(modal).open();
    }

    function copyPart(text) {
        copyTextToClipboard(text).then(() => M.toast({
            html: 'Numero de parte copiado',
            classes: 'green darken-1'
        })).catch(() => M.toast({
            html: 'No se pudo copiar',
            classes: 'red'
        }));
    }
    displayData(data);
});

function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy') ? resolve() : reject(new Error('Copy failed'));
        } catch (error) {
            reject(error);
        } finally {
            textarea.remove();
        }
    });
}