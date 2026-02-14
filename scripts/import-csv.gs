/**
 * Imports CSVs alphabetically.
 * Uses Sheet locale settings to handle semicolons and commas automatically.
 *
 * Vereist Script Properties:
 *   importFolderId      - Google Drive map met nieuwe CSV's
 *   processedFolderId   - Google Drive map voor verwerkte CSV's
 */
function importCSV() {
  var props = PropertiesService.getScriptProperties();
  const folderId = props.getProperty('importFolderId');
  const processedFolderId = props.getProperty('processedFolderId');
  const sheetName = 'SKG';

  if (!folderId || !processedFolderId) {
    SpreadsheetApp.getUi().alert("Script Properties 'importFolderId' en/of 'processedFolderId' niet ingesteld.");
    return;
  }

  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFilesByType(MimeType.CSV);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

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

  fileList.forEach(file => {
    const fileContent = file.getBlob().getDataAsString();

    // Parse using semicolon
    let csvData = Utilities.parseCsv(fileContent, ';');

    // Remove header row
    csvData.shift();

    if (csvData.length > 0) {
      const lastRow = Math.max(sheet.getLastRow(), 1);
      const targetRange = sheet.getRange(lastRow + 1, 1, csvData.length, csvData[0].length);

      // setValues() automatically detects numbers and dates based on your Sheet settings
      targetRange.setValues(csvData);
    }

    // Move to 'Ingelezen CSV's'
    const processedFolder = DriveApp.getFolderById(processedFolderId);
    file.moveTo(processedFolder);
  });

  SpreadsheetApp.getUi().alert('Import voltooid');
}

/**
 * TEST: Import met deduplicatie.
 * Werkt met zowel afschriften als tussentijdse mutatieoverzichten.
 * Dubbele regels (op basis van datum, bedrag, tegenrekening, omschrijving) worden overgeslagen.
 * Als een mutatie eerder zonder afschriftnummer is geimporteerd, wordt het
 * afschriftnummer bijgewerkt zodra het afschrift binnenkomt.
 *
 * Vereist Script Properties:
 *   importFolderId      - Google Drive map met nieuwe CSV's
 *   processedFolderId   - Google Drive map voor verwerkte CSV's
 */
function importCSVTest() {
  var props = PropertiesService.getScriptProperties();
  const folderId = props.getProperty('importFolderId');
  const processedFolderId = props.getProperty('processedFolderId');
  const sheetName = 'SKG';

  if (!folderId || !processedFolderId) {
    SpreadsheetApp.getUi().alert("Script Properties 'importFolderId' en/of 'processedFolderId' niet ingesteld.");
    return;
  }

  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFilesByType(MimeType.CSV);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  let fileList = [];
  while (files.hasNext()) {
    fileList.push(files.next());
  }

  if (fileList.length === 0) {
    SpreadsheetApp.getUi().alert("Geen CSV's gevonden");
    return;
  }

  fileList.sort((a, b) => a.getName().localeCompare(b.getName()));

  // Read all existing data once for deduplication
  const lastRow = sheet.getLastRow();
  const existingData = lastRow > 0
    ? sheet.getRange(1, 1, lastRow, 18).getValues()
    : [];

  // Build index: key -> {rowIndex (0-based), hasStatementNr}
  const existingKeys = new Map();
  for (let i = 0; i < existingData.length; i++) {
    const key = buildKey_(existingData[i]);
    existingKeys.set(key, {
      rowIndex: i,
      hasStatementNr: existingData[i][0] !== '' && existingData[i][1] !== ''
    });
  }

  const rowsToAppend = [];
  const rowsToUpdate = []; // {sheetRow (1-based), year, number}
  let skipped = 0;

  fileList.forEach(file => {
    const fileContent = file.getBlob().getDataAsString();
    let csvData = Utilities.parseCsv(fileContent, ';');
    csvData.shift();

    csvData.forEach(row => {
      if (row.length < 11) return;

      const key = buildKey_(row);

      if (existingKeys.has(key)) {
        const existing = existingKeys.get(key);
        const hasNewStatementNr = row[0] !== '' && row[1] !== '';
        if (hasNewStatementNr && !existing.hasStatementNr) {
          rowsToUpdate.push({
            sheetRow: existing.rowIndex + 1,
            year: row[0],
            number: row[1]
          });
          existing.hasStatementNr = true;
        } else {
          skipped++;
        }
      } else {
        rowsToAppend.push(row);
        existingKeys.set(key, {
          rowIndex: -1,
          hasStatementNr: row[0] !== '' && row[1] !== ''
        });
      }
    });

    const processedFolder = DriveApp.getFolderById(processedFolderId);
    file.moveTo(processedFolder);
  });

  // Batch append new rows
  if (rowsToAppend.length > 0) {
    const startRow = Math.max(sheet.getLastRow(), 1) + 1;
    sheet.getRange(startRow, 1, rowsToAppend.length, rowsToAppend[0].length)
      .setValues(rowsToAppend);
  }

  // Update statement numbers on existing rows
  rowsToUpdate.forEach(update => {
    sheet.getRange(update.sheetRow, 1, 1, 2)
      .setValues([[update.year, update.number]]);
  });

  SpreadsheetApp.getUi().alert(
    'Import voltooid:\n' +
    rowsToAppend.length + ' nieuwe regels\n' +
    rowsToUpdate.length + ' afschriftnummers bijgewerkt\n' +
    skipped + ' dubbele regels overgeslagen'
  );
}

/**
 * Deduplicatie-sleutel op basis van kolommen die niet veranderen
 * tussen mutatie- en afschriftexport:
 * RekeningNummer (3), Datum (4), Bedrag (5),
 * Rekeningnummer begunstigde (7), Omschrijving (11).
 *
 * Normaliseert datums en bedragen zodat CSV-strings en
 * getValues()-types (Date, Number) dezelfde sleutel opleveren.
 */
function buildKey_(row) {
  let datum = row[3];
  let bedrag = row[4];

  // Normalize date to YYYY-MM-DD
  if (datum instanceof Date) {
    datum = Utilities.formatDate(datum, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  } else {
    const parts = String(datum).split('-');
    if (parts.length === 3) {
      datum = parts[2] + '-' + parts[1].padStart(2, '0') + '-' + parts[0].padStart(2, '0');
    }
  }

  // Normalize amount to fixed decimal
  if (typeof bedrag === 'number') {
    bedrag = bedrag.toFixed(2);
  } else {
    bedrag = parseFloat(String(bedrag).replace(/\./g, '').replace(',', '.')).toFixed(2);
  }

  return [
    String(row[2]).trim(),
    datum,
    bedrag,
    String(row[6]).trim(),
    String(row[10]).trim()
  ].join('|');
}
