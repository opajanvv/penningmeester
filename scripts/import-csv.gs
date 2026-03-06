/**
 * Importeert CSV's in Journaal Wijkkas.
 * Leest folder-ID's uit Script Properties: importFolderIdWijkkas, processedFolderIdWijkkas.
 */
function importCSVWijkkas() {
  importCSV_('importFolderIdWijkkas', 'processedFolderIdWijkkas', 'Journaal Wijkkas');
}

/**
 * Importeert CSV's in Journaal Exploitatie.
 * Leest folder-ID's uit Script Properties: importFolderIdExploitatie, processedFolderIdExploitatie.
 */
function importCSVExploitatie() {
  importCSV_('importFolderIdExploitatie', 'processedFolderIdExploitatie', 'Journaal Exploitatie');
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
 *   A: grootboekcode (leeg)    B: VLOOKUP    C: datum    D: bron
 *   E: debet                   F: credit     G: omschrijving
 *   H: afschriftnr             I: naam begunstigde
 *
 * Data begint op rij 4 (rij 1 = titel, 2-3 = leeg/headers).
 */
function importCSV_(folderProp, processedProp, sheetName) {
  var props = PropertiesService.getScriptProperties();
  const folderId = props.getProperty(folderProp);
  const processedFolderId = props.getProperty(processedProp);

  if (!folderId || !processedFolderId) {
    SpreadsheetApp.getUi().alert("Script Properties '" + folderProp + "' en/of '" + processedProp + "' niet ingesteld.");
    return;
  }

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
    SpreadsheetApp.getUi().alert("Geen CSV's gevonden");
    return;
  }

  // Sort alphabetically so 2026001 comes before 2026002
  fileList.sort((a, b) => a.getName().localeCompare(b.getName()));

  // Read existing data for deduplication
  const lastRow = sheet.getLastRow();
  const existingKeys = buildExistingKeys_(sheet, lastRow);

  const rowsToAppend = [];
  let skipped = 0;
  let updated = 0;

  fileList.forEach(file => {
    const fileContent = file.getBlob().getDataAsString();
    let csvData = Utilities.parseCsv(fileContent, ';');
    csvData.shift(); // Remove header

    csvData.forEach(csvRow => {
      if (csvRow.length < 11) return;

      const key = buildKeyFromCSV_(csvRow);

      if (existingKeys.has(key)) {
        // Check if we can update the afschriftnummer
        const existing = existingKeys.get(key);
        const hasNewNr = csvRow[0] !== '' && csvRow[1] !== '';
        if (hasNewNr && !existing.hasAfschriftNr) {
          sheet.getRange(existing.sheetRow, 8).setValue(csvRow[1]); // kolom H
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

    const processedFolder = DriveApp.getFolderById(processedFolderId);
    file.moveTo(processedFolder);
  });

  // Batch append new rows
  if (rowsToAppend.length > 0) {
    const startRow = Math.max(lastRow, 3) + 1; // data begint op rij 4
    const range = sheet.getRange(startRow, 1, rowsToAppend.length, 9); // kolom A t/m I
    range.setValues(rowsToAppend);

    // Zet VLOOKUP-formule in kolom B voor de nieuwe rijen
    for (let i = 0; i < rowsToAppend.length; i++) {
      const r = startRow + i;
      sheet.getRange(r, 2).setFormula(
        '=IFERROR(VLOOKUP(A' + r + ',Grootboekschema!$A:$B,2,0), "")'
      );
    }
  }

  SpreadsheetApp.getUi().alert(
    'Import voltooid:\n' +
    rowsToAppend.length + ' nieuwe regels\n' +
    updated + ' afschriftnummers bijgewerkt\n' +
    skipped + ' dubbele regels overgeslagen'
  );
}

/**
 * Converteert een CSV-rij naar een journaalrij (array van 9 kolommen A-I).
 * Kolom B wordt als lege string gezet; de VLOOKUP wordt apart ingevuld.
 */
function csvToJournaal_(csvRow) {
  var bedrag = parseFloat(String(csvRow[4]).replace(/\./g, '').replace(',', '.'));
  if (isNaN(bedrag)) bedrag = 0;

  return [
    '',                                       // A: grootboekcode (leeg)
    '',                                       // B: VLOOKUP (wordt apart gezet)
    csvRow[3],                                // C: datum
    'SKG',                                    // D: bron
    bedrag < 0 ? -bedrag : '',                // E: debet (negatief bedrag = uitgave)
    bedrag >= 0 ? bedrag : '',                // F: credit (positief bedrag = ontvangst)
    csvRow[10] || '',                         // G: omschrijving
    csvRow[1] || '',                          // H: afschriftnummer
    csvRow[7] || ''                           // I: naam begunstigde
  ];
}

/**
 * Bouwt een deduplicatie-index van bestaande journaalrijen.
 * Returns Map<string, {sheetRow, hasAfschriftNr}>
 */
function buildExistingKeys_(sheet, lastRow) {
  const keys = new Map();
  if (lastRow < 4) return keys; // geen data

  const data = sheet.getRange(4, 1, lastRow - 3, 9).getValues(); // A-I, vanaf rij 4

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    // Alleen SKG-rijen dedupliceren
    if (row[3] !== 'SKG') continue;

    const key = buildKeyFromJournaal_(row);
    keys.set(key, {
      sheetRow: i + 4, // 1-based sheet rij
      hasAfschriftNr: row[7] !== '' && row[7] !== null
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
 * Deduplicatie-sleutel vanuit een bestaande journaalrij (kolom A-I als array).
 * Reconstrueert het originele bedrag uit debet (E=4) en credit (F=5).
 */
function buildKeyFromJournaal_(row) {
  let datum = normalizeDatum_(row[2]); // kolom C
  // Reconstrueer bedrag: debet = negatief, credit = positief
  let debet = row[4]; // kolom E
  let credit = row[5]; // kolom F
  let bedrag;
  if (debet !== '' && debet !== null && debet !== 0) {
    bedrag = (-Number(debet)).toFixed(2);
  } else if (credit !== '' && credit !== null && credit !== 0) {
    bedrag = Number(credit).toFixed(2);
  } else {
    bedrag = '0.00';
  }
  return [datum, bedrag, String(row[6]).trim(), String(row[8]).trim()].join('|');
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
