// Table data as JavaScript array
const tableData = [
    { articulo: "Bolsas", codigo: "100024" },
    { articulo: "Celofan 18", codigo: "9961003" },
    { articulo: "Cinta Transparente", codigo: "6175372" },
    { articulo: "Etiquetas De Rastreo", codigo: "ZF00524B" },
    { articulo: "Masking Tape", codigo: "3120644" },
    { articulo: "Pasantes", codigo: "ZN98547" },
    { articulo: "Fifos Febrero", codigo: "ZF28744" },
    { articulo: "Fifos Marzo", codigo: "ZF28747" },
    { articulo: "Fifos Abril", codigo: "ZF28751" },
    { articulo: "Fifos Mayo", codigo: "ZF28763" },
    { articulo: "Fifos Junio", codigo: "ZF28768" },
    { articulo: "Fifos Julio", codigo: "ZF28774" },
    { articulo: "Fifos Agosto", codigo: "ZF28776" },
    { articulo: "Fifos Septiembre", codigo: "ZF28781" },
    { articulo: "Fifos Noviembre", codigo: "ZF28790" },
    { articulo: "Fifos Diciembre", codigo: "ZF28794" }
];

// Function to populate the table
function populateTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    tableData.forEach(item => {
        const row = document.createElement('tr');
        const articuloCell = document.createElement('td');
        const codigoCell = document.createElement('td');

        articuloCell.textContent = item.articulo;
        codigoCell.textContent = item.codigo;

        row.appendChild(articuloCell);
        row.appendChild(codigoCell);
        tableBody.appendChild(row);
    });
}

// Populate the table on page load
document.addEventListener('DOMContentLoaded', populateTable);

// Filter table function
function filterTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('myTable');
    const tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName('td');
        let match = false;
        for (let j = 0; j < td.length; j++) {
            if (td[j]) {
                if (td[j].innerHTML.toLowerCase().indexOf(filter) > -1) {
                    match = true;
                    break;
                }
            }
        }
        tr[i].style.display = match ? '' : 'none';
    }
}

// Add event listener to search input
document.getElementById('searchInput').addEventListener('keyup', filterTable);