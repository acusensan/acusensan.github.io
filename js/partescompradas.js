document.addEventListener('DOMContentLoaded', function() {
    const elems = document.querySelectorAll('.modal');
    M.Modal.init(elems);
    const sidenavElems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(sidenavElems);
});

const data = [
    {location:'APC0101', partNumber:'255S5-184D', description:'ZIPPER CHAIN YKK ITEM', standardpack:'766'},
    {location:'APC0101', partNumber:'255S5-195A', description:'ZIPPER CHAIN YKK ITEM', standardpack:'766'},
    {location:'APC0101', partNumber:'5CC-CH-PLF8-645D', description:'ZIPPER CHAIN 5CC-CH-PLF8', standardpack:'766'},
    {location:'APC0101', partNumber:'L001449870U52AA', description:'ZIPPER CHAIN U52 BLACK', standardpack:'766'},
    {location:'APC0101', partNumber:'L00144987006HAA', description:'ZIPPER CHAIN 5CC-CH-PLF8', standardpack:'766'},
    {location:'APC0102', partNumber:'L002401087NCPAC', description:'RET FLAT 5258 25X245MM', standardpack:'1000'},
    {location:'APC0102', partNumber:'L002401088NCPAC', description:'RET FLAT 5258 25X255MM', standardpack:'1000'},
    {location:'APC0102', partNumber:'L002401089NCPAD', description:'TIE-DOWN 5258 25X430MM', standardpack:'1000'},
    {location:'APC0102', partNumber:'L002401090NCPAD', description:'TIE-DOWN 5258 25X420MM', standardpack:'1000'},
    {location:'APC0102', partNumber:'L002401091NCPAB', description:'TIE-DOWN 5258 30X160MM', standardpack:'1000'},
    {location:'APC0102', partNumber:'L002401092NCPAA', description:'J-RET 721 28.5X625MM', standardpack:'350'},
    {location:'APC0102', partNumber:'L002401093NCPAA', description:'J-RET D1805 28.5X370 MM', standardpack:'650'},
    {location:'APC0103', partNumber:'L002316235NCPAB', description:'BEADED TIE-DOWN 25X955MM', standardpack:'500'},
    {location:'APC0103', partNumber:'L002316236NCPAA', description:'J-RET D1805 24X120 MM', standardpack:'1800'},
    {location:'APC0103', partNumber:'L002316237NCPAA', description:'J-RET D1805 24X200 MM', standardpack:'1000'},
    {location:'APC0103', partNumber:'L002316238NCPAA', description:'J-RET D1697 21.7X250 MM', standardpack:'1200'},
    {location:'APC0104', partNumber:'L00180249345DAA', description:'ZIPPER ASSEM L435MM 45D', standardpack:'1000'},
    {location:'APC0104', partNumber:'L001802493GKAAA', description:'ZIPPER ASSEM L435MM GKA', standardpack:'1000'},
    {location:'APC0104', partNumber:'L0816049AA0109X', description:'ZIPPER 5/8 W32.5.L535MM', standardpack:'1000'},
    {location:'APC0104', partNumber:'L0816049AA0145D', description:'ZIPPER 5/8 W32.5.L535MM', standardpack:'1000'},
    {location:'APC0104', partNumber:'L0816049AA01GKA', description:'ZIPPER 5/8 W32.5.L535MM', standardpack:'1000'},
    {location:'APC0105', partNumber:'L0571635AA01', description:'J-RET D3497 22.4X45MM', standardpack:'5000'},
    {location:'APC0105', partNumber:'L0571636AA01', description:'J-RET D3497 22.4X80MM', standardpack:'3000'},
    {location:'APC0105', partNumber:'L0572828AA03', description:'RET FLT STRP 67X270MM', standardpack:'750'},
    {location:'APC0105', partNumber:'L0591424AA01', description:'J-RET 1588 28.95X80MM', standardpack:'1500'},
    {location:'APC0105', partNumber:'L0668944AA01', description:'J-RET D2140 35X60MM', standardpack:'1500'},
    {location:'APC0106', partNumber:'L002866832NCPAA', description:'J-RET 30.1X335MM ', standardpack:'500'},
    {location:'APC0106', partNumber:'L002890609NCPAA', description:'J-RET D975 30.1X320MM ', standardpack:'500'},
    {location:'APC0106', partNumber:'L0571668AA01', description:'A-RET D2384 25X100MM', standardpack:'1000'},
    {location:'APC0106', partNumber:'L0592046AA01', description:'J-RET D976 25X60MM BLK', standardpack:'4700'},
    {location:'APC0106', partNumber:'L0676165AA01', description:'RET FLT STRP 25X290MM', standardpack:'2000'},
    {location:'APC0107', partNumber:'L002866833NCPAA', description:'J-RET D975 30.1X735MM', standardpack:'150'},
    {location:'APC0107', partNumber:'L002890610NCPAA', description:'J-RET D975 30.1X720MM ', standardpack:'150'},
    {location:'APC0107', partNumber:'L0676192AA01', description:'RET FLT STRP 25X285MM', standardpack:'2000'},
    {location:'APC0107', partNumber:'L0676195AA01', description:'RET FLT STRP 25X350MM', standardpack:'1800'},
    {location:'APC0108', partNumber:'1561-305SAA', description:'J RET 1561 305MM', standardpack:'950'},
    {location:'APC0108', partNumber:'1561-345SAA', description:'J RET 1561 345MM', standardpack:'750'},
    {location:'APC0108', partNumber:'2232b910F00MA', description:'J-RET FABRIC 910mm BLK', standardpack:'175'},
    {location:'APC0108', partNumber:'STFR-415X122FAC', description:'STIFFENER 415X122 MM', standardpack:'300'},
    {location:'APC0109', partNumber:'794-100SAA', description:'J-RET D794 100mm  BLK', standardpack:'1500'},
    {location:'APC0109', partNumber:'L0269501AA01', description:'ELGIN CLIP ASSY 11X46MM', standardpack:'750'},
    {location:'APC0109', partNumber:'L0617164AA01', description:'LABEL ISO CHILD 40.6X44', standardpack:'1000'},
    {location:'APC0109', partNumber:'L0697064AA01', description:'LABEL SAFETY TAG 20X64MM', standardpack:'1000'},
    {location:'APC0109', partNumber:'L0672525AA01', description:'WELT-PLASTIC, 124830;', standardpack:'2000'},
    {location:'APC0109', partNumber:'L0148229AA02', description:'AIR BAG TAG GM PROGRAMS', standardpack:'500'},
    {location:'APC0109', partNumber:'0010686', description:'BW/WIRE ZP (3mm/2.5K.G)', standardpack:'2.5'},
    {location:'APC0109', partNumber:'Q010000839', description:'ISO BUTTON BACK WHITE', standardpack:'1000'},
    {location:'APC0109', partNumber:'Q92K204G19', description:'ISO BUTTON CHARCOAL', standardpack:'1000'},
    {location:'APC0109', partNumber:'Q92K204G20', description:'ISO BUTTON G20 A. BROWN', standardpack:'1000'},
    {location:'APC0110', partNumber:'346779', description:'BINDING FOLD 1 1/8" 195A', standardpack:'300'},
    {location:'APC0110', partNumber:'346803', description:'BINDING FOLD 1 1/8" 110D', standardpack:'300'},
    {location:'APC0110', partNumber:'170480', description:'VELCRO HOOK 1" BLACK ', standardpack:'250'},
    {location:'APC0110', partNumber:'25ZZ5', description:'ZIPPER SLIDER 580 BLACK', standardpack:'6000'},
    {location:'APC0110', partNumber:'5CC-DF6SLSEP', description:'ZIPPER SLIDER CD391 2013', standardpack:'3000'},
    {location:'APC0110', partNumber:'L0575410AA01', description:'VELCRO LOOP BLK TAPE 1"', standardpack:'1000'},
    {location:'APC0111', partNumber:'L0449870AA0102F', description:'ZIPPER CHAIN 5CC-CH-PLF8', standardpack:'766'},
    {location:'APC0111', partNumber:'L0449870AA0164D', description:'ZIPPER CHAIN 5CC-CH-PLF8', standardpack:'766'},
    {location:'APC0111', partNumber:'L0449870AA01GWB', description:'ZIPPER CHAIN 5CC-CH-PLF8', standardpack:'766'},
    {location:'APC0111', partNumber:'L001466311NCPAA', description:'ARROW RET W15XL155MM', standardpack:'3000'},
    {location:'APC0111', partNumber:'L002215045NCPAA', description:'ARROW RET 687 W15XL240MM', standardpack:'2500'},
    {location:'APC0111', partNumber:'L002215046NCPAA', description:'ARROW RET 687 W15XL170MM', standardpack:'3500'},
    {location:'APC0111', partNumber:'L002481117NCPAA', description:'J-RET D721 28.5X240 MM', standardpack:'1100'},
    {location:'APC0112', partNumber:'L001434100NCPAA', description:'J-RET D1805 24X45MM', standardpack:'4400'},
    {location:'APC0112', partNumber:'L001518304NCPAA', description:'J-RET 721 28.5X55MM 31XX', standardpack:'3000'},
    {location:'APC0112', partNumber:'L002316951NCPAC', description:'STIFFENER PP 260X320MM', standardpack:'80'},
    {location:'APC0112', partNumber:'L002479502NCPAA', description:'RET-ARROW 687 15X308MM', standardpack:'1900'},
    {location:'APC0112', partNumber:'L002618780NCPAA', description:'J-RET 1697 21.7x330MM', standardpack:'900'},
    {location:'APC0112', partNumber:'L0430654AA01', description:'J-RET 1805 W24MM; L25MM', standardpack:'5000'},
    {location:'APC0113', partNumber:'L002312377NCPAA', description:'J-RET D1805 24X290 MM LH', standardpack:'700'},
    {location:'APC0113', partNumber:'L002312378NCPAA', description:'J-RET D1805 24X290 MM RH', standardpack:'700'},
    {location:'APC0113', partNumber:'L002312379NCPAC', description:'J-RET D1805 24X580 MM', standardpack:'375'},
    {location:'APC0113', partNumber:'L002312383NCPAC', description:'J-RET D1805 24X290 MM', standardpack:'700'},
    {location:'APC0113', partNumber:'L002396469NCPAA', description:'STIFFENER PP 180X20MM', standardpack:'2600'},
    {location:'APC0113', partNumber:'L002479499NCPAA', description:'J-RET D1805 24X65MM', standardpack:'3600'},
    {location:'APC0114', partNumber:'L002316914NCPAA', description:'J-RET D1697 21.7X45 MM', standardpack:'6700'},
    {location:'APC0114', partNumber:'L002316915NCPAA', description:'J-RET D721 28.5X55 MM', standardpack:'1200'},
    {location:'APC0114', partNumber:'L001797262NCPAA', description:'RET FLAT STRIP 25X265MM', standardpack:'2000'},
    {location:'APC0114', partNumber:'L002171015NCPAA', description:'RET FLAT STRIP 25X420MM', standardpack:'1000'},
    {location:'APC0115', partNumber:'L0571640AA01', description:'RET FLT STRP 25X50MM', standardpack:'10000'},
    {location:'APC0115', partNumber:'L0592042AA01', description:'J-RET D3497 22.4X35MM', standardpack:'6000'},
    {location:'APC0115', partNumber:'L0592045AA04', description:'RET FLT STRP 25.4X250MM', standardpack:'3000'},
    {location:'APC0115', partNumber:'L0597009AA02', description:'RET FLT STRP 154X42MM', standardpack:'5000'},
    {location:'APC0115', partNumber:'L0682843AA01', description:'RET FLAT STRIP 25X330MM', standardpack:'1700'},
    {location:'APC0116', partNumber:'L001802491NCPAA', description:'RET FLAT STRIP 25X380MM', standardpack:'1000'},
    {location:'APC0116', partNumber:'L001802492NCPAA', description:'RET FLAT STRIP 25X360MM', standardpack:'1000'},
    {location:'APC0116', partNumber:'L0681545AA01', description:'RET FLAT SRIP 25MMX220MM', standardpack:'2800'},
    {location:'APC0116', partNumber:'L0681546AA01', description:'RET FLAT SRIP 25MMX325MM', standardpack:'1500'},
    {location:'APC0116', partNumber:'L0681547AA01', description:'RET FLAT SRIP 25MMX305MM', standardpack:'1500'},
    {location:'APC0116', partNumber:'L0685445AA01', description:'FLT STRP STIFF 20X310MM', standardpack:'1300'},
    {location:'APC0117', partNumber:'L0649100AA01', description:'A-RET D2384 25X35MM', standardpack:'3000'},
    {location:'APC0117', partNumber:'L0649101AA01', description:'A-RET D2384 25X75MM', standardpack:'1400'},
    {location:'APC0117', partNumber:'L0676166AA01', description:'RET FLT STRP 25X220MM', standardpack:'2300'},
    {location:'APC0117', partNumber:'L0676168AA01', description:'RET FLT STRP 25X290MM', standardpack:'1750'},
    {location:'APC0117', partNumber:'L0676177AA01', description:'RET FLT STRP 25X325MM', standardpack:'2000'},
    {location:'APC0118', partNumber:'L00180970202FAA', description:'PULLSTRAP 9.5X70MM 02F', standardpack:'2000'},
    {location:'APC0118', partNumber:'L00180970209XAA', description:'PULLSTRAP 9.5X70MM 09X', standardpack:'2000'},
    {location:'APC0118', partNumber:'L00180970245DAA', description:'PULLSTRAP 9.5X70MM 45D', standardpack:'2000'},
    {location:'APC0118', partNumber:'L00180970264DAA', description:'PULLSTRAP 9.5X70MM 64D', standardpack:'2000'},
    {location:'APC0118', partNumber:'L001809702GKAAA', description:'PULLSTRAP 9.5X70MM GKA', standardpack:'2000'},
    {location:'APC0118', partNumber:'L001809702GWBAA', description:'PULLSTRAP 9.5X70MM GWB', standardpack:'2000'},
    {location:'APC0118', partNumber:'L001809702HXWAA', description:'PULLSTRAP 9.5X70MM HXW   ', standardpack:'2000'},
    {location:'APC0118', partNumber:'L002162447NCPAA', description:'BRIDED POLY/NEO 12.700MM', standardpack:'144'},
    {location:'APC0119', partNumber:'72918', description:'HOPE WEBBING LOOP TAPE ', standardpack:'700'},
    {location:'APC0119', partNumber:'190562', description:'HOOK 088-0199 ', standardpack:'500'},
    {location:'APC0119', partNumber:'KRG25LTCA', description:'TRICOT LOOP PROTECTOR', standardpack:'500'},
    {location:'APC0119', partNumber:'L0429142AA02', description:'TRICOT PROTECT KRG25LTCA', standardpack:'Varia'},
    {location:'APC0119', partNumber:'L0549303AA01', description:'WELT-PLASTIC 701156', standardpack:'2624.672'},
    {location:'APC0119', partNumber:'197443', description:'VELCR LOOP 25MM RG060292', standardpack:'500'},
    {location:'APC0119', partNumber:'L0575409AA01', description:'VELCRO HOOK MUSHRM 1"X2"', standardpack:'Varia'},
    {location:'APC0120', partNumber:'WRG16HMAA', description:'APLIX HOOK 16MM ', standardpack:'500'},
    {location:'APC0120', partNumber:'WRG16LBAA', description:'LOOP 5/8', standardpack:'500'},
    {location:'APC0120', partNumber:'WRG25LBAA', description:'VELCRO LOOP BLK TAPE 1"', standardpack:'500'},
    {location:'APC0120', partNumber:'WRG25MAAA', description:'VELCRO HOOK MUSHRM 1"X2"', standardpack:'1000'},
    {location:'APC0201', partNumber:'L0698195AA01', description:'FLAT RET D5258 W30 L365', standardpack:'800'},
    {location:'APC0201', partNumber:'L0706492AA02', description:'RET FLAT D5258 30X300MM', standardpack:'1500'},
    {location:'APC0201', partNumber:'L0724597AA01', description:'RET FLAT 5258 W25 L265mm', standardpack:'2000'},
    {location:'APC0201', partNumber:'L0736063AA01', description:'J-RET 3127 W29XL240', standardpack:'700'},
    {location:'APC0201', partNumber:'L0736066AA01', description:'J-RET 3127 W29XL680', standardpack:'125'},
    {location:'APC0202', partNumber:'L002194708NCPAA', description:'STF RET 25X30MM BLACK PP', standardpack:'3300'},
    {location:'APC0202', partNumber:'L0676258AA05', description:'RET FLAT STIF 108X142MM', standardpack:'2600'},
    {location:'APC0202', partNumber:'L0706490AA03', description:'RET FLAT D5258 25X255MM', standardpack:'2000'},
    {location:'APC0202', partNumber:'L0706491AA03', description:'RET FLAT D5258 25X370MM', standardpack:'1500'},
    {location:'APC0202', partNumber:'L0776538AA01', description:'J-RET D3890 W25.6 L160MM', standardpack:'500'},
    {location:'APC0202', partNumber:'L0780891AA01', description:'J-RET D305 W26.67 L190MM', standardpack:'750'},
    {location:'APC0203', partNumber:'L002806946NCPAA', description:'J RETAINER 26.7X70MM ', standardpack:'2000'},
    {location:'APC0203', partNumber:'L002806947NCPAA', description:'RET J 305 26.7X80MM', standardpack:'1800'},
    {location:'APC0203', partNumber:'L002807250NCPAA', description:'RET J 305 26.7X260MM', standardpack:'500'},
    {location:'APC0203', partNumber:'L002907223NCPAA', description:'ARROW RET 267 25.4X100MM ', standardpack:'1000'},
    {location:'APC0203', partNumber:'L002799378NCPAA', description:'STIFFENER 30X72MM PP ', standardpack:'6500'},
    {location:'APC0204', partNumber:'L001698202NCPAA', description:'RET J 305 W26.67 L115MM', standardpack:'900'},
    {location:'APC0204', partNumber:'L002053089NCPAA', description:'RET J POLY 26.67X155MM', standardpack:'1000'},
    {location:'APC0204', partNumber:'L002460234NCPAA', description:'J RETAINER 26.67X270MM', standardpack:'800'},
    {location:'APC0204', partNumber:'L002798840NCPAB', description:'OKIE TIEDOWN FL 30X290MM ', standardpack:'2100'},
    {location:'APC0204', partNumber:'L002798841NCPAB', description:'OKIE TIEDOWN FL 30X310MM ', standardpack:'2400'},
    {location:'APC0204', partNumber:'L002799379NCPAB', description:'STIFFENER 78.5X67.7 PP', standardpack:'1700'},
    {location:'APC0205', partNumber:'L002799380NCPAA', description:'STIFFENER 325X248 PP', standardpack:'110'},
    {location:'APC0205', partNumber:'L002806896NCPAA', description:'OKIE TIEDOWN FL 25X250MM ', standardpack:'3000'},
    {location:'APC0205', partNumber:'L002806897NCPAA', description:'OKIE TIEDOWN FL 25X255MM ', standardpack:'3000'},
    {location:'APC0205', partNumber:'L003142004NCPAA', description:'ARROW RET 15.5X452MM', standardpack:'900'},
    {location:'APC0205', partNumber:'L003142005NCPAA', description:'ARROW RET 15.5X396MM', standardpack:'1000'},
    {location:'APC0205', partNumber:'L0802981AA01', description:'RET FLT STRP 5258 25X365', standardpack:'1500'},
    {location:'APC0206', partNumber:'L0802979AA01', description:'RET FLT STRP 5258 25X265', standardpack:'2000'},
    {location:'APC0206', partNumber:'L0802980AA01', description:'RET FLT STRP 5258 25X265', standardpack:'2000'},
    {location:'APC0206', partNumber:'L0753466AA01', description:'FLAT RET D5258 W25 L245', standardpack:'2000'},
    {location:'APC0206', partNumber:'L0633654AA01', description:'VELCRO LOOP 30MM WIDE', standardpack:'328'},
    {location:'APC0211', partNumber:'L0698200AA01', description:'J RET D305 W26.67 175MM', standardpack:'600'},
    {location:'APC0211', partNumber:'L0698203AA01', description:'RET J 305 W26.67 L185MM', standardpack:'550'},
    {location:'APC0211', partNumber:'L0797678AA01', description:'RETAINER  J 305 W26.67MM', standardpack:'450'},
    {location:'APC0211', partNumber:'L0797679AA01', description:'RETAINER -J,305 W26.67MM', standardpack:'100'},
    {location:'APC0212', partNumber:'L0654899AA01', description:'J RET D976 W25.4MM L35MM', standardpack:'7500'},
    {location:'APC0212', partNumber:'L0797825AA01', description:'FLAT RET STFR W98 L195MM', standardpack:'1200'},
    {location:'APC0212', partNumber:'L0806941AA01', description:'J-RET 721 28.5X300MM', standardpack:'850'},
    {location:'APC0212', partNumber:'L0806942AA01', description:'J-RET 721 28.5X750MM', standardpack:'250'},
    {location:'APC0212', partNumber:'L0806943AA01', description:'A-RET 687 15X285MM', standardpack:'2000'},
    {location:'APC0212', partNumber:'L0806944AA01', description:'A-RET 687 15X735MM', standardpack:'400'},
    {location:'APC0213', partNumber:'L002907225NCPAB', description:'OKIE TIEDOWN 30X335MM', standardpack:'2000'},
    {location:'APC0213', partNumber:'L002914716NCPAA', description:'STIFFENER PP 28X55MM 1.5 ', standardpack:'2500'},
    {location:'APC0213', partNumber:'L002914905NCPAA', description:'RET J 305 W26.67 L60MM', standardpack:'2000'},
    {location:'APC0213', partNumber:'L0609247AA01', description:'J-RET D305 25MM BLACK ', standardpack:'4000'},
    {location:'APC0213', partNumber:'L0701143AA01', description:'J-RET D305 100 MM', standardpack:'1000'},
    {location:'APC0213', partNumber:'L002798842NCPAC', description:'OKIE TIEDOWN FL 30X375MM ', standardpack:'2000'},
    {location:'APC0214', partNumber:'L001423285NCPAA', description:'RET J 305 26.67X30MM', standardpack:'5000'},
    {location:'APC0214', partNumber:'L001450016NCPAA', description:'ARROW 2384 W25MM L70MM', standardpack:'2000'},
    {location:'APC0214', partNumber:'L001553609NCPAA', description:'RET J D305 26.67X160MM', standardpack:'850'},
    {location:'APC0214', partNumber:'L001614470NCPAA', description:'RET J 305 W26.67 L50MM', standardpack:'1750'},
    {location:'APC0214', partNumber:'L001676174NCPAA', description:'RET FLT STRP 25.4X80MM', standardpack:'7800'},
    {location:'APC0214', partNumber:'L001676224NCPAA', description:'RET J D305 26.76X140MM', standardpack:'1000'},
    {location:'APC0215', partNumber:'L003141998NCPAA', description:'ARROW RET 15.50X660MM', standardpack:'200'},
    {location:'APC0215', partNumber:'L003141999NCPAA', description:'ARROW RET 15.50X596MM', standardpack:'200'},
    {location:'APC0215', partNumber:'L003142000NCPAA', description:'ARROW RET 15.50X390MM', standardpack:'1200'},
    {location:'APC0215', partNumber:'L003142001NCPAA', description:'ARROW RET 15.50X380MM', standardpack:'1200'},
    {location:'APC0215', partNumber:'L003142002NCPAA', description:'ARROW RET 15.50X80MM ', standardpack:'5000'},
    {location:'APC0215', partNumber:'L003142003NCPAA', description:'ARROW RET 15.50X110MM ', standardpack:'5000'},
    {location:'APC0402', partNumber:'5CC-CH-PLF8-309X', description:'ZIPPER CHAIN 5CC-CH-PLF8', standardpack:'766'},
    {location:'APC0402', partNumber:'L0637636AA01', description:'J-RET 25.4X335MM', standardpack:'700'},
    {location:'APC0402', partNumber:'L0639918AA01', description:'J-RET D976 25.4X735MM', standardpack:'300'},
    {location:'APC0402', partNumber:'L0676232AA01', description:'J-RET D3167 25.4X320MM', standardpack:'700'},
    {location:'APC0402', partNumber:'L0797260AA01', description:'J-RET D3167 25.4X720MM', standardpack:'400'},
    {location:'APC0402', partNumber:'L001571668NCPAA', description:'A-RET D2384 25X100MM ', standardpack:'1000'},
    {location:'APC0402', partNumber:'L001597009NCPAA', description:'RET FLT STRP 154X42MM', standardpack:'Pendiente'},
    {location:'APC0402', partNumber:'L001649100NCPAA', description:'A-RET D2384 25X35MM', standardpack:'Pendiente'},
    {location:'APC0402', partNumber:'L001676177NCPAA', description:'RET FLT STRP 25X325MM', standardpack:'2000'},
    {location:'APC0402', partNumber:'L001676192NCPAA', description:'RET FLT STRP 25X285MM', standardpack:'2000'},
    {location:'APC0402', partNumber:'L001676195NCPAA', description:'RET FLT STRP 25X350MM', standardpack:'Pendiente'},
    {location:'APC0402', partNumber:'L001676232NCPAA', description:'J-RET D3167 25.4X320MM', standardpack:'800'},
    {location:'APC0402', partNumber:'L001676166NCPAA', description:'RET FLT STRP 25X220MM', standardpack:'Pendiente'},
    {location:'APC0402', partNumber:'L001649101NCPAA', description:'A-RET D2384 25X75MM', standardpack:'Pendiente'},
    {location:'APC0402', partNumber:'L001676165NCPAA', description:'RET FLT STRP 25X290MM', standardpack:'Pendiente'},
    {location:'APC0402', partNumber:'L001637636NCPAA', description:'J-RET 25.4X335MM', standardpack:'Pendiente'},
    {location:'APC0402', partNumber:'L001797260NCPAA', description:'J-RET D3167 25.4X720MM', standardpack:'350'},
];

