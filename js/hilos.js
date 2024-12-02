document.addEventListener('DOMContentLoaded', function() {
    // Data for the table
    const data = [
        { partNumber: '291577X33-110D', color: '110D' },
        { partNumber: '291577X33-149B', color: '149B' },
        { partNumber: '291577X33-309X', color: '309X' },
        { partNumber: '291577X33-313N', color: '313N' },
        { partNumber: '291577X33-645D', color: '645D' },
        { partNumber: '291577X33-848', color: '848' },
        { partNumber: '291577X33-999K', color: '999K' },
        { partNumber: '41577X69-110D', color: '110D' },
        { partNumber: '41577X69-8927', color: '8927' },
        { partNumber: '91577X92-110D', color: '110D' },
        { partNumber: '91577X92-119X', color: '119X' },
        { partNumber: '91577X92-245V', color: '245V' },
        { partNumber: '91577X92-309X', color: '309X' },
        { partNumber: '91577X92-312N', color: '312N' },
        { partNumber: '91577X92-313N', color: '313N' },
        { partNumber: '91577X92-341M', color: '341M' },
        { partNumber: '91577X92-395A', color: '395A' },
        { partNumber: '91577X92-400C', color: '400C' },
        { partNumber: '91577X92-645D', color: '645D' },
        { partNumber: '91577X92-834T', color: '834T' },
        { partNumber: '91577X92-8927', color: '8927' },
        { partNumber: '91577X92-923T', color: '923T' },
        { partNumber: '91577X92-9936', color: '9936' },
        { partNumber: '91577X92-999K', color: '999K' }
    ];

    // Function to create and populate the table
    function createTable(data) {
        const tableContainer = document.getElementById('table-container');
        const table = document.createElement('table');
        table.className = 'striped';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['Numero De Parte', 'Color'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        data.forEach(item => {
            const row = document.createElement('tr');
            Object.values(item).forEach(text => {
                const td = document.createElement('td');
                td.textContent = text;
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        tableContainer.appendChild(table);
    }

    // Create the table with the data
    createTable(data);

    // Filter function
    document.getElementById('searchInput').addEventListener('keyup', function() {
        const filter = this.value.toUpperCase();
        const rows = document.querySelectorAll('#table-container table tbody tr');
        rows.forEach(row => {
            const td = row.getElementsByTagName('td')[0];
            if (td) {
                row.style.display = td.textContent.toUpperCase().indexOf(filter) > -1 ? '' : 'none';
            }
        });
    });
});