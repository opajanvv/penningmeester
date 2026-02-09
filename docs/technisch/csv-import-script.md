# CSV-importscript (Apps Script)

Zowel de Wijkkas- als de Exploitatie-sheet hebben een Apps Script dat CSV-bankafschriften uit Google Drive importeert. De werking is identiek; het enige verschil zijn de folder-ID's bovenin het script.

## Waar zit het script?

Het script zit **in de Google Sheet zelf**:

1. Open de sheet (Wijkkas of Exploitatie)
2. Ga naar **Uitbreidingen > Apps Script**
3. Het script `importCSV` staat daar

De knop "CSV importeren" in de sheet roept deze functie aan.

## Hoe vind je de folder-ID's?

Het script gebruikt twee folder-ID's:

| Variabele | Map | Doel |
|-----------|-----|------|
| `folderId` | `Bankafschriften` | Bronmap waar nieuwe CSV's staan |
| `processedFolderId` | `Ingelezen CSV's` | Doelmap voor verwerkte CSV's |

Een folder-ID vind je door de map te openen in Google Drive en het laatste deel van de URL te kopieren:

```
https://drive.google.com/drive/folders/1qYuhNpnDJvzhZC9KVec3K-V89toiJmzG
                                        └─────────── dit is de folder-ID ──┘
```

De ID's zijn per sheet verschillend omdat Wijkkas en Exploitatie elk hun eigen mappenstructuur hebben in Google Drive.

## Wat doet het script?

1. **CSV's ophalen** -- Haalt alle bestanden van het type CSV op uit de bronmap.
2. **Sorteren** -- Sorteert de bestanden alfabetisch op bestandsnaam, zodat `Afschrift-...-2026001.csv` voor `Afschrift-...-2026002.csv` komt. Dit zorgt ervoor dat afschriften in chronologische volgorde worden ingelezen.
3. **Parsen** -- Leest elk CSV-bestand in met puntkomma (`;`) als scheidingsteken. Dit is het standaardformaat van de SKG-export.
4. **Headerrij overslaan** -- De eerste rij van elke CSV (kolomkoppen) wordt verwijderd.
5. **Toevoegen aan sheet** -- De data wordt onderaan het tabblad `SKG` geplakt. Google Sheets herkent automatisch getallen en datums op basis van de locale-instellingen van de sheet.
6. **Verplaatsen** -- Het verwerkte CSV-bestand wordt verplaatst naar de submap `Ingelezen CSV's`, zodat het niet opnieuw wordt ingelezen.
7. **Melding** -- Na afloop verschijnt een melding "Import voltooid". Als er geen CSV's zijn, verschijnt "Geen CSV's gevonden".

## Aandachtspunten

- Het script leest **alle** CSV's in de bronmap in een keer in. Zorg dat daar alleen bestanden staan die daadwerkelijk geimporteerd moeten worden.
- De data komt op het tabblad **SKG**. Als dat tabblad niet bestaat, geeft het script een fout.
- Het scheidingsteken is hardcoded op puntkomma (`;`). Als SKG ooit een ander exportformaat gebruikt, moet het script aangepast worden.
- Er is geen controle op dubbele imports. Het verplaatsen naar `Ingelezen CSV's` is het enige mechanisme dat dubbel inlezen voorkomt. Als je een CSV handmatig terugzet in de bronmap, wordt deze opnieuw ingelezen.
