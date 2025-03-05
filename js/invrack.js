document.addEventListener('DOMContentLoaded', function() {
            var elems = document.querySelectorAll('select');
            var instances = M.FormSelect.init(elems);
        });

        const racks = {
            APC01: ["APC0101", "APC0102", "APC0103", "APC0104", "APC0105", "APC0106", "APC0107", "APC0108", "APC0109", "APC0110", "APC0111", "APC0112", "APC0113", "APC0114", "APC0115", "APC0116", "APC0117", "APC0118", "APC0119", "APC0120"],
            APC02: ["APC0201", "APC0202", "APC0203", "APC0204", "APC0205", "APC0206", "APC0211", "APC0212", "APC0213", "APC0214", "APC0215"]
        };

        const items = {
            APC0101: [
            "255S5-184D",
            "255S5-195A",
            "5CC-CH-PLF8-645D",
            "L001449870U52AA",
            "L00144987006HAA"
          ],
            APC0102: [
            "L002401087NCPAC",
            "L002401088NCPAC",
            "L002401089NCPAD",
            "L002401090NCPAD",
            "L002401091NCPAB",
            "L002401092NCPAA",
            "L002401093NCPAA"
          ],
             APC0103: [
            "L002316235NCPAB",
            "L002316236NCPAA",
            "L002316237NCPAA",
            "L002316238NCPAA"
          ],
            APC0104: [
            "L00180249345DAA",
            "L001802493GKAAA",
            "L0816049AA0109X",
            "L0816049AA0145D",
            "L0816049AA01GKA"
          ],
            APC0105: [
            "L0571635AA01",
            "L0571636AA01",
            "L0572828AA03",
            "L0591424AA01",
            "L0668944AA01"
          ],
            APC0106: [
            "L002866832NCPAA",
            "L002890609NCPAA",
            "L0571668AA01",
            "L0592046AA01",
            "L0676165AA01"
          ],
            APC0107: [
            "L002866833NCPAA",
            "L002890610NCPAA",
            "L0676192AA01",
            "L0676195AA01"
          ],
            APC0108: [
            "1561-305SAA",
            "1561-345SAA",
            "2232b910F00MA",
            "STFR-415X122FAC"
          ],
            APC0109: [
            "L0269501AA01",
            "L0617164AA01",
            "L0697064AA01",
            "L0672525AA01",
            "L0148229AA02",
            "0010686",
            "Q010000839",
            "Q92K204G19",
            "Q92K204G20"
          ],
            APC0110: [
            "346779",
            "346803",
            "170480",
            "25ZZ5",
            "5CC-DF6SLSEP",
            "L0575410AA01"
          ],
            APC0111: [
            "L0449870AA0102F",
            "L0449870AA0164D",
            "L001466311NCPAA",
            "L002215045NCPAA",
            "L002215046NCPAA",
            "L002481117NCPAA"
          ],
            APC0112: [
            "L001434100NCPAA",
            "L001518304NCPAA",
            "L002316951NCPAC",
            "L002479502NCPAA",
            "L002618780NCPAA",
            "L0430654AA01"
          ],
            APC0113: [
            "L002312377NCPAA",
            "L002312378NCPAA",
            "L002312379NCPAC",
            "L002312383NCPAC",
            "L002396469NCPAA",
            "L002479499NCPAA"
          ],
            APC0114: [
            "L002316914NCPAA",
            "L002316915NCPAA",
            "L001797262NCPAA",
            "L002171015NCPAA"
          ],
            APC0115: [
            "L0571640AA01",
            "L0592042AA01",
            "L0592045AA04",
            "L0597009AA02",
            "L0682843AA01"
          ],
            APC0116: [
            "L001802491NCPAA",
            "L001802492NCPAA",
            "L0681545AA01",
            "L0681546AA01",
            "L0681547AA01",
            "L0685445AA01"
          ],
            APC0117: [
            "L0649100AA01",
            "L0649101AA01",
            "L0676166AA01",
            "L0676168AA01",
            "L0676177AA01"
          ],
            APC0118: [
            "794-100SAA",
            "L00180970202FAA",
            "L00180970209XAA",
            "L00180970245DAA",
            "L00180970264DAA",
            "L001809702GKAAA",
            "L001809702GWBAA",
            "L001809702HXWAA"
          ],
            APC0119: [
            "L002162447NCPAA",
            "190562",
            "KRG25LTCA",
            "L0429142AA02",
            "L0549303AA01",
            "L0575409AA01"
          ],
            APC0120: [
            "WRG16HMAA",
            "WRG16LBAA",
            "WRG25LBAA",
            "WRG25MAAA"
          ],
            APC0201: [
            "L0698195AA01",
            "L0706492AA02",
            "L0724597AA01",
            "L0736063AA01",
            "L0736066AA01"
          ],
            APC0202: [
            "L002194708NCPAA",
            "L0676258AA05",
            "L0706490AA03",
            "L0706491AA03",
            "L0776538AA01",
            "L0780891AA01"
          ],
            APC0203: [
            "L002806946NCPAA",
            "L002806947NCPAA",
            "L002807250NCPAA",
            "L002907223NCPAA",
            "L002799378NCPAA"
          ],
            APC0204: [
            "L001698202NCPAA",
            "L002053089NCPAA",
            "L002460234NCPAA",
            "L002798840NCPAB",
            "L002798841NCPAB",
            "L002799379NCPAB"
          ],
            APC0205: [
            "L002799380NCPAA",
            "L002806896NCPAA",
            "L002806897NCPAA",
            "L003142004NCPAA",
            "L003142005NCPAA",
            "L0802981AA01"
          ],
            APC0206: [
            "L0802979AA01",
            "L0802980AA01",
            "L0753466AA01",
            "L0633654AA01"
          ],
            APC0211: [
            "L0698200AA01",
            "L0698203AA01",
            "L0797678AA01",
            "L0797679AA01"
          ],
            APC0212: [
            "L0654899AA01",
            "L0797825AA01",
            "L0806941AA01",
            "L0806942AA01",
            "L0806943AA01",
            "L0806944AA01"
          ],
            APC0213: [
            "L002907225NCPAB",
            "L002914716NCPAA",
            "L002914905NCPAA",
            "L0609247AA01",
            "L0701143AA01",
            "L002798842NCPAC"
          ],
            APC0214: [
            "L001423285NCPAA",
            "L001450016NCPAA",
            "L001553609NCPAA",
            "L001614470NCPAA",
            "L001676174NCPAA",
            "L001676224NCPAA"
          ],
            APC0215: [
            "L003141998NCPAA",
            "L003141999NCPAA",
            "L003142000NCPAA",
            "L003142001NCPAA",
            "L003142002NCPAA",
            "L003142003NCPAA"
          ]
};
        const itemAmounts = {};
        function updateRacks() {
            const columnSelect = document.getElementById('columnSelect').value;
            const rackSelect = document.getElementById('rackSelect');
            rackSelect.innerHTML = '';

            racks[columnSelect].forEach(rack => {
                const option = document.createElement('option');
                option.value = rack;
                option.textContent = rack;
                rackSelect.appendChild(option);
            });

            M.FormSelect.init(rackSelect);
            displayItems();
        }

        function displayItems() {
            const rackSelect = document.getElementById('rackSelect').value;
            const itemDisplay = document.getElementById('itemDisplay');
            const selectedItems = items[rackSelect] || [];
            itemDisplay.innerHTML = `
                <h3 class="center-text">${rackSelect}</h3>
                <ul class="collection">
                    ${selectedItems.map(item => `
                        <li class="collection-item">
                            ${item}
                            <div class="input-field inline">
                                <input type="number" id="${item}" name="${item}" value="${itemAmounts[item] || ''}" onchange="updateAmount('${item}', this.value)">
                                <label for="${item}" class="active">Ingrese Cantidad</label>
                            </div>
                        </li>`).join('')}
                </ul>
            `;
        }

        function updateAmount(item, amount) {
            itemAmounts[item] = amount;
        }

        function prevRack() {
            const rackSelect = document.getElementById('rackSelect');
            const currentIndex = rackSelect.selectedIndex;
            if (currentIndex > 0) {
                rackSelect.selectedIndex = currentIndex - 1;
                displayItems();
            }
        }

        function nextRack() {
            const rackSelect = document.getElementById('rackSelect');
            const currentIndex = rackSelect.selectedIndex;
            if (currentIndex < rackSelect.options.length - 1) {
                rackSelect.selectedIndex = currentIndex + 1;
                displayItems();
            }
        }

        function downloadCSV() {
            let csvContent = "data:text/csv;charset=utf-8,Rack,Item,Amount\n";
            Object.keys(items).forEach(rack => {
                items[rack].forEach(item => {
                    const amount = itemAmounts[item] || 0;
                    csvContent += `${rack},${item},${amount}\n`;
                });
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "inventory.csv");
            document.body.appendChild(link);
            link.click();
            document.body
            document.body.removeChild(link);
        }

        document.getElementById('columnSelect').addEventListener('change', updateRacks);
        document.getElementById('rackSelect').addEventListener('change', displayItems);

        // Initialize the racks on page load
        updateRacks();