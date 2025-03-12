function prependAndGenerate(letter) {
            var input = document.getElementById('barcodeInput');
            input.value = letter + input.value;
            generateBarcode();
        }

        function generateBarcode() {
            var input = document.getElementById('barcodeInput').value;
            JsBarcode("#barcode", input, {
                format: "CODE128",
                displayValue: true
            });
        }