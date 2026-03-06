# Bankafschriften coderen

Nieuwe SKG-boekingen in het Journaal krijgen nog geen grootboekcode. Dit proces wijst die codes toe via Claude, en importeert ze terug in de sheet.

Dit hoeft niet wekelijks -- mag een week worden overgeslagen.

De broncode van het script staat in `scripts/codering.gs`.

## Stap 1: Export ongecodeerde regels

1. Open de sheet **Boekhouding 2026**
2. Ga naar **Extensies > Apps Script-menu** bovenin de sheet
3. Kies **Exporteer ongecodeerd**
4. Het script filtert het Journaal op rijen met lege code (kolom A) en bron "SKG"
5. Er verschijnt een dialoog met regels in dit formaat:

```
42|Collectebonnen, J. de Vries
43|SKG Collect S265 - Batch 1688, SKG COLLECT
44|factuur schoonmaak periode 12, Care
```

6. Selecteer alles en kopieer

## Stap 2: Codes laten voorstellen door Claude

Plak de gekopieerde regels in Claude Code:

```
/coderen
42|Collectebonnen, J. de Vries
43|SKG Collect S265 - Batch 1688, SKG COLLECT
44|factuur schoonmaak periode 12, Care
```

Claude geeft twee blokken terug: een leesbaar overzicht en een **import-blok**.

Twijfelgevallen krijgen code **200** (Vraagposten) met een toelichting.

## Stap 3: Import-blok controleren

Controleer het leesbare overzicht. Pas in het import-blok codes aan als iets niet klopt. Het formaat is:

```
rijnummer|code|opmerking
```

De opmerking is alleen nodig bij code 200.

## Stap 4: Importeer de codes terug

1. Ga terug naar de sheet
2. Kies **Importeer gecodeerd** in het Apps Script-menu
3. Plak het import-blok in het dialoogvenster
4. Klik **Importeren**

De codes worden ingevuld in kolom A van het Journaal. Bij code 200 komt de opmerking in kolom M.

## Stap 5: Vraagposten oplossen

Boekingen met code 200 zijn nog niet definitief. Zoek de juiste code op via het [coderingsschema](../referentie/coderingsschema.md) en:

1. Zet de juiste code in kolom A
2. Schrijf een korte toelichting in **kolom M** (dit is ook input voor de leerslag)

## Stap 6: Leerslag (periodiek)

Na het verwerken van correcties en vraagposten kan Claude de coderingspatronen verbeteren. Dit hoeft niet elke keer -- doe het als er meerdere correcties zijn geweest.

1. Kies **Exporteer gecorrigeerd** in het Apps Script-menu
2. Dit exporteert alle regels met een toelichting in kolom M
3. Kopieer de output en geef die aan Claude:

```
/leer-codering
27|210|J. de Vries|geen omschrijving, is gift
67|225|Nepal, persoon|doorzendcollecte voor Nepal
```

Claude stelt voor welke patronen aan de coderingsregel worden toegevoegd.

## Gevoelige data

Het Journaal bevat geen IBAN's of adressen -- alleen namen, omschrijvingen en bedragen. Namen van tegenpartijen worden ongemaskeerd meegestuurd naar Claude omdat ze nodig zijn voor correcte codering (bijv. "Sligro" -> inkoop buffet, "Care" -> schoonmaak).

## Zie ook

- [Coderingsschema](../referentie/coderingsschema.md) -- overzicht van alle codes
- [Wekelijkse taken](../checklists/wekelijkse-taken.md)
