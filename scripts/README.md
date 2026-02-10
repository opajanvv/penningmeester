# Scripts

## codering-wijkkas.gs

Google Apps Script voor de Wijkkas-sheet. Persoonsnamen worden gemaskeerd als "persoon"; organisaties blijven zichtbaar (herkend via trefwoorden en de organisatielijst in Script Properties).

- **exportOngecodeerd()** -- exporteert ongecodeerde SKG-regels als `rijnummer|omschrijving, naam`.
- **importGecodeerd()** -- importeert gecodeerde regels (`rijnummer|code|opmerking`) terug in het Journaal.
- **verwerkImport(tekst)** -- backend voor importGecodeerd, zet codes in kolom A en opmerkingen in kolom M.
- **exportGecodeerd()** -- exporteert regels met toelichting in kolom M voor `/leer-codering`.
- **setupOrganisaties()** -- eenmalig uitvoeren om de lijst van bekende organisatienamen op te slaan in Script Properties.

## codering-exploitatie.gs

Google Apps Script voor de Exploitatie-sheet. Identiek aan de wijkkas-versie, maar zonder naammaskering: namen worden ongewijzigd geexporteerd omdat ze nodig zijn voor de codering.

- **exportOngecodeerd()** -- exporteert ongecodeerde SKG-regels als `rijnummer|omschrijving, naam`.
- **importGecodeerd()** -- importeert gecodeerde regels (`rijnummer|code|opmerking`) terug in het Journaal.
- **verwerkImport(tekst)** -- backend voor importGecodeerd.
- **exportGecodeerd()** -- exporteert regels met toelichting in kolom M voor `/leer-codering`.

Zie `../processen/bankafschriften-coderen.md` voor het volledige stappenplan.

## import-csv.gs

Google Apps Script voor het importeren van SKG CSV-bestanden in het SKG-tabblad. Leest CSV's uit een Google Drive map, sorteert alfabetisch, en verplaatst verwerkte bestanden naar een aparte map.

