document.addEventListener('DOMContentLoaded', function () {
      M.AutoInit();
    });
    document.addEventListener("DOMContentLoaded", () => {
  focusPartInput();
});
    document.addEventListener("keydown", e => {
  if (e.key === "Tab") {
    e.preventDefault();
    focusPartInput();
  }
});
    document.addEventListener("click", () => {
  focusPartInput();
});

/* ===== PART MASTER (SAMPLE – YOU ALREADY HAVE FULL DATA) ===== */
const partsDB = {
  "L002316235NCPAB": {
    location: "APC0101",
    description: "BEADED TIE-DOWN 25X955MM",
    cost: 0.2328,
    weight: 381,
    pack: 500,
    daily: 1532.4
  },
  "L002401087NCPAC": {
    location: "APC0101",
    description: "RET FLAT 5258 25X245MM",
    cost: 0.0386,
    weight: 102,
    pack: 1000,
    daily: 3065.6
  },
  "L002401088NCPAC": {
    location: "APC0101",
    description: "RET FLAT 5258 25X255MM",
    cost: 0.0402,
    weight: 106,
    pack: 1000,
    daily: 1532.8
  },
  "L002401089NCPAD": {
    location: "APC0101",
    description: "TIE-DOWN 5258 25X430MM",
    cost: 0.0778,
    weight: 175,
    pack: 1000,
    daily: 1532.8
  },
  "L002401090NCPAD": {
    location: "APC0101",
    description: "TIE-DOWN 5258 25X420MM",
    cost: 0.076,
    weight: 165,
    pack: 1000,
    daily: 1532.8
  },
  "L002401091NCPAB": {
    location: "APC0101",
    description: "TIE-DOWN 5258 30X160MM",
    cost: 0.0264,
    weight: 70,
    pack: 1000,
    daily: 767.2
  },
  "L002316236NCPAA": {
    location: "APC0102",
    description: "J-RET D1805 24X120 MM",
    cost: 0.0326,
    weight: 153,
    pack: 1800,
    daily: 1532.4
  },
  "L002316237NCPAA": {
    location: "APC0102",
    description: "J-RET D1805 24X200 MM",
    cost: 0.0556,
    weight: 263,
    pack: 1000,
    daily: 2024.6
  },
  "L002316238NCPAA": {
    location: "APC0102",
    description: "J-RET D1697 21.7X250 MM",
    cost: 0.0576,
    weight: 200,
    pack: 1200,
    daily: 766.2
  },
  "L002316951NCPAC": {
    location: "APC0102",
    description: "STIFFENER PP 260X320MM",
    cost: 0.6008,
    weight: 2791,
    pack: 80,
    daily: 293.6
  },
  "L002401092NCPAA": {
    location: "APC0102",
    description: "J-RET 721 28.5X625MM",
    cost: 0.2262,
    weight: 819,
    pack: 350,
    daily: 767.2
  },
  "L002481117NCPAA": {
    location: "APC0102",
    description: "J-RET D721 28.5X240 MM",
    cost: 0.0643,
    weight: 286,
    pack: 1100,
    daily: 293.6
  },
  "5CC-CH-PLF8-645D": {
    location: "APC0103",
    description: "ZIPPER CHAIN 5CC-CH-PLF8",
    cost: 0.7315,
    weight: null,
    pack: 766,
    daily: 699.4
  },
  "L00144987006HAA": {
    location: "APC0103",
    description: "ZIPPER CHAIN 5CC-CH-PLF8",
    cost: 0.7315,
    weight: null,
    pack: 766,
    daily: 82.2
  },
  "L001449870U52AA": {
    location: "APC0103",
    description: "ZIPPER CHAIN U52 BLACK",
    cost: 0.6401,
    weight: null,
    pack: 766,
    daily: 2698
  },
  "L002401093NCPAA": {
    location: "APC0103",
    description: "J-RET D1805 28.5X370 MM",
    cost: 0.1258,
    weight: 459,
    pack: 650,
    daily: 765.6
  },
  "255S5-195A": {
    location: "APC0103",
    description: "ZIPPER CHAIN YKK ITEM",
    cost: 0.2164,
    weight: null,
    pack: 766,
    daily: 45.4
  },
  "L00180249345DAA": {
    location: "APC0104",
    description: "ZIPPER ASSEM L435MM 45D",
    cost: 0.278,
    weight: null,
    pack: 1000,
    daily: 0
  },
  "L001802493GKAAA": {
    location: "APC0104",
    description: "ZIPPER ASSEM L435MM GKA",
    cost: 0.278,
    weight: null,
    pack: 1000,
    daily: 507.2
  },
  "L0816049AA0109X": {
    location: "APC0104",
    description: "ZIPPER 5/8 W32.5.L535MM",
    cost: 0.255,
    weight: null,
    pack: 1000,
    daily: 264
  },
  "L0816049AA0145D": {
    location: "APC0104",
    description: "ZIPPER 5/8 W32.5.L535MM",
    cost: 0.255,
    weight: null,
    pack: 1000,
    daily: 541.6
  },
  "L0816049AA01GKA": {
    location: "APC0104",
    description: "ZIPPER 5/8 W32.5.L535MM",
    cost: 0.255,
    weight: null,
    pack: 1000,
    daily: 10116.4
  },
  "L0571635AA01": {
    location: "APC0105",
    description: "J-RET D3497 22.4X45MM",
    cost: 0.0114,
    weight: 52,
    pack: 5000,
    daily: 7924
  },
  "L0571636AA01": {
    location: "APC0105",
    description: "J-RET D3497 22.4X80MM",
    cost: 0.017,
    weight: 91,
    pack: 3000,
    daily: 4754.4
  },
  "L0572828AA03": {
    location: "APC0105",
    description: "RET FLT STRP 67X270MM",
    cost: 0.0947,
    weight: 377,
    pack: 750,
    daily: 1584.8
  },
  "L0591424AA01": {
    location: "APC0105",
    description: "J-RET 1588 28.95X80MM",
    cost: 0.0173,
    weight: 94,
    pack: 1500,
    daily: 1584.8
  },
  "L0668944AA01": {
    location: "APC0105",
    description: "J-RET D2140 35X60MM",
    cost: 0.0217,
    weight: 104,
    pack: 1500,
    daily: 3169.6
  },
  "L002866832NCPAA": {
    location: "APC0106",
    description: "J-RET 30.1X335MM",
    cost: 0.0915,
    weight: 375,
    pack: 500,
    daily: 2820
  },
  "L002890609NCPAA": {
    location: "APC0106",
    description: "J-RET D975 30.1X320MM",
    cost: 0.0874,
    weight: 371,
    pack: 500,
    daily: 2820
  },
  "L0571668AA01": {
    location: "APC0106",
    description: "A-RET D2384 25X100MM",
    cost: 0.0269,
    weight: 159,
    pack: 1000,
    daily: 5686.8
  },
  "L0592046AA01": {
    location: "APC0106",
    description: "J-RET D976 25X60MM BLK",
    cost: 0.0152,
    weight: 66,
    pack: 4700,
    daily: 6339.2
  },
  "L0676165AA01": {
    location: "APC0106",
    description: "RET FLT STRP 25X290MM",
    cost: 0.0442,
    weight: 128,
    pack: 2000,
    daily: 7331.2
  },
  "L002866833NCPAA": {
    location: "APC0107",
    description: "J-RET D975 30.1X735MM",
    cost: 0.2007,
    weight: 844,
    pack: 150,
    daily: 2832.4
  },
  "L002890610NCPAA": {
    location: "APC0107",
    description: "J-RET D975 30.1X720MM",
    cost: 0.1966,
    weight: 811,
    pack: 150,
    daily: 2832.4
  },
  "L0676192AA01": {
    location: "APC0107",
    description: "RET FLT STRP 25X285MM",
    cost: 0.0436,
    weight: 124,
    pack: 2000,
    daily: 3339.6
  },
  "L0676195AA01": {
    location: "APC0107",
    description: "RET FLT STRP 25X350MM",
    cost: 0.0537,
    weight: 152,
    pack: 1800,
    daily: 5539.2
  },
  "1561-305SAA": {
    location: "APC0108",
    description: "J RET 1561 305MM",
    cost: 0.1099,
    weight: 290,
    pack: 950,
    daily: 642.6
  },
  "1561-345SAA": {
    location: "APC0108",
    description: "J RET 1561 345MM",
    cost: 0.094,
    weight: 324,
    pack: 750,
    daily: 642.6
  },
  "2232b910F00MA": {
    location: "APC0108",
    description: "J-RET FABRIC 910mm BLK",
    cost: 0.1758,
    weight: 1364,
    pack: 175,
    daily: 644.8
  },
  "STFR-415X122FAC": {
    location: "APC0108",
    description: "STIFFENER 415X122 MM",
    cost: 0.2248,
    weight: 766,
    pack: 300,
    daily: 608.6
  },
  "170480": {
    location: "APC0109",
    description: "VELCRO HOOK 1 BLACK ",
    cost: 0.2973,
    weight: null,
    pack: 250,
    daily: 0
  },
  "L002162447NCPAA": {
    location: "APC0109",
    description: "BRIDED POLY/NEO 12.700MM",
    cost: 0.3706,
    weight: 1346,
    pack: 144,
    daily: 96.8
  },
  "L0575410AA01": {
    location: "APC0109",
    description: "VELCRO LOOP BLK TAPE 1",
    cost: 0.2446,
    weight: null,
    pack: 1000,
    daily: 1112.2
  },
  "L0633654AA01": {
    location: "APC0109",
    description: "VELCRO LOOP 30MM WIDE",
    cost: 0.0582,
    weight: 974,
    pack: 328,
    daily: 5134.6
  },
  "190562": {
    location: "APC0110",
    description: "HOOK 088-0199",
    cost: 0.2385,
    weight: null,
    pack: 500,
    daily: 390.2
  },
  "KRG25LTCA": {
    location: "APC0110",
    description: "TRICOT LOOP PROTECTOR",
    cost: 0.1876,
    weight: null,
    pack: 500,
    daily: 55.4
  },
  "L0429142AA02": {
    location: "APC0110",
    description: "TRICOT PROTECT KRG25LTCA",
    cost: 0.1533,
    weight: null,
    pack: 2000,
    daily: 2962.2
  },
  "L0495624AA01": {
    location: "APC0110",
    description: "ELASTIC 1 BLK BRAIDDE",
    cost: 0.8637,
    weight: 1011,
    pack: 720,
    daily: 426
  },
  "L0549303AA01": {
    location: "APC0110",
    description: "WELT-PLASTIC 701156",
    cost: 0.2165,
    weight: 1823,
    pack: 2624.672,
    daily: 5841.2
  },
  "L0575409AA01": {
    location: "APC0110",
    description: "VELCRO HOOK MUSHRM 1 X2",
    cost: 0.254,
    weight: null,
    pack: 1050,
    daily: 144.6
  },
  "L001434100NCPAA": {
    location: "APC0111",
    description: "J-RET D1805 24X45MM",
    cost: 0.0127,
    weight: 57,
    pack: 4400,
    daily: 4600
  },
  "L001518304NCPAA": {
    location: "APC0111",
    description: "J-RET 721 28.5X55MM 31XX",
    cost: 0.0197,
    weight: 64,
    pack: 3000,
    daily: 1532.8
  },
  "L002312383NCPAC": {
    location: "APC0111",
    description: "J-RET D1805 24X290 MM",
    cost: 0.1249,
    weight: 264,
    pack: 700,
    daily: 765.6
  },
  "L002479502NCPAA": {
    location: "APC0111",
    description: "RET-ARROW 687 15X308MM",
    cost: 0.0517,
    weight: 147,
    pack: 1900,
    daily: 1534.4
  },
  "L002618780NCPAA": {
    location: "APC0111",
    description: "J-RET 1697 21.7x330MM",
    cost: 0.1031,
    weight: 263,
    pack: 900,
    daily: 766.2
  },
  "L0430654AA01": {
    location: "APC0111",
    description: "J-RET 1805 W24MM; L25MM",
    cost: 0.007,
    weight: 32,
    pack: 5000,
    daily: 4598.4
  },
  "L002215045NCPAA": {
    location: "APC0112",
    description: "ARROW RET 687 W15XL240MM",
    cost: 0.0549,
    weight: 122,
    pack: 2500,
    daily: 293.6
  },
  "L002312377NCPAA": {
    location: "APC0112",
    description: "J-RET D1805 24X290 MM LH",
    cost: 0.1158,
    weight: 284,
    pack: 700,
    daily: 1532.8
  },
  "L002312378NCPAA": {
    location: "APC0112",
    description: "J-RET D1805 24X290 MM RH",
    cost: 0.1158,
    weight: 298,
    pack: 700,
    daily: 1532.8
  },
  "L002312379NCPAC": {
    location: "APC0112",
    description: "J-RET D1805 24X580 MM",
    cost: 0.2365,
    weight: 509,
    pack: 375,
    daily: 767.2
  },
  "L002396469NCPAA": {
    location: "APC0112",
    description: "STIFFENER PP 180X20MM",
    cost: 0.0423,
    weight: 91,
    pack: 2600,
    daily: 766.2
  },
  "L002479499NCPAA": {
    location: "APC0112",
    description: "J-RET D1805 24X65MM",
    cost: 0.0326,
    weight: 82,
    pack: 3600,
    daily: 472.6
  },
  "255S5-184D": {
    location: "APC0113",
    description: "ZIPPER CHAIN YKK ITEM",
    cost: 0.2164,
    weight: null,
    pack: 766,
    daily: 877
  },
  "L002215046NCPAA": {
    location: "APC0113",
    description: "ARROW RET 687 W15XL170MM",
    cost: 0.0304,
    weight: 86,
    pack: 3500,
    daily: 1531.2
  },
  "L002316914NCPAA": {
    location: "APC0113",
    description: "J-RET D1697 21.7X45 MM",
    cost: 0.0145,
    weight: 37,
    pack: 6700,
    daily: 587.2
  },
  "L002316915NCPAA": {
    location: "APC0113",
    description: "J-RET D721 28.5X55 MM",
    cost: 0.041,
    weight: 191,
    pack: 1200,
    daily: 293.6
  },
  "L0449870AA0102F": {
    location: "APC0113",
    description: "ZIPPER CHAIN 5CC-CH-PLF8",
    cost: 0.7315,
    weight: null,
    pack: 766,
    daily: 134.2
  },
  "L0449870AA0164D": {
    location: "APC0113",
    description: "ZIPPER CHAIN 5CC-CH-PLF8",
    cost: 0.7315,
    weight: null,
    pack: 766,
    daily: 166.4
  },
  "L001466311NCPAA": {
    location: "APC0113",
    description: "ARROW RET W15XL155MM",
    cost: 0.0198,
    weight: 74,
    pack: 3000,
    daily: 293.6
  },
  "L001797262NCPAA": {
    location: "APC0114",
    description: "RET FLAT STRIP 25X265MM",
    cost: 0.0385,
    weight: 114,
    pack: 2000,
    daily: 16636.6
  },
  "L002171015NCPAA": {
    location: "APC0114",
    description: "RET FLAT STRIP 25X420MM",
    cost: 0.0611,
    weight: 176,
    pack: 1000,
    daily: 10922
  },
  "L0571640AA01": {
    location: "APC0115",
    description: "RET FLT STRP 25X50MM",
    cost: 0.0088,
    weight: 20,
    pack: 10000,
    daily: 3169.6
  },
  "L0592042AA01": {
    location: "APC0115",
    description: "J-RET D3497 22.4X35MM",
    cost: 0.0094,
    weight: 40,
    pack: 6000,
    daily: 3169.6
  },
  "L0592045AA04": {
    location: "APC0115",
    description: "RET FLT STRP 25.4X250MM",
    cost: 0.0322,
    weight: 98,
    pack: 3000,
    daily: 3169.6
  },
  "L0597009AA02": {
    location: "APC0115",
    description: "RET FLT STRP 154X42MM",
    cost: 0.0486,
    weight: 57,
    pack: 5000,
    daily: 2832.4
  },
  "L0682843AA01": {
    location: "APC0115",
    description: "RET FLAT STRIP 25X330MM",
    cost: 0.0494,
    weight: 143,
    pack: 1700,
    daily: 125.6
  },
  "L001802491NCPAA": {
    location: "APC0116",
    description: "RET FLAT STRIP 25X380MM",
    cost: 0.058,
    weight: 162,
    pack: 1000,
    daily: 253.6
  },
  "L001802492NCPAA": {
    location: "APC0116",
    description: "RET FLAT STRIP 25X360MM",
    cost: 0.055,
    weight: 156,
    pack: 1000,
    daily: 253.6
  },
  "L0681545AA01": {
    location: "APC0116",
    description: "RET FLAT SRIP 25MMX220MM",
    cost: 0.0339,
    weight: 98,
    pack: 2800,
    daily: 512
  },
  "L0681546AA01": {
    location: "APC0116",
    description: "RET FLAT SRIP 25MMX325MM",
    cost: 0.0491,
    weight: 142,
    pack: 1500,
    daily: 128
  },
  "L0681547AA01": {
    location: "APC0116",
    description: "RET FLAT SRIP 25MMX305MM",
    cost: 0.0463,
    weight: 127,
    pack: 1500,
    daily: 128
  },
  "L0685445AA01": {
    location: "APC0116",
    description: "FLT STRP STIFF 20X310MM",
    cost: 0.0528,
    weight: 222,
    pack: 1300,
    daily: 3169.6
  },
  "L0649100AA01": {
    location: "APC0117",
    description: "A-RET D2384 25X35MM",
    cost: 0.0112,
    weight: 56,
    pack: 3000,
    daily: 5579.8
  },
  "L0649101AA01": {
    location: "APC0117",
    description: "A-RET D2384 25X75MM",
    cost: 0.0239,
    weight: 121,
    pack: 1400,
    daily: 1993
  },
  "L0676166AA01": {
    location: "APC0117",
    description: "RET FLT STRP 25X220MM",
    cost: 0.0488,
    weight: 93,
    pack: 2300,
    daily: 1141.6
  },
  "L0676168AA01": {
    location: "APC0117",
    description: "RET FLT STRP 25X290MM",
    cost: 0.0609,
    weight: 125,
    pack: 1750,
    daily: 3424.8
  },
  "L0676177AA01": {
    location: "APC0117",
    description: "RET FLT STRP 25X325MM",
    cost: 0.0489,
    weight: 142,
    pack: 2000,
    daily: 2283.2
  },
  "L002460234NCPAA": {
    location: "APC0118",
    description: "J RETAINER 26.67X270MM",
    cost: 0.1308,
    weight: 500,
    pack: 800,
    daily: 13.4
  },
  "L002798840NCPAB": {
    location: "APC0118",
    description: "OKIE TIEDOWN FL 30X290MM",
    cost: 0.0521,
    weight: 102,
    pack: 2100,
    daily: 54
  },
  "L002798841NCPAB": {
    location: "APC0118",
    description: "OKIE TIEDOWN FL 30X310MM",
    cost: 0.0557,
    weight: 108,
    pack: 2400,
    daily: 27
  },
  "L002806946NCPAA": {
    location: "APC0118",
    description: "J RETAINER 26.7X70MM",
    cost: 0.0333,
    weight: 132,
    pack: 2000,
    daily: 26.8
  },
  "L002806947NCPAA": {
    location: "APC0118",
    description: "RET J 305 26.7X80MM",
    cost: 0.0389,
    weight: 150,
    pack: 1800,
    daily: 38
  },
  "L002807250NCPAA": {
    location: "APC0118",
    description: "RET J 305 26.7X260MM",
    cost: 0.126,
    weight: 486,
    pack: 500,
    daily: 11.2
  },
  "L002907223NCPAA": {
    location: "APC0118",
    description: "ARROW RET 267 25.4X100MM",
    cost: 0.0425,
    weight: 76,
    pack: 1000,
    daily: 13.6
  },
  "794-100SAA": {
    location: "APC0119",
    description: "J-RET D794 100mm  BLK",
    cost: 0.0395,
    weight: 129,
    pack: 1500,
    daily: 644.8
  },
  "L00180970202FAA": {
    location: "APC0119",
    description: "PULLSTRAP 9.5X70MM 02F",
    cost: 0.0911,
    weight: 12,
    pack: 2000,
    daily: 97.4
  },
  "L00180970206HAA": {
    location: "APC0119",
    description: "PULLSTRAP 9.5X70MM 06H",
    cost: 0.1384,
    weight: 12,
    pack: 2000,
    daily: 59.6
  },
  "L00180970209XAA": {
    location: "APC0119",
    description: "PULLSTRAP 9.5X70MM 09X",
    cost: 0.0911,
    weight: 12,
    pack: 2000,
    daily: 0
  },
  "L00180970245DAA": {
    location: "APC0119",
    description: "PULLSTRAP 9.5X70MM 45D",
    cost: 0.0911,
    weight: 12,
    pack: 2000,
    daily: 510
  },
  "L00180970264DAA": {
    location: "APC0119",
    description: "PULLSTRAP 9.5X70MM 64D",
    cost: 0.0911,
    weight: 12,
    pack: 2000,
    daily: 118.4
  },
  "L001809702GKAAA": {
    location: "APC0119",
    description: "PULLSTRAP 9.5X70MM GKA",
    cost: 0.0911,
    weight: 12,
    pack: 2000,
    daily: 3290
  },
  "L001809702HXWAA": {
    location: "APC0119",
    description: "PULLSTRAP 9.5X70MM HXW",
    cost: 0.0911,
    weight: 12,
    pack: 2000,
    daily: 327.8
  },
  "L002618822NCPAA": {
    location: "APC0119",
    description: "PIPING CORE 1MM ROLL",
    cost: 0.0491,
    weight: 1082,
    pack: 1000,
    daily: 1736.2
  },
  "WRG16HMAA": {
    location: "APC0120",
    description: "APLIX HOOK 16MM",
    cost: 0.2054,
    weight: null,
    pack: 500,
    daily: 1795.2
  },
  "WRG16LBAA": {
    location: "APC0120",
    description: "LOOP 5/8",
    cost: 0.3533,
    weight: null,
    pack: 500,
    daily: 1091.8
  },
  "WRG25LBAA": {
    location: "APC0120",
    description: "VELCRO LOOP BLK TAPE 1",
    cost: 0.4018,
    weight: null,
    pack: 500,
    daily: 2336.4
  },
  "WRG25MAAA": {
    location: "APC0120",
    description: "VELCRO HOOK MUSHRM 1 X2",
    cost: 0.3129,
    weight: null,
    pack: 1000,
    daily: 1229.4
  },
  "L0698195AA01": {
    location: "APC0201",
    description: "FLAT RET D5258 W30 L365",
    cost: 0.0416,
    weight: 150,
    pack: 800,
    daily: 4603.6
  },
  "L0706492AA02": {
    location: "APC0201",
    description: "RET FLAT D5258 30X300MM",
    cost: 0.0431,
    weight: 132,
    pack: 1500,
    daily: 5053.2
  },
  "L0724597AA01": {
    location: "APC0201",
    description: "RET FLAT 5258 W25 L265mm",
    cost: 0.0307,
    weight: 113,
    pack: 2000,
    daily: 6905.4
  },
  "L0736063AA01": {
    location: "APC0201",
    description: "J-RET 3127 W29XL240",
    cost: 0.0767,
    weight: 419,
    pack: 700,
    daily: 2061.2
  },
  "L0736066AA01": {
    location: "APC0201",
    description: "J-RET 3127 W29XL680",
    cost: 0.2138,
    weight: 1104,
    pack: 125,
    daily: 447.4
  },
  "L002194708NCPAA": {
    location: "APC0202",
    description: "STF RET 25X30MM BLACK PP",
    cost: 0.0152,
    weight: 7,
    pack: 3300,
    daily: 5002
  },
  "L0676258AA05": {
    location: "APC0202",
    description: "RET FLAT STIF 108X142MM",
    cost: 0.056,
    weight: 109,
    pack: 2600,
    daily: 5053.2
  },
  "L0706490AA03": {
    location: "APC0202",
    description: "RET FLAT D5258 25X255MM",
    cost: 0.0348,
    weight: 98,
    pack: 2000,
    daily: 4564.2
  },
  "L0706491AA03": {
    location: "APC0202",
    description: "RET FLAT D5258 25X370MM",
    cost: 0.0504,
    weight: 143,
    pack: 1500,
    daily: 489
  },
  "L0776538AA01": {
    location: "APC0202",
    description: "J-RET D3890 W25.6 L160MM",
    cost: 0.0652,
    weight: 280,
    pack: 500,
    daily: 878.2
  },
  "L0780891AA01": {
    location: "APC0202",
    description: "J-RET D305 W26.67 L190MM",
    cost: 0.0627,
    weight: 344,
    pack: 750,
    daily: 1622.8
  },
  "346779": {
    location: "APC0203",
    description: "BINDING FOLD 1 1/8 195A",
    cost: 0.5,
    weight: 4035,
    pack: 300,
    daily: 0
  },
  "346803": {
    location: "APC0203",
    description: "BINDING FOLD 1 1/8 110D",
    cost: 0.5,
    weight: 4035,
    pack: 300,
    daily: 579.2
  },
  "10686": {
    location: "APC0203",
    description: "BW/WIRE ZP (3mm/2.5K.G)",
    cost: 73.7478,
    weight: 2703,
    pack: 2.5,
    daily: 0.8
  },
  "5CC-DF6SLSEP": {
    location: "APC0203",
    description: "ZIPPER SLIDER CD391 2013",
    cost: 0.17,
    weight: 129,
    pack: 3000,
    daily: 5052
  },
  
"L0672525AA01": {
  location: "APC0203",
  description: "WELT-PLASTIC, 124830;",
  cost: 0.09,
  weight: "n-a",
  pack: 2000,
  daily: 177.2
},

  "25ZZ5": {
    location: "APC0204",
    description: "ZIPPER SLIDER 580 BLACK",
    cost: 0.0348,
    weight: 60,
    pack: 6000,
    daily: 1285.2
  },
  "L0148229AA02": {
    location: "APC0204",
    description: "AIR BAG TAG GM PROGRAMS",
    cost: 0.04,
    weight: 103,
    pack: 500,
    daily: 608.6
  },
  "L0269501AA01": {
    location: "APC0204",
    description: "ELGIN CLIP ASSY 11X46MM",
    cost: 0.2425,
    weight: 316,
    pack: 750,
    daily: 608.6
  },
  "L0617164AA01": {
    location: "APC0204",
    description: "LABEL ISO CHILD 40.6X44",
    cost: 0.067,
    weight: 438,
    pack: 1000,
    daily: 447.4
  },
  "L0697064AA01": {
    location: "APC0204",
    description: "LABEL SAFETY TAG 20X64MM",
    cost: 0.0472,
    weight: 396,
    pack: 1000,
    daily: 1524.8
  },
  "Q010000839": {
    location: "APC0204",
    description: "ISO BUTTON BACK WHITE",
    cost: 0.0306,
    weight: 417,
    pack: 1000,
    daily: 12237.6
  },
  "Q92K204G19": {
    location: "APC0204",
    description: "ISO BUTTON CHARCOAL",
    cost: 0.024,
    weight: 342,
    pack: 1000,
    daily: 10938.4
  },
  "Q92K204G20": {
    location: "APC0204",
    description: "ISO BUTTON G20 A. BROWN",
    cost: 0.024,
    weight: 342,
    pack: 1000,
    daily: 1752.8
  },
  "L002799380NCPAA": {
    location: "APC0205",
    description: "STIFFENER 325X248 PP",
    cost: 0.8675,
    weight: 2033,
    pack: 110,
    daily: 13.4
  },
  "L002806896NCPAA": {
    location: "APC0205",
    description: "OKIE TIEDOWN FL 25X250MM",
    cost: 0.0375,
    weight: 86,
    pack: 3000,
    daily: 73.8
  },
  "L002806897NCPAA": {
    location: "APC0205",
    description: "OKIE TIEDOWN FL 25X255MM",
    cost: 0.0382,
    weight: 86,
    pack: 3000,
    daily: 24.6
  },
  "L002914716NCPAA": {
    location: "APC0205",
    description: "STIFFENER PP 28X55MM 1.5",
    cost: 0.0121,
    weight: 38,
    pack: 5000,
    daily: 24.6
  },
  "L003142004NCPAA": {
    location: "APC0205",
    description: "ARROW RET 15.5X452MM",
    cost: 0.0808,
    weight: 261,
    pack: 900,
    daily: 13.4
  },
  "L003142005NCPAA": {
    location: "APC0205",
    description: "ARROW RET 15.5X396MM",
    cost: 0.0708,
    weight: 225,
    pack: 1000,
    daily: 26.8
  },
  "L001698202NCPAA": {
    location: "APC0206",
    description: "RET J 305 W26.67 L115MM",
    cost: 0.05,
    weight: 216,
    pack: 900,
    daily: 22.4
  },
  "L002053089NCPAA": {
    location: "APC0206",
    description: "RET J POLY 26.67X155MM",
    cost: 0.0747,
    weight: 279,
    pack: 1000,
    daily: 24.6
  },
  "L002799378NCPAA": {
    location: "APC0206",
    description: "STIFFENER 30X72MM PP",
    cost: 0.0402,
    weight: 46,
    pack: 6500,
    daily: 49.2
  },
  "L002799379NCPAB": {
    location: "APC0206",
    description: "STIFFENER 78.5X67.7 PP",
    cost: 0.0482,
    weight: 123,
    pack: 1700,
    daily: 13.4
  },
  "L002907225NCPAB": {
    location: "APC0206",
    description: "OKIE TIEDOWN 30X335MM",
    cost: 0.0588,
    weight: 118,
    pack: 2000,
    daily: 27.2
  },
  "L002914905NCPAA": {
    location: "APC0206",
    description: "RET J 305 W26.67 L60MM",
    cost: 0.0285,
    weight: 114,
    pack: 2000,
    daily: 11.2
  },
  "L0609247AA01": {
    location: "APC0206",
    description: "J-RET D305 25MM BLACK",
    cost: 0.0055,
    weight: 46,
    pack: 6500,
    daily: 13.4
  },
  "L0698200AA01": {
    location: "APC0211",
    description: "J RET D305 W26.67 175MM",
    cost: 0.0376,
    weight: 342,
    pack: 600,
    daily: 2501
  },
  "L0698203AA01": {
    location: "APC0211",
    description: "RET J 305 W26.67 L185MM",
    cost: 0.0398,
    weight: 348,
    pack: 550,
    daily: 438.4
  },
  "L0797678AA01": {
    location: "APC0211",
    description: "RETAINER  J 305 W26.67MM",
    cost: 0.0522,
    weight: 465,
    pack: 450,
    daily: 1622.8
  },
  
"L0797679AA01": {
  location: "APC0211",
  description: "RETAINER -J, 305 W26.67MM",
  cost: 0.1324,
  weight: 1145,
  pack: 100,
  daily: 447.4
},

  "L0654899AA01": {
    location: "APC0212",
    description: "J RET D976 W25.4MM L35MM",
    cost: 0.0054,
    weight: 39,
    pack: 7500,
    daily: 878.2
  },
  "L0797825AA01": {
    location: "APC0212",
    description: "FLAT RET STFR W98 L195MM",
    cost: 0.0703,
    weight: 140,
    pack: 1200,
    daily: 447.4
  },
  "L0806941AA01": {
    location: "APC0212",
    description: "J-RET 721 28.5X300MM",
    cost: 0.0775,
    weight: 317,
    pack: 850,
    daily: 2053.8
  },
  "L0806942AA01": {
    location: "APC0212",
    description: "J-RET 721 28.5X750MM",
    cost: 0.1933,
    weight: 850,
    pack: 250,
    daily: 489
  },
  "L0806943AA01": {
    location: "APC0212",
    description: "A-RET 687 15X285MM",
    cost: 0.0435,
    weight: 135,
    pack: 2000,
    daily: 2053.8
  },
  "L0806944AA01": {
    location: "APC0212",
    description: "A-RET 687 15X735MM",
    cost: 0.1125,
    weight: 352,
    pack: 400,
    daily: 489
  },
  "L002798842NCPAC": {
    location: "APC0213",
    description: "OKIE TIEDOWN FL 30X375MM",
    cost: 0.0776,
    weight: 136,
    pack: 2000,
    daily: 54
  },
  "L0701143AA01": {
    location: "APC0213",
    description: "J-RET D305 100 MM",
    cost: 0.0204,
    weight: 202,
    pack: 1000,
    daily: 35.8
  },
  "L0753466AA01": {
    location: "APC0213",
    description: "FLAT RET D5258 W25 L245",
    cost: 0.0278,
    weight: 100,
    pack: 2000,
    daily: 1342.2
  },
  "L0802979AA01": {
    location: "APC0213",
    description: "RET FLT STRP 5258 25X265",
    cost: 0.0373,
    weight: 110,
    pack: 2000,
    daily: 398.4
  },
  "L0802980AA01": {
    location: "APC0213",
    description: "RET FLT STRP 5258 25X265",
    cost: 0.0373,
    weight: 113,
    pack: 2000,
    daily: 199.2
  },
  "L0802981AA01": {
    location: "APC0213",
    description: "RET FLT STRP 5258 25X365",
    cost: 0.0515,
    weight: 151,
    pack: 1500,
    daily: 398.4
  },
  "L001423285NCPAA": {
    location: "APC0214",
    description: "RET J 305 26.67X30MM",
    cost: 0.0186,
    weight: 55,
    pack: 5000,
    daily: 13.4
  },
  "L001450016NCPAA": {
    location: "APC0214",
    description: "ARROW 2384 W25MM L70MM",
    cost: 0.0544,
    weight: 103,
    pack: 2000,
    daily: 127.2
  },
  "L001553609NCPAA": {
    location: "APC0214",
    description: "RET J D305 26.67X160MM",
    cost: 0.076,
    weight: 290,
    pack: 850,
    daily: 51.4
  },
  "L001614470NCPAA": {
    location: "APC0214",
    description: "RET J 305 W26.67 L50MM",
    cost: 0.0258,
    weight: 100,
    pack: 2000,
    daily: 13.4
  },
  "L001676174NCPAA": {
    location: "APC0214",
    description: "RET FLT STRP 25.4X80MM",
    cost: 0.0148,
    weight: 36,
    pack: 7800,
    daily: 95.4
  },
  "L001676224NCPAA": {
    location: "APC0214",
    description: "RET J D305 26.76X140MM",
    cost: 0.0698,
    weight: 257,
    pack: 1000,
    daily: 13.4
  },
  "L003141998NCPAA": {
    location: "APC0215",
    description: "ARROW RET 15.50X660MM",
    cost: 0.118,
    weight: 384,
    pack: 200,
    daily: 13.6
  },
  "L003141999NCPAA": {
    location: "APC0215",
    description: "ARROW RET 15.50X596MM",
    cost: 0.1066,
    weight: 348,
    pack: 200,
    daily: 13.6
  },
  "L003142000NCPAA": {
    location: "APC0215",
    description: "ARROW RET 15.50X390MM",
    cost: 0.0697,
    weight: 226,
    pack: 1200,
    daily: 13.6
  },
  "L003142001NCPAA": {
    location: "APC0215",
    description: "ARROW RET 15.50X380MM",
    cost: 0.068,
    weight: 220,
    pack: 1200,
    daily: 27
  },
  "L003142002NCPAA": {
    location: "APC0215",
    description: "ARROW RET 15.50X80MM",
    cost: 0.014,
    weight: 50,
    pack: 5000,
    daily: 13.6
  },
  "L003142003NCPAA": {
    location: "APC0215",
    description: "ARROW RET 15.50X110MM",
    cost: 0.0192,
    weight: 69,
    pack: 5000,
    daily: 13.6
  },
  "L001571668NCPAA": {
    location: "BODPATIO",
    description: "A-RET D2384 25X100MM",
    cost: 0.0262,
    weight: 170,
    pack: 1000,
    daily: 0
  },
  "L001597009NCPAA": {
    location: "BODPATIO",
    description: "RET FLT STRP 154X42MM",
    cost: 0.0451,
    weight: 27,
    pack: 5000,
    daily: 31.6
  },
  "L001637636NCPAA": {
    location: "BODPATIO",
    description: "J-RET 25.4X335MM",
    cost: 0.0949,
    weight: null,
    pack: 700,
    daily: 100.8
  },
  "L001649100NCPAA": {
    location: "BODPATIO",
    description: "A-RET D2384 25X35MM",
    cost: 0.0133,
    weight: 56,
    pack: 4500,
    daily: 0
  },
  "L001649101NCPAA": {
    location: "BODPATIO",
    description: "A-RET D2384 25X75MM",
    cost: 0.0233,
    weight: 121,
    pack: 1400,
    daily: 0
  },
  "L001676165NCPAA": {
    location: "BODPATIO",
    description: "RET FLT STRP 25X290MM",
    cost: 0.0471,
    weight: 128,
    pack: 2000,
    daily: 190.8
  },
  "L001676166NCPAA": {
    location: "BODPATIO",
    description: "RET FLT STRP 25X220MM",
    cost: 0.0488,
    weight: 93,
    pack: 2300,
    daily: 31.8
  },
  "L001676177NCPAA": {
    location: "BODPATIO",
    description: "RET FLT STRP 25X325MM",
    cost: 0.0541,
    weight: 142,
    pack: 2000,
    daily: 63.6
  },
  "L001676192NCPAA": {
    location: "BODPATIO",
    description: "RET FLT STRP 25X285MM",
    cost: 0.0497,
    weight: 124,
    pack: 2000,
    daily: 31.6
  },
  "L001676195NCPAA": {
    location: "BODPATIO",
    description: "RET FLT STRP 25X350MM",
    cost: 0.0583,
    weight: 152,
    pack: 1800,
    daily: 63.2
  },
  "L001676232NCPAA": {
    location: "BODPATIO",
    description: "J-RET D3167 25.4X320MM",
    cost: 0.0561,
    weight: 310,
    pack: 800,
    daily: 103.2
  },
  "L001797260NCPAA": {
    location: "BODPATIO",
    description: "J-RET D3167 25.4X720MM",
    cost: 0.1015,
    weight: 960,
    pack: 350,
    daily: 82.6
  },
  "L0637636AA01": {
    location: "BODPATIO",
    description: "J-RET 25.4X335MM",
    cost: 0.0745,
    weight: 330,
    pack: 700,
    daily: 30
  },
  "L0639918AA01": {
    location: "BODPATIO",
    description: "J-RET D976 25.4X735MM",
    cost: 0.1515,
    weight: 810,
    pack: 300,
    daily: 82.6
  },
  "L0676232AA01": {
    location: "BODPATIO",
    description: "J-RET D3167 25.4X320MM",
    cost: 0.0542,
    weight: 310,
    pack: 700,
    daily: 0
  },
  "L0797260AA01": {
    location: "BODPATIO",
    description: "J-RET D3167 25.4X720MM",
    cost: 0.1184,
    weight: 960,
    pack: 400,
    daily: 0
  },
};

/* ===== GLOBAL STATE ===== */
let logCounter = 0;
let summaryCounter = 0;
let lastDeletedLog = null;
const scannedParts = {};
const scanLog = [];
let autoExportCounter = 0;
const partInput = document.getElementById("partInput");
const qtyInput = document.getElementById("qtyInput");
const logTable = document.getElementById("logTable");
const summaryTable = document.getElementById("summaryTable");

/* ===== INPUT FLOW ===== */
partInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && partInput.value.trim()) {
    e.preventDefault();
    qtyInput.focus();
  }
});

qtyInput.addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  e.preventDefault();

  const part = partInput.value.trim();
  const qtyValue = qtyInput.value.trim().toUpperCase();

  // Case 1: Qty field contains a PART NUMBER
 if (partsDB[qtyValue]) {
  const packQty = partsDB[qtyValue].pack;

  partInput.value = qtyValue;
  qtyInput.value = packQty;

  // 🔔 PACK APPLIED TOAST
  if (typeof M !== "undefined") {
    M.toast({
      html: `📦 <b>PACK APLICADO</b> (${packQty})`,
      classes: "green darken-1",
      displayLength: 2000
    });
  }

  addScan();
  focusPartInput();
  return;
}


  // Case 2: Normal numeric quantity
  const qty = parseFloat(qtyValue);
  if (!isNaN(qty) && qty > 0) {
    addScan();
    focusPartInput();
  }
});

/* ===== STATUS LOGIC ===== */
// getStockStatus
function getStockStatus(qty, daily) {
  if (!daily || daily <= 0) {
    return { label: "N/A", class: "gray", days: "N/A" };
  }
  const days = qty / daily;
  if (days < 1) return { label: "OK", class: "green", days: days.toFixed(1) };
  if (days <= 1) return { label: "LOW", class: "yellow", days: days.toFixed(1) };
  return { label: "NO SURTIR", class: "red", days: days.toFixed(1) };
}

/* ===== ADD SCAN ===== */
function addScan() {
  const part = partInput.value.trim();
  const qty = parseFloat(qtyInput.value);

  if (!part || isNaN(qty) || qty <= 0) return;

  addToLog(part, qty);
  updateSummary(part, qty);

  /* AUTO-EXPORT EVERY 10 SCANS */
  autoExportCounter++;
  if (autoExportCounter % 10 === 0) {
    exportBothCSVs();
  }

  partInput.value = "";
  qtyInput.value = "";
  partInput.focus();
}


/* ===== SCAN LOG TABLE ===== */
function addToLog(part, qty) {
  logCounter++;

  const entry = {
    id: logCounter,
    part,
    qty,
    row: null
  };

  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${entry.id}</td>
    <td>${part}</td>
    <td class="qty">${qty}</td>
    <td>${new Date().toLocaleTimeString()}</td>
    <td>
      <a class="btn-small blue waves-effect" onclick="editLog(${entry.id})">Editar</a>
      <a class="btn-small red waves-effect" onclick="deleteLog(${entry.id})">Borrar</a>
    </td>
  `;

  entry.row = row;
  scanLog.push(entry);
  logTable.appendChild(row);
}

/* ===== SUMMARY TABLE ===== */
function updateSummary(part, qty) {
    const partData = partsDB[part];
    const daily = partData ? partData.daily : 0;

    if (scannedParts[part]) {
        scannedParts[part].total += qty;
        const row = scannedParts[part].row;
        row.querySelector(".total").innerText = scannedParts[part].total;

        const status = getStockStatus(scannedParts[part].total, daily);
        row.querySelector(".status").className = `status ${status.class}`;
        row.querySelector(".status").innerHTML =
            `${status.label}<br><small>${status.days} dias</small>`;
    } else {
        summaryCounter++;
        const status = getStockStatus(qty, daily);

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${summaryCounter}</td>
            <td class="part clickable" onclick="showPartInfo('${part}')">${part}</td>
            <td class="total">${qty}</td>
            <td class="status ${status.class}">
                ${status.label}<br><small>${status.days} Dias</small>
            </td>
            <td>
                <button onclick="copyRow('${part}')">Copiar</button>
            </td>
        `;
        summaryTable.appendChild(row);

        scannedParts[part] = { total: qty, row };
    }
}

/* ===== ACTIONS ===== */
function copyRow(part) {
    const total = scannedParts[part].total;
    navigator.clipboard.writeText(`${part}, ${total}`);
}

function deleteSummary(part) {
    scannedParts[part].row.remove();
    delete scannedParts[part];
}

/* ===== POPUP ===== */
function showPartInfo(part) {
  const modalElem = document.getElementById("partModal");
  const instance = M.Modal.getInstance(modalElem);
  const div = document.getElementById("modalContent");
  const m = partsDB[part];

  if (!m) {
    div.innerHTML = `<p>No master data found for <b>${part}</b></p>`;
  } else {
    div.innerHTML = `
      <p><strong>Localizacion:</strong> ${m.location}</p>
      <p><strong>Parte:</strong> ${part}</p>
      <p><strong>Descripción:</strong> ${m.description}</p>
      <p><strong>Costo:</strong> $${m.cost}</p>
      <p><strong>Peso:</strong> ${m.weight ?? "N/A"}</p>
      <p><strong>Standard Pack:</strong> ${m.pack}</p>
      <p><strong>Uso Dairio:</strong> ${m.daily}</p>
    `;
  }

  instance.open();
}


function deleteLog(id) {
  const index = scanLog.findIndex(e => e.id === id);
  if (index === -1) return;

  const entry = scanLog[index];

  // Save for undo
  lastDeletedLog = {
    entry: { ...entry },
    index
  };

  // Adjust summary totals
  if (scannedParts[entry.part]) {
    scannedParts[entry.part].total -= entry.qty;

    if (scannedParts[entry.part].total <= 0) {
      deleteSummary(entry.part);
    } else {
      const row = scannedParts[entry.part].row;
      row.querySelector(".total").innerText =
        scannedParts[entry.part].total;

      const daily = partsDB[entry.part]?.daily || 0;
      const status = getStockStatus(scannedParts[entry.part].total, daily);

      const statusCell = row.querySelector(".status");
      statusCell.className = `status ${status.class}`;
      statusCell.innerHTML = `${status.label}<br>${status.days} days`;
    }
  }

  // Remove log row
  entry.row.remove();
  scanLog.splice(index, 1);

  showUndo();
  focusPartInput();

}

