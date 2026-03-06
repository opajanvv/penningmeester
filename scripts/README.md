# Scripts

## codering.gs

Google Apps Script voor de sheet Boekhouding 2026. Werkt op het samengevoegde Journaal (beide bankrekeningen).

- **exportOngecodeerd()** -- exporteert ongecodeerde SKG-regels als `rijnummer|omschrijving, naam`.
- **importGecodeerd()** -- importeert gecodeerde regels (`rijnummer|code|opmerking`) terug in het Journaal.
- **verwerkImport(tekst)** -- backend voor importGecodeerd, zet codes in kolom A en opmerkingen in kolom M.
- **exportGecodeerd()** -- exporteert regels met toelichting in kolom M voor `/leer-codering`.

Zie `../docs/processen/bankafschriften-coderen.md` voor het volledige stappenplan.

## import-csv.gs

Google Apps Script voor het importeren van SKG CSV-bestanden. Twee entry-functies per bankrekening:

- **importCSVWijkkas()** -- importeert CSV's in tabblad "SKG Wijkkas"
- **importCSVExploitatie()** -- importeert CSV's in tabblad "SKG Exploitatie"

Folder-ID's worden per rekening geconfigureerd via Script Properties.
