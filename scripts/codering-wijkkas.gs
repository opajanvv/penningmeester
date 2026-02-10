/**
 * Exporteert ongecodeerde SKG-regels uit het Journaal.
 * Toont een dialoog met per regel: rijnummer|omschrijving, naam
 * Klaar om te plakken in /coderen-wijkkas.
 *
 * Persoonsnamen worden gemaskeerd als "persoon".
 * Organisaties (herkend via trefwoorden of de organisatielijst) blijven zichtbaar.
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
  var organisatieLijst = laadOrganisaties();
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
      if (naam) {
        var naamStr = String(naam).trim();
        if (naamStr) {
          delen.push(isOrganisatie(naamStr, organisatieLijst) ? naamStr : "persoon");
        }
      }
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
  var rijnummers = [];

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
    rijnummers.push(rijnummer);
    verwerkt++;
  }

  // Sla geimporteerde rijnummers op voor exportGecodeerd
  PropertiesService.getScriptProperties().setProperty(
    "laatsteBatch", JSON.stringify(rijnummers)
  );

  var resultaat = verwerkt + " regels verwerkt.";
  if (fouten.length > 0) {
    resultaat += "\n\nFouten:\n" + fouten.join("\n");
  }
  return resultaat;
}

/**
 * Exporteert regels met toelichting in kolom M (correcties en opgeloste vraagposten).
 * Toont per regel: rijnummer|code|omschrijving, naam|toelichting
 * Klaar om te plakken in /leer-codering voor het bijwerken van patronen.
 *
 * Persoonsnamen worden gemaskeerd als "persoon".
 */
function exportGecodeerd() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Journaal");
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Tabblad 'Journaal' niet gevonden.");
    return;
  }

  var data = sheet.getDataRange().getValues();
  var organisatieLijst = laadOrganisaties();
  var regels = [];

  for (var i = 1; i < data.length; i++) {
    var toelichting = data[i][12]; // kolom M
    if (!toelichting || String(toelichting).trim() === "") continue;

    var rijnummer = i + 1;
    var code = data[i][0];        // kolom A
    var omschrijving = data[i][6]; // kolom G
    var naam = data[i][8];        // kolom I

    var delen = [];
    if (omschrijving) delen.push(String(omschrijving).trim());
    if (naam) {
      var naamStr = String(naam).trim();
      if (naamStr) {
        delen.push(isOrganisatie(naamStr, organisatieLijst) ? naamStr : "persoon");
      }
    }

    regels.push(rijnummer + "|" + code + "|" + delen.join(", ") + "|" + String(toelichting).trim());
  }

  if (regels.length === 0) {
    SpreadsheetApp.getUi().alert("Geen regels met toelichting in kolom M gevonden.");
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

  SpreadsheetApp.getUi().showModalDialog(html, regels.length + " regels met correcties/toelichting");
}

/**
 * Controleert of een naam een organisatie is (niet-persoon).
 * Herkent organisaties op twee manieren:
 * 1. Trefwoorden in de naam (B.V., Stichting, Gemeente, etc.)
 * 2. Exacte match met de organisatielijst in Script Properties.
 */
function isOrganisatie(naam, organisatieLijst) {
  if (!naam) return false;
  var naamLower = naam.toLowerCase();

  // Trefwoorden die wijzen op een organisatie (substring-match)
  var trefwoorden = ["b.v.", "stichting", "gemeente", "diaconie",
                     "fonds", "genootschap", "dienstenorganisatie", "fa."];
  for (var i = 0; i < trefwoorden.length; i++) {
    if (naamLower.indexOf(trefwoorden[i]) !== -1) return true;
  }

  // "Kerk" en "BV" met woordgrens om false positives te voorkomen (bv. Kerkhof)
  if (/\bkerk\b/i.test(naam) || /\bbv\b/i.test(naam)) return true;

  // Specifieke organisatienamen (exacte match, case-insensitive)
  for (var j = 0; j < organisatieLijst.length; j++) {
    if (naamLower === organisatieLijst[j].toLowerCase()) return true;
  }

  return false;
}

/**
 * Laadt de organisatielijst uit Script Properties.
 */
function laadOrganisaties() {
  var json = PropertiesService.getScriptProperties().getProperty("organisaties");
  return json ? JSON.parse(json) : [];
}

/**
 * Eenmalig uitvoeren om de lijst van bekende organisaties op te slaan
 * in Script Properties. Bevat namen die niet door de trefwoorden
 * (B.V., Stichting, Gemeente, etc.) herkend worden.
 */
function setupOrganisaties() {
  var organisaties = [
    "Arjen Keer Yacht Design",
    "Beukers Bouwt",
    "Boothville",
    "Cafetaria Jan Kruis",
    "Eet Smakelijk",
    "EHBO Hilversum",
    "HBBZ",
    "HILVERSUM FINANCIELE ADM",
    "ISERO",
    "Liedboek",
    "Micro-projects",
    "Micro-Projects",
    "Mrs. Italy",
    "Piano Select",
    "Psychologieprak Richters",
    "RoyalPrint",
    "Schaapsound",
    "SKG COLLECT",
    "Smits tuinen",
    "Smits Tuinen",
    "Three Sixty Group",
    "VBK media",
    "Webheld"
  ];
  PropertiesService.getScriptProperties().setProperty(
    "organisaties", JSON.stringify(organisaties)
  );
  SpreadsheetApp.getUi().alert(organisaties.length + " organisaties opgeslagen in Script Properties.");
}