const searchBar = document.getElementById('searchBar');
const dataContainer = document.getElementById('dataContainer');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');

// Function to display data items
function displayData(items) {
    dataContainer.innerHTML = `
        <table class="highlight">
            <thead>
                <tr>
                    <th>Localización</th>
                    <th>Numero De Parte</th>
                    <th>Descripción</th>
                    <th>Standard Pack</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr class="data-item" onclick="showBarcode('${item.partNumber}')">
                        <td>${item.location}</td>
                        <td>${item.partNumber}</td>
                        <td>${item.description}</td>
                        <td>${item.standardpack}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Function to show barcode in modal
function showBarcode(partNumber) {
    const instance = M.Modal.getInstance(modal);
    modalImage.innerHTML = ''; // Clear previous content
    const modifiedPartNumber = 'P' + partNumber; // Add 'P' before the part number
    JsBarcode(modalImage, modifiedPartNumber, {
        format: "CODE128",
        displayValue: true
    });
    instance.open();
}

// Event listener for search bar
searchBar.addEventListener('input', (e) => {
    const searchString = e.target.value.toLowerCase();
    const filteredData = data.filter(item => 
        item.location.toLowerCase().includes(searchString) ||
        item.partNumber.toLowerCase().includes(searchString) ||
        item.description.toLowerCase().includes(searchString)
    );
    displayData(filteredData);
});

// Initial display of all data
displayData(data);