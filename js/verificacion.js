document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('addRowButton').addEventListener('click', addRow);
document.getElementById('downloadButton').addEventListener('click', downloadTable);

function handleFileUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = cleanText(e.target.result);
        const rows = text.split('\n').slice(1); // Skip header row
        const tableBody = document.querySelector('#inventoryTable tbody');
        tableBody.innerHTML = ''; // Clear existing rows
        rows.forEach(row => {
            const columns = row.split(/\s+/);
            console.log(columns); // Log columns to check their content
            if (columns.length >= 7) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${columns[1]}</td>
                    <td>${columns[2]}</td>
                    <td>${columns[3]}</td>
                    <td>${columns[4]}</td> <!-- Update this index to the correct one for Qty On Hand -->
                    <td><button class="btn red removeButton">Remove</button></td>
                `;
                tableBody.appendChild(tr);
            }
        });
        addRemoveButtonListeners();
    };
    reader.readAsText(file);
}

function cleanText(text) {
    const lines = text.split('\n');
    const cleanedLines = [];
    for (let line of lines) {
        if (line.includes('End of Report')) break;
        cleanedLines.push(line);
    }
    return cleanedLines.join('\n');
}

function addRow() {
    const location = document.getElementById('locationInput').value;
    const itemNumber = document.getElementById('itemNumberInput').value;
    const lotSerial = document.getElementById('lotSerialInput').value;
    const qtyOnHand = document.getElementById('qtyOnHandInput').value;

    const tableBody = document.querySelector('#inventoryTable tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${location}</td>
        <td>${itemNumber}</td>
        <td>${lotSerial}</td>
        <td>${qtyOnHand}</td>
        <td><button class="btn red removeButton">Remove</button></td>
    `;
    tableBody.appendChild(tr);
    addRemoveButtonListeners();
}

function downloadTable() {
    console.log("Download function called");
    const table = document.getElementById('inventoryTable');
    let csvContent = '';
    for (let row of table.rows) {
        const cells = Array.from(row.cells).map((cell, index) => {
            if (index === 4) { // Assuming the button is in the 5th column
                return ''; // Skip the button column
            }
            return cell.innerText;
        });
        csvContent += cells.join(',') + '\n';
    }
    console.log("CSV Content:", csvContent);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    document.body.appendChild(a); // Append to body
    a.click();
    document.body.removeChild(a); // Remove from body
}

function addRemoveButtonListeners() {
    const removeButtons = document.querySelectorAll('.removeButton');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = button.closest('tr');
            row.remove();
        });
    });
}