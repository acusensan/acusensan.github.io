document.addEventListener('DOMContentLoaded', function() {
    M.AutoInit();
    document.getElementById('current-year').textContent = new Date().getFullYear();

    const optionsMap = {
        'BT1': ['L001423285NCPAA', 'L001450016NCPAA', 'L001553609NCPAA', 'L001614470NCPAA', 'L001676174NCPAA', 'L001676224NCPAA', 'L001698202NCPAA', 'L002053089NCPAA', 'L002460234NCPAA', 'L002798840NCPAB', 'L002798841NCPAB', 'L002798842NCPAC', 'L002799378NCPAA', 'L002799379NCPAB', 'L002799380NCPAA', 'L002806896NCPAA', 'L002806897NCPAA', 'L002806946NCPAA', 'L002806947NCPAA', 'L002807250NCPAA', 'L002907223NCPAA', 'L002907225NCPAB', 'L002914716NCPAA', 'L002914905NCPAA', 'L003141998NCPAA', 'L003141999NCPAA', 'L003142000NCPAA', 'L003142001NCPAA', 'L003142002NCPAA', 'L003142003NCPAA', 'L003142004NCPAA', 'L003142005NCPAA', 'L0609247AA01', 'L0701143AA01'],
        'COLORADO': ['L001434100NCPAA', 'L001466311NCPAA', 'L001518304NCPAA', 'L002215045NCPAA', 'L002215046NCPAA', 'L002312377NCPAA', 'L002312378NCPAA', 'L002312379NCPAC', 'L002312383NCPAC', 'L002316235NCPAB', 'L002316236NCPAA', 'L002316237NCPAA', 'L002316238NCPAA', 'L002316914NCPAA', 'L002316915NCPAA', 'L002316951NCPAC', 'L002396469NCPAA', 'L002401087NCPAC', 'L002401088NCPAC', 'L002401089NCPAD', 'L002401090NCPAD', 'L002401091NCPAB', 'L002401092NCPAA', 'L002401093NCPAA', 'L002479499NCPAA', 'L002479502NCPAA', 'L002481117NCPAA', 'L002618780NCPAA', 'L0430654AA01'],
        'FIX': ['L001797262NCPAA', 'L001802491NCPAA', 'L001802492NCPAA', 'L002171015NCPAA', 'L002866832NCPAA', 'L002866833NCPAA', 'L002890609NCPAA', 'L002890610NCPAA', 'L0571635AA01', 'L0571636AA01', 'L0571640AA01', 'L0571668AA01', 'L0572828AA03', 'L0591424AA01', 'L0592042AA01', 'L0592045AA04', 'L0592046AA01', 'L0597009AA02', 'L0649100AA01', 'L0649101AA01', 'L0668944AA01', 'L0676165AA01', 'L0676166AA01', 'L0676168AA01', 'L0676177AA01', 'L0676192AA01', 'L0676195AA01', 'L0681545AA01', 'L0681546AA01', 'L0681547AA01', 'L0682843AA01', 'L0685445AA01'],
        'SUV': ['L002194708NCPAA', 'L0654899AA01', 'L0676258AA05', 'L0698195AA01', 'L0698200AA01', 'L0698203AA01', 'L0706490AA03', 'L0706491AA03', 'L0706492AA02', 'L0724597AA01', 'L0736063AA01', 'L0736066AA01', 'L0753466AA01', 'L0776538AA01', 'L0780891AA01', 'L0797678AA01', 'L0797679AA01', 'L0797825AA01', 'L0802979AA01', 'L0802980AA01', 'L0802981AA01', 'L0806941AA01', 'L0806942AA01', 'L0806943AA01', 'L0806944AA01'],
        'SAVANA': ['1561-305SAA', '1561-345SAA', '2232b910F00MA', '794-100SAA', 'STFR-415X122FAC'],
        'MISC': ['L002477092NCPAA', '346779', '346803', '0010686', '25ZZ5', '5CC-DF6SLSEP', 'L00180970202FAA', 'L00180970209XAA', 'L00180970245DAA', 'L00180970264DAA', 'L001809702GKAAA', 'L001809702GWBAA', 'L002162447NCPAA', 'L0148229AA02', 'L0269501AA01', 'L0549303AA01', 'L0617164AA01', 'L0672525AA01', 'L0697064AA01', 'Q010000839', 'Q92K204G19', 'Q92K204G20'],
        'VELCRO': ['72918', '170480', '190562', '197443', 'KRG25LTCA', 'L0429142AA02', 'L0575409AA01', 'L0575410AA01', 'L0633654AA01', 'WRG16HMAA', 'WRG16LBAA', 'WRG25LBAA', 'WRG25MAAA'],
        'ZIPPER': ['L00144987006HAA', '255S5-184D', '255S5-195A', '5CC-CH-PLF8-309X', '5CC-CH-PLF8-645D', 'L001449870U52AA', 'L00180249345DAA', 'L001802493GKAAA', 'L0449870AA0102F', 'L0449870AA0164D', 'L0449870AA01GWB', 'L0816049AA0109X', 'L0816049AA0145D', 'L0816049AA01GKA']
    };

    const categorySelect = document.getElementById('category-select');
    const itemSelect = document.getElementById('item-select');

    categorySelect.addEventListener('change', function() {
        const selectedCategory = categorySelect.value;
        const items = optionsMap[selectedCategory] || [];

        itemSelect.innerHTML = '<option value="" disabled selected>Choose your item</option>';
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            itemSelect.appendChild(option);
        });

        itemSelect.disabled = items.length === 0;
        M.FormSelect.init(itemSelect); // Reinitialize the select element
    });
});

function calculate() {
    const input1 = parseFloat(document.getElementById('input1').value);
    const input2 = parseFloat(document.getElementById('input2').value);
    const input3 = parseFloat(document.getElementById('input3').value);
    const selectedItem = document.getElementById('item-select').value;
    const result = (input2 * input3) / input1;

    // Show toast notification
    M.toast({html: 'Agregado', displayLength: 3000});
    
    // Display the result at the top
const resultsContainer = document.getElementById('results-container');
const resultCard = document.createElement('div');
resultCard.className = "col s12 m4"; // Adjust column size if needed
resultCard.innerHTML = `
    <div class="card blue-grey darken-1">
        <div class="card-content white-text">
            <span class="card-title">Resultado: ${result.toFixed(2)}</span>
            <p><strong>Item:</strong> ${selectedItem}</p>
            <p><strong>Peso De Muestra:</strong> ${input1}</p>
            <p><strong>Cantidad De Muestras:</strong> ${input2}</p>
            <p><strong>Peso Total:</strong> ${input3}</p>
        </div>
        <div class="card-action" style="display: flex; justify-content: flex-end;">
            <button class="btn red waves-effect waves-light" onclick="removeResult(this)" style="margin-left: auto;">Eliminar</button>
        </div>
    </div>
`;
resultsContainer.appendChild(resultCard);

// Clear the input fields
clearFields();
}

function clearFields() {
    document.getElementById('input1').value = '';
    document.getElementById('input3').value = '';
    document.getElementById('result').textContent = '';
    M.updateTextFields(); // Update labels for Materialize
}

function removeResult(button) {
    const resultCard = button.closest('.col');
    resultCard.remove();
}
function downloadResults() {
    const resultsContainer = document.getElementById('results-container');
    const resultCards = resultsContainer.querySelectorAll('.card-content');
    let csvContent = "data:text/csv;charset=utf-8,Item,Peso De Muestra,Cantidad De Muestras,Peso Total,Resultado\n";

    resultCards.forEach(card => {
        const item = card.querySelector('p:nth-child(2)').textContent.split(': ')[1];
        const pesoMuestra = card.querySelector('p:nth-child(3)').textContent.split(': ')[1];
        const cantidadMuestras = card.querySelector('p:nth-child(4)').textContent.split(': ')[1];
        const pesoTotal = card.querySelector('p:nth-child(5)').textContent.split(': ')[1];
        const resultado = card.querySelector('.card-title').textContent.split(': ')[1];
        const row = `${item},${pesoMuestra},${cantidadMuestras},${pesoTotal},${resultado}\n`;
        csvContent += row;
    });
    // Show toast notification
    M.toast({html: 'Descargado', displayLength: 3000});

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}