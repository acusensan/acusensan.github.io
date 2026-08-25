document.addEventListener('DOMContentLoaded', function () {

  // INIT MATERIALIZE
  const elems = document.querySelectorAll('.modal');
  M.Modal.init(elems);
  const sidenavElems = document.querySelectorAll('.sidenav');
  M.Sidenav.init(sidenavElems);

  // SAFETY CHECK: is hilosDB loaded?
  if (!window.hilosDB) {
    console.error('hilosDB not loaded');
    return;
  }

  // CONVERT DB TO ARRAY
  const data = Object.entries(window.hilosDB).map(([partNumber, item]) => ({
    partNumber,
    location: item.location,
    description: item.description,
    calibre: item.calibre,
    color: item.color,
    um: item.um,
    kanban: item.kanban,
    productionLine: item.productionLine
  }));


  // SORT BY LOCATION
  data.sort((a, b) => {
  const locCompare = a.location.localeCompare(b.location);
  return locCompare !== 0
    ? locCompare
    : a.partNumber.localeCompare(b.partNumber);
});

  // DOM ELEMENTS (NOW THEY EXIST)
  const searchBar = document.getElementById('searchBar');
  const dataContainer = document.getElementById('dataContainer');
  const modal = document.getElementById('modal');
  const modalImage = document.getElementById('modalImage');

  // DISPLAY FUNCTION
  function displayData(items) {
    dataContainer.innerHTML = `
      <table class="highlight">
        <thead>
          <tr>
            <th>Localización</th>
            <th>Número de Parte</th>
            <th>Color</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr onclick="showBarcode('${item.partNumber}')">
              <td>${item.location}</td>
              <td>${item.partNumber}</td>
              <td>${item.color}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // SEARCH
  searchBar.addEventListener('input', e => {
    const searchString = e.target.value.toLowerCase();
    const filteredData = data.filter(item =>
      item.partNumber.toLowerCase().includes(searchString) ||
      item.color.toLowerCase().includes(searchString)
    );
    displayData(filteredData);
  });

  // INITIAL RENDER
  displayData(data);

  // EXPOSE FUNCTION TO HTML
  window.showBarcode = function (partNumber) {
  const instance = M.Modal.getInstance(modal);
  modalImage.innerHTML = '';

  const item = window.hilosDB[partNumber];
  if (!item) return;

  JsBarcode(modalImage, 'P' + partNumber, {
    format: "CODE128",
    displayValue: true
  });

  //reset any previous handler
  modalImage.onclick = null;

  //click or tap to copy
  modalImage.onclick = () => {
    copyTextToClipboard(partNumber)
      .then(() => {
        M.toast({ html: "Número de parte copiado" });
      })
      .catch(() => {
        M.toast({ html: "No se pudo copiar" });
      });
  };

  const detailsContainer = document.getElementById('barcodeDetails');
  let detailsHtml = '';

  for (const [key, value] of Object.entries(item)) {
    detailsHtml += `
      <p>
        <strong>${formatLabel(key)}:</strong> ${value}
      </p>
    `;
  }

  detailsContainer.innerHTML = detailsHtml;
  instance.open();
};


});

function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
}

// Clipboard
function copyTextToClipboard(text) {
  // Modern browsers (PC, Android, iOS 15+)
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }

  // Fallback for older iOS
  return new Promise((resolve, reject) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed"; // prevent scrolling
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      const successful = document.execCommand("copy");
      successful ? resolve() : reject();
    } catch (err) {
      reject(err);
    }

    document.body.removeChild(textarea);
  });
}