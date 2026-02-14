# Import met deduplicatie testen

## Context

Naast de tweewekelijkse afschriften wil Jan ook tussentijdse mutatieoverzichten kunnen importeren. Die bevatten dezelfde transacties, maar zonder afschriftnummer (kolom 1-2 leeg). Bij overlap moet de import dubbelen overslaan.

## Wat is gedaan

- `importCSVTest()` toegevoegd aan `scripts/import-csv.gs` (onder de bestaande `importCSV()` die ongewijzigd blijft)
- Hulpfunctie `buildKey_()` maakt een deduplicatiesleutel op basis van kolommen die niet veranderen tussen mutatie- en afschriftexport: rekeningnummer, datum, bedrag, tegenrekening, omschrijving
- Normaliseert datums (Date vs string) en bedragen (number vs Nederlandse kommanotatie) zodat vergelijking werkt tussen bestaande sheetdata en nieuwe CSV-strings
- Bij match: als de nieuwe rij wel een afschriftnummer heeft en de bestaande niet, wordt het afschriftnummer bijgewerkt
- Alert toont aantallen: nieuw / bijgewerkt / overgeslagen

## Nog te doen

1. **Test `importCSVTest`** met het mutatieoverzicht (`~/Downloads/Mutatieoverzicht.csv`):
   - Upload naar de importmap in Drive
   - Draai `importCSVTest` vanuit Apps Script
   - Controleer: regels zonder afschriftnummer (2-6 feb) moeten nieuw zijn, regels van afschrift 1 en 2 (10-29 jan) moeten overgeslagen worden
   - Upload hetzelfde bestand nogmaals → alles overgeslagen, 0 nieuw
2. **Als het werkt**: `importCSV()` vervangen door de nieuwe versie en `importCSVTest()` verwijderen
3. **Documentatie bijwerken**: `docs/technisch/csv-import-script.md` aanpassen met deduplicatiegedrag
4. **Wekelijkse checklist bijwerken**: In `docs/checklists/wekelijkse-taken.md` mutaties importeren toevoegen als stap (naast afschriften)
