# leer-codering

Input: $ARGUMENTS

## Doel

Werk de patronen in een coderen-skill bij op basis van gecorrigeerde boekingen. Dit zorgt ervoor dat Claude bij de volgende batch betere codes toewijst.

## Gebruik

```
/leer-codering wijkkas
27|210|W. Triemstra e/o B. Triemstra-Wagenaar|geen omschrijving, is gift
67|205|Nepal, J.C. Duim-van Harn|doorzendcollecte voor Nepal
50|300|declaratie borrel Communicatie-werkgroep, J van Veldhuizen|valt onder wijkkerkenraad
```

Input komt uit het Apps Script `exportGecodeerd()` in de Google Sheet. Dit exporteert alleen regels waar de penningmeester een toelichting in kolom M heeft gezet (correcties en opgeloste vraagposten).

Formaat per regel: `rijnummer|code|omschrijving, naam|toelichting`

De toelichting van de penningmeester geeft context over waarom deze code is gekozen.

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
5. Als de coderen skill de juiste code oplevert, dan hoeft er **niets** te gebeuren.
6. Als de coderen skill een andere code opelevert, Stel dan concrete wijzigingen voor aan de patroontabellen in de skill, zodat het volgende keer beter gaat.
7. Voer de wijzigingen door na bevestiging door Jan.

## Wat niet aanpassen

- De structuur van de skill (secties, output-formaat, etc.)
- Codes of codenamen (die komen uit het officiele coderingsschema)
- Patronen die al correct werken

## Voorbeeld

Als de input `67|205|Nepal, J.C. Duim-van Harn|doorzendcollecte voor Nepal` bevat, en code 205 (Doorzendcollectes BK) heeft als patroon "doorzendcollecte, Thermo Libanon, diaconie (doorzending)", dan stel voor om "Nepal" toe te voegen:

```
| 225 | Doorzichtcollecten | doorzendcollecte, Thermo Libanon, diaconie (doorzending), Nepal |
```

## Belangrijk

- Voeg alleen patronen toe die generaliseerbaar zijn (niet eenmalige uitzonderingen).
- Bij twijfel: vraag Jan of het patroon structureel is of een uitzondering.
- Blijf in het **Nederlands**.
