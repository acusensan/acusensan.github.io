document.addEventListener('DOMContentLoaded', function() {
    const elems = document.querySelectorAll('.modal');
    M.Modal.init(elems);
    const sidenavElems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(sidenavElems);
});
const data = [
    { "partNumber": "291577X33-110D", "color": "110D" },
    { "partNumber": "291577X33-149B", "color": "149B" },
    { "partNumber": "291577X33-309X", "color": "309X" },
    { "partNumber": "291577X33-313N", "color": "313N" },
    { "partNumber": "291577X33-645D", "color": "645D" },
    { "partNumber": "291577X33-848", "color": "848" },
    { "partNumber": "291577X33-999K", "color": "999k" },
    { "partNumber": "41577X69-110D", "color": "110D" },
    { "partNumber": "41577X69-8927", "color": "8927" },
    { "partNumber": "91577X92-110D", "color": "110D" },
    { "partNumber": "91577X92-119X", "color": "119X" },
    { "partNumber": "91577X92-245V", "color": "245V" },
    { "partNumber": "91577X92-309X", "color": "309X" },
    { "partNumber": "91577X92-312N", "color": "312N" },
    { "partNumber": "91577X92-313N", "color": "313N" },
    { "partNumber": "91577X92-341M", "color": "341M" },
    { "partNumber": "91577X92-395A", "color": "395A" },
    { "partNumber": "91577X92-400C", "color": "400C" },
    { "partNumber": "91577X92-645D", "color": "645D" },
    { "partNumber": "91577X92-834T", "color": "834T" },
    { "partNumber": "91577X92-8927", "color": "8927" },
    { "partNumber": "91577X92-923T", "color": "923T" },
    { "partNumber": "91577X92-9936", "color": "9936" },
    { "partNumber": "91577X92-999K", "color": "999K" },
    { "partNumber": "L00162055706HAA", "color": "854T" },
    { "partNumber": "L00162055731EAA", "color": "31E" },
    { "partNumber": "L00162055763JAA", "color": "63J" },
    { "partNumber": "L00162055773DAA", "color": "73D" },
    { "partNumber": "L00162055776CAA", "color": "476C" },
    { "partNumber": "L00162055788TAA", "color": "868T" },
    { "partNumber": "L001620557E03AA", "color": "E03" },
    { "partNumber": "L001620557G32AA", "color": "332X" },
    { "partNumber": "L001620557GSBAA", "color": "116H" },
    { "partNumber": "L001620557HXWAA", "color": "103H" },
    { "partNumber": "L00162055906HAA", "color": "854T" },
    { "partNumber": "L00162055931EAA", "color": "31E" },
    { "partNumber": "L00162055963JAA", "color": "63J" },
    { "partNumber": "L00162055973DAA", "color": "737D" },
    { "partNumber": "L00162055976CAA", "color": "476C" },
    { "partNumber": "L00162055988TAA", "color": "868T" },
    { "partNumber": "L001620559E03AA", "color": "303E" },
    { "partNumber": "L001620559G32AA", "color": "332X" },
    { "partNumber": "L001620559GSBAA", "color": "116H" },
    { "partNumber": "L001620559HXWAA", "color": "103H" },
    { "partNumber": "L0583835AA0188T", "color": "868T" },
    { "partNumber": "L0620557AA0101F", "color": "201F" },
    { "partNumber": "L0620557AA0102F", "color": "202F" },
    { "partNumber": "L0620557AA0107M", "color": "245V" },
    { "partNumber": "L0620557AA0164D", "color": "604D" },
    { "partNumber": "L0620557AA0173D", "color": "737D" },
    { "partNumber": "L0620557AA01E02", "color": "E02" },
    { "partNumber": "L0620557AA01X07", "color": "407X" },
    { "partNumber": "L0620557AA01XTS", "color": "834T" },
    { "partNumber": "L0620559AA0101F", "color": "201F" },
    { "partNumber": "L0620559AA0102F", "color": "202F" },
    { "partNumber": "L0620559AA0107M", "color": "245V" },
    { "partNumber": "L0620559AA0164D", "color": "604D" },
    { "partNumber": "L0620559AA01E02", "color": "E02" },
    { "partNumber": "L0620559AA01X07", "color": "407X" },
    { "partNumber": "L0620559AA01XTS", "color": "834T" },
    { "partNumber": "L0749224AA01", "color": "Blanco" },
    { "partNumber": "M15H60ATLBXEZ", "color": "Azul" },
    { "partNumber": "M15H63AWSB", "color": "Blanco" },
    { "partNumber": "N03425756033", "color": "600R" },
    { "partNumber": "T35WCWHITE", "color": "Blanco" },
    { "partNumber": "WYNGB3-119X", "color": "119X" },
    { "partNumber": "WYNGB3-167A", "color": "167A" },
    { "partNumber": "WYNGB3-309X", "color": "309X" },
    { "partNumber": "WYNGB3-312N", "color": "312N" },
    { "partNumber": "WYNGB3-313N", "color": "313N" },
    { "partNumber": "WYNGB3-341M", "color": "341M" },
    { "partNumber": "WYNGB3-395A", "color": "395A" },
    { "partNumber": "WYNGB3-400C", "color": "400C" },
    { "partNumber": "WYNGB3-645D", "color": "645D" },
    { "partNumber": "WYNGB3-834T", "color": "834T" },
    { "partNumber": "WYNGB3-8927", "color": "8927" },
    { "partNumber": "WYNGB3-923T", "color": "923T" },
    { "partNumber": "WYNGB3-9936", "color": "9936" },
    { "partNumber": "WYNGB3-999K", "color": "999K" }
];

const searchBar = document.getElementById('searchBar');
const dataContainer = document.getElementById('dataContainer');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');

// Function to display data items
function displayData(items) {
    dataContainer.innerHTML = `
        <table class="highlight">
            <thead>
                <tr>
                    <th>Numero De Parte</th>
                    <th>Color</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr class="data-item" onclick="showBarcode('${item.partNumber}')">
                        <td>${item.partNumber}</td>
                        <td>${item.color}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Function to show barcode in modal
function showBarcode(partNumber) {
    const instance = M.Modal.getInstance(modal);
    modalImage.innerHTML = ''; // Clear previous content
    const modifiedPartNumber = 'P' + partNumber; // Add 'P' before the part number
    JsBarcode(modalImage, modifiedPartNumber, {
        format: "CODE128",
        displayValue: true
    });
    instance.open();
}

// Event listener for search bar
searchBar.addEventListener('input', (e) => {
    const searchString = e.target.value.toLowerCase();
    const filteredData = data.filter(item => 
        item.partNumber.toLowerCase().includes(searchString) ||
        item.color.toLowerCase().includes(searchString)
    );
    displayData(filteredData);
});

// Initial display of all data
displayData(data);