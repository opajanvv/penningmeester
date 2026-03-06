# CSV-importscript (Apps Script)

De sheet Boekhouding 2026 heeft een Apps Script dat CSV-bankafschriften uit Google Drive importeert in het juiste SKG-tabblad.

## Waar zit het script?

Het script zit **in de Google Sheet zelf**:

1. Open de sheet Boekhouding 2026
2. Ga naar **Uitbreidingen > Apps Script**
3. De functies `importCSVWijkkas` en `importCSVExploitatie` staan daar

Elk roept dezelfde interne functie `importCSV_()` aan met de juiste folder-ID's en tabblad.

## Twee functies, twee tabbladen

| Functie | Doeltabblad | Script Properties |
|---------|-------------|-------------------|
| `importCSVWijkkas()` | SKG Wijkkas | `importFolderIdWijkkas`, `processedFolderIdWijkkas` |
| `importCSVExploitatie()` | SKG Exploitatie | `importFolderIdExploitatie`, `processedFolderIdExploitatie` |

## Hoe vind je de folder-ID's?

Het script gebruikt vier folder-ID's (twee per rekening):

| Property | Map | Doel |
|----------|-----|------|
| `importFolderId*` | `Bankafschriften` | Bronmap waar nieuwe CSV's staan |
| `processedFolderId*` | `Ingelezen CSV's` | Doelmap voor verwerkte CSV's |

Een folder-ID vind je door de map te openen in Google Drive en het laatste deel van de URL te kopieren:

```
https://drive.google.com/drive/folders/1qYuhNpnDJvzhZC9KVec3K-V89toiJmzG
                                        └─────────── dit is de folder-ID ──┘
```

## Wat doet het script?

1. **CSV's ophalen** -- Haalt alle bestanden van het type CSV op uit de bronmap.
2. **Sorteren** -- Sorteert de bestanden alfabetisch op bestandsnaam, zodat `Afschrift-...-2026001.csv` voor `Afschrift-...-2026002.csv` komt. Dit zorgt ervoor dat afschriften in chronologische volgorde worden ingelezen.
3. **Parsen** -- Leest elk CSV-bestand in met puntkomma (`;`) als scheidingsteken. Dit is het standaardformaat van de SKG-export.
4. **Headerrij overslaan** -- De eerste rij van elke CSV (kolomkoppen) wordt verwijderd.
5. **Toevoegen aan sheet** -- De data wordt onderaan het doeltabblad geplakt. Google Sheets herkent automatisch getallen en datums op basis van de locale-instellingen van de sheet.
6. **Verplaatsen** -- Het verwerkte CSV-bestand wordt verplaatst naar de submap `Ingelezen CSV's`, zodat het niet opnieuw wordt ingelezen.
7. **Melding** -- Na afloop verschijnt een melding "Import voltooid". Als er geen CSV's zijn, verschijnt "Geen CSV's gevonden".

## Deduplicatie (test-versie)

De functies `importCSVTestWijkkas()` en `importCSVTestExploitatie()` werken identiek maar met deduplicatie: dubbele regels worden overgeslagen, en afschriftnummers worden bijgewerkt als een mutatie eerder zonder afschriftnummer was geimporteerd.

## Aandachtspunten

- Het script leest **alle** CSV's in de bronmap in een keer in. Zorg dat daar alleen bestanden staan die daadwerkelijk geimporteerd moeten worden.
- Het scheidingsteken is hardcoded op puntkomma (`;`). Als SKG ooit een ander exportformaat gebruikt, moet het script aangepast worden.
