document.addEventListener('DOMContentLoaded', function() {
            M.AutoInit();
            document.getElementById('current-year').textContent = new Date().getFullYear();
        });

        function calculate() {
            const input1 = parseFloat(document.getElementById('input1').value);
            const input2 = parseFloat(document.getElementById('input2').value);
            const input3 = parseFloat(document.getElementById('input3').value);
            const result = (input2 * input3) / input1;
            document.getElementById('result').textContent = `Resultado: ${result.toFixed(2)}`;
        }

        function clearFields() {
            document.getElementById('input1').value = '';
            document.getElementById('input2').value = '';
            document.getElementById('input3').value = '';
            document.getElementById('result').textContent = '';
            M.updateTextFields(); // Update labels for Materialize
        }