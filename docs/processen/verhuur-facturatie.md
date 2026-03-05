# Verhuur-facturatieproces

Maandelijks proces voor het verwerken van verhuur, consumpties en bijbehorende facturatie.

## Trigger

De koster geeft begin van de maand een seintje dat de administratie van de vorige maand klaar is. Hij legt de map met paperassen (formulieren consumpties, urenformulier hulpkoster) in het postbakje van de penningmeester in de kerk. Zijn spreadsheet wordt automatisch gesynchroniseerd via een cron job (elke nacht om 3:00, one-way sync van Dropbox naar Google Drive map `DropboxKoster`).

## Stap 1: Kopie koster-sheet maken

1. Ga naar Google Drive: `DropboxKoster/Koster Bethlehemkerk/2026/Financieel/`
2. Kopieer de sheet (bijv. `2026 Maandoverzicht 01 januari.xlsx`) naar `2026/Exploitatie/Koster/`
3. Het bestand heet dan `Kopie van 2026 Maandoverzicht 01 januari.xlsx`

De koster-sheet heeft drie tabs:
- **Maandoverzicht** — verhuurdetails per datum, inclusief gitaarlessen (vast terugkerend, bovenaan)
- **Kasafdracht** — contante ontvangsten
- **Vrijwilligers** — uren hulpkoster(s)

## Stap 2: Controles

### Ontbrekende huurprijzen

Soms staat er geen huurprijs in de sheet. Controleer in dat geval de reserveringsbevestiging in `DropboxKoster/Koster Bethlehemkerk/2026/reserveringen/` en neem de afgesproken huurprijs over in de kopie.

### Consumpties

De map met papieren uit het postbakje bevat per verhuur-activiteit een formulier met consumpties. Controleer of de consumpties in de sheet overeenkomen met de formulieren en corrigeer waar nodig.

## Stap 3: Sorteren op huurder

Selecteer de detailregels in de tab Maandoverzicht en sorteer op kolom B (huurder/activiteit). Zo staan alle activiteiten per huurder bij elkaar voor één factuur.

## Stap 4: Factureren via Jortt

Inloggen op [jortt.nl](https://jortt.nl) met penningmeester@delichtbron.nl.

Per huurder één factuur per maand:
1. Kies de debiteur
2. Voeg regels toe per categorie: huur, koffie/thee, kannen koffie/thee, frisdrank, bier, wijn, buffet, etc.
3. Gitaarleraar: alleen huur, geen consumpties
4. Verstuur de factuur per email vanuit Jortt

Jortt geeft factuurnummers het formaat `JJJJMM-XXXX` op basis van de huidige maand. Facturen lopen dus altijd een maand achter op de verhuurmaand (facturen `202604-XXX` = verwerking van maart 2026). Bij de jaarwisseling: facturen `202601-XXX` horen bij december van het vorige jaar.

### Automatisch archiveren

Jortt stuurt een kopiefactuur naar penningmeester@delichtbron.nl. Het AppScript `verwerkFactuurMails()` archiveert de bijlage automatisch naar `2026/Exploitatie/Facturen/` op Google Drive en verwijdert de mail. Dit script handmatig uitvoeren als de facturering klaar is. Het script is te vinden via [scripts.google.com/home](https://scripts.google.com/home).

## Stap 5: Debiteuren Exploitatie sheet bijwerken

Voeg per factuur een regel toe in de sectie van de juiste maand in tabblad BK2026:
- Factuurnummer
- Huurder
- Bedrag huur
- Bedrag rest (consumpties etc.)
- Kolom betaaldatum: wordt later ingevuld bij de wekelijkse controle (zie hieronder)

### Wekelijkse controle: betalingen verhuurfacturen

Wekelijks controleren of betaalde verhuurfacturen correct verwerkt zijn:

1. Open de Google Sheet **Debiteuren** en ga naar het tabblad van het huidige jaar
2. Open daarnaast de **exploitatie-sheet** en bekijk de nieuwe mutaties (van nieuw naar oud)
3. Bij een betaling met een factuurnummer in de omschrijving (bijv. `202512-270`):
   - Zoek het factuurnummer op in de Debiteuren sheet
   - Controleer of het bedrag klopt
   - Vul de betaaldatum in
   - Markeer de factuur ook als betaald in Jortt (de betaaldatum in Jortt wordt de dag van het vinkje, niet de werkelijke betaaldatum — dat is niet erg)
   - Bij afwijkend bedrag: plaats een notitie in de Debiteuren sheet en onderneem zo nodig actie
4. Stop zodra je een betaling tegenkomt die al als betaald gemarkeerd is

**Waarom ook in Jortt markeren?** Zo zijn openstaande facturen en aanmaningen makkelijker te selecteren in Jortt.

**Verdwaalde collectebonbestellingen:** soms komt een collectebonbestelling binnen op de exploitatierekening in plaats van de wijkkas. Afhandeling:

1. Maak een betaalopdracht in SKG van exploitatie naar wijkkas (kruispost)
2. Codeer de ontvangst en overboeking op de exploitatierekening als kruispost
3. Codeer de ontvangst op de wijkkas als code 170 (collectebonnen bestelling)

### Contant en pin

- **Contant**: overnemen uit de tab Kasafdracht in de koster-sheet (bedrag "Ontvangsten") — zie ![kasafdracht](../assets/screenshot-2026-02-12_18-47-34-kasafdracht.png)
- **Pin**: maandtotaal opzoeken in de Zettle website:
  1. Ga naar `https://my.zettle.com/reports/v2?fromDate=JJJJ-MM-01&toDate=JJJJ-MM-31` (pas de datum aan naar de juiste maand)
  2. Het totaalbedrag staat linksboven onder "Verkooptrends" — zie ![zettle rapport](../assets/screenshot-2026-03-05_10-27-31-zettle-rapport.png)

## Stap 6: Declaratie koster

Als er een declaratieformulier van de koster bij de papieren zit: de gedeclareerde kosten overmaken.

## Stap 7: Vrijwilligersvergoeding

Op basis van het urenformulier in het postbakje: bedrag overmaken naar de hulpkoster(s).

## Stap 8: Overnemen naar journaal

[TODO: Stap overnemen naar journaal nog documenteren. Bedragen uit Debiteuren sheet worden handmatig overgenomen naar het journaal in de Exploitatie sheet.]

## Controle

Onderaan de koster-sheet staan controletotalen. Deze moeten overeenkomen met de maandtotalen onderaan de Debiteuren sheet.

## Bekende problemen

- Soms verschijnt er een popup in Jortt (zie ![jortt popup](../assets/screenshot-2026-02-12_16-05-43-jortt-popup.png)). De inhoud wordt bewaard, gewoon de pagina refreshen.
- Met het Jortt Starter abonnement kunnen maximaal 10 facturen per uur verstuurd worden (zie ![jortt limiet](../assets/screenshot-2026-03-04_21-35-50-jortt-limiet.png)). Bij meer dan 10 huurders even wachten voor de volgende batch.

## Verbeterpunten

- Debiteuren sheet omzetten van Excel naar Google Sheets
- Oude tabbladen BK2023/BK2024 opruimen (uitzoeken of er nog relevante info instaat)
- Outlook-adres penningmeesterbethlehemkerk@outlook.com opheffen
- Pin-bedrag per maand automatiseren (Zettle mails of stortingen op bank tellen)
- Koster-sheet: kopiëren overbodig maken, eventueel combineren in Exploitatie-sheet
- Koster-sheet: omzetten naar Google Sheets
- Overnemen naar journaal automatiseren
