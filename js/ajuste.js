function updateRackOptions() {
            const rackSelect = document.getElementById('rack');
            const partSelect = document.getElementById('part');
            partSelect.innerHTML = ''; // Clear previous options

            let options = [];
            if (rackSelect.value === 'rack1') {
                options = Array.from({length: 40}, (_, i) => `APC01${String(i + 1).padStart(2, '0')}`);
            } else if (rackSelect.value === 'rack2') {
                options = Array.from({length: 40}, (_, i) => `APC02${String(i + 1).padStart(2, '0')}`);
            } else if (rackSelect.value === 'rack3') {
                options = Array.from({length: 4}, (_, i) => `APC03${String(i + 1).padStart(2, '0')}`);
            }

            options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.textContent = option;
                partSelect.appendChild(opt);
            });
        }

        function updatePartNumberOptions() {
            const partTypeSelect = document.getElementById('partType');
            const partNumberSelect = document.getElementById('partNumber');
            partNumberSelect.innerHTML = ''; // Clear previous options

            let options = [];
            if (partTypeSelect.value === 'PCGREARS') {
                options = ['190562'];
            } else if (partTypeSelect.value === 'PCGSAVAN') {
                options = ['1561-305SAA', '1561-345SAA', '2232b910F00MA', 'STFR-415X122FAC', '794-100SAA','25ZZ5','72918', '170480','255S5-184D', '255S5-195A', '346779','346803','L0269501AA01'];
            } else if (partTypeSelect.value === 'PCGBT1CC') {
                options = ['L001423285NCPAA'];
            } else if (partTypeSelect.value === 'PCG31XX') {
                options = ['L001434100NCPAA', ];
            }

            options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.textContent = option;
                partNumberSelect.appendChild(opt);
            });
        }

        function addDataToTable(event) {
            event.preventDefault(); // Prevent form submission

            const rack = document.getElementById('rack').value;
            const part = document.getElementById('part').value;
            const partType = document.getElementById('partType').value;
            const partNumber = document.getElementById('partNumber').value;
            const quantity = document.getElementById('quantity').value;

            if (rack && part && partType && partNumber && quantity) {
                const tableBody = document.getElementById('dataTable').querySelector('tbody');
                const newRow = tableBody.insertRow();

                newRow.insertCell(0).textContent = part;
                newRow.insertCell(1).textContent = partNumber;
                newRow.insertCell(2).textContent = quantity;

                // Clear form inputs
                document.querySelector('form').reset();
                document.getElementById('part').innerHTML = '<option value="">Select Rack Section</option>';
                document.getElementById('partNumber').innerHTML = '<option value="">Select Part Number</option>';
            } else {
                alert('Please fill out all fields.');
            }
        }

        function downloadData() {
            const table = document.getElementById('dataTable');
            let data = '';

            for (let i = 1; i < table.rows.length; i++) {
                const cells = table.rows[i].cells;
                for (let j = 0; j < cells.length; j++) {
                    data += cells[j].textContent + (j < cells.length - 1 ? '\t' : '');
                }
                data += '\n';
            }

            const blob = new Blob([data], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'data.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }