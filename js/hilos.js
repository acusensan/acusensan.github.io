document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar'),
        calibreFilter = document.getElementById('calibreFilter'),
        clearSearch = document.getElementById('clearSearch'),
        dataContainer = document.getElementById('dataContainer'),
        emptyResults = document.getElementById('emptyResults'),
        loadError = document.getElementById('loadError'),
        resultCount = document.getElementById('resultCount'),
        modal = document.getElementById('thread-modal'),
        modalImage = document.getElementById('modalImage'),
        details = document.getElementById('barcodeDetails'),
        detailPart = document.getElementById('detailPartNumber'),
        copyButton = document.getElementById('copyPartBtn');
    let selectedPart = '';
    if (window.M) {
        M.Modal.init(document.querySelectorAll('.modal'));
        M.Sidenav.init(document.querySelectorAll('.sidenav'));
    }
    if (!window.hilosDB) {
        loadError.hidden = false;
        resultCount.textContent = '0';
        return;
    }
    const data = Object.entries(window.hilosDB).map(([partNumber, item]) => ({
        partNumber,
        location: item.location || '',
        description: item.description || '',
        calibre: item.calibre || '',
        color: item.color || '',
        um: item.um || '',
        kanban: item.kanban ?? '',
        productionLine: item.productionLine || ''
    })).sort((a, b) => a.location.localeCompare(b.location, undefined, {
        numeric: true
    }) || a.partNumber.localeCompare(b.partNumber, undefined, {
        numeric: true
    }));
    [...new Set(data.map(item => item.calibre).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, {
        numeric: true
    })).forEach(value => calibreFilter.add(new Option(value, value)));
    searchBar.addEventListener('input', applyFilters);
    calibreFilter.addEventListener('change', applyFilters);
    clearSearch.addEventListener('click', () => {
        searchBar.value = '';
        clearSearch.hidden = true;
        applyFilters();
        searchBar.focus();
    });
    copyButton.addEventListener('click', () => copyPart(selectedPart));

    function applyFilters() {
        const query = searchBar.value.trim().toLocaleLowerCase('es'),
            calibre = calibreFilter.value;
        clearSearch.hidden = !query;
        const matches = data.filter(item => (!calibre || item.calibre === calibre) && (!query || [item.partNumber, item.color, item.location, item.description, item.calibre, item.productionLine].some(value => String(value).toLocaleLowerCase('es').includes(query))));
        displayData(matches);
    }

    function displayData(items) {
        dataContainer.innerHTML = '';
        resultCount.textContent = items.length;
        emptyResults.hidden = items.length !== 0;
        if (!items.length) return;
        const table = document.createElement('table');
        table.className = 'thread-table';
        table.innerHTML = '<thead><tr><th>Ubicacion</th><th>Numero de parte</th><th>Color</th><th>Calibre</th><th><span class="sr-only">Abrir</span></th></tr></thead>';
        const tbody = document.createElement('tbody');
        items.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'thread-row';
            row.tabIndex = 0;
            row.setAttribute('role', 'button');
            row.setAttribute('aria-label', `Abrir ${item.partNumber}`);
            row.innerHTML = `<td class="location-cell"><span class="location-badge"></span></td><td class="part-cell"><strong></strong><small></small></td><td class="color-cell"></td><td class="calibre-cell"><span class="calibre-badge"></span></td><td class="row-arrow" aria-hidden="true">›</td>`;
            row.querySelector('.location-badge').textContent = item.location;
            row.querySelector('.part-cell strong').textContent = item.partNumber;
            row.querySelector('.part-cell small').textContent = item.description;
            row.querySelector('.color-cell').textContent = item.color;
            row.querySelector('.calibre-badge').textContent = item.calibre;
            row.onclick = () => showBarcode(item.partNumber);
            row.onkeydown = e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    showBarcode(item.partNumber);
                }
            };
            tbody.append(row);
        });
        table.append(tbody);
        dataContainer.append(table);
    }

    function showBarcode(partNumber) {
        const item = window.hilosDB[partNumber];
        if (!item) return;
        selectedPart = partNumber;
        detailPart.textContent = partNumber;
        details.innerHTML = '';
        const labels = {
            description: 'Descripcion',
            calibre: 'Calibre',
            color: 'Color',
            um: 'Unidad de medida',
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