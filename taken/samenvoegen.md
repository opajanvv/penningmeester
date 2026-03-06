# Plan: samenvoegen wijkkas en exploitatie in een sheet

**Status**: scripts klaar, Jan bouwt de Google Sheet

**Branch**: `samenvoegen` (main is ongewijzigd, oude workflow werkt daar nog)

## Beslissingen genomen

### Sheet-structuur (herzien)

Het oorspronkelijke plan had SKG-tabbladen die via celverwijzingen naar een Journaal spiegelden. Dat werkt niet met twee SKG-tabbladen naar een enkel Journaal. Na bespreking is gekozen voor een andere aanpak:

**SKG-tabbladen vervallen.** De CSV-import schrijft direct naar de Journaal-tabbladen. De ruwe CSV-data wordt bewaard in Google Drive (het import-script verplaatst verwerkte CSV's naar "Ingelezen CSV's"). Volledige afschriften staan als PDF in Drive en zijn na te kijken in SKG Online.

**Twee journaaltabbladen** (geen een). Redenen:
- Rijnummers blijven stabiel per rekening (belangrijk voor het coderingsproces)
- Deduplicatie bij CSV-import werkt per tabblad, geen conflicten
- Bij het opheffen van een rekening is het simpelweg een tabblad weghalen
- De Kolommenbalans somt over beide journalen + memoriaal

### Tabbladen in de nieuwe sheet

| Tabblad | Inhoud |
|---------|--------|
| Journaal Wijkkas | CSV-import + codering (was: SKG + Journaal) |
| Journaal Exploitatie | CSV-import + codering |
| Memoriaal | Beginbalansen, correcties, handmatige boekingen |
| Kolommenbalans | SUMIF over alle drie bovenstaande tabbladen |
| Jaarcijfers | Rapportage |
| Kas | Contant/Zettle kasboek |
| Verhuur en Buffet | Factuuroverzicht |
| Grootboekschema | Gecombineerde codelijst (129 codes, 198 verwijderd) |

### Journaal-kolomindeling

| Kolom | Inhoud | Bron |
|-------|--------|------|
| A | Grootboekcode | Leeg bij import, gevuld door codering |
| B | Naam rekening | VLOOKUP naar Grootboekschema |
| C | Datum | CSV kolom 3 |
| D | Bron | "SKG" (automatisch bij import) |
| E | Debet | CSV bedrag als negatief |
| F | Credit | CSV bedrag als positief |
| G | Omschrijving | CSV kolom 10 |
| H | Afschriftnummer | CSV kolom 1 |
| I | Naam begunstigde | CSV kolom 7 |
| M | Toelichting | Voor correcties/vraagposten |

Rij 1 = titel, data begint op rij 4.

### Overige beslissingen

- **Code 198** (sluitrekening) vervalt
- **Name-masking** vervalt (namen gaan ongemaskeerd naar Claude)
- **Een `/coderen` command** vervangt `/coderen-wijkkas` + `/coderen-exploitatie`
- **Coderingsfuncties** werken op het actieve tabblad (gebruiker navigeert naar het juiste Journaal)

## Wat is klaar (op branch `samenvoegen`)

### Scripts (klaar, nog niet getest in Google Sheets)

- `scripts/codering.gs` -- export/import functies werken op actief Journaal-tabblad
  - `exportOngecodeerd()` -- filtert ongecodeerde rijen
  - `importGecodeerd()` -- slaat actief tabblad op, dialoog voor import
  - `verwerkImport(tekst)` -- zet codes in kolom A, opmerkingen in kolom M
  - `exportGecodeerd()` -- exporteert correcties uit kolom M
  - `getActiveJournaal_()` -- valideert dat actief tabblad een Journaal is
- `scripts/import-csv.gs` -- CSV direct naar Journaal-tabblad
  - `importCSVWijkkas()` / `importCSVExploitatie()` -- entry-functies
  - `importCSV_()` -- leest CSV, mapt kolommen naar journaalformaat, deduplicatie, vult VLOOKUP
  - `csvToJournaal_()` -- kolommapping CSV -> journaal
  - `buildKeyFromCSV_()` / `buildKeyFromJournaal_()` -- deduplicatiesleutels
  - Script Properties: `importFolderIdWijkkas`, `processedFolderIdWijkkas`, `importFolderIdExploitatie`, `processedFolderIdExploitatie`

### Commands en documentatie (klaar)

- `.claude/commands/coderen.md` -- gecombineerd codering-command
- `.claude/commands/leer-codering.md` -- bijgewerkt (verwijst naar `/coderen`)
- `docs/technisch/ontwerp-boekhouding-2026.md` -- ontwerpdocument (deels achterhaald door herziene structuur)
- Alle docs bijgewerkt (bankafschriften-coderen, bankafschriften-importeren, csv-import-script, name-masking, coderingsschema, wekelijkse-taken, scripts/README, .claude/CLAUDE.md)

### Verwijderd

- `scripts/codering-wijkkas.gs`, `scripts/codering-exploitatie.gs`
- `.claude/commands/coderen-wijkkas.md`, `.claude/commands/coderen-exploitatie.md`
- Code 198 uit `docs/referentie/coderingsschema.md`

## Wat Jan moet doen

1. **Google Sheet aanmaken** met de tabbladen uit de tabel hierboven
2. **Grootboekschema** vullen (de xlsx in `taken/bronnen/boekhouding-2026.xlsx` bevat de gecombineerde codelijst, maar de sheet-structuur daarin is achterhaald)
3. **Journaal-tabbladen** inrichten: titel op rij 1, data vanaf rij 4
4. **Kolommenbalans** inrichten met SUMIF over "Journaal Wijkkas", "Journaal Exploitatie" en "Memoriaal"
5. **Scripts kopieren** naar Apps Script-editor (`codering.gs` + `import-csv.gs`)
6. **Script Properties** instellen (4 folder-ID's)
7. **CSV's importeren** en testen of de import + codering werkt
8. **Memoriaal** vullen (beginbalansen, correcties)
9. **Oude sheets** archiveren

## Nog te doen na testen

- `docs/technisch/ontwerp-boekhouding-2026.md` bijwerken met definitieve structuur (geen SKG-tabbladen meer)
- `docs/technisch/csv-import-script.md` bijwerken (schrijft naar Journaal i.p.v. SKG)
- `docs/processen/bankafschriften-importeren.md` bijwerken (geen SKG-tabbladen meer)
- Kolommenbalans-formules documenteren (SUMIF over drie tabbladen)
- Committen en eventueel mergen naar main
