/**
 * Imports CSVs alphabetically.
 * Uses Sheet locale settings to handle semicolons and commas automatically.
 */
function importCSV() {
  const folderId = '1qYuhNpnDJvzhZC9KVec3K-V89toiJmzG';
  const processedFolderId = '1dASRrGOE3bgGkeXsU9ICxdnErmTmXGla';
  const sheetName = 'SKG';

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
