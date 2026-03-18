// Folder-ID's voor CSV-import (Google Drive)
var IMPORT_FOLDER_WIJKKAS = '1xrB4WtpGoS8EtpXc971X0osSF9H7YHS5';
var PROCESSED_FOLDER_WIJKKAS = '1Gr97wgTjC227zLQegn0AEl47Wcmn6l8U';
var IMPORT_FOLDER_EXPLOITATIE = '1qYuhNpnDJvzhZC9KVec3K-V89toiJmzG';
var PROCESSED_FOLDER_EXPLOITATIE = '1dASRrGOE3bgGkeXsU9ICxdnErmTmXGla';

/**
 * Importeert CSV's in Journaal Wijkkas.
 */
function importCSVWijkkas() {
  importCSV_(IMPORT_FOLDER_WIJKKAS, PROCESSED_FOLDER_WIJKKAS, 'Journaal Wijkkas');
}

/**
 * Importeert CSV's in Journaal Exploitatie.
 */
function importCSVExploitatie() {
  importCSV_(IMPORT_FOLDER_EXPLOITATIE, PROCESSED_FOLDER_EXPLOITATIE, 'Journaal Exploitatie');
}

/**
 * Importeert CSV's en schrijft ze als journaalregels in het doeltabblad.
 *
 * CSV-kolommen (SKG-export, 0-indexed):
 *   0: Jaar afschrift    1: Volgnr afschrift    2: Rekeningnr
 *   3: Datum             4: Bedrag              5: Valuta
 *   6: Tegenrekening     7: Naam begunstigde    8: Adres
 *   9: Woonplaats       10: Omschrijving       11+: overig
 *
 * Journaal-kolommen:
 *   A: grootboekcode (leeg)    B: VLOOKUP       C: afschriftnr
 *   D: datum                   E: bij            F: af
 *   G: omschrijving            H: naam tegenpartij
 *
 * Data begint op rij 10.
 */
function importCSV_(folderId, processedFolderId, sheetName, silent) {
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFilesByType(MimeType.CSV);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    SpreadsheetApp.getUi().alert("Tabblad '" + sheetName + "' niet gevonden.");
    return;
  }

  let fileList = [];
  while (files.hasNext()) {
    fileList.push(files.next());
  }

  if (fileList.length === 0) {
    if (!silent) SpreadsheetApp.getUi().alert("Geen CSV's gevonden");
    return;
  }

  // Sort alphabetically so 2026001 comes before 2026002
  fileList.sort((a, b) => a.getName().localeCompare(b.getName()));

  const DATA_START = 8;
  let totalNew = 0;
  let skipped = 0;
  let updated = 0;

  fileList.forEach(file => {
    // Herbereken deduplicatie-index voor elk bestand (na vorige write)
    const lastRow = sheet.getLastRow();
    const existingKeys = buildExistingKeys_(sheet, lastRow, DATA_START);

    const fileContent = file.getBlob().getDataAsString();
    let csvData = Utilities.parseCsv(fileContent, ';');
    csvData.shift(); // Remove header

    // Keer bestand om als eerste datum nieuwer is dan laatste
    if (csvData.length >= 2) {
      const firstDate = normalizeDatum_(csvData[0][3]);
      const lastDate = normalizeDatum_(csvData[csvData.length - 1][3]);
      if (firstDate > lastDate) {
        csvData.reverse();
      }
    }

    const rowsToAppend = [];

    csvData.forEach(csvRow => {
      if (csvRow.length < 11) return;

      const key = buildKeyFromCSV_(csvRow);

      if (existingKeys.has(key)) {
        const existing = existingKeys.get(key);
        const hasNewNr = csvRow[0] !== '' && csvRow[1] !== '';
        if (hasNewNr && !existing.hasAfschriftNr && existing.sheetRow > 0) {
          sheet.getRange(existing.sheetRow, 3).setValue(csvRow[1]); // kolom C
          existing.hasAfschriftNr = true;
          updated++;
        } else {
          skipped++;
        }
      } else {
        rowsToAppend.push(csvToJournaal_(csvRow));
        existingKeys.set(key, { sheetRow: -1, hasAfschriftNr: csvRow[0] !== '' && csvRow[1] !== '' });
      }
    });

    // Schrijf rijen van dit bestand naar de sheet
    if (rowsToAppend.length > 0) {
      const startRow = Math.max(sheet.getLastRow(), DATA_START - 1) + 1;
      sheet.getRange(startRow, 1, rowsToAppend.length, 8).setValues(rowsToAppend);

      const fmt = '"€ "#,##0.00;[Red]"€ -"#,##0.00';
      sheet.getRange(startRow, 5, rowsToAppend.length, 2).setNumberFormat(fmt);

      for (let i = 0; i < rowsToAppend.length; i++) {
        const r = startRow + i;
        sheet.getRange(r, 2).setFormula(
          '=IFERROR(VLOOKUP(A' + r + ';Grootboekschema!$A1:$B;2;0); "")'
        );
      }
      totalNew += rowsToAppend.length;
    }

    // Verplaats verwerkt bestand
    const processedFolder = DriveApp.getFolderById(processedFolderId);
    file.moveTo(processedFolder);
  });

  var resultaat = {
    nieuw: totalNew,
    bijgewerkt: updated,
    overgeslagen: skipped
  };

  if (!silent) {
    SpreadsheetApp.getUi().alert(
      'Import voltooid:\n' +
      resultaat.nieuw + ' nieuwe regels\n' +
      resultaat.bijgewerkt + ' afschriftnummers bijgewerkt\n' +
      resultaat.overgeslagen + ' dubbele regels overgeslagen'
    );
  }

  return resultaat;
}

/**
 * Converteert een CSV-rij naar een journaalrij (array van 8 kolommen A-H).
 * Kolom B wordt als lege string gezet; de VLOOKUP wordt apart ingevuld.
 */
function csvToJournaal_(csvRow) {
  var bedrag = parseFloat(String(csvRow[4]).replace(/\./g, '').replace(',', '.'));
  if (isNaN(bedrag)) bedrag = 0;

  return [
    '',                                       // A: grootboekcode (leeg)
    '',                                       // B: VLOOKUP (wordt apart gezet)
    csvRow[1] || '',                          // C: afschriftnr
    csvRow[3],                                // D: datum
    bedrag >= 0 ? bedrag : '',                // E: bij (positief bedrag = ontvangst)
    bedrag < 0 ? -bedrag : '',                // F: af (negatief bedrag = uitgave)
    csvRow[10] || '',                         // G: omschrijving
    csvRow[7] || ''                           // H: naam tegenpartij
  ];
}

/**
 * Bouwt een deduplicatie-index van bestaande journaalrijen.
 * Returns Map<string, {sheetRow, hasAfschriftNr}>
 */
function buildExistingKeys_(sheet, lastRow, dataStart) {
  const keys = new Map();
  if (lastRow < dataStart) return keys; // geen data

  const data = sheet.getRange(dataStart, 1, lastRow - dataStart + 1, 8).getValues(); // A-H

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const key = buildKeyFromJournaal_(row);
    keys.set(key, {
      sheetRow: i + dataStart, // 1-based sheet rij
      hasAfschriftNr: row[2] !== '' && row[2] !== null // kolom C
    });
  }
  return keys;
}

/**
 * Deduplicatie-sleutel vanuit een CSV-rij.
 * Gebaseerd op: datum, bedrag, omschrijving, naam begunstigde.
 */
function buildKeyFromCSV_(csvRow) {
  let datum = normalizeDatum_(csvRow[3]);
  let bedrag = normalizeBedrag_(csvRow[4]);
  return [datum, bedrag, String(csvRow[10]).trim(), String(csvRow[7]).trim()].join('|');
}

/**
 * Deduplicatie-sleutel vanuit een bestaande journaalrij (kolom A-H als array).
 * Reconstrueert het originele bedrag uit bij (E=4) en af (F=5).
 */
function buildKeyFromJournaal_(row) {
  let datum = normalizeDatum_(row[3]); // kolom D
  // Reconstrueer bedrag: bij = positief, af = negatief
  let bij = row[4]; // kolom E
  let af = row[5]; // kolom F
  let bedrag;
  if (af !== '' && af !== null && af !== 0) {
    bedrag = (-Number(af)).toFixed(2);
  } else if (bij !== '' && bij !== null && bij !== 0) {
    bedrag = Number(bij).toFixed(2);
  } else {
    bedrag = '0.00';
  }
  return [datum, bedrag, String(row[6]).trim(), String(row[7]).trim()].join('|');
}

/**
 * Normaliseert een datum naar YYYY-MM-DD.
 */
function normalizeDatum_(datum) {
  if (datum instanceof Date) {
    return Utilities.formatDate(datum, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  var s = String(datum);
  var parts = s.split('-');
  if (parts.length === 3 && parts[0].length <= 2) {
    // DD-MM-YYYY -> YYYY-MM-DD
    return parts[2] + '-' + parts[1].padStart(2, '0') + '-' + parts[0].padStart(2, '0');
  }
  return s; // al YYYY-MM-DD of ander formaat
}

/**
 * Normaliseert een bedrag naar een string met 2 decimalen.
 */
function normalizeBedrag_(bedrag) {
  if (typeof bedrag === 'number') {
    return bedrag.toFixed(2);
  }
  return parseFloat(String(bedrag).replace(/\./g, '').replace(',', '.')).toFixed(2);
}
