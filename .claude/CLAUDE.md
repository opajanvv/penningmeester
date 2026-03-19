# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Taal

- Alle communicatie in dit project is in het **Nederlands**.
- Ook als Jan per ongeluk een vraag in het Engels stelt, antwoordt toch in het Nederlands.

## Doel van dit project

- Dit project is bedoeld om **documentatie en werkinstructies** op te stellen voor de **penningmeester van De Lichtbron**.
- Houd teksten praktisch, concreet en toepasbaar voor de penningmeester.

## Werkafspraken

- Geef waar mogelijk **korte, bondige antwoorden** met duidelijke stappen.
- Gebruik, waar relevant, voorbeelden die passen bij het werk van een penningmeester (zoals begroting, jaarrekening, declaraties, contributie, enz.).
- Respecteer de globale werkstijlregels uit `~/.claude/CLAUDE.md` en vul die in dit project praktisch in.

## Werkwijze en structuur

- Documentatie en instructies worden stap voor stap opgebouwd als **Markdown-bestanden** in `docs/`.
- Schrijf direct naar de definitieve locatie in `docs/`. Vermijd tussenstappen (staging areas, draft-folders) die geen review toevoegen.
- Ruwe input (notities, schermafdrukken, exports, losse ideeën) gaat naar `inbox/`. Als er iets in `inbox/` staat, gebruik dan eerst de `/inbox` skill om deze te verwerken.
- Voor uitzoektaken en lopende vragen is er een map `taken/`.
- De mappenstructuur mag uitgebreid of aangepast worden als dat helpt om informatie beter terug te vinden.
- Bij het ordenen mag bestanden hernoemd en verplaatst worden, maar **de inhoud blijft altijd behouden**.
- Bij verplaatsen of verwijderen van bestanden: controleer verwijzingen in `.claude/commands/` en documentatie.

## Commands

Dit project heeft 7 commands in `.claude/commands/`. Ze vallen in drie groepen:

### Documentatie bijwerken

- `/inbox` — Verwerk ruwe notities uit `inbox/` naar `docs/`. Eenvoudige items direct, onduidelijke met vragen, complexe onderwerpen promoveren naar interview-backlog.
- `/interview` — Verzamel kennis via een interviewproces. Stelt gerichte vragen, werkt docs bij, houdt een backlog bij in `docs/interview-backlog.md`. Zoek altijd eerst in `docs/` of het onderwerp al (deels) gedocumenteerd is voordat je een vraag stelt.

### Takenbeheer

- `/kies` — Analyseer de takenlijst en stel een top-3 voor om op te pakken.
- `/doe <code>` — Start een taak als sparringpartner. Beantwoord vragen, help bij obstakels.
- `/refine` — Verfijn alle taken met `[⚠]` tot ze uitvoerbaar zijn (`[ ]`).

### Coderen (boekhouding)

- `/coderen` — Wijs grootboekcodes toe aan ongecodeerde boekingen (wijkkas en exploitatie gecombineerd).
- `/leer-codering` — Verwerk correcties om de coderingspatronen te verbeteren.

### Typische workflow

1. `/inbox` — Verwerk nieuwe notities en input
2. `/kies` — Kies een taak om op te pakken
3. `/refine` — Verfijn de taak indien nodig
4. `/doe <code>` — Werk de taak uit
5. `/coderen` — Codeer nieuwe boekingen
6. `/leer-codering` — Verbeter patronen na correcties
7. `/interview` — Vul ontbrekende kennis aan

## Sheet-referenties

- **Sheet**: Boekhouding 2026 (samenvoeging wijkkas + exploitatie)
- **Tabbladen**: Journaal Wijkkas, Journaal Exploitatie, Memoriaal, Beginbalans, Grootboekschema, Kolommenbalans, Jaarcijfers, Kas, Verhuur&Buffet
- **Lokale exports**: `taken/bronnen/` -- Jan exporteert als een taak inzicht in de sheet vereist

## Grootboekschema

- `grootboekschema.csv` is de bron van waarheid voor alle grootboekcodes. Formaat: `code,naam,bron,zijde`
- **bron**: `W` = wijkkas, `E` = exploitatie
- **zijde**: `A` = activa, `P` = passiva, `B` = baten, `L` = lasten, `X` = kruisposten/vraagposten
- Codes 30-36 zijn groepskoppen (L met num < 100) en worden overgeslagen in Kolommenbalans en Jaarcijfers
- Volledige documentatie van codes en hun betekenis: `docs/referentie/coderingsschema.md`

## Scripts (Google Apps Script)

Alle scripts staan in `scripts/` en draaien in de Google Apps Script-editor van de Boekhouding 2026 sheet.

### Architectuur

```
import-csv.gs          CSV-bestanden uit Google Drive importeren naar journaaltabbladen
auto-codering.gs       Menu (onOpen), importeren + auto-coderen via Anthropic API
codering.gs            Export/import van codes voor handmatige codering via /coderen
kolommenbalans.gs      Kolommenbalans opbouwen vanuit Grootboekschema + journaaltabbladen
jaarcijfers.gs         Jaarcijfers (balans + resultatenrekening) opbouwen
```

### Conventies

- Bij nieuwe scripts: gebruik configuratie (Script Properties, env vars) voor IDs en paden vanaf het begin, niet hardcoded waarden.
- Name-masking is niet meer actief. Namen gaan ongemaskeerd naar Claude (nodig voor correcte codering).
- Data in journaaltabbladen begint op **rij 8** (niet 10).
- `setFormula()`: gebruik Engelse functienamen + puntkomma's als scheidingsteken (NL-locale in Google Sheets).
- `setNumberFormat()`: altijd internationale notatie (punt=decimaal, komma=duizendtal).
- Euro-format: `_ [$€-2]\ * #,##0.00_ ;_ [$€-2]\ * \-#,##0.00_ ;_ [$€-2]\ * \-??_ ;_ @_ `
- Codes uit Grootboekschema: neem het originele datatype over (`gsData[i][0]`), niet converteren naar String. Puur numerieke codes (zoals 196) worden anders tekst en matchen niet meer in VLOOKUP/SUMIF.
- Kolommenbalans en Jaarcijfers zijn herlaadbaar: ze maken het tabblad eerst leeg en bouwen het opnieuw op.
- Grootboeknamen in Kolommenbalans en Jaarcijfers zijn VLOOKUP-formules naar het Grootboekschema, geen hardcoded tekst.
