/**
 * Jaarcijfers opbouwen
 *
 * Leest codes uit het Grootboekschema-tabblad en bouwt de Jaarcijfers op
 * met twee secties: Balanspositie en Resultatenrekening.
 *
 * Classificatie uit kolom D van Grootboekschema:
 *   A = Activa (debet-balans)
 *   P = Passiva (credit-balans)
 *   B = Baten
 *   L = Lasten
 *   X = Kruisposten/Vraagposten (aparte groep)
 *
 * Kan herhaald worden: maakt het tabblad eerst helemaal leeg.
 * Let op: begroting en Jaar 2025 kolommen in de Resultatenrekening zijn
 * handmatig in te vullen en gaan verloren bij opnieuw uitvoeren.
 */

// Brontabbladen
var JC_ALLE_TABS = ['Beginbalans', 'Journaal Wijkkas', 'Journaal Exploitatie', 'Memoriaal'];
var JC_MUTATIE_TABS = ['Journaal Wijkkas', 'Journaal Exploitatie', 'Memoriaal'];

// Bankrekeningen: SUM i.p.v. SUMIF voor het eigen journaaltabblad (zie kolommenbalans.gs)
var JC_BANK_CODES = {
  '100': 'Journaal Wijkkas',
  '120': 'Journaal Exploitatie'
};

// Getalnotatie
var JC_FMT = '_ [$\u20ac-2]\\ * #,##0.00_ ;_ [$\u20ac-2]\\ * \\-#,##0.00_ ;_ [$\u20ac-2]\\ * \\-??_ ;_ @_ ';

/**
 * Bouwt het volledige Jaarcijfers-tabblad op.
 */
function bouwJaarcijfers() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Jaarcijfers');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Tabblad "Jaarcijfers" niet gevonden.');
    return;
  }

  sheet.clear();
  sheet.clearFormats();
  sheet.setHiddenGridlines(true);

  // Geen tekstterugloop (voorkomt afwijkende rijhoogtes)
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

  // Haal codes op uit Grootboekschema (A=code, B=naam, C=bron W/E, D=zijde A/P/B/L/X)
  var gsSheet = ss.getSheetByName('Grootboekschema');
  if (!gsSheet) {
    SpreadsheetApp.getUi().alert('Tabblad "Grootboekschema" niet gevonden.');
    return;
  }

  var gsData = gsSheet.getDataRange().getValues();
  var codes = [];
  for (var i = 1; i < gsData.length; i++) {
    var code = gsData[i][0];
    var naam = String(gsData[i][1] || '').trim();
    var bron = String(gsData[i][2] || '').trim();
    var zijde = String(gsData[i][3] || '').trim();
    if (!code || !zijde) continue;

    var num = parseInt(code, 10);

    // Skip groepskoppen (30-36, lasten onder 100)
    if (zijde === 'L' && !isNaN(num) && num < 100) continue;

    codes.push({ code: code, naam: naam, bron: bron, zijde: zijde, num: isNaN(num) ? 0 : num });
  }

  // Splits per classificatie
  var activa = codes.filter(function(c) { return c.zijde === 'A'; });
  var passiva = codes.filter(function(c) { return c.zijde === 'P'; });
  var baten = codes.filter(function(c) { return c.zijde === 'B'; });
  var lasten = codes.filter(function(c) { return c.zijde === 'L'; });
  var overig = codes.filter(function(c) { return c.zijde === 'X'; });

  // Sorteer op codenummer
  var sortFn = function(a, b) { return a.num - b.num; };
  activa.sort(sortFn);
  passiva.sort(sortFn);
  baten.sort(sortFn);
  lasten.sort(sortFn);
  overig.sort(sortFn);

  // --- BALANSPOSITIE ---
  var rij = bouwBalanspositie_(sheet, activa, passiva, overig, 1);

  // Witruimte
  rij += 3;

  // --- RESULTATENREKENING ---
  rij = bouwResultatenrekening_(sheet, lasten, baten, rij);

  // Kolombreedte
  zetKolomBreedte_(sheet);

  Logger.log('Jaarcijfers opgebouwd.');
}

// ---------------------------------------------------------------------------
// Balanspositie
// ---------------------------------------------------------------------------

function bouwBalanspositie_(sheet, activa, passiva, overig, startRij) {
  var rij = startRij;

  // Rij 1: leeg
  rij++;

  // Rij 2: titels
  sheet.getRange(rij, 2).setValue('Balanspositie');
  sheet.getRange(rij, 2).setFontWeight('bold').setFontColor('#0066cc').setFontSize(16);
  sheet.getRange(rij, 7).setValue('De Lichtbron');
  sheet.getRange(rij, 7, 1, 6).merge();
  sheet.getRange(rij, 7).setFontWeight('bold').setFontColor('#0066cc').setFontSize(16);
  rij++;

  // Rij 3: leeg
  rij++;

  // Rij 4: kolomkoppen
  sheet.getRange(rij, 2).setValue('Debet');
  sheet.getRange(rij, 7).setValue('Ultimo 2026');
  sheet.getRange(rij, 9).setValue('Ultimo 2025');
  sheet.getRange(rij, 11).setValue('Credit');
  sheet.getRange(rij, 17).setValue('Ultimo 2026');
  sheet.getRange(rij, 19).setValue('Ultimo 2025');
  sheet.getRange(rij, 1, 1, 19).setFontWeight('bold');
  rij++;

  // Rij 5: leeg
  rij++;

  // Data: activa links, passiva rechts
  var dataStartRij = rij;
  var maxRijen = Math.max(activa.length, passiva.length);

  for (var i = 0; i < maxRijen; i++) {
    var r = rij + i;

    // Linker zijde: Activa
    if (i < activa.length) {
      var a = activa[i];
      sheet.getRange(r, 1).setValue(a.code);
      sheet.getRange(r, 1).setFontWeight('bold').setHorizontalAlignment('right');
      sheet.getRange(r, 2).setFormula(naamFormula_('A' + r));
      sheet.getRange(r, 2).setFontWeight('bold');

      // Ultimo 2026: beginbalans + mutaties (netto debet)
      var aBankTab = JC_BANK_CODES[String(a.code)] || null;
      sheet.getRange(r, 7).setFormula(netFormula_('A' + r, JC_ALLE_TABS, 'debet', aBankTab));
      // Ultimo 2025: direct uit beginbalans
      sheet.getRange(r, 9).setFormula(bbFormula_('A' + r, 'debet'));

      // Grijze achtergrond voor bedragen
      sheet.getRange(r, 7).setBackground('#c0c0c0');
      sheet.getRange(r, 9).setBackground('#c0c0c0');
    }

    // Rechter zijde: Passiva
    if (i < passiva.length) {
      var p = passiva[i];
      sheet.getRange(r, 11).setValue(p.code);
      sheet.getRange(r, 11).setFontWeight('bold').setHorizontalAlignment('right');
      sheet.getRange(r, 12).setFormula(naamFormula_('K' + r));
      sheet.getRange(r, 12).setFontWeight('bold');

      // Ultimo 2026: beginbalans + mutaties (netto credit)
      var pBankTab = JC_BANK_CODES[String(p.code)] || null;
      sheet.getRange(r, 17).setFormula(netFormula_('K' + r, JC_ALLE_TABS, 'credit', pBankTab));
      // Ultimo 2025: direct uit beginbalans
      sheet.getRange(r, 19).setFormula(bbFormula_('K' + r, 'credit'));

      sheet.getRange(r, 17).setBackground('#c0c0c0');
      sheet.getRange(r, 19).setBackground('#c0c0c0');
    }
  }

  rij += maxRijen;

  // Lege rij
  rij++;

  // Kruisposten / Vraagposten (X) — links, aparte groep
  var overigStartRij = rij;
  for (var x = 0; x < overig.length; x++) {
    var r = rij + x;
    var o = overig[x];
    sheet.getRange(r, 1).setValue(o.code);
    sheet.getRange(r, 1).setFontWeight('bold').setHorizontalAlignment('right');
    sheet.getRange(r, 2).setFormula(naamFormula_('A' + r));
    sheet.getRange(r, 2).setFontWeight('bold');

    var oBankTab = JC_BANK_CODES[String(o.code)] || null;
    sheet.getRange(r, 7).setFormula(netFormula_('A' + r, JC_ALLE_TABS, 'debet', oBankTab));
    sheet.getRange(r, 7).setBackground('#c0c0c0');
    sheet.getRange(r, 9).setBackground('#c0c0c0');
  }
  rij += overig.length;

  // Lege rij
  rij++;

  // Resultaat verslagjaar (rechts)
  var resultaatRij = rij;
  sheet.getRange(rij, 12).setValue('Resultaat verslagjaar');
  sheet.getRange(rij, 12).setFontWeight('bold');
  // Formule: totaal activa - totaal passiva (= jaarresultaat op credit-zijde)
  // Wordt pas ingevuld na de totaalrij, want we hebben de totalen nodig

  rij++;

  // Lege rij
  rij++;

  // Totaalrij
  var totaalRij = rij;
  // Debet totaal: som van alle activa + overig
  var gCol = jcKolLetter_(7);
  var iCol = jcKolLetter_(9);
  // Bouw SUM-formule voor alle activa-rijen en overig-rijen
  sheet.getRange(rij, 7).setFormula(
    '=SUM(' + gCol + dataStartRij + ':' + gCol + (dataStartRij + activa.length - 1) + ')' +
    '+SUM(' + gCol + overigStartRij + ':' + gCol + (overigStartRij + overig.length - 1) + ')'
  );
  sheet.getRange(rij, 9).setFormula(
    '=SUM(' + iCol + dataStartRij + ':' + iCol + (dataStartRij + activa.length - 1) + ')' +
    '+SUM(' + iCol + overigStartRij + ':' + iCol + (overigStartRij + overig.length - 1) + ')'
  );

  // Credit totaal: som passiva + resultaat
  var qCol = jcKolLetter_(17);
  var sCol = jcKolLetter_(19);
  sheet.getRange(rij, 17).setFormula(
    '=SUM(' + qCol + dataStartRij + ':' + qCol + (dataStartRij + passiva.length - 1) + ')' +
    '+' + qCol + resultaatRij
  );
  sheet.getRange(rij, 19).setFormula(
    '=SUM(' + sCol + dataStartRij + ':' + sCol + (dataStartRij + passiva.length - 1) + ')' +
    '+' + sCol + resultaatRij
  );

  // Resultaat verslagjaar formule: debet totaal - credit totaal (excl resultaat)
  sheet.getRange(resultaatRij, 17).setFormula(
    '=' + gCol + totaalRij +
    '-SUM(' + qCol + dataStartRij + ':' + qCol + (dataStartRij + passiva.length - 1) + ')'
  );
  sheet.getRange(resultaatRij, 17).setBackground('#c0c0c0');

  // Bold totaalrij
  sheet.getRange(rij, 1, 1, 19).setFontWeight('bold');
  sheet.getRange(rij, 7).setBackground('#c0c0c0');
  sheet.getRange(rij, 9).setBackground('#c0c0c0');
  sheet.getRange(rij, 17).setBackground('#c0c0c0');
  sheet.getRange(rij, 19).setBackground('#c0c0c0');
  rij++;

  // Lege rij
  rij++;

  // Check: debet - credit moet 0 zijn
  sheet.getRange(rij, 5).setValue('check');
  sheet.getRange(rij, 7).setFormula('=' + gCol + totaalRij + '-' + qCol + totaalRij);
  sheet.getRange(rij, 9).setFormula('=' + iCol + totaalRij + '-' + sCol + totaalRij);

  // Getalnotatie voor hele balanspositie
  var fmtRijen = rij - startRij + 1;
  sheet.getRange(startRij, 7, fmtRijen, 1).setNumberFormat(JC_FMT);
  sheet.getRange(startRij, 9, fmtRijen, 1).setNumberFormat(JC_FMT);
  sheet.getRange(startRij, 17, fmtRijen, 1).setNumberFormat(JC_FMT);
  sheet.getRange(startRij, 19, fmtRijen, 1).setNumberFormat(JC_FMT);

  rij++;
  return rij;
}

// ---------------------------------------------------------------------------
// Resultatenrekening
// ---------------------------------------------------------------------------

function bouwResultatenrekening_(sheet, lasten, baten, startRij) {
  var rij = startRij;

  // Groepeer lasten en baten
  var lastenGroepen = groepeerVW_(lasten, [
    { naam: 'Wijkkas', filter: function(c) { return c.bron === 'W'; } },
    { naam: 'Exploitatie', filter: function(c) { return c.bron === 'E' && c.num < 550; } },
    { naam: 'Decentraal onderhoud', filter: function(c) { return c.bron === 'E' && c.num >= 550; } }
  ]);

  var batenGroepen = groepeerVW_(baten, [
    { naam: 'Wijkkas', filter: function(c) { return c.bron === 'W'; } },
    { naam: 'Exploitatie', filter: function(c) { return c.bron === 'E' && c.num < 500; } },
    { naam: 'Decentraal onderhoud', filter: function(c) { return c.bron === 'E' && c.num >= 500; } }
  ]);

  // Titel
  rij++;
  sheet.getRange(rij, 2).setValue('Resultatenrekening');
  sheet.getRange(rij, 2).setFontWeight('bold').setFontColor('#0066cc').setFontSize(16);
  sheet.getRange(rij, 7).setValue('De Lichtbron');
  sheet.getRange(rij, 7, 1, 6).merge();
  sheet.getRange(rij, 7).setFontWeight('bold').setFontColor('#0066cc').setFontSize(16);
  rij++;

  // Leeg
  rij++;

  // Kolomkoppen
  sheet.getRange(rij, 2).setValue('Lasten');
  sheet.getRange(rij, 5).setValue('begroting 2026');
  sheet.getRange(rij, 7).setValue('jaar 2026');
  sheet.getRange(rij, 9).setValue('Jaar 2025');
  sheet.getRange(rij, 12).setValue('Baten');
  sheet.getRange(rij, 15).setValue('begroting 2026');
  sheet.getRange(rij, 17).setValue('jaar 2026');
  sheet.getRange(rij, 19).setValue('Jaar 2025');
  sheet.getRange(rij, 1, 1, 19).setFontWeight('bold');
  rij++;

  // Leeg
  rij++;

  var fmtStartRij = rij;

  // Schrijf groepen
  var alleTotaalRijenLasten = [];
  var alleTotaalRijenBaten = [];
  var maxGroepen = Math.max(lastenGroepen.length, batenGroepen.length);

  for (var g = 0; g < maxGroepen; g++) {
    var lg = g < lastenGroepen.length ? lastenGroepen[g] : null;
    var bg = g < batenGroepen.length ? batenGroepen[g] : null;

    var lgLen = lg ? lg.items.length : 0;
    var bgLen = bg ? bg.items.length : 0;
    var maxLen = Math.max(lgLen, bgLen);

    // Data rijen
    var groepStartRij = rij;
    for (var i = 0; i < maxLen; i++) {
      var r = rij + i;

      if (lg && i < lg.items.length) {
        var l = lg.items[i];
        sheet.getRange(r, 1).setValue(l.code);
        sheet.getRange(r, 1).setFontWeight('bold').setHorizontalAlignment('right');
        sheet.getRange(r, 2).setFormula(naamFormula_('A' + r));
        sheet.getRange(r, 2).setFontWeight('bold');
        // begroting 2026 lasten (kolom E) — uit Beginbalans kolom H
        sheet.getRange(r, 5).setFormula(begrotingFormula_('A' + r, 'H'));
        // jaar 2026 (kolom G): formule
        sheet.getRange(r, 7).setFormula(netFormula_('A' + r, JC_MUTATIE_TABS, 'debet'));
        // jaar 2025 lasten (kolom I) — uit Beginbalans kolom E
        sheet.getRange(r, 9).setFormula(begrotingFormula_('A' + r, 'E'));
        sheet.getRange(r, 5).setBackground('#c0c0c0');
        sheet.getRange(r, 7).setBackground('#c0c0c0');
        sheet.getRange(r, 9).setBackground('#c0c0c0');
      }

      if (bg && i < bg.items.length) {
        var b = bg.items[i];
        sheet.getRange(r, 11).setValue(b.code);
        sheet.getRange(r, 11).setFontWeight('bold').setHorizontalAlignment('right');
        sheet.getRange(r, 12).setFormula(naamFormula_('K' + r));
        sheet.getRange(r, 12).setFontWeight('bold');
        // begroting 2026 baten (kolom O) — uit Beginbalans kolom I
        sheet.getRange(r, 15).setFormula(begrotingFormula_('K' + r, 'I'));
        // jaar 2026 (kolom Q)
        sheet.getRange(r, 17).setFormula(netFormula_('K' + r, JC_MUTATIE_TABS, 'credit'));
        // jaar 2025 baten (kolom S) — uit Beginbalans kolom F
        sheet.getRange(r, 19).setFormula(begrotingFormula_('K' + r, 'F'));
        sheet.getRange(r, 15).setBackground('#c0c0c0');
        sheet.getRange(r, 17).setBackground('#c0c0c0');
        sheet.getRange(r, 19).setBackground('#c0c0c0');
      }
    }

    rij += maxLen;

    // Leeg
    rij++;

    // Subtotaal
    var subRij = rij;
    sheet.getRange(rij, 1).setValue('Totaal');
    sheet.getRange(rij, 1, 1, 19).setFontWeight('bold');

    if (lg && lg.items.length > 0) {
      ['E', 'G', 'I'].forEach(function(col) {
        sheet.getRange(subRij, jcKolNr_(col)).setFormula(
          '=SUM(' + col + groepStartRij + ':' + col + (groepStartRij + lg.items.length - 1) + ')'
        );
      });
      alleTotaalRijenLasten.push(subRij);
    }

    if (bg && bg.items.length > 0) {
      sheet.getRange(rij, 11).setValue('Totaal');
      ['O', 'Q', 'S'].forEach(function(col) {
        sheet.getRange(subRij, jcKolNr_(col)).setFormula(
          '=SUM(' + col + groepStartRij + ':' + col + (groepStartRij + bg.items.length - 1) + ')'
        );
      });
      alleTotaalRijenBaten.push(subRij);
    }

    rij++;

    // Leeg tussen groepen
    rij++;
  }

  // Saldo (Totaal baten - Totaal lasten)
  var saldoRij = rij;
  sheet.getRange(rij, 1).setValue('Saldo');
  sheet.getRange(rij, 1, 1, 19).setFontWeight('bold');

  // Saldo per kolom: baten totaal - lasten totaal
  var saldoKolommen = [
    { lastenKol: 'E', batenKol: 'O', doelKol: 'E' },
    { lastenKol: 'G', batenKol: 'Q', doelKol: 'G' },
    { lastenKol: 'I', batenKol: 'S', doelKol: 'I' }
  ];
  saldoKolommen.forEach(function(sk) {
    var batenSom = alleTotaalRijenBaten.map(function(r) { return sk.batenKol + r; }).join('+');
    var lastenSom = alleTotaalRijenLasten.map(function(r) { return sk.lastenKol + r; }).join('+');
    if (batenSom && lastenSom) {
      sheet.getRange(saldoRij, jcKolNr_(sk.doelKol)).setFormula('=' + batenSom + '-' + lastenSom);
    }
  });

  rij++;

  // Leeg
  rij++;

  // Grand totaal
  var grandRij = rij;
  sheet.getRange(rij, 1).setValue('Totaal Lasten');
  sheet.getRange(rij, 11).setValue('Totaal Baten');
  sheet.getRange(rij, 1, 1, 19).setFontWeight('bold');

  // Totaal Lasten = som subtotalen + saldo
  ['E', 'G', 'I'].forEach(function(col) {
    var delen = alleTotaalRijenLasten.map(function(r) { return col + r; });
    delen.push(col + saldoRij);
    sheet.getRange(grandRij, jcKolNr_(col)).setFormula('=' + delen.join('+'));
  });

  // Totaal Baten = som subtotalen
  ['O', 'Q', 'S'].forEach(function(col) {
    var delen = alleTotaalRijenBaten.map(function(r) { return col + r; });
    sheet.getRange(grandRij, jcKolNr_(col)).setFormula('=' + delen.join('+'));
  });

  rij++;

  // Leeg
  rij++;

  // Check: lasten totaal - baten totaal
  sheet.getRange(rij, 5).setValue('check');
  ['E', 'G', 'I'].forEach(function(col) {
    var batenKol = col === 'E' ? 'O' : (col === 'G' ? 'Q' : 'S');
    sheet.getRange(rij, jcKolNr_(col)).setFormula(
      '=' + col + grandRij + '-' + batenKol + grandRij
    );
  });

  // Getalnotatie voor hele resultatenrekening
  var fmtRijen = rij - fmtStartRij + 1;
  [5, 7, 9, 15, 17, 19].forEach(function(col) {
    sheet.getRange(fmtStartRij, col, fmtRijen, 1).setNumberFormat(JC_FMT);
  });

  rij++;
  return rij;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Bouwt een SUMIF-formule die het netto saldo berekent over meerdere tabbladen.
 * richting 'debet': E - F (positief = debet-saldo)
 * richting 'credit': F - E (positief = credit-saldo)
 */
function netFormula_(codeCell, tabs, richting, bankTab) {
  var plus = richting === 'debet' ? 'E' : 'F';
  var min = richting === 'debet' ? 'F' : 'E';

  var parts = tabs.map(function(tab) {
    var t = tab.indexOf(' ') >= 0 ? "'" + tab + "'" : tab;
    // Voor bankrekeningen: SUM over het eigen journaaltabblad i.p.v. SUMIF
    if (bankTab && tab === bankTab) {
      return 'SUM(' + t + '!' + plus + '8:' + plus + ')' +
             '-SUM(' + t + '!' + min + '8:' + min + ')';
    }
    return 'SUMIF(' + t + '!A:A;' + codeCell + ';' + t + '!' + plus + ':' + plus + ')' +
           '-SUMIF(' + t + '!A:A;' + codeCell + ';' + t + '!' + min + ':' + min + ')';
  });

  return '=' + parts.join('+');
}

/**
 * Eenvoudige SUMIF op Beginbalans — pakt direct kolom E (debet) of F (credit).
 * Geen saldering nodig als de beginbalans correct is ingevuld.
 */
function bbFormula_(codeCell, richting) {
  var kolom = richting === 'debet' ? 'E' : 'F';
  return '=SUMIF(Beginbalans!A:A;' + codeCell + ';Beginbalans!' + kolom + ':' + kolom + ')';
}

/**
 * SUMIF op V&W-sectie in Beginbalans-tabblad.
 * Kolom A=code, E=jaar 2025 lasten, F=jaar 2025 baten,
 * G=spacer, H=begroting lasten, I=begroting baten.
 */
function begrotingFormula_(codeCell, kolom) {
  return '=SUMIF(Beginbalans!A:A;' + codeCell + ';Beginbalans!' + kolom + ':' + kolom + ')';
}

/**
 * Groepeert V&W-codes volgens de opgegeven groepsdefinities.
 * Geeft een array van { naam, items } terug.
 */
function groepeerVW_(codes, groepDefs) {
  var groepen = [];
  var toegewezen = {};

  groepDefs.forEach(function(def) {
    var items = codes.filter(function(c) {
      return !toegewezen[c.code] && def.filter(c);
    });
    items.forEach(function(c) { toegewezen[c.code] = true; });
    if (items.length > 0) {
      groepen.push({ naam: def.naam, items: items });
    }
  });

  // Rest
  var rest = codes.filter(function(c) { return !toegewezen[c.code]; });
  if (rest.length > 0) {
    groepen.push({ naam: 'Overig', items: rest });
  }

  return groepen;
}

/**
 * Zet kolomnummer om naar kolomletter.
 */
function jcKolLetter_(col) {
  return String.fromCharCode(64 + col);
}

/**
 * Zet kolomletter om naar kolomnummer.
 */
function jcKolNr_(letter) {
  return letter.charCodeAt(0) - 64;
}

/**
 * VLOOKUP-formule naar Grootboekschema (kolom A=code, B=naam).
 */
function naamFormula_(codeCell) {
  return '=IFERROR(VLOOKUP(' + codeCell + ';Grootboekschema!A:B;2;FALSE);"")';
}

/**
 * Stelt kolombreedte in.
 */
function zetKolomBreedte_(sheet) {
  sheet.setColumnWidth(1, 50);    // code links
  sheet.setColumnWidth(2, 250);   // naam links
  sheet.setColumnWidth(3, 20);    // spacer
  sheet.setColumnWidth(4, 20);    // spacer
  sheet.setColumnWidth(5, 110);   // begroting
  sheet.setColumnWidth(6, 20);    // spacer
  sheet.setColumnWidth(7, 110);   // Ultimo/jaar 2026
  sheet.setColumnWidth(8, 20);    // spacer
  sheet.setColumnWidth(9, 110);   // Ultimo/Jaar 2025
  sheet.setColumnWidth(10, 40);   // spacer tussen zijden
  sheet.setColumnWidth(11, 50);   // code rechts
  sheet.setColumnWidth(12, 250);  // naam rechts
  sheet.setColumnWidth(13, 20);   // spacer
  sheet.setColumnWidth(14, 20);   // spacer
  sheet.setColumnWidth(15, 110);  // begroting
  sheet.setColumnWidth(16, 20);   // spacer
  sheet.setColumnWidth(17, 110);  // Ultimo/jaar 2026
  sheet.setColumnWidth(18, 20);   // spacer
  sheet.setColumnWidth(19, 110);  // Ultimo/Jaar 2025
}
