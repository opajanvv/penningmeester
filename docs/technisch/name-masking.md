# Name masking (niet meer actief)

Voorheen werden persoonsnamen in de wijkkas-export gemaskeerd als "persoon" voordat data naar Claude ging. Dit gebeurde via de functies `isOrganisatie()`, `laadOrganisaties()` en `setupOrganisaties()` in `codering-wijkkas.gs`.

## Waarom is dit vervallen?

Bij de samenvoeging van de wijkkas- en exploitatie-sheets tot "Boekhouding 2026" is besloten name-masking te laten vervallen:

1. **Namen zijn essentieel voor codering** -- tegenpartijnamen zijn het primaire herkenningspatroon voor veel codes (bijv. "Sligro" -> 450, "Care" -> 460)
2. **Geen gevoelige data** -- het Journaal bevat geen IBAN's, adressen of financiele details. Alleen namen, omschrijvingen en bedragen
3. **Onderhoudslast** -- de organisatielijst moest handmatig bijgehouden worden via `setupOrganisaties()`
4. **Inconsistentie** -- de exploitatie-sheet had al geen masking, wat tot verwarring leidde bij het samenvoegen
