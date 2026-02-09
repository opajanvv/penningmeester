/**
 * Exporteert ongecodeerde SKG-regels uit het Journaal.
 * Toont een dialoog met per regel: rijnummer|omschrijving, naam
 * Klaar om te plakken in /coderen-wijkkas of /coderen-exploitatie.
 *
 * Het rijnummer wordt meegestuurd zodat de gecodeerde output
 * via importGecodeerd() teruggezet kan worden op de juiste rij.
 */
function exportOngecodeerd() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Journaal");
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Tabblad 'Journaal' niet gevonden.");
    return;
  }

  var data = sheet.getDataRange().getValues();
  var regels = [];

  for (var i = 1; i < data.length; i++) {
    var code = data[i][0];   // kolom A: grootboekcode
    var bron = data[i][3];   // kolom D: bron
    var omschrijving = data[i][6]; // kolom G: omschrijving
    var naam = data[i][8];   // kolom I: naam begunstigde
    var rijnummer = i + 1;   // sheet-rijen zijn 1-based

    if (code === "" && bron === "SKG") {
      var delen = [];
      if (omschrijving) delen.push(String(omschrijving).trim());
      if (naam) delen.push(String(naam).trim());
      if (delen.length > 0) {
        regels.push(rijnummer + "|" + delen.join(", "));
      }
    }
  }

  if (regels.length === 0) {
    SpreadsheetApp.getUi().alert("Geen ongecodeerde SKG-regels gevonden.");
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

  SpreadsheetApp.getUi().showModalDialog(html, regels.length + " ongecodeerde regels");
}

/**
 * Importeert gecodeerde regels terug in het Journaal.
 * Verwacht per regel: rijnummer|code|opmerking (optioneel)
 *
 * - Zet de code in kolom A van de betreffende rij.
 * - Bij code 200 (Vraagposten): zet de opmerking in kolom M.
 */
function importGecodeerd() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Journaal");
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Tabblad 'Journaal' niet gevonden.");
    return;
  }

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

  SpreadsheetApp.getUi().showModalDialog(html, "Gecodeerde regels importeren");
}

/**
 * Verwerkt de geplakte import-tekst.
 * Wordt aangeroepen vanuit de importGecodeerd-dialoog.
 */
function verwerkImport(tekst) {
  if (!tekst) return "Geen invoer ontvangen.";
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Journaal");
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
      sheet.getRange(rijnummer, 13).setValue(opmerking); // kolom M
    }
    verwerkt++;
  }

  var resultaat = verwerkt + " regels verwerkt.";
  if (fouten.length > 0) {
    resultaat += "\n\nFouten:\n" + fouten.join("\n");
  }
  return resultaat;
}
