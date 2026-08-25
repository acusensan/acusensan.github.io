document.addEventListener('DOMContentLoaded', () => {
  M.FormSelect.init(document.querySelectorAll('select'));
});

/* Elements */
const typeSelect = document.getElementById('barcodeType');
const valueInput = document.getElementById('barcodeValue');
const helperText = document.getElementById('helperText');
const barcodeSvg = document.getElementById('barcode');
const downloadBtn = document.getElementById('downloadBtn');

/* Type change */
typeSelect.addEventListener('change', () => {
  valueInput.disabled = false;
  valueInput.value = '';
  valueInput.focus();

  const label = typeSelect.options[typeSelect.selectedIndex].text;
  helperText.textContent = `Ingrese valor para ${label}`;

  /* Mobile keyboard optimization */
  if (typeSelect.value === 'Q') {
    valueInput.type = 'number';
    valueInput.inputMode = 'numeric';
  } else {
    valueInput.type = 'text';
    valueInput.inputMode = 'text';
  }

  generateBarcode();
});

/* Input change */
valueInput.addEventListener('input', generateBarcode);

/* Barcode generation */
function generateBarcode() {
  const type = typeSelect.value;
  const val = valueInput.value.trim();

  if (!type || !val) {
    barcodeSvg.innerHTML = '';
    downloadBtn.disabled = true;
    return;
  }

  //  Add the "L" prefix for the barcode
  const fullValue = "L" + val.toUpperCase();

  JsBarcode("#barcode", fullValue, {
    format: "CODE128",
    height: window.innerWidth < 600 ? 90 : 120,
    displayValue: true,

    // Show WITHOUT the added "L"
    text: val.toUpperCase(),

    fontSize: 50,
    margin: 10
  });

  downloadBtn.disabled = false;
}


/* Clear everything */
function clearAll() {
  typeSelect.selectedIndex = 0;
  valueInput.value = '';
  valueInput.disabled = true;
  helperText.textContent = 'Seleccione tipo de codigo';
  barcodeSvg.innerHTML = '';
  downloadBtn.disabled = true;

  M.FormSelect.init(typeSelect);
}

/* Download barcode */
function downloadBarcode() {
  const svg = document.querySelector("#barcode");
  if (!svg) return;

  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg);

  const svgBlob = new Blob(
    ['<?xml version="1.0" standalone="no"?>\r\n', source],
    { type: 'image/svg+xml;charset=utf-8' }
  );

  const url = URL.createObjectURL(svgBlob);
  const link = document.createElement("a");
  link.href = url;
  const fileName = valueInput.value.trim() || "barcode";
  link.download = fileName + ".svg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}