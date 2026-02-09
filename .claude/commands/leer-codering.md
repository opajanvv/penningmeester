# leer-codering

Input: $ARGUMENTS

## Doel

Werk de patronen in een coderen-skill bij op basis van gecorrigeerde boekingen. Dit zorgt ervoor dat Claude bij de volgende batch betere codes toewijst.

## Gebruik

```
/leer-codering wijkkas
23|305|Vaste kosten voor 2026 - Rekening-courant
24|210|Wijkkas, M. Kuyvenhoven-Kok
27|210|W. Triemstra e/o B. Triemstra-Wagenaar
67|205|Nepal, J.C. Duim-van Harn
```

Input komt uit het Apps Script `exportGecodeerd()` in de Google Sheet. Dit exporteert de laatste batch met definitieve codes na correctie door de penningmeester.

Formaat per regel: `rijnummer|code|omschrijving, naam`

Het eerste woord na `/leer-codering` geeft aan welke skill bijgewerkt moet worden:
- `wijkkas` -> `.claude/commands/coderen-wijkkas.md`
- `exploitatie` -> `.claude/commands/coderen-exploitatie.md`

## Instructies

1. Lees de huidige skill (`.claude/commands/coderen-wijkkas.md` of `coderen-exploitatie.md`).
2. Vergelijk elke regel uit de input met de bestaande patronen in de skill.
3. Identificeer **nieuwe patronen** -- boekingen die niet door de bestaande patronen gedekt worden:
   - Nieuwe trefwoorden in omschrijvingen
   - Nieuwe tegenpartij-namen
   - Nieuwe combinaties die tot een specifieke code leiden
4. Identificeer **correcties** -- gevallen waar de bestaande patronen tot een verkeerde code zouden leiden.
5. Stel concrete wijzigingen voor aan de patroontabellen in de skill.
6. Voer de wijzigingen door na bevestiging door Jan.

## Wat niet aanpassen

- De structuur van de skill (secties, output-formaat, etc.)
- Codes of codenamen (die komen uit het officiele coderingsschema)
- Patronen die al correct werken

## Voorbeeld

Als de input `67|205|Nepal, J.C. Duim-van Harn` bevat, en code 205 (Doorzendcollectes BK) heeft als patroon "doorzendcollecte, Thermo Libanon, diaconie (doorzending)", dan stel voor om "Nepal" toe te voegen:

```
| 205 | Doorzendcollectes BK | doorzendcollecte, Thermo Libanon, diaconie (doorzending), Nepal |
```

## Belangrijk

- Voeg alleen patronen toe die generaliseerbaar zijn (niet eenmalige uitzonderingen).
- Bij twijfel: vraag Jan of het patroon structureel is of een uitzondering.
- Blijf in het **Nederlands**.
