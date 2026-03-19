/**
 * Kolommenbalans opbouwen
 *
 * Leest codes uit het Grootboekschema-tabblad en bouwt de Kolommenbalans op
 * met SUMIF-formules over alle brontabbladen.
 *
 * Kan herhaald worden: maakt het tabblad eerst helemaal leeg.
 */

// Brontabbladen voor mutatie-SUMIF (code in kolom A, Bij in kolom E, Af in kolom F)
var KB_BRONNEN = [
  'Journaal Wijkkas',
  'Journaal Exploitatie',
  'Memoriaal'
];

// Bankrekeningen: deze codes vertegenwoordigen de bankrekening van een journaaltabblad.
// Elke regel in dat tabblad is een transactie op die bankrekening, dus voor mutaties
// gebruiken we SUM i.p.v. SUMIF (de code verschijnt niet in kolom A).
var KB_BANK_CODES = {
  '100': 'Journaal Wijkkas',
  '120': 'Journaal Exploitatie'
};

// Tabblad voor beginbalans (zelfde kolomindeling: A=code, E=debet, F=credit)
var KB_BEGINBALANS = 'Beginbalans';

// Kolom-layout Kolommenbalans (1-based)
// A=Rekening, B=Naam, C=leeg, D=type (Balans/V&W)
// E=Beginbalans Debet, F=Beginbalans Credit, G=leeg
// H=Mutaties Debet, I=Mutaties Credit, J=leeg
// K=Proefbalans Debet, L=Proefbalans Credit, M=leeg
// N=V&W Debet, O=V&W Credit, P=leeg
// Q=Eindbalans Debet, R=Eindbalans Credit

/**
 * Bouwt de volledige Kolommenbalans op.
 * Maakt het tabblad eerst leeg zodat het script herhaald kan worden.
 */
function bouwKolommenbalans() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Kolommenbalans');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Tabblad "Kolommenbalans" niet gevonden.');
    return;
  }

  // Leegmaken
  sheet.clear();
  sheet.clearFormats();
  sheet.setHiddenGridlines(true);

  // Haal codes op uit Grootboekschema
  var gsSheet = ss.getSheetByName('Grootboekschema');
  if (!gsSheet) {
    SpreadsheetApp.getUi().alert('Tabblad "Grootboekschema" niet gevonden.');
    return;
  }

  var gsData = gsSheet.getDataRange().getValues();
  // Verwacht kolom A=code, B=naam. Skip header.
  var codes = [];
  for (var i = 1; i < gsData.length; i++) {
    var code = gsData[i][0];
    if (code === '' || code === null) continue;
    codes.push({
      code: String(code).trim(),
      naam: String(gsData[i][1] || '').trim()
    });
  }

  // Bepaal type (Balans of V&W) op basis van codenummer
  codes.forEach(function(c) {
    var num = parseInt(c.code, 10);
    if (isNaN(num)) {
      c.type = 'Balans';
      c.num = 0;
    } else {
      c.num = num;
      // Balansrekeningen: 0-209 (incl kruisposten 199, vraagposten 200)
      c.type = num <= 200 ? 'Balans' : 'V&W';
    }
  });

  // Sorteer op codenummer
  codes.sort(function(a, b) { return a.num - b.num; });

  // Groepeer codes
  var groepen = groepenIndeling_(codes);

  // Bouw het tabblad op
  var rij = 1;

  // Lege rij 1
  rij++;

  // Rij 2: sectiekoppen
  sheet.getRange(rij, 5).setValue('Beginbalans');
  sheet.getRange(rij, 8).setValue('Mutaties');
  sheet.getRange(rij, 11).setValue('Proefbalans');
  sheet.getRange(rij, 14).setValue('V&W');
  sheet.getRange(rij, 17).setValue('Eindbalans');

  // Merge sectiekoppen over 2 kolommen
  sheet.getRange(rij, 5, 1, 2).merge();
  sheet.getRange(rij, 8, 1, 2).merge();
  sheet.getRange(rij, 11, 1, 2).merge();
  sheet.getRange(rij, 14, 1, 2).merge();
  sheet.getRange(rij, 17, 1, 2).merge();

  // Centreer sectiekoppen
  [5, 8, 11, 14, 17].forEach(function(col) {
    sheet.getRange(rij, col).setHorizontalAlignment('center');
  });

  rij++;

  // Rij 3: subkoppen
  sheet.getRange(rij, 1).setValue('Rekening');
  sheet.getRange(rij, 2).setValue('Naam rekening');
  sheet.getRange(rij, 5).setValue('Debet');
  sheet.getRange(rij, 6).setValue('Credit');
  sheet.getRange(rij, 8).setValue('Debet');
  sheet.getRange(rij, 9).setValue('Credit');
  sheet.getRange(rij, 11).setValue('Debet');
  sheet.getRange(rij, 12).setValue('Credit');
  sheet.getRange(rij, 14).setValue('Debet');
  sheet.getRange(rij, 15).setValue('Credit');
  sheet.getRange(rij, 17).setValue('Debet');
  sheet.getRange(rij, 18).setValue('Credit');

  // Bold voor koprijen
  sheet.getRange(2, 1, 2, 18).setFontWeight('bold');

  rij++;

  // Data rijen per groep
  var eersteDataRij = rij;
  for (var g = 0; g < groepen.length; g++) {
    var groep = groepen[g];

    // Lege scheidingsrij tussen groepen (behalve voor de eerste)
    if (g > 0) {
      rij++;
    }

    for (var c = 0; c < groep.length; c++) {
      var item = groep[c];
      var r = rij;

      // A: Rekening, B: Naam, D: Type
      sheet.getRange(r, 1).setValue(item.code);
      sheet.getRange(r, 2).setFormula('=IFERROR(VLOOKUP(A' + r + ';Grootboekschema!A:B;2;FALSE);"")');

      sheet.getRange(r, 4).setValue(item.type);

      // Bold voor code en naam, code rechts uitlijnen
      sheet.getRange(r, 1).setFontWeight('bold').setHorizontalAlignment('right');
      sheet.getRange(r, 2).setFontWeight('bold');

      // Beginbalans (E, F): alleen voor Balansrekeningen
      if (item.type === 'Balans') {
        sheet.getRange(r, 5).setFormula(
          '=SUMIF(' + KB_BEGINBALANS + '!A:A;A' + r + ';' + KB_BEGINBALANS + '!E:E)'
        );
        sheet.getRange(r, 6).setFormula(
          '=SUMIF(' + KB_BEGINBALANS + '!A:A;A' + r + ';' + KB_BEGINBALANS + '!F:F)'
        );
      }

      // Mutaties (H, I): SUMIF over alle brontabbladen.
      // Voor bankrekeningen: SUM over het eigen journaaltabblad (elke regel is een
      // banktransactie), SUMIF voor de overige tabbladen (memoriaalcorrecties e.d.).
      var bankTab = KB_BANK_CODES[item.code] || null;
      var sumifDebet = KB_BRONNEN.map(function(tab) {
        if (bankTab && tab === bankTab) {
          return "SUM('" + tab + "'!E8:E)";
        }
        return "SUMIF('" + tab + "'!A:A;A" + r + ";'" + tab + "'!E:E)";
      }).join('+');
      var sumifCredit = KB_BRONNEN.map(function(tab) {
        if (bankTab && tab === bankTab) {
          return "SUM('" + tab + "'!F8:F)";
        }
        return "SUMIF('" + tab + "'!A:A;A" + r + ";'" + tab + "'!F:F)";
      }).join('+');

      sheet.getRange(r, 8).setFormula('=' + sumifDebet);
      sheet.getRange(r, 9).setFormula('=' + sumifCredit);

      // Proefbalans (K, L): saldering van Beginbalans + Mutaties
      sheet.getRange(r, 11).setFormula(
        '=IF((E' + r + '-F' + r + '+H' + r + '-I' + r + ')>0;E' + r + '-F' + r + '+H' + r + '-I' + r + ';0)'
      );
      sheet.getRange(r, 12).setFormula(
        '=IF((F' + r + '-E' + r + '+I' + r + '-H' + r + ')>0;F' + r + '-E' + r + '+I' + r + '-H' + r + ';0)'
      );

      if (item.type === 'V&W') {
        // V&W (N, O): gelijk aan Proefbalans voor V&W-rekeningen
        sheet.getRange(r, 14).setFormula('=K' + r);
        sheet.getRange(r, 15).setFormula('=L' + r);
        // Eindbalans leeg voor V&W
      } else {
        // Balans: V&W leeg, Eindbalans = Proefbalans
        sheet.getRange(r, 17).setFormula('=K' + r);
        sheet.getRange(r, 18).setFormula('=L' + r);
        // V&W leeg voor Balans
      }

      // Grijze achtergrond alleen voor kolommen met formules
      if (item.type === 'Balans') {
        sheet.getRange(r, 5, 1, 2).setBackground('#c0c0c0');   // Beginbalans
        sheet.getRange(r, 17, 1, 2).setBackground('#c0c0c0');  // Eindbalans
      } else {
        sheet.getRange(r, 14, 1, 2).setBackground('#c0c0c0');  // V&W
      }
      sheet.getRange(r, 8, 1, 2).setBackground('#c0c0c0');     // Mutaties (altijd)
      sheet.getRange(r, 11, 1, 2).setBackground('#c0c0c0');    // Proefbalans (altijd)

      rij++;
    }
  }

  var laatsteDataRij = rij - 1;

  // Lege rij
  rij++;

  // SUB-TOTAAL
  var subTotaalRij = rij;
  sheet.getRange(rij, 2).setValue('SUB-TOTAAL');
  sheet.getRange(rij, 1, 1, 18).setFontWeight('bold');

  // Som over alle datarijen voor elke kolom
  [5, 6, 8, 9, 11, 12, 14, 15, 17, 18].forEach(function(col) {
    var colLetter = kolLetter_(col);
    sheet.getRange(rij, col).setFormula(
      '=SUM(' + colLetter + eersteDataRij + ':' + colLetter + laatsteDataRij + ')'
    );
  });

  rij++;

  // Lege rij
  rij++;

  // SALDO WINST
  var saldoRij = rij;
  sheet.getRange(rij, 2).setValue('SALDO WINST');
  sheet.getRange(rij, 1, 1, 18).setFontWeight('bold');

  // V&W saldo: Credit - Debet (winst als credit > debet)
  // Als winst: toon in Credit-kolom van V&W en Eindbalans
  // Formule: als V&W Credit > V&W Debet -> winst in credit, anders verlies in debet
  sheet.getRange(rij, 14).setFormula(
    '=IF(N' + subTotaalRij + '>O' + subTotaalRij + ';0;O' + subTotaalRij + '-N' + subTotaalRij + ')'
  );
  sheet.getRange(rij, 15).setFormula(
    '=IF(O' + subTotaalRij + '>N' + subTotaalRij + ';0;N' + subTotaalRij + '-O' + subTotaalRij + ')'
  );
  sheet.getRange(rij, 17).setFormula(
    '=IF(Q' + subTotaalRij + '>R' + subTotaalRij + ';0;R' + subTotaalRij + '-Q' + subTotaalRij + ')'
  );
  sheet.getRange(rij, 18).setFormula(
    '=IF(R' + subTotaalRij + '>Q' + subTotaalRij + ';0;Q' + subTotaalRij + '-R' + subTotaalRij + ')'
  );

  rij++;

  // Lege rij
  rij++;

  // TOTAAL
  var totaalRij = rij;
  sheet.getRange(rij, 2).setValue('TOTAAL');
  sheet.getRange(rij, 1, 1, 18).setFontWeight('bold');

  // Mutaties en Proefbalans: gelijk aan Sub-totaal
  [8, 9, 11, 12].forEach(function(col) {
    var colLetter = kolLetter_(col);
    sheet.getRange(rij, col).setFormula('=' + colLetter + subTotaalRij);
  });
  // V&W en Eindbalans: Sub-totaal + Saldo Winst
  [14, 15, 17, 18].forEach(function(col) {
    var colLetter = kolLetter_(col);
    sheet.getRange(rij, col).setFormula(
      '=' + colLetter + subTotaalRij + '+' + colLetter + saldoRij
    );
  });

  rij++;

  // Controleregel: verschil moet 0 zijn
  [8, 9, 11, 12, 14, 15, 17, 18].forEach(function(col) {
    if (col === 8 || col === 11 || col === 14 || col === 17) {
      var colLetter = kolLetter_(col);
      var colLetterNext = kolLetter_(col + 1);
      sheet.getRange(rij, col).setFormula(
        '=' + colLetter + totaalRij + '-' + colLetterNext + totaalRij
      );
    }
  });

  // Getalnotatie: € 150.000,00 met streepje bij nul
  var fmt = '_ [$€-2]\\ * #,##0.00_ ;_ [$€-2]\\ * \\-#,##0.00_ ;_ [$€-2]\\ * \\-??_ ;_ @_ ';
  sheet.getRange(eersteDataRij, 5, rij - eersteDataRij + 1, 2).setNumberFormat(fmt);
  sheet.getRange(eersteDataRij, 8, rij - eersteDataRij + 1, 2).setNumberFormat(fmt);
  sheet.getRange(eersteDataRij, 11, rij - eersteDataRij + 1, 2).setNumberFormat(fmt);
  sheet.getRange(eersteDataRij, 14, rij - eersteDataRij + 1, 2).setNumberFormat(fmt);
  sheet.getRange(eersteDataRij, 17, rij - eersteDataRij + 1, 2).setNumberFormat(fmt);

  // Kolombreedte
  sheet.setColumnWidth(1, 70);   // Rekening
  sheet.setColumnWidth(2, 280);  // Naam
  sheet.setColumnWidth(3, 20);   // leeg
  sheet.setColumnWidth(4, 100);  // type
  sheet.setColumnWidth(7, 20);   // leeg
  sheet.setColumnWidth(10, 20);  // leeg
  sheet.setColumnWidth(13, 20);  // leeg
  sheet.setColumnWidth(16, 20);  // leeg

  Logger.log('Kolommenbalans opgebouwd met ' + codes.length + ' rekeningen.');
}

/**
 * Bepaalt de groepsindeling van codes.
 * Gebaseerd op de coderanges uit het coderingsschema.
 */
function groepenIndeling_(codes) {
  var groepRanges = [
    // Balansrekeningen Wijkkas
    { min: 0, max: 110, type: 'Balans' },
    { min: 111, max: 200, type: 'Balans' },
    // Baten Wijkkas
    { min: 210, max: 290, type: 'V&W' },
    // Lasten Algemeen
    { min: 300, max: 309, type: 'V&W' },
    // Lasten Eredienst
    { min: 310, max: 319, type: 'V&W' },
    // Lasten Gemeente-activiteiten
    { min: 320, max: 329, type: 'V&W' },
    // Lasten Ouderenwerk
    { min: 330, max: 339, type: 'V&W' },
    // Lasten Jongerenwerk
    { min: 340, max: 349, type: 'V&W' },
    // Lasten Missionaire activiteiten
    { min: 350, max: 357, type: 'V&W' },
    // Lasten Diversen
    { min: 360, max: 370, type: 'V&W' },
    // Overige codes Wijkkas
    { min: 392, max: 407, type: 'V&W' },
    // Baten Exploitatie (Verhuur + Buffet + Overig)
    { min: 400, max: 430, type: 'V&W' },
    // Lasten Exploitatie
    { min: 450, max: 489, type: 'V&W' },
    // Decentraal onderhoud Baten
    { min: 500, max: 509, type: 'V&W' },
    // Decentraal onderhoud Lasten
    { min: 550, max: 600, type: 'V&W' }
  ];

  var groepen = [];
  var toegewezen = new Set();

  groepRanges.forEach(function(range) {
    var groep = [];
    codes.forEach(function(c) {
      if (c.num >= range.min && c.num <= range.max && !toegewezen.has(c.code)) {
        groep.push(c);
        toegewezen.add(c.code);
      }
    });
    if (groep.length > 0) {
      groepen.push(groep);
    }
  });

  // Restcodes die nergens ingedeeld zijn
  var rest = codes.filter(function(c) { return !toegewezen.has(c.code); });
  if (rest.length > 0) {
    groepen.push(rest);
  }

  return groepen;
}

/**
 * Zet kolomnummer om naar kolomletter (1=A, 2=B, ..., 18=R).
 */
function kolLetter_(col) {
  return String.fromCharCode(64 + col);
}
