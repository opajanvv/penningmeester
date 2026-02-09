# coderen-wijkkas

Input: $ARGUMENTS

## Doel

Bepaal de juiste grootboekrekening voor nieuwe boekingen van de wijkkas op basis van omschrijving en tegenpartij.

## Gebruik

Input komt uit het Apps Script `exportOngecodeerd()` in de Google Sheet.
Elke regel heeft het formaat: `rijnummer|omschrijving, naam`

```
/coderen-wijkkas
23|Vaste kosten voor 2026 - Rekening-courant
24|Wijkkas, M. Kuyvenhoven-Kok
25|SKG Collect S265 - Batch 1688, SKG COLLECT
```

Of zonder rijnummers voor losse invoer:
```
/coderen-wijkkas gift wijkkas, Hr Van Lambalgen
```

## Coderingsregels

### Opbrengsten

| Code | Naam | Patroon |
|------|------|---------|
| 73 | Reservering Legaten | legaat, nalatenschap (let op: "Erven" in naam betekent niet automatisch legaat) |
| 162 | Te betalen kosten Lichtjestocht | Lichtjestocht (kosten/bijdrage) |
| 170 | Verkoop collectebonnen | collectebonnen (verkoop), bonnen bestelling |
| 171 | Afdracht collectebonnen | doorzendcollecte (van exploitatie), opbrengst collectebonnen (van PGH) |
| 210 | Giften wijkkas | gift, bijdrage wijkkas, PWG De Lichtbron, maandelijkse gift |
| 215 | Doorzendgiften | koffiepotje (opbrengst), Nepal (gift van persoon) |
| 220 | Collecte voor de wijkkas | SKG Collect, collecte wijkkas, 2e collecte |
| 225 | Doorzichtcollecten | doorzendcollecte, Thermo Libanon, Nepal, diaconie (doorzending) |
| 265 | Subsidies Kerktuin | Oranje Fonds, NLdoet, subsidie kerktuin |
| 290 | Overige baten | ondersteuning activiteiten, gemeenschapsactiviteiten, sponsoring, contante schenking |

### Kosten wijkkerkenraad en predikant

| Code | Naam | Patroon |
|------|------|---------|
| 300 | Kosten wijkkerkenraad | maaltijd kerkenraad, Mrs. Italy |
| 301 | Kosten scribaat en predikant | declaratie predikant, pastoraat |
| 302 | Kosten drukwerk | drukkosten, Practicum Print, Laposta, najaarsbrief, paasnummer, flyers |
| 303 | Abonnementen | VBK media, Woord en Dienst, Ouderlingenblad, Liedboek online |
| 304 | Kosten vrijwilligers | vrijwilligersvergoeding, organisten |
| 305 | Bankkosten | bankkosten, portokosten |
| 307 | Kosten Internet/telefoon en website | Micro-Projects, HBBZ, Argeweb, Webheld, Schaapsound, wifi |

### Kosten eredienst

| Code | Naam | Patroon |
|------|------|---------|
| 311 | Kosten eredienst | bloemen (declaratie), avondmaalwijn, Fa. W. van Oosterom, kaarsen eredienst |
| 312 | Cantorij en koren | cantorij, koor |
| 314 | Kosten kerktelefoon/televisie | Kerkdienst Gemist |
| 319 | Overige kosten eredienst | avondmaalbekertjes, avondmaalvuller |

### Kosten activiteiten

| Code | Naam | Patroon |
|------|------|---------|
| 323 | Kosten lichtjestocht | lichtjestocht (kosten) |
| 329 | Overige kosten gemeente activiteiten | ISERO (materiaal), kerststal, Beukers Bouwt |
| 332 | Maaltijden ouderen | driekoningenlunch, 3K lunch, senioren lunch, Cafetaria Jan Kruis, DaBa Hummen |
| 333 | Attenties bij verjaardagen e.d. | bloemen sectie, Flyerzone, attenties sectiewerk |
| 334 | Kerstattenties | kerst presentje, kerstviering senioren |

### Overige kosten

| Code | Naam | Patroon |
|------|------|---------|
| 360 | Overige diverse kosten | Piano Select, jeugdruimte, theelichtglazen, parkeervergunning, training, drumstel |
| 365 | Kerktuin | kerktuin, Anneke Beemer, TOMA Bloemenservice, Puik tuincentrum, Smits tuinen, compost, gieters, regentonnen |
| 370 | Paaskaars | paaskaars, BOCA Kaarsengroep, jubelkaars |

### Interne boekingen

| Code | Naam | Patroon |
|------|------|---------|
| 199 | Kruisposten | correctie, kruispost, foutief geboekt |
| 392 | Kerkbalans (naar PGH) | kerkbalans, vrijwillige vaste bijdrage (naar PGH) |
| 402 | Wijkkas naar PGH | wijkkas naar PGH, kinderkoor |

## Prioriteit matching

1. **Specifieke namen eerst** - SKG Collect, Kerkdienst Gemist, specifieke leveranciers
2. **Keywords in omschrijving** - collectebonnen, gift, drukkosten, etc.
3. **Geen of vage omschrijving** - Als er geen duidelijke omschrijving is, default naar gift (210)
4. **Bij twijfel** - Geef code 200 (Vraagposten) met opties

## Output formaat

Geef twee blokken output:

### 1. Leesbaar overzicht

Per regel: `rijnummer: CODE NAAM | omschrijving | tegenpartij`
Bij twijfel: markeer met `?` en geef opties.

```
23: 305 Bankkosten | Vaste kosten voor 2026 - Rekening-courant
24: 210 Giften wijkkas | Wijkkas | M. Kuyvenhoven-Kok
25: 220 Collecte voor de wijkkas | SKG Collect Batch 1688 | SKG COLLECT
49: 200 Vraagposten | Erven mw NJ Ridder: nalatenschap (73) of gift (210)?
```

### 2. Import-blok

Na het overzicht, geef een code-blok met het import-formaat voor het Apps Script `importGecodeerd()`.
Per regel: `rijnummer|code|opmerking`
De opmerking is alleen nodig bij code 200 (twijfelgevallen).

```
23|305|
24|210|
25|220|
49|200|Erven mw NJ Ridder: nalatenschap (73) of gift (210)?
```

### Twijfelgevallen

Als een boeking niet duidelijk past:
- Geef code **200** (Vraagposten)
- Zet de toelichting met mogelijke codes in de opmerking
- Let extra op: gift (210) vs. collecte (220) vs. ondersteuning activiteiten (290)

Als er geen rijnummer in de input staat, geef alleen het leesbare overzicht zonder import-blok.
