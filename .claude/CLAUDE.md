# Project: penningmeester-documentatie

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

Dit project heeft 8 commands in `.claude/commands/`. Ze vallen in drie groepen:

### Documentatie bijwerken

- `/inbox` — Verwerk ruwe notities uit `inbox/` naar `docs/`. Eenvoudige items direct, onduidelijke met vragen, complexe onderwerpen promoveren naar interview-backlog.
- `/interview` — Verzamel kennis via een interviewproces. Stelt gerichte vragen, werkt docs bij, houdt een backlog bij in `docs/interview-backlog.md`.

### Takenbeheer

- `/kies` — Analyseer de takenlijst en stel een top-3 voor om op te pakken.
- `/doe <code>` — Start een taak als sparringpartner. Beantwoord vragen, help bij obstakels.
- `/refine` — Verfijn alle taken met `[⚠]` tot ze uitvoerbaar zijn (`[ ]`).

### Coderen (boekhouding)

- `/coderen-wijkkas` — Wijs grootboekcodes toe aan ongecodeerde wijkkas-boekingen.
- `/coderen-exploitatie` — Wijs grootboekcodes toe aan ongecodeerde exploitatie-boekingen.
- `/leer-codering <wijkkas|exploitatie>` — Verwerk correcties om de coderingspatronen te verbeteren.

### Typische workflow

1. `/inbox` — Verwerk nieuwe notities en input
2. `/kies` — Kies een taak om op te pakken
3. `/refine` — Verfijn de taak indien nodig
4. `/doe <code>` — Werk de taak uit
5. `/coderen-wijkkas` of `/coderen-exploitatie` — Codeer nieuwe boekingen
6. `/leer-codering` — Verbeter patronen na correcties
7. `/interview` — Vul ontbrekende kennis aan

## Scripts

- Bij nieuwe scripts: gebruik configuratie (Script Properties, env vars) voor IDs en paden vanaf het begin, niet hardcoded waarden.
- Bij nieuwe export-functies in Apps Script: name-masking is standaard vereist. Persoonsnamen worden gemaskeerd voordat data naar Claude gaat.
- Bij nieuwe features die zowel wijkkas als exploitatie raken: ontwerp eerst de gedeelde structuur, bouw dan de varianten. Voorkom achteraf splitsen.