function editLog(id) {
  const entry = scanLog.find(e => e.id === id);
  if (!entry) return;

  const newQty = parseFloat(
    prompt("Enter new quantity:", entry.qty)
  );

  if (isNaN(newQty) || newQty <= 0) return;

  // Update summary totals
  const diff = newQty - entry.qty;

  if (scannedParts[entry.part]) {
    scannedParts[entry.part].total += diff;

    const row = scannedParts[entry.part].row;
    row.querySelector(".total").innerText =
      scannedParts[entry.part].total;

    const daily = partsDB[entry.part]?.daily || 0;
    const status = getStockStatus(scannedParts[entry.part].total, daily);

    const statusCell = row.querySelector(".status");
    statusCell.className = `status ${status.class}`;
    statusCell.innerHTML = `${status.label}<br>${status.days} days`;
  }

  // Update log entry
  entry.qty = newQty;
  entry.row.querySelector(".qty").innerText = newQty;
  focusPartInput();

}
function showUndo() {
  document.getElementById("undoBar").style.display = "block";

  // Auto-hide after 5 seconds
  setTimeout(() => {
    document.getElementById("undoBar").style.display = "none";
    lastDeletedLog = null;
  }, 5000);
}

function undoDelete() {
  if (!lastDeletedLog) return;

  const { entry, index } = lastDeletedLog;

  // Restore summary totals
  if (scannedParts[entry.part]) {
    scannedParts[entry.part].total += entry.qty;

    const row = scannedParts[entry.part].row;
    row.querySelector(".total").innerText =
      scannedParts[entry.part].total;

    const daily = partsDB[entry.part]?.daily || 0;
    const status = getStockStatus(scannedParts[entry.part].total, daily);

    const statusCell = row.querySelector(".status");
    statusCell.className = `status ${status.class}`;
    statusCell.innerHTML = `${status.label}<br>${status.days} days`;
  } else {
    updateSummary(entry.part, entry.qty);
  }

  // Rebuild log row
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${entry.id}</td>
    <td>${entry.part}</td>
    <td class="qty">${entry.qty}</td>
    <td>${new Date().toLocaleTimeString()}</td>
    <td>
      <button onclick="editLog(${entry.id})">Editar</button>
      <button onclick="deleteLog(${entry.id})">Borrar</button>
    </td>
  `;

  entry.row = row;
 if (logTable.children[index]) {
  logTable.insertBefore(row, logTable.children[index]);
} else {
  logTable.appendChild(row);
}

  lastDeletedLog = null;
  document.getElementById("undoBar").style.display = "none";
  focusPartInput();

}

function downloadCSV(filename, rows) {
  const csv = rows
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

/* ===== EXPORT RESUMEN POR PARTE ===== */
function exportResumenCSV() {
  const rows = [];
  rows.push(["#", "Numero de Parte", "Cantidad Total", "Status", "Dias"]);

  let i = 1;
  for (const part in scannedParts) {
    const total = scannedParts[part].total;
    const daily = partsDB[part]?.daily || 0;
    const status = getStockStatus(total, daily);

    rows.push([
      i++,
      part,
      total,
      status.label,
      status.days
    ]);
  }

  const date = new Date().toISOString().slice(0, 10);
  downloadCSV(`resumen_por_parte_${date}.csv`, rows);
}

/* ===== EXPORT REGISTRO DE ESCANEO ===== */
function exportRegistroCSV() {
  const rows = [];
  rows.push(["#", "Numero de Parte", "Cantidad", "Hora"]);

  scanLog.forEach(e => {
    rows.push([
      e.id,
      e.part,
      e.qty,
      e.row.children[3].innerText
    ]);
  });

  const date = new Date().toISOString().slice(0, 10);
  downloadCSV(`registro_de_escaneo_${date}.csv`, rows);
}

/* ===== EXPORT BOTH CSV FILES ===== */
function exportBothCSVs() {
  exportResumenCSV();
  exportRegistroCSV();
}
document.addEventListener('DOMContentLoaded', function () {
  M.AutoInit();
  focusPartInput();

});

/* ===== ALWAYS READY TO SCAN ===== */

function focusPartInput() {
  setTimeout(() => {
    partInput.focus();
    if (typeof M !== "undefined") {
      M.updateTextFields(); // keep Materialize labels correct
    }
  }, 50);
}
/* ================================
   LOCALSTORAGE PERSISTENCE
   ================================ */

// ===== LOCALSTORAGE KEYS =====
const LS_KEYS = {
  SCAN_LOG: "inventory_scanLog",
  SCANNED_PARTS: "inventory_scannedParts",
  COUNTERS: "inventory_counters"
};

// ===== SAVE STATE =====
function saveState() {
  localStorage.setItem(LS_KEYS.SCAN_LOG, JSON.stringify(
    scanLog.map(e => ({
      id: e.id,
      part: e.part,
      qty: e.qty,
      time: e.row.children[3].innerText
    }))
  ));

  localStorage.setItem(
    LS_KEYS.SCANNED_PARTS,
    JSON.stringify(
      Object.fromEntries(
        Object.entries(scannedParts).map(([p, o]) => [p, o.total])
      )
    )
  );

  localStorage.setItem(
    LS_KEYS.COUNTERS,
    JSON.stringify({ logCounter, summaryCounter })
  );
}

// ===== LOAD STATE =====
function loadState() {
  const savedLog = JSON.parse(localStorage.getItem(LS_KEYS.SCAN_LOG) || "[]");
  const savedParts = JSON.parse(localStorage.getItem(LS_KEYS.SCANNED_PARTS) || "{}");
  const counters = JSON.parse(localStorage.getItem(LS_KEYS.COUNTERS) || "{}");

  logCounter = counters.logCounter || 0;
  summaryCounter = counters.summaryCounter || 0;

  for (const part in savedParts) {
    updateSummary(part, savedParts[part]);
  }

  savedLog.forEach(entry => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.id}</td>
      <td>${entry.part}</td>
      <td class="qty">${entry.qty}</td>
      <td>${entry.time}</td>
      <td>
        <button onclick="editLog(${entry.id})">Editar</button>
        <button onclick="deleteLog(${entry.id})">Borrar</button>
      </td>
    `;
    scanLog.push({ ...entry, row });
    logTable.appendChild(row);
    logCounter = Math.max(logCounter, entry.id);
  });
}

