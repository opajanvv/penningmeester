# Name masking in het codeerproces

Bij het coderen van boekingen worden mutaties uit Google Sheets geexporteerd en aan Claude aangeboden. Persoonsnamen worden daarbij gemaskeerd om privacy te waarborgen: ze worden vervangen door het woord "persoon". Organisatienamen blijven zichtbaar omdat die nodig zijn voor correcte codering.

## Waar is masking actief?

| Sheet | exportOngecodeerd | exportGecodeerd | Reden |
|---|---|---|---|
| Wijkkas | Ja | Ja | Merendeel van boekingen is van/naar particulieren (giften, collectebonnen) |
| Exploitatie | Nee | Nee | Merendeel van boekingen is van/naar bedrijven en stichtingen |

## Hoe werkt het?

De functie `isOrganisatie(naam, organisatieLijst)` bepaalt of een naam een organisatie is. Als dat niet het geval is, wordt de naam vervangen door "persoon".

Herkenning gaat op twee manieren:

1. **Trefwoorden** — als de naam een van deze trefwoorden bevat, is het een organisatie:
   - `b.v.`, `stichting`, `gemeente`, `diaconie`, `fonds`, `genootschap`, `dienstenorganisatie`, `fa.`
   - `kerk` en `bv` worden met woordgrens-matching herkend (zodat "Kerkhof" geen match is)

2. **Organisatielijst** — een lijst van specifieke organisatienamen die niet via trefwoorden herkend worden. Deze staat opgeslagen in Script Properties onder de sleutel `organisaties`.

## Organisatielijst beheren

De organisatielijst wordt beheerd via de functie `setupOrganisaties()` in `codering-wijkkas.gs`. Deze functie slaat een JSON-array op in Script Properties.

Nieuwe organisatie toevoegen:
1. Open de Apps Script-editor in de Wijkkas-sheet
2. Voeg de naam toe aan de array in `setupOrganisaties()`
3. Voer `setupOrganisaties()` uit om de lijst op te slaan

## Voorbeeld

Invoer uit het Journaal:
```
Rij 42: omschrijving="Collectebonnen", naam="Piet Jansen"
Rij 43: omschrijving="Factuur verhuur", naam="Beukers Bouwt"
```

Na export met masking:
```
42|Collectebonnen, persoon
43|Factuur verhuur, Beukers Bouwt
```
