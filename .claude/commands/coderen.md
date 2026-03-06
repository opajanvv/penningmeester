# coderen

Input: $ARGUMENTS

## Doel

Bepaal de juiste grootboekrekening voor nieuwe boekingen op basis van omschrijving en tegenpartij. Alle codes (wijkkas en exploitatie) staan in een gecombineerde sheet "Boekhouding 2026".

## Gebruik

Input komt uit het Apps Script `exportOngecodeerd()` in de Google Sheet.
Elke regel heeft het formaat: `rijnummer|omschrijving, naam`

```
/coderen
23|Vaste kosten voor 2026 - Rekening-courant
24|Wijkkas, M. Kuyvenhoven-Kok
25|SKG Collect S265 - Batch 1688, SKG COLLECT
42|factuur schoonmaak periode 12, Care
43|parkeervergunning 11, Stichting Derdengelden Parkeer Service
```

Of zonder rijnummers voor losse invoer:
```
/coderen gift wijkkas, Hr Van Lambalgen
```

## Coderingsregels

### Wijkkas - Opbrengsten

| Code | Naam | Patroon |
|------|------|---------|
| 73 | Reservering Legaten | legaat, nalatenschap (let op: "Erven" in naam betekent niet automatisch legaat) |
| 162 | Te betalen kosten Lichtjestocht | Lichtjestocht (kosten/bijdrage) |
| 170 | Verkoop collectebonnen | collectebonnen (verkoop), bonnen bestelling, kaarten (= collectebonnen) |
| 171 | Afdracht collectebonnen | doorzendcollecte (van exploitatie), opbrengst collectebonnen (van PGH) |
| 210 | Giften wijkkas | gift, bijdrage wijkkas, PWG De Lichtbron, maandelijkse gift |
| 215 | Doorzendgiften | koffiepotje (opbrengst), Nepal (gift van persoon) |
| 220 | Collecte voor de wijkkas | SKG Collect, collecte wijkkas, 2e collecte |
| 225 | Doorzichtcollecten | doorzendcollecte, Thermo Libanon, Nepal, diaconie (doorzending) |
| 265 | Subsidies Kerktuin | Oranje Fonds, NLdoet, subsidie kerktuin |
| 290 | Overige baten | ondersteuning activiteiten, gemeenschapsactiviteiten, sponsoring, contante schenking |

### Wijkkas - Kosten wijkkerkenraad en predikant

| Code | Naam | Patroon |
|------|------|---------|
| 300 | Kosten wijkkerkenraad | maaltijd kerkenraad, Mrs. Italy |
| 301 | Kosten scribaat en predikant | declaratie predikant, pastoraat |
| 302 | Kosten drukwerk | drukkosten, Practicum Print, Laposta, najaarsbrief, paasnummer, flyers |
| 303 | Abonnementen | VBK media, Woord en Dienst, Ouderlingenblad, Liedboek online |
| 304 | Kosten vrijwilligers | vrijwilligersvergoeding, organisten |
| 305 | Bankkosten wijkkas | bankkosten wijkkas, portokosten |
| 307 | Kosten Internet/telefoon en website | Micro-Projects, HBBZ, Argeweb, Webheld, Schaapsound, wifi |

### Wijkkas - Kosten eredienst

| Code | Naam | Patroon |
|------|------|---------|
| 311 | Kosten eredienst | bloemen (declaratie), avondmaalwijn, Fa. W. van Oosterom, kaarsen eredienst, orgel (materiaal/scherm) |
| 312 | Cantorij en koren | cantorij, koor |
| 314 | Kosten kerktelefoon/televisie | Kerkdienst Gemist |
| 319 | Overige kosten eredienst | avondmaalbekertjes, avondmaalvuller |

### Wijkkas - Kosten activiteiten

| Code | Naam | Patroon |
|------|------|---------|
| 323 | Kosten lichtjestocht | lichtjestocht (kosten) |
| 329 | Overige kosten gemeente activiteiten | ISERO (materiaal), Beukers Bouwt |
| 332 | Maaltijden ouderen | driekoningenlunch, 3K lunch, senioren lunch, Cafetaria Jan Kruis, DaBa Hummen |
| 333 | Attenties bij verjaardagen e.d. | bloemen sectie, Flyerzone, attenties sectiewerk |
| 334 | Kerstattenties | kerst presentje, kerstviering senioren |

### Wijkkas - Overige kosten

| Code | Naam | Patroon |
|------|------|---------|
| 360 | Overige diverse kosten wijkkas | Piano Select, jeugdruimte, theelichtglazen, parkeervergunning, training, drumstel |
| 364 | Kopieermachine | kopieermachine, printer, toner |
| 365 | Kerktuin | kerktuin, Anneke Beemer, TOMA Bloemenservice, Puik tuincentrum, Smits tuinen, compost, gieters, regentonnen |
| 370 | Paaskaars | paaskaars, BOCA Kaarsengroep, jubelkaars |

### Wijkkas - Interne boekingen

| Code | Naam | Patroon |
|------|------|---------|
| 199 | Kruisposten | correctie, kruispost, foutief geboekt, collectebonnen (kruispost) |
| 392 | Kerkbalans (naar PGH) | kerkbalans, kerkelijke bijdrage, vrijwillige vaste bijdrage (naar PGH) |
| 402 | Wijkkas naar PGH | wijkkas naar PGH, kinderkoor |
| 407 | Kerststal | kerststal |

### Exploitatie - Opbrengsten

| Code | Naam | Patroon |
|------|------|---------|
| 140 | Debiteuren verhuur/buffet BK | factuurnummer JJJJMM-NNN (bijv. 202601-013), VvE/VVE, zaalhuur, huur (van huurder), St. Inovum, HilverZorg, Sonnevelt, De Gitaarleraar, Prestige Vocal, Con Amore, Alzheimer, HENGELSPORTVER, COV HILVERSUM |
| 404 | Verhuur ruimte pedicure | pedicure, pedicureruimte |
| 410 | Buffet op rekening | Drankopbrengst (Steenvoorden) |
| 411 | Buffet contant | Kasafdracht (Van Vliet) |
| 412 | Buffet PIN | PAYPAL, PayPal |
| 428 | Opbrengst bazar | Verkoop (marktplaats, bazar) |

### Exploitatie - Kosten buffet

| Code | Naam | Patroon |
|------|------|---------|
| 450 | Inkoop buffet | Sligro, FAJE catering, Party en Cateringservice, Teastreet, Zavor Coffee, boodschappen kerk, koekjes |
| 455 | Afrekening personeelskosten koster | personeelskosten koster, kostervergoeding |

### Exploitatie - Kosten gebouw

| Code | Naam | Patroon |
|------|------|---------|
| 460 | Kosten schoonmaakbedrijf | Care, Boozt24 Finance |
| 560 | Schoonmaakartikelen | GPH Schoonmaakartikelen |
| 562 | Kosten vuilafvoer | Renewi |
| 574 | Kleine aanschaf | keukengerei, kleine apparatuur |
| 579 | Overige onderhoudskosten | Micro-Projects, onderhoud apparatuur |
| 589 | Kosten tuinonderhoud | TOMA Bloemenservice, ISERO, tuin, bollen |
| 600 | Kosten parkeervoorziening | Parkeer Service, parkeervergunning |

### Exploitatie - Overige kosten

| Code | Naam | Patroon |
|------|------|---------|
| 470 | Onderhoud vleugel/piano | Piano Select, pianostemmer |
| 480 | Bankkosten exploitatie | Bankkosten exploitatie, portokosten |
| 481 | Kantoorartikelen | 123inkt |
| 482 | Vergoeding vrijwilligers | vrijwilligersvergoeding, Verschoof |
| 489 | Overige diverse kosten exploitatie | telefoon abonnement, overige |

### Exploitatie - Interne boekingen

| Code | Naam | Patroon |
|------|------|---------|
| 129 | Spaargeld Centraal | Afstorting saldo, interne overboeking naar spaar |
| 199 | Kruisposten | correctie, kruispost, doorzendcollecte (naar wijkkas) |

## Prioriteit matching

1. **Factuurnummerformaat** - Omschrijving bevat JJJJMM-NNN (bijv. 202601-013) -> 140 (verhuurfactuur)
2. **Omschrijving boven leverancier** - Als de omschrijving een duidelijk patroon bevat, gebruik dat (bijv. Micro-Projects + "orgel" = 311, niet 307)
3. **Tegenpartij** - Exacte of gedeeltelijke match op naam
4. **Keywords in omschrijving** - collectebonnen, gift, drukkosten, etc.
5. **Geen of vage omschrijving** - Als er geen duidelijke omschrijving is, default naar gift (210)
6. **Bij twijfel** - Geef code 200 (Vraagposten) met opties

## Output formaat

Geef twee blokken output:

### 1. Leesbaar overzicht

Per regel: `rijnummer: CODE NAAM | omschrijving | tegenpartij`
Bij twijfel: markeer met `?` en geef opties.

```
23: 305 Bankkosten wijkkas | Vaste kosten voor 2026 - Rekening-courant
24: 210 Giften wijkkas | Wijkkas | M. Kuyvenhoven-Kok
25: 220 Collecte voor de wijkkas | SKG Collect Batch 1688 | SKG COLLECT
42: 460 Kosten schoonmaakbedrijf | factuur schoonmaak periode 12 | Care
43: 600 Kosten parkeervoorziening | parkeervergunning 11 | Stichting Derdengelden Parkeer Service
49: 200 Vraagposten | onbekende boeking | Onbekend bedrijf?
```

### 2. Import-blok

Na het overzicht, geef een code-blok met het import-formaat voor het Apps Script `importGecodeerd()`.
Per regel: `rijnummer|code|opmerking`
De opmerking is alleen nodig bij code 200 (twijfelgevallen).

```
23|305|
24|210|
25|220|
42|460|
43|600|
49|200|Onbekende boeking: verhuur (140) of overig (489)?
```

### Twijfelgevallen

Als een boeking niet duidelijk past:
- Geef code **200** (Vraagposten)
- Zet de toelichting met mogelijke codes in de opmerking
- Let extra op: gift (210) vs. collecte (220) vs. ondersteuning activiteiten (290)

Als er geen rijnummer in de input staat, geef alleen het leesbare overzicht zonder import-blok.
