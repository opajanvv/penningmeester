# Ontwerp: Boekhouding 2026 (samengevoegde sheet)

## Tabbladen

| Tabblad | Bron | Toelichting |
|---------|------|-------------|
| SKG Wijkkas | nieuw | Bankafschriften wijkkas-rekening (PWG De Lichtbron) |
| SKG Exploitatie | nieuw | Bankafschriften exploitatie-rekening (PWG Bethlehemkerk) |
| Journaal | samengevoegd | Alle boekingen uit beide rekeningen + memoriaalposten |
| Kolommenbalans | samengevoegd | Automatisch over alle grootboekcodes |
| Jaarcijfers | samengevoegd | Een overzicht voor de jaarrekening |
| Kas | van exploitatie | Contant/Zettle kasboek |
| Verhuur&Buffet | van exploitatie | Factuuroverzicht verhuur en buffet |

## Kolomindeling

### SKG-tabbladen (Wijkkas en Exploitatie)

Identiek aan de huidige SKG-tabbladen. Kolommen komen rechtstreeks uit de SKG CSV-export:

| Kolom | Inhoud |
|-------|--------|
| A | Jaar afschriftnummer |
| B | Volgnummer afschrift |
| C | Rekeningnummer |
| D | Datum |
| E | Bedrag |
| F | Debet/Credit |
| G | Tegenrekeningnummer |
| H | Naam tegenpartij |
| I | Adres |
| J | Postcode |
| K | Plaats |
| L | Omschrijving |
| M-R | Overige velden (valuta, etc.) |

### Journaal

Identiek aan de huidige structuur:

| Kolom | Inhoud |
|-------|--------|
| A | Grootboekcode |
| B | Naam (VLOOKUP op code) |
| C | Datum |
| D | Bron (SKG/Memoriaal) |
| E | Debet |
| F | Credit |
| G | Omschrijving |
| H | Afschriftnummer |
| I | Naam begunstigde |
| M | Toelichting (voor correcties/vraagposten) |

### Kolommenbalans en Jaarcijfers

Ongewijzigd, maar nu automatisch over alle codes (wijkkas + exploitatie).

## Grootboekcodes

### Wijzigingen

| Code | Actie | Reden |
|------|-------|-------|
| 198 | **Vervalt** | Sluitrekening is niet meer nodig bij een gecombineerde administratie |
| 199 | Blijft | Kruisposten voor overboekingen tussen bankrekeningen en spaarrekeningen |

### Ranges

De codes overlappen niet:

| Range | Domein |
|-------|--------|
| 010-200 | Balansrekeningen (gedeeld) |
| 210-407 | Wijkkas (giften, collectes, gemeentewerk) |
| 400-600 | Exploitatie (verhuur, buffet, onderhoud) |

Overlap in het 400-bereik (407 wijkkas vs 400-412 exploitatie) is geen probleem: de codes zelf zijn uniek.

### Volledige codelijst

Zie [coderingsschema](../referentie/coderingsschema.md) voor alle codes. Na samenvoeging is code 198 de enige die vervalt.

## Formules

### VLOOKUP (kolom B Journaal)

Eén VLOOKUP-tabel met alle codes (wijkkas + exploitatie). Nu hoeft er geen aparte tabel per sheet te zijn.

### Kolommenbalans

De kolommenbalans sommeert per code over het hele Journaal. Dit werkt automatisch correct omdat alle boekingen in een tabblad staan.

## Apps Script

Eén set functies in de sheet:

| Functie | Doel |
|---------|------|
| `exportOngecodeerd()` | Exporteert ongecodeerde SKG-regels uit Journaal |
| `importGecodeerd()` | Importeert codes terug in Journaal |
| `verwerkImport(tekst)` | Backend voor importGecodeerd |
| `exportGecodeerd()` | Exporteert regels met correcties (kolom M) |
| `importCSV(tabblad)` | Importeert CSV's in het opgegeven SKG-tabblad |

Name-masking is niet meer nodig: namen gaan ongemaskeerd naar Claude omdat ze essentieel zijn voor correcte codering.

## Claude Code commands

| Command | Vervangt |
|---------|----------|
| `/coderen` | `/coderen-wijkkas` + `/coderen-exploitatie` |
| `/leer-codering` | Aangepast (verwijst naar `/coderen`) |
