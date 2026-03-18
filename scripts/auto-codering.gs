/**
 * Custom menu voor de boekhouding.
 */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Boekhouding')
    .addItem('CSV importeren', 'importeerEnCodeer')
    .addItem('Patronen bijwerken', 'patronenBijwerken')
    .addToUi();
}

// ---------------------------------------------------------------------------
// Importeren en coderen
// ---------------------------------------------------------------------------

/**
 * Importeert CSV's voor beide rekeningen en codeert daarna alle ongecodeerde regels.
 */
function importeerEnCodeer() {
  var ui = SpreadsheetApp.getUi();
  var resultaat = [];

  // Importeer CSV's (constanten uit import-csv.gs)
  var wijkkasImport = importCSV_(
    IMPORT_FOLDER_WIJKKAS, PROCESSED_FOLDER_WIJKKAS,
    'Journaal Wijkkas', true
  );
  if (wijkkasImport) {
    resultaat.push('Wijkkas: ' + wijkkasImport.nieuw + ' nieuw, ' +
      wijkkasImport.bijgewerkt + ' bijgewerkt, ' +
      wijkkasImport.overgeslagen + ' overgeslagen');
  }

  var explImport = importCSV_(
    IMPORT_FOLDER_EXPLOITATIE, PROCESSED_FOLDER_EXPLOITATIE,
    'Journaal Exploitatie', true
  );
  if (explImport) {
    resultaat.push('Exploitatie: ' + explImport.nieuw + ' nieuw, ' +
      explImport.bijgewerkt + ' bijgewerkt, ' +
      explImport.overgeslagen + ' overgeslagen');
  }

  // Codeer ongecodeerde regels
  var codeerWijkkas = codeerOngecodeerd_('Journaal Wijkkas');
  var codeerExpl = codeerOngecodeerd_('Journaal Exploitatie');

  if (codeerWijkkas.verwerkt > 0 || codeerWijkkas.vraagposten > 0) {
    resultaat.push('Codering wijkkas: ' + codeerWijkkas.verwerkt + ' gecodeerd, ' +
      codeerWijkkas.vraagposten + ' vraagposten');
  }
  if (codeerExpl.verwerkt > 0 || codeerExpl.vraagposten > 0) {
    resultaat.push('Codering exploitatie: ' + codeerExpl.verwerkt + ' gecodeerd, ' +
      codeerExpl.vraagposten + ' vraagposten');
  }

  if (codeerWijkkas.fouten > 0 || codeerExpl.fouten > 0) {
    resultaat.push('Let op: ' + (codeerWijkkas.fouten + codeerExpl.fouten) +
      ' regels konden niet gecodeerd worden (API-fout)');
  }

  if (resultaat.length === 0) {
    ui.alert('Geen nieuwe CSV\'s gevonden en geen ongecodeerde regels.');
  } else {
    ui.alert(resultaat.join('\n'));
  }
}

// ---------------------------------------------------------------------------
// Automatisch coderen
// ---------------------------------------------------------------------------

var DATA_START_ROW = 8;
var BATCH_SIZE = 50;

/**
 * Codeert alle ongecodeerde regels in het gegeven journaal-tabblad.
 * Returns {verwerkt, vraagposten, fouten}
 */
function codeerOngecodeerd_(sheetName) {
  var result = { verwerkt: 0, vraagposten: 0, fouten: 0 };
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return result;

  var lastRow = sheet.getLastRow();
  if (lastRow < DATA_START_ROW) return result;

  // Verzamel ongecodeerde rijen
  var data = sheet.getRange(DATA_START_ROW, 1, lastRow - DATA_START_ROW + 1, 8).getValues();
  var ongecodeerd = [];

  for (var i = 0; i < data.length; i++) {
    var code = data[i][0];   // A: grootboekcode
    var datum = data[i][3];  // D: datum
    if (code === '' && datum) {
      ongecodeerd.push({
        rij: i + DATA_START_ROW,
        omschrijving: String(data[i][6] || '').trim(),  // G
        naam: String(data[i][7] || '').trim(),           // H
        bij: data[i][4],                                  // E
        af: data[i][5]                                    // F
      });
    }
  }

  if (ongecodeerd.length === 0) return result;

  // Bouw system prompt
  var systemPrompt = buildSystemPrompt_();

  // Verwerk in batches
  for (var b = 0; b < ongecodeerd.length; b += BATCH_SIZE) {
    var batch = ongecodeerd.slice(b, b + BATCH_SIZE);

    var regels = batch.map(function(r) {
      return r.rij + '|' + r.omschrijving + '|' + r.naam + '|' +
        (r.bij || 0) + '|' + (r.af || 0);
    });

    var userMessage = 'Tabblad: ' + sheetName + '\n\n' +
      'Codeer deze bankafschriften.\n\n' +
      'rij|omschrijving|naam|bij|af\n' +
      regels.join('\n');

    try {
      var antwoord = roepClaudeAan_(systemPrompt, userMessage);
      var codes = parseCodering_(antwoord);

      for (var j = 0; j < codes.length; j++) {
        var c = codes[j];
        sheet.getRange(c.rij, 1).setValue(c.code);  // kolom A
        if (c.code === 200 && c.opmerking) {
          sheet.getRange(c.rij, 9).setValue(c.opmerking);  // kolom I
          result.vraagposten++;
        } else {
          result.verwerkt++;
        }
      }
    } catch (e) {
      Logger.log('Batch ' + Math.floor(b / BATCH_SIZE) + ' voor ' + sheetName +
        ' mislukt: ' + e.message);
      result.fouten += batch.length;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Patronen bijwerken
// ---------------------------------------------------------------------------

/**
 * Verzamelt correcties uit alle journaaltabbladen en werkt patronen bij.
 */
function patronenBijwerken() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Verzamel correcties uit beide journaaltabbladen
  var correcties = [];
  ['Journaal Wijkkas', 'Journaal Exploitatie'].forEach(function(naam) {
    var sheet = ss.getSheetByName(naam);
    if (!sheet) return;
    var lastRow = sheet.getLastRow();
    if (lastRow < DATA_START_ROW) return;

    var data = sheet.getRange(DATA_START_ROW, 1, lastRow - DATA_START_ROW + 1, 9).getValues();
    for (var i = 0; i < data.length; i++) {
      var toelichting = data[i][8];  // kolom I
      if (!toelichting || String(toelichting).trim() === '') continue;

      correcties.push({
        rij: i + DATA_START_ROW,
        tabblad: naam,
        code: data[i][0],
        omschrijving: String(data[i][6] || '').trim(),
        naam: String(data[i][7] || '').trim(),
        toelichting: String(toelichting).trim()
      });
    }
  });

  if (correcties.length === 0) {
    ui.alert('Geen correcties gevonden (kolom I is leeg in beide journaaltabbladen).');
    return;
  }

  // Lees huidige patronen
  var patronenSheet = ss.getSheetByName('Coderingspatronen');
  if (!patronenSheet) {
    ui.alert('Tabblad "Coderingspatronen" niet gevonden.');
    return;
  }

  var patronenData = patronenSheet.getDataRange().getValues();
  var patronenTekst = 'Code|Naam|Patronen\n';
  for (var p = 1; p < patronenData.length; p++) {
    patronenTekst += patronenData[p][0] + '|' + patronenData[p][1] + '|' + patronenData[p][2] + '\n';
  }

  // Bouw prompt
  var systemPrompt = 'Je bent een boekhoudassistent voor kerkelijke gemeente De Lichtbron.\n' +
    'Analyseer correcties op bankafschriften en bepaal welke coderingspatronen ' +
    'moeten worden aangepast.\n\n' +
    'Huidige patronen:\n' + patronenTekst + '\n' +
    'Antwoord UITSLUITEND met JSON in dit formaat:\n' +
    '{"wijzigingen": [\n' +
    '  {"code": 225, "nieuwe_patronen": "doorzendcollecte, Thermo Libanon, Nepal, diaconie (doorzending)", "reden": "Nepal toegevoegd als doorzendcollecte"}\n' +
    '],\n' +
    '"geen_actie": [\n' +
    '  {"rij": 27, "reden": "Patronen dekken dit al: vage omschrijving -> default gift (210)"}\n' +
    ']}\n\n' +
    'Regels:\n' +
    '- Geef bij wijzigingen de VOLLEDIGE nieuwe patronen-tekst voor die code (niet alleen het verschil)\n' +
    '- Voeg alleen patronen toe die generaliseerbaar zijn (niet eenmalige uitzonderingen)\n' +
    '- Wijzig geen codenamen, alleen de patronen-kolom\n' +
    '- Als een correctie al door bestaande patronen gedekt wordt, zet het bij geen_actie';

  var correctieTekst = correcties.map(function(c) {
    return c.rij + '|' + c.code + '|' + c.omschrijving + '|' + c.naam + '|' + c.toelichting;
  });

  var userMessage = 'Deze boekingen zijn gecorrigeerd:\n\n' +
    'rij|code|omschrijving|naam|toelichting\n' +
    correctieTekst.join('\n');

  try {
    var antwoord = roepClaudeAan_(systemPrompt, userMessage);
    var analyse = parseJSON_(antwoord);

    if (!analyse || !analyse.wijzigingen) {
      ui.alert('Onverwacht antwoord van de API. Controleer de logs.');
      return;
    }

    if (analyse.wijzigingen.length === 0) {
      // Maak toelichting leeg voor verwerkte correcties
      wisToelichtingen_(correcties);
      ui.alert('Geen patroonwijzigingen nodig. ' + correcties.length + ' toelichtingen gewist.');
      return;
    }

    // Sla analyse op voor de bevestigingsdialoog
    PropertiesService.getScriptProperties().setProperty(
      'pendingPatronen', JSON.stringify(analyse));
    PropertiesService.getScriptProperties().setProperty(
      'pendingCorrecties', JSON.stringify(correcties));

    // Toon preview
    var htmlRegels = analyse.wijzigingen.map(function(w) {
      return '<tr><td>' + w.code + '</td><td>' +
        htmlEscape_(w.nieuwe_patronen) + '</td><td>' +
        htmlEscape_(w.reden) + '</td></tr>';
    });

    var html = HtmlService.createHtmlOutput(
      '<style>table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:6px;text-align:left;font-size:13px}th{background:#f5f5f5}</style>' +
      '<h3>Voorgestelde wijzigingen (' + analyse.wijzigingen.length + ')</h3>' +
      '<table><tr><th>Code</th><th>Nieuwe patronen</th><th>Reden</th></tr>' +
      htmlRegels.join('') + '</table>' +
      (analyse.geen_actie && analyse.geen_actie.length > 0 ?
        '<p style="color:#666;font-size:12px">' + analyse.geen_actie.length +
        ' correcties vereisen geen patroonwijziging.</p>' : '') +
      '<br><button onclick="google.script.run.withSuccessHandler(function(){google.script.host.close()}).bevestigPatronen()" ' +
      'style="padding:8px 20px;font-size:14px;background:#4285f4;color:white;border:none;border-radius:4px;cursor:pointer">Doorvoeren</button>' +
      '&nbsp;<button onclick="google.script.host.close()" ' +
      'style="padding:8px 20px;font-size:14px;border:1px solid #ddd;border-radius:4px;cursor:pointer">Annuleren</button>'
    ).setWidth(700).setHeight(400);

    ui.showModalDialog(html, 'Patronen bijwerken');

  } catch (e) {
    ui.alert('Fout bij patronen bijwerken: ' + e.message);
  }
}

/**
 * Wordt aangeroepen vanuit de bevestigingsdialoog.
 * Voert de patroonwijzigingen door en wist de toelichtingen.
 */
function bevestigPatronen() {
  var props = PropertiesService.getScriptProperties();
  var analyse = JSON.parse(props.getProperty('pendingPatronen'));
  var correcties = JSON.parse(props.getProperty('pendingCorrecties'));

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var patronenSheet = ss.getSheetByName('Coderingspatronen');
  var patronenData = patronenSheet.getDataRange().getValues();

  // Pas patronen aan
  for (var w = 0; w < analyse.wijzigingen.length; w++) {
    var wijziging = analyse.wijzigingen[w];
    for (var r = 1; r < patronenData.length; r++) {
      if (Number(patronenData[r][0]) === Number(wijziging.code)) {
        patronenSheet.getRange(r + 1, 3).setValue(wijziging.nieuwe_patronen);
        break;
      }
    }
  }

  // Wis toelichtingen
  wisToelichtingen_(correcties);

  // Ruim tijdelijke properties op
  props.deleteProperty('pendingPatronen');
  props.deleteProperty('pendingCorrecties');
}

/**
 * Wist kolom I (toelichting) voor de verwerkte correcties.
 */
function wisToelichtingen_(correcties) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = {};

  for (var i = 0; i < correcties.length; i++) {
    var c = correcties[i];
    if (!sheets[c.tabblad]) {
      sheets[c.tabblad] = ss.getSheetByName(c.tabblad);
    }
    sheets[c.tabblad].getRange(c.rij, 9).setValue('');  // kolom I
  }
}

// ---------------------------------------------------------------------------
// API-communicatie
// ---------------------------------------------------------------------------

/**
 * Roept de Anthropic Messages API aan met retry bij tijdelijke fouten.
 * Returns de tekst-content van het antwoord.
 */
function roepClaudeAan_(systemPrompt, userMessage) {
  var props = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('ANTHROPIC_API_KEY');
  var model = props.getProperty('ANTHROPIC_MODEL') || 'claude-haiku-4-5-20251001';

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY niet ingesteld in Script Properties.');
  }

  var payload = {
    model: model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }]
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var maxRetries = 3;
  for (var poging = 0; poging < maxRetries; poging++) {
    var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', options);
    var statusCode = response.getResponseCode();

    if (statusCode === 200) {
      var body = JSON.parse(response.getContentText());
      return body.content[0].text;
    }

    // Retry bij tijdelijke fouten
    if ([429, 500, 503, 529].indexOf(statusCode) !== -1 && poging < maxRetries - 1) {
      Logger.log('API poging ' + (poging + 1) + ': status ' + statusCode + ', retry...');
      Utilities.sleep(Math.pow(2, poging + 1) * 1000);  // 2s, 4s
      continue;
    }

    throw new Error('Anthropic API fout ' + statusCode + ': ' +
      response.getContentText().substring(0, 200));
  }

  throw new Error('Alle API-pogingen mislukt.');
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

/**
 * Bouwt de system prompt op basis van het tabblad Coderingspatronen.
 */
function buildSystemPrompt_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Coderingspatronen');
  if (!sheet) {
    throw new Error('Tabblad "Coderingspatronen" niet gevonden.');
  }

  var data = sheet.getDataRange().getValues();
  var tabel = '| Code | Naam | Patroon |\n|------|------|---------|';
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === '') continue;
    tabel += '\n| ' + data[i][0] + ' | ' + data[i][1] + ' | ' + data[i][2] + ' |';
  }

  return 'Je bent een boekhoudassistent voor kerkelijke gemeente De Lichtbron.\n' +
    'Wijs grootboekcodes toe aan bankafschriften op basis van onderstaande patronen.\n\n' +
    '## Coderingspatronen\n\n' + tabel + '\n\n' +
    '## Prioriteit matching\n\n' +
    '1. Factuurnummerformaat JJJJMM-NNN (bijv. 202601-013) -> altijd code 140\n' +
    '2. Omschrijving boven leverancier (bijv. Micro-Projects + "orgel" = 311, niet 307)\n' +
    '3. Tegenpartij - exacte of gedeeltelijke match op naam\n' +
    '4. Keywords in omschrijving\n' +
    '5. Geen of vage omschrijving -> default gift (210)\n' +
    '6. Bij twijfel -> code 200 (Vraagposten) met toelichting\n\n' +
    '## Output formaat\n\n' +
    'Antwoord UITSLUITEND met JSON. Geen tekst ervoor of erna.\n' +
    '[{"rij": 23, "code": 305, "opmerking": ""},\n' +
    ' {"rij": 24, "code": 200, "opmerking": "Gift (210) of collecte (220)?"}]\n\n' +
    'Regels:\n' +
    '- Opmerking alleen bij code 200\n' +
    '- Gebruik ALLEEN codes uit bovenstaande tabel\n' +
    '- Bij twijfel: code 200 met mogelijke opties in opmerking';
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/**
 * Parst de API-response voor codering naar een array van {rij, code, opmerking}.
 */
function parseCodering_(tekst) {
  var json = extractJSON_(tekst);
  var arr = JSON.parse(json);

  if (!Array.isArray(arr)) {
    throw new Error('Verwacht een JSON-array, kreeg: ' + typeof arr);
  }

  var resultaat = [];
  for (var i = 0; i < arr.length; i++) {
    var item = arr[i];
    var rij = parseInt(item.rij, 10);
    var code = parseInt(item.code, 10);

    if (isNaN(rij) || isNaN(code)) {
      Logger.log('Ongeldige codering overgeslagen: ' + JSON.stringify(item));
      continue;
    }

    resultaat.push({
      rij: rij,
      code: code,
      opmerking: item.opmerking || ''
    });
  }

  return resultaat;
}

/**
 * Parst een JSON-object uit API-tekst.
 */
function parseJSON_(tekst) {
  var json = extractJSON_(tekst);
  return JSON.parse(json);
}

/**
 * Extraheert JSON uit tekst die mogelijk extra tekst bevat.
 * Zoekt het eerste [ of { en het bijbehorende sluitende teken.
 */
function extractJSON_(tekst) {
  tekst = tekst.trim();

  // Probeer direct te parsen
  try {
    JSON.parse(tekst);
    return tekst;
  } catch (e) {
    // Zoek het eerste JSON-object of -array
    var start = -1;
    var openChar = '';
    for (var i = 0; i < tekst.length; i++) {
      if (tekst[i] === '[' || tekst[i] === '{') {
        start = i;
        openChar = tekst[i];
        break;
      }
    }

    if (start === -1) {
      throw new Error('Geen JSON gevonden in response: ' + tekst.substring(0, 100));
    }

    var closeChar = openChar === '[' ? ']' : '}';
    var depth = 0;
    for (var j = start; j < tekst.length; j++) {
      if (tekst[j] === openChar) depth++;
      if (tekst[j] === closeChar) depth--;
      if (depth === 0) {
        return tekst.substring(start, j + 1);
      }
    }

    throw new Error('Onvolledige JSON in response');
  }
}

// ---------------------------------------------------------------------------
// Hulpfuncties
// ---------------------------------------------------------------------------

/**
 * Escapet HTML-tekens voor weergave in dialogen.
 */
function htmlEscape_(tekst) {
  return String(tekst)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
