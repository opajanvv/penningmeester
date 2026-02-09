# Bankafschriften coderen

Stappenplan om nieuwe bankafschriften te coderen met Claude. Er zijn twee Apps Scripts in de Google Sheet die het proces ondersteunen. De broncode staat in `scripts/export-ongecodeerd.gs`.

## 1. Exporteer ongecodeerde regels

1. Open de Google Sheet (Wijkkas of Exploitatie).
2. Draai het script **exportOngecodeerd** (via Uitbreidingen > Macro's, of via een knop).
3. Het script filtert het Journaal op rijen met lege code (kolom A) en bron "SKG".
4. Er verschijnt een dialoog met per regel: `rijnummer|omschrijving, naam`.
5. Selecteer alles en kopieer.

## 2. Codeer met Claude

1. Open Claude Code in dit project.
2. Typ `/coderen-wijkkas` (of `/coderen-exploitatie`) en plak de gekopieerde regels.
3. Claude geeft twee blokken output:
   - **Leesbaar overzicht** -- per regel de code met toelichting, ter controle.
   - **Import-blok** -- per regel `rijnummer|code|opmerking`, klaar voor import.
4. Bij twijfelgevallen geeft Claude code **200** (Vraagposten) met een opmerking over de mogelijke codes.

## 3. Importeer codes in de sheet

1. Draai het script **importGecodeerd** in de Google Sheet.
2. Er verschijnt een dialoog met een tekstveld.
3. Kopieer het **import-blok** uit de Claude-output en plak het in het tekstveld.
4. Klik **Importeren**.
5. Het script zet de codes in kolom A. Bij code 200 komt de opmerking in kolom M.

## 4. Controleer en corrigeer

1. Filter het Journaal op code **200** om de twijfelgevallen te zien.
2. Lees de opmerking in kolom M en kies de juiste code.
3. Controleer ook de overige codes steekproefsgewijs.

## Gevoelige data

Het Journaal bevat geen IBAN's of adressen -- alleen namen, omschrijvingen en bedragen. Namen van tegenpartijen worden meegestuurd naar Claude omdat ze nodig zijn voor de codering (bijv. "Sligro" -> inkoop buffet, "Care" -> schoonmaak).

Bij twijfel over een code: zie `docs/referentie/coderingsschema.md`.
