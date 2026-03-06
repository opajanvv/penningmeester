# Plan: samenvoegen wijkkas en exploitatie in een sheet

**Status**: gepland, nog niet gestart

## Huidige situatie

Twee aparte Google Sheets met identieke structuur:
- **Wijkkas 2026**: Jaarcijfers, Kolommenbalans, Journaal, SKG
- **Exploitatie 2026**: Jaarcijfers, Kolommenbalans, Journaal, Kas, Verhuur&Buffet

Elke sheet heeft eigen grootboekcodes die **niet overlappen**:
- Wijkkas: 199, 210-407 (giften, collectes, gemeentewerk)
- Exploitatie: 140-600 (verhuur, buffet, onderhoud)

Ze zijn al verbonden via code 198 (sluitrekening) voor de gecombineerde jaarrekening.

## Boekhoudkundig oordeel

**Dit is een goed idee.** Het is boekhoudkundig zelfs de meer gangbare aanpak. De Lichtbron is een entiteit met twee bankrekeningen — in de boekhouding is het normaal om meerdere bankrekeningen in een administratie te voeren, elk als eigen grootboekrekening.

De huidige scheiding in twee sheets is een technische keuze, geen boekhoudkundige noodzaak. De sluitrekening 198 is eigenlijk een workaround om twee losse administraties achteraf te combineren.

### Voordelen

1. **Een bron van waarheid** — geen dubbele sluitrekeningen, geen synchronisatieproblemen
2. **Kolommenbalans en jaarrekening automatisch over het geheel** — geen handmatige consolidatie
3. **Minder onderhoud** — formules, structuur en tabbladen maar 1x beheren
4. **Kruisposten direct zichtbaar** — overboekingen tussen rekeningen zijn gewoon journaalposten
5. **Rapportage per deelgebied blijft werken** — grootboekcodes overlappen niet, dus filteren op code-range geeft dezelfde inzichten als nu

### Aandachtspunten

1. **Journaal wordt groter** — meer regels, maar functioneel geen probleem in Google Sheets
2. **Twee SKG-tabbladen** — import per bankrekening, maar beide voeden hetzelfde journaal
3. **Extra tabbladen exploitatie** — Kas en Verhuur&Buffet moeten mee, ze hebben geen equivalent in wijkkas
4. **Name-masking verschilt** — wijkkas maskeert persoonsnamen voor Claude, exploitatie niet. In een journaal moet Claude alle namen zien of alle namen gemaskeerd krijgen. Oplossing: maskeren bij export naar Claude (zoals nu), niet in de sheet zelf.
5. **Coderingsproces** — de twee `/coderen-*` commands kunnen samengevoegd tot een, of blijven gescheiden per SKG-tabblad. De grootboekcodes zijn al uniek, dus samenvoegen is technisch mogelijk.
6. **Migratiepad** — 2026 is al bezig. Samenvoegen kan per nieuw boekjaar (2027) of halverwege met data-migratie.

### Risico's

- **Complexiteit van de migratie** — alle formules, VLOOKUP's, en Apps Script functies moeten aangepast
- **Terugvallen wordt lastig** — eenmaal samengevoegd is splitsen veel werk
- **Debiteuren-sheet** — hangt nu aan exploitatie, moet mee in de nieuwe structuur

## Besluit

Samenvoegen voor 2026 — geen externe vereisten, rapportage is intern, en het jaar is pas twee maanden oud. Afschriften worden opnieuw ingelezen. Op termijn kan zelfs een bankrekening worden opgeheven.

## Implementatieplan

### Stap 1: nieuwe sheet-structuur ontwerpen

Een Google Sheet "Boekhouding 2026" met tabbladen:

| Tabblad | Bron | Toelichting |
|---------|------|-------------|
| SKG Wijkkas | nieuw | Import bankafschriften wijkkas-rekening |
| SKG Exploitatie | nieuw | Import bankafschriften exploitatie-rekening |
| Journaal | samengevoegd | Alle boekingen, beide rekeningen |
| Kolommenbalans | samengevoegd | Automatisch over alle codes |
| Jaarcijfers | samengevoegd | Een overzicht |
| Kas | van exploitatie | Contant/Zettle, blijft nodig |
| Verhuur&Buffet | van exploitatie | Factuuroverzicht, blijft nodig |

### Stap 2: grootboekcodes opschonen

- Code **198** (sluitrekening) is niet meer nodig — vervalt
- Code **199** (kruisposten) blijft voor overboekingen naar/van spaarrekeningen
- Overige codes overlappen niet en kunnen ongewijzigd mee
- Optioneel: codes hernummeren zodat wijkkas en exploitatie in logische ranges vallen (maar niet strikt nodig)

### Stap 3: sheet bouwen (Jan, handmatig)

1. Nieuwe sheet aanmaken of een van de twee hergebruiken
2. Tabbladen inrichten met formules (VLOOKUP, kolommenbalans)
3. Beide SKG-exports inlezen in de twee SKG-tabbladen
4. Controleren dat kolommenbalans klopt

### Stap 4: Apps Script aanpassen (Claude)

- `scripts/codering.gs`: `exportOngecodeerd` en `importGecodeerd` moeten werken met twee SKG-tabbladen in een sheet
- `scripts/import-csv.gs`: CSV import moet weten welk SKG-tabblad het doel is
- Script Properties updaten voor de nieuwe sheet ID

Concreet:
- Neem `codering-exploitatie.gs` als basis (geen name-masking)
- De functies werken al op "Journaal" — dat blijft hetzelfde
- Verwijder `isOrganisatie`, `laadOrganisaties`, `setupOrganisaties` uit het script
- In `import-csv.gs`: maak sheetnaam configureerbaar via Script Properties (of twee functies)

### Stap 5: codering-commands samenvoegen (Claude)

Een `/coderen` command dat alle ongecodeerde regels behandelt. De grootboekcodes zijn al uniek, dus alle patronen en leveranciers kunnen samengevoegd in een bestand.

- Nieuw: `.claude/commands/coderen.md` (samenvoeging van wijkkas + exploitatie patronen)
- Verwijderen: `.claude/commands/coderen-wijkkas.md` en `.claude/commands/coderen-exploitatie.md`
- Bijwerken: `.claude/commands/leer-codering.md` (verwijst naar nieuw bestand)

### Stap 6: name-masking verwijderen

Maskering wordt achterwege gelaten. Naar Claude gaan alleen omschrijving + tegenpartijnaam (geen rekeningnummers, adressen, bedragen). De `isOrganisatie`-logica, `laadOrganisaties`, en `setupOrganisaties` functies worden verwijderd uit het Apps Script.

Documentatie bijwerken:
- `docs/technisch/name-masking.md` — verwijderen of vervangen door uitleg waarom het niet meer nodig is

### Stap 7: documentatie bijwerken (Claude)

- `docs/referentie/coderingsschema.md` — code 198 verwijderen
- `docs/processen/bankafschriften-coderen.md` — nieuw proces (een command i.p.v. twee)
- `docs/processen/bankafschriften-importeren.md` — een sheet i.p.v. twee
- `docs/checklists/wekelijkse-taken.md` — verwijzingen updaten
- `docs/technisch/name-masking.md` — verwijderen of archiveren
- `docs/technisch/csv-import-script.md` — updaten
- `scripts/README.md` — een script i.p.v. twee
- `.claude/CLAUDE.md` — sheet-referenties en commands updaten
- `MEMORY.md` — structuurwijzigingen

### Stap 8: oude sheets archiveren (Jan)

Wijkkas 2026 en Exploitatie 2026 markeren als "vervangen" maar bewaren als referentie.

## Volgorde en rolverdeling

| Stap | Wie | Afhankelijk van |
|------|-----|-----------------|
| 1 | Samen | — |
| 2 | Samen | — |
| 3 | Jan | 1, 2 |
| 4 | Claude | 3 |
| 5 | Claude | 2 |
| 6 | Samen | 3 |
| 7 | Claude | 3, 4, 5 |
| 8 | Jan | 3 |