// ===== AUTO-SAVE HOOKS =====
const _addScan = addScan;
addScan = function () {
  _addScan();
  saveState();
};

const _deleteLog = deleteLog;
deleteLog = function (id) {
  _deleteLog(id);
  saveState();
};

const _editLog = editLog;
editLog = function (id) {
  _editLog(id);
  saveState();
};

const _undoDelete = undoDelete;
undoDelete = function () {
  _undoDelete();
  saveState();
};

// ===== INIT LOAD =====
document.addEventListener("DOMContentLoaded", () => {
  loadState();
});
function clearAllData() {
  if (!confirm("Clear all scanned data? This cannot be undone.")) return;

  // Clear state
  scanLog.length = 0;
  Object.keys(scannedParts).forEach(k => delete scannedParts[k]);

  // Reset counters
  logCounter = 0;
  summaryCounter = 0;
  autoExportCounter = 0;
  lastDeletedLog = null;

  // Clear tables
  logTable.innerHTML = "";
  summaryTable.innerHTML = "";

  // Clear undo bar
  document.getElementById("undoBar").style.display = "none";

  // Clear localStorage
  Object.values(LS_KEYS).forEach(key => localStorage.removeItem(key));

  // Refocus scanner input
  focusPartInput();

  // Optional feedback
  if (typeof M !== "undefined") {
    M.toast({ html: "All data cleared" });
  }
}
``