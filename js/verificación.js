document.getElementById('fileInput').addEventListener('change', function() {
            const file = this.files[0];
            const reader = new FileReader();
            reader.onload = function() {
                const text = reader.result;
                parseData(text);
            };
            reader.readAsText(file);
        });

        function parseData(text) {
            const dataTable = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
            dataTable.innerHTML = '';
            const lines = text.split('\n');
            let isDataSection = false;
            for (let line of lines) {
                if (line.includes('End of Report')) break;
                if (line.trim().startsWith('Site')) {
                    isDataSection = true;
                    continue;
                }
                if (isDataSection && line.trim() && !line.startsWith('Site')) {
                    const row = dataTable.insertRow();
                    const cells = line.trim().split(/\s+/);  // Split by whitespace
                    if (cells.length > 3) {  // Check if we have the right amount of data
                        addTableRow(row, cells[1], cells[2], cells[cells.length - 6]);
                    }
                }
            }
        }

        function addTableRow(row, location, itemNumber, qtyOnHand) {
            row.insertCell().textContent = location;
            row.insertCell().textContent = itemNumber;
            const qtyCell = row.insertCell();
            qtyCell.textContent = qtyOnHand;
            qtyCell.contentEditable = "true";
            qtyCell.addEventListener('input', () => {
                qtyCell.classList.add('edited');
            });
            const quitarCell = row.insertCell();
            quitarCell.innerHTML = '<label><input type="checkbox" class="filled-in"><span>Quitar</span></label>';
        }

        function addRow() {
            const location = document.getElementById('newLocation').value;
            const itemNumber = document.getElementById('newItemNumber').value;
            const qtyOnHand = document.getElementById('newQtyOnHand').value;
            if (location && itemNumber && qtyOnHand) {
                const dataTable = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
                const row = dataTable.insertRow();
                addTableRow(row, location, itemNumber, qtyOnHand);
            }
        }

        function downloadData() {
            let data = "Location\tItem Number\tQty On Hand\tQuitar\n";
            const rows = document.getElementById('dataTable').getElementsByTagName('tbody')[0].rows;
            for (let row of rows) {
                const cells = row.cells;
                const quitar = cells[3].querySelector('input[type="checkbox"]').checked ? "yes" : "no";
                data += `${cells[0].textContent}\t${cells[1].textContent}\t${cells[2].textContent}\t${quitar}\n`;
            }

            const blob = new Blob([data], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'inventory_report.txt';
            link.click();
        }