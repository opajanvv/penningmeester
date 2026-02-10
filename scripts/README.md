# Scripts

## codering.gs

Google Apps Script voor de Wijkkas/Exploitatie-sheets. Bevat vier functies voor het coderingsproces:

- **exportOngecodeerd()** -- exporteert ongecodeerde SKG-regels uit het Journaal als `rijnummer|omschrijving, naam`.
- **importGecodeerd()** -- importeert gecodeerde regels (`rijnummer|code|opmerking`) terug in het Journaal.
- **verwerkImport(tekst)** -- backend voor importGecodeerd, zet codes in kolom A en opmerkingen in kolom M.
- **exportGecodeerd()** -- exporteert regels met toelichting in kolom M voor `/leer-codering`.

Zie `../processen/bankafschriften-coderen.md` voor het volledige stappenplan.

## import-csv.gs

Google Apps Script voor het importeren van SKG CSV-bestanden in het SKG-tabblad. Leest CSV's uit een Google Drive map, sorteert alfabetisch, en verplaatst verwerkte bestanden naar een aparte map.

