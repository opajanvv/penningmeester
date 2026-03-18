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
| Kolommenbalans | SUMIF over alle bovenstaande tabbladen + Kas + Verhuur en Buffet |
| Jaarcijfers | Rapportage |
| Kas | Contant/Zettle kasboek |
| Verhuur en Buffet | Factuuroverzicht |
| Grootboekschema | Gecombineerde codelijst (129 codes, 198 verwijderd) |

### Journaal-kolomindeling

| Kolom | Inhoud | Bron |
|-------|--------|------|
| A | Grootboekcode | Leeg bij import, gevuld door codering |
| B | Grootboekrekening | VLOOKUP naar Grootboekschema |
| C | Afschriftnr | CSV kolom 1 |
| D | Datum | CSV kolom 3 |
| E | Bij | CSV bedrag als positief (ontvangst) |
| F | Af | CSV bedrag als negatief, opgeslagen als positief (uitgave) |
| G | Omschrijving | CSV kolom 10 |
| H | Naam Tegenpartij | CSV kolom 7 |
| I | Toelichting | Voor correcties/vraagposten |

Data begint op rij 8.

### Overige beslissingen

- **Code 198** (sluitrekening) vervalt
- **Name-masking** vervalt (namen gaan ongemaskeerd naar Claude)
- **Een `/coderen` command** vervangt `/coderen-wijkkas` + `/coderen-exploitatie`
- **Coderingsfuncties** werken op het actieve tabblad (gebruiker navigeert naar het juiste Journaal)

## Wat is klaar

### Scripts (getest en werkend)

- `scripts/import-csv.gs` — CSV direct naar Journaal-tabblad
  - Folder-ID's als constanten (Script Properties werkten niet)
  - Verwerkt bestand per bestand (schrijven + verplaatsen per CSV)
  - Deduplicatie, per-file reversal, VLOOKUP-formule, euronotatie
- `scripts/codering.gs` — handmatige export/import functies (fallback)
  - `exportOngecodeerd()`, `importGecodeerd()`, `verwerkImport()`, `exportGecodeerd()`
- `scripts/auto-codering.gs` — automatisch coderen + patronen bijwerken via Anthropic API
  - Menu "Boekhouding" met "CSV importeren" en "Patronen bijwerken"
  - Model configureerbaar via Script Property `ANTHROPIC_MODEL` (default Haiku, Jan gebruikt Sonnet)
  - Patronen uit tabblad "Coderingspatronen"

### Commands en documentatie

- `.claude/commands/coderen.md` — gecombineerd codering-command
- `.claude/commands/leer-codering.md` — bijgewerkt (verwijst naar `/coderen`)

### Verwijderd

- `scripts/codering-wijkkas.gs`, `scripts/codering-exploitatie.gs`
- `.claude/commands/coderen-wijkkas.md`, `.claude/commands/coderen-exploitatie.md`
- Code 198 uit `docs/referentie/coderingsschema.md`

## Huidige status (2026-03-11)

CSV-import, automatisch coderen en patronen bijwerken zijn gebouwd en getest voor beide rekeningen. Kolommenbalans-script is gebouwd en wordt fijngetuned.

### Klaar
- `scripts/import-csv.gs` — CSV-import per bestand, silent-mode, verplaatsen naar ingelezen
- `scripts/codering.gs` — handmatige export/import functies (fallback)
- `scripts/auto-codering.gs` — menu "Boekhouding" met CSV importeren + Patronen bijwerken
- `scripts/kolommenbalans.gs` — bouwt Kolommenbalans op vanuit Grootboekschema (herhaaldbaar, getest en klaar)
- Codering getest met Sonnet 4.6 (configureerbaar via Script Property `ANTHROPIC_MODEL`)
- Patronen bijwerken getest en werkend

### In uitvoering
- Beginbalans-tabblad invullen (handmatig, eindbalans vorig jaar)

### Geleerde lessen Apps Script
- `setFormula()`: Engelse functienamen + puntkomma's als scheidingsteken (NL-locale)
- `setNumberFormat()`: altijd internationale notatie (punt=decimaal, komma=duizendtal)
- `getNumberFormat()` op een bestaande cel gebruiken om het exacte formaat te achterhalen
- Folder-ID's hardcoded in constanten (Script Properties werkten niet)

## Nog te doen

1. **Beginbalans** invullen (apart tabblad, handmatig vanuit eindbalans vorig jaar)
2. **Memoriaal** vullen — correcties, handmatige boekingen
3. **Kas en Verhuur/Buffet** inrichten (tellen later mee in Kolommenbalans via KB_BRONNEN)
4. **Jaarcijfers** — rapportage-tabblad opzetten
4. **Documentatie bijwerken**:
   - `docs/technisch/ontwerp-boekhouding-2026.md` — definitieve structuur
   - `docs/technisch/csv-import-script.md` — schrijft naar Journaal i.p.v. SKG
   - `docs/processen/bankafschriften-importeren.md` — geen SKG-tabbladen meer
   - Kolommenbalans-formules documenteren
5. **Committen en mergen** naar main
6. **Oude sheets** archiveren
