document.addEventListener('DOMContentLoaded', () => {
    const typeSelect = document.getElementById('barcodeType');
    const valueInput = document.getElementById('barcodeValue');
    const helperText = document.getElementById('helperText');
    const valueLabel = document.getElementById('valueLabel');
    const barcodeSvg = document.getElementById('barcode');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');
    const emptyPreview = document.getElementById('emptyPreview');
    const barcodePreview = document.getElementById('barcodePreview');
    const previewStatus = document.getElementById('previewStatus');
    const encodedValue = document.getElementById('encodedValue');
    const encodedText = document.getElementById('encodedText');
    const configs = {
        L: {
            label: 'Localizacion',
            hint: 'Ingresa la ubicacion sin espacios adicionales.',
            placeholder: 'Ej. APC0121',
            mode: 'text'
        },
        P: {
            label: 'Numero de parte',
            hint: 'Ingresa el numero de parte completo.',
            placeholder: 'Ej. 12345678',
            mode: 'text'
        },
        S: {
            label: 'Numero de serie',
            hint: 'Ingresa el numero de serie.',
            placeholder: 'Ej. ABC12345',
            mode: 'text'
        },
        Q: {
            label: 'Cantidad',
            hint: 'Ingresa una cantidad mayor que cero.',
            placeholder: 'Ej. 25',
            mode: 'numeric'
        }
    };

    typeSelect.addEventListener('change', handleTypeChange);
    valueInput.addEventListener('input', generateBarcode);
    valueInput.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !downloadBtn.disabled) downloadBarcode();
    });
    downloadBtn.addEventListener('click', downloadBarcode);
    clearBtn.addEventListener('click', clearAll);

    function handleTypeChange() {
        const config = configs[typeSelect.value];
        valueInput.value = '';
        barcodeSvg.innerHTML = '';
        if (!config) {
            valueInput.disabled = true;
            valueInput.placeholder = 'Primero selecciona un tipo';
            helperText.textContent = 'Selecciona el tipo de dato para continuar.';
            valueLabel.textContent = 'Valor';
            resetPreview();
            return;
        }
        valueInput.disabled = false;
        valueInput.type = config.mode === 'numeric' ? 'number' : 'text';
        valueInput.inputMode = config.mode;
        valueInput.min = config.mode === 'numeric' ? '1' : '';
        valueInput.placeholder = config.placeholder;
        valueLabel.textContent = config.label;
        helperText.textContent = config.hint;
        resetPreview();
        valueInput.focus();
    }

    function normalizedValue() {
        return valueInput.value.trim().toUpperCase();
    }

    function fullValue() {
        return normalizedValue() ? `L${normalizedValue()}` : '';
    }

    function resetPreview() {
        barcodeSvg.innerHTML = '';
        emptyPreview.hidden = false;
        barcodePreview.hidden = true;
        downloadBtn.disabled = true;
        encodedValue.hidden = true;
        previewStatus.textContent = 'Sin datos';
        previewStatus.classList.remove('ready');
    }

    function generateBarcode() {
        const val = normalizedValue();
        if (!typeSelect.value || !val) {
            resetPreview();
            return;
        }
        if (typeSelect.value === 'Q' && Number(val) <= 0) {
            helperText.textContent = 'La cantidad debe ser mayor que cero.';
            resetPreview();
            return;
        }
        try {
            JsBarcode(barcodeSvg, fullValue(), {
                format: 'CODE128',
                height: window.innerWidth < 600 ? 82 : 110,
                width: 2,
                displayValue: true,
                text: val,
                fontSize: window.innerWidth < 600 ? 28 : 38,
                textMargin: 8,
                margin: 12,
                background: '#ffffff',
                lineColor: '#000000'
            });
            emptyPreview.hidden = true;
            barcodePreview.hidden = false;
            downloadBtn.disabled = false;
            encodedText.textContent = fullValue();
            encodedValue.hidden = false;
            previewStatus.textContent = 'Listo';
            previewStatus.classList.add('ready');
            barcodeSvg.setAttribute('aria-label', `Codigo de barras para ${val}`);
        } catch (error) {
            console.error('Barcode generation failed', error);
            helperText.textContent = 'No fue posible generar el codigo con este valor.';
            resetPreview();
        }
    }

    function clearAll() {
        typeSelect.value = '';
        valueInput.value = '';
        valueInput.type = 'text';
        valueInput.inputMode = 'text';
        valueInput.disabled = true;
        valueInput.placeholder = 'Primero selecciona un tipo';
        valueLabel.textContent = 'Valor';
        helperText.textContent = 'Selecciona el tipo de dato para continuar.';
        resetPreview();
        typeSelect.focus();
    }

    function downloadBarcode() {
        if (downloadBtn.disabled || !barcodeSvg.children.length) return;
        const source = new XMLSerializer().serializeToString(barcodeSvg);
        const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n', source], {
            type: 'image/svg+xml;charset=utf-8'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${normalizedValue().replace(/[^a-z0-9_-]+/gi,'_')||'barcode'}.svg`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        if (window.M) M.toast({
            html: 'Codigo descargado',
            classes: 'green darken-1',
            displayLength: 1800
        });
    }
});