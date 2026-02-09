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

## Scripts

- Bij nieuwe scripts: gebruik configuratie (Script Properties, env vars) voor IDs en paden vanaf het begin, niet hardcoded waarden.
