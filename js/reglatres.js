function calculate() {
            const a = parseFloat(document.getElementById('input1').value);
            const b = parseFloat(document.getElementById('input2').value);
            const c = parseFloat(document.getElementById('input3').value);
            if (!isNaN(a) && !isNaN(b) && !isNaN(c)) {
                const result = (b * c) / a;
                document.getElementById('result').innerText = `Result: ${result}`;
            } else {
                document.getElementById('result').innerText = 'Introduzca números válidos en todos los campos.';
            }
        }