/**
 * Exporteert ongecodeerde regels uit het actieve Journaal-tabblad.
 * Toont een dialoog met per regel: rijnummer|omschrijving, naam
 * Klaar om te plakken in /coderen.
 *
 * Werkt op het actieve tabblad (Journaal Wijkkas of Journaal Exploitatie).
 */
function exportOngecodeerd() {
  var sheet = getActiveJournaal_();
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  var regels = [];

  for (var i = 7; i < data.length; i++) { // data begint op rij 8 (index 7)
    var code = data[i][0];   // kolom A: grootboekcode
    var omschrijving = data[i][6]; // kolom G: omschrijving
    var naam = data[i][7];   // kolom H: naam tegenpartij
    var rijnummer = i + 1;   // sheet-rijen zijn 1-based

    var datum = data[i][3];  // kolom D: datum
    if (code === "" && datum) {
      var delen = [];
      if (omschrijving) delen.push(String(omschrijving).trim());
      if (naam) delen.push(String(naam).trim());
      regels.push(rijnummer + "|" + (delen.length > 0 ? delen.join(", ") : "(geen omschrijving)"));
    }
  }

  if (regels.length === 0) {
    SpreadsheetApp.getUi().alert("Geen ongecodeerde regels gevonden in " + sheet.getName() + ".");
    return;
  }

  var tekst = regels.join("\n");

  var html = HtmlService
    .createHtmlOutput(
      '<textarea id="output" style="width:100%;height:90%;font-family:monospace;font-size:13px;">'
      + tekst.replace(/&/g,"&amp;").replace(/</g,"&lt;")
      + '</textarea>'
      + '<script>document.getElementById("output").select();</script>'
    )
    .setWidth(600)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, sheet.getName() + ": " + regels.length + " ongecodeerde regels");
}

/**
 * Importeert gecodeerde regels terug in het actieve Journaal-tabblad.
 * Verwacht per regel: rijnummer|code|opmerking (optioneel)
 *
 * - Zet de code in kolom A van de betreffende rij.
 * - Bij code 200 (Vraagposten): zet de opmerking in kolom I.
 */
function importGecodeerd() {
  var sheet = getActiveJournaal_();
  if (!sheet) return;

  // Sla de tabblad-naam op zodat verwerkImport het juiste tabblad vindt
  PropertiesService.getScriptProperties().setProperty("importTarget", sheet.getName());

  var htmlContent = ''
    + '<textarea id="invoer" style="width:100%;height:80%;font-family:monospace;font-size:13px;" '
    + 'placeholder="Plak hier de gecodeerde output.&#10;Formaat: rijnummer|code|opmerking"></textarea>'
    + '<br><button id="btn" onclick="importeren()" style="margin-top:8px;padding:6px 16px;">Importeren</button>'
    + '<script>'
    + 'function importeren() {'
    + '  var el = document.getElementById("invoer");'
    + '  var tekst = el.value || "";'
    + '  if (!tekst.trim()) { el.value = "Niets om te importeren."; return; }'
    + '  document.getElementById("btn").disabled = true;'
    + '  google.script.run'
    + '    .withSuccessHandler(function(r) { el.value = r; document.getElementById("btn").disabled = false; })'
    + '    .withFailureHandler(function(e) { el.value = "Fout: " + e.message; document.getElementById("btn").disabled = false; })'
    + '    .verwerkImport(tekst);'
    + '}'
    + '</script>';

  var html = HtmlService
    .createHtmlOutput(htmlContent)
    .setWidth(600)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, sheet.getName() + ": gecodeerde regels importeren");
}

/**
 * Verwerkt de geplakte import-tekst.
 * Wordt aangeroepen vanuit de importGecodeerd-dialoog.
 * Gebruikt het tabblad dat was opgeslagen bij het openen van de dialoog.
 */
function verwerkImport(tekst) {
  if (!tekst) return "Geen invoer ontvangen.";

  var sheetName = PropertiesService.getScriptProperties().getProperty("importTarget");
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return "Tabblad '" + sheetName + "' niet gevonden.";

  var regels = tekst.trim().split("\n");
  var verwerkt = 0;
  var fouten = [];

  for (var i = 0; i < regels.length; i++) {
    var regel = regels[i].trim();
    if (regel === "") continue;

    var delen = regel.split("|");
    if (delen.length < 2) {
      fouten.push("Regel " + (i + 1) + ": ongeldig formaat");
      continue;
    }

    var rijnummer = parseInt(delen[0], 10);
    var code = parseInt(delen[1], 10);
    var opmerking = delen.length > 2 ? delen.slice(2).join("|").trim() : "";

    if (isNaN(rijnummer) || isNaN(code)) {
      fouten.push("Regel " + (i + 1) + ": ongeldig rijnummer of code");
      continue;
    }

    sheet.getRange(rijnummer, 1).setValue(code); // kolom A
    if (code === 200 && opmerking) {
      sheet.getRange(rijnummer, 9).setValue(opmerking); // kolom I
    }
    verwerkt++;
  }

  var resultaat = verwerkt + " regels verwerkt in " + sheetName + ".";
  if (fouten.length > 0) {
    resultaat += "\n\nFouten:\n" + fouten.join("\n");
  }
  return resultaat;
}

/**
 * Exporteert regels met toelichting in kolom I (correcties en opgeloste vraagposten).
 * Toont per regel: rijnummer|code|omschrijving, naam|toelichting
 * Klaar om te plakken in /leer-codering voor het bijwerken van patronen.
 */
function exportGecodeerd() {
  var sheet = getActiveJournaal_();
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  var regels = [];

  for (var i = 7; i < data.length; i++) { // data begint op rij 8 (index 7)
    var toelichting = data[i][8]; // kolom I
    if (!toelichting || String(toelichting).trim() === "") continue;

    var rijnummer = i + 1;
    var code = data[i][0];        // kolom A
    var omschrijving = data[i][6]; // kolom G
    var naam = data[i][7];        // kolom H

    var delen = [];
    if (omschrijving) delen.push(String(omschrijving).trim());
    if (naam) delen.push(String(naam).trim());

    regels.push(rijnummer + "|" + code + "|" + delen.join(", ") + "|" + String(toelichting).trim());
  }

  if (regels.length === 0) {
    SpreadsheetApp.getUi().alert("Geen regels met toelichting in kolom I gevonden in " + sheet.getName() + ".");
    return;
  }

  var tekst = regels.join("\n");

  var html = HtmlService
    .createHtmlOutput(
      '<textarea id="output" style="width:100%;height:90%;font-family:monospace;font-size:13px;">'
      + tekst.replace(/&/g,"&amp;").replace(/</g,"&lt;")
      + '</textarea>'
      + '<script>document.getElementById("output").select();</script>'
    )
    .setWidth(600)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, sheet.getName() + ": " + regels.length + " regels met correcties");
}

/**
 * Geeft het actieve tabblad terug als het een Journaal-tabblad is.
 * Toont een foutmelding als het actieve tabblad geen Journaal is.
 */
function getActiveJournaal_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var name = sheet.getName();
  if (name.indexOf("Journaal") !== 0) {
    SpreadsheetApp.getUi().alert(
      "Dit werkt alleen op een Journaal-tabblad.\n" +
      "Actief tabblad: " + name + "\n\n" +
      "Ga naar 'Journaal Wijkkas' of 'Journaal Exploitatie'."
    );
    return null;
  }
  return sheet;
}
