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

## Huidige status (2026-03-19)

Alle scripts zijn gebouwd en getest. Jaarcijfers is het laatst bijgewerkt en wordt door Jan visueel gecontroleerd.

### Klaar
- `scripts/import-csv.gs` — CSV-import per bestand, silent-mode, verplaatsen naar ingelezen
- `scripts/codering.gs` — handmatige export/import functies (fallback)
- `scripts/auto-codering.gs` — menu "Boekhouding" met CSV importeren + Patronen bijwerken
- `scripts/kolommenbalans.gs` — herlaadbaar, VLOOKUP voor namen, gridlines verborgen
- `scripts/jaarcijfers.gs` — herlaadbaar, Balanspositie + Resultatenrekening, VLOOKUP voor namen, gridlines verborgen
- Codering getest met Sonnet 4.6 (configureerbaar via Script Property `ANTHROPIC_MODEL`)
- Patronen bijwerken getest en werkend
- `grootboekschema.csv` uitgebreid met kolom D: zijde (A/P/B/L/X)
- CLAUDE.md bijgewerkt met scriptarchitectuur en Apps Script conventies

### Beginbalans-tabblad layout
Het tabblad Beginbalans bevat twee secties:
- **Beginbalans** (balanscodes): A=code, E=debet, F=credit
- **Begroting/Jaar 2025** (V&W-codes): A=code, E=jaar 2025 lasten, F=jaar 2025 baten, G=spacer, H=begroting lasten, I=begroting baten

Jaarcijfers haalt Ultimo 2025 (balans) via SUMIF op E/F, begroting via SUMIF op H/I, jaar 2025 (V&W) via SUMIF op E/F. Geen overlap omdat balans- en V&W-codes disjunct zijn.

### Geleerde lessen Apps Script
- `setFormula()`: Engelse functienamen + puntkomma's als scheidingsteken (NL-locale)
- `setNumberFormat()`: altijd internationale notatie (punt=decimaal, komma=duizendtal)
- `getNumberFormat()` op een bestaande cel gebruiken om het exacte formaat te achterhalen
- Folder-ID's hardcoded in constanten (Script Properties werkten niet)
- Codes uit Grootboekschema overnemen met origineel datatype (`gsData[i][0]`), niet converteren naar String — anders falen VLOOKUP/SUMIF op puur numerieke codes (zoals 196)

## Nog te doen

1. **Beginbalans** invullen (handmatig vanuit eindbalans vorig jaar)
2. **Begroting + Jaar 2025** invullen in Beginbalans-tabblad (handmatig)
3. **Memoriaal** vullen — correcties, handmatige boekingen
4. **Kas en Verhuur/Buffet** inrichten (tellen mee in Kolommenbalans via KB_BRONNEN)
5. **Ongebruikte codes** verwijderen uit Grootboekschema (Jan bepaalt welke)
6. **Documentatie bijwerken**:
   - `docs/technisch/ontwerp-boekhouding-2026.md` — definitieve structuur
   - `docs/technisch/csv-import-script.md` — schrijft naar Journaal i.p.v. SKG
   - `docs/processen/bankafschriften-importeren.md` — geen SKG-tabbladen meer
   - Kolommenbalans- en Jaarcijfers-formules documenteren
7. **Committen en mergen** naar main
8. **Oude sheets** archiveren
