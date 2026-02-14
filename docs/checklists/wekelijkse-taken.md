# Wekelijkse taken penningmeester

De penningmeester werkt 1 dag per week. Dit zijn de vaste taken:

## Checklist

1. **Afschriften exporteren** - uit SKG Online exporteren en importeren in Google Sheets
2. **Collectebonnen** - check bestellingen en doorgeven aan Ewout
3. **Mailbox nalopen** - facturen betalen, declaraties verwerken, overige mail beantwoorden of archiveren
4. **Transacties wijkkas controleren** - alles correct? Niets op verkeerde rekening binnengekomen?
5. **Transacties exploitatie verwerken** - betaalde verhuurfacturen verwerken in debiteurenlijst
6. **Betalingen accorderen** - alle ingevoerde betalingen in SKG accorderen (anders gaan ze niet weg)

---

## How-to: Afschriften exporteren

### Stap 1: Open SKG Online

Ga naar Afschriften > Rekeningafschriften

![SKG bankafschriften export](../assets/skg-bankafschriften-export.png)

### Stap 2: Selecteer de rekening

Kies de juiste rekening:
- **PWG Bethlehemkerk expl.geb.** (exploitatie)
- **PWG De Lichtbron wijkkas** (wijkkas)

### Stap 3: Exporteer als PDF

1. Klik op "Exporteren als..." bij het gewenste afschrift
2. Kies PDF
3. Hernoem naar `[type]-JJJJ-XX.pdf`:
   - `exploitatie-2026-01.pdf`
   - `wijkkas-2026-01.pdf`
4. Opslaan in Google Drive: `[jaar]/Administratie/[Wijkkas of Exploitatie]/Bankafschriften/`

### Stap 4: Exporteer als CSV

1. Klik op "Exporteren als..." > CSV
2. Download (naam wordt bijv. `Afschrift-373722540-2025021.csv`)
3. Opslaan in dezelfde map Bankafschriften

**Let op: Doe dit voor beide rekeningen!**

### Stap 5: Importeer CSV in Google Sheets

De sheets voor Wijkkas en Exploitatie hebben een Apps Script voor het inlezen van CSV's:

1. Open de sheet (Wijkkas of Exploitatie)
2. Klik op de knop "CSV importeren"
3. Het script leest automatisch alle CSV-bestanden uit de map Bankafschriften
4. Verwerkte CSV's worden verplaatst naar de submap `Ingelezen CSV's` (om dubbel verwerken te voorkomen)
5. Bij meerdere CSV's worden ze in de juiste volgorde verwerkt

---

---

## How-to: Betalingen verhuurfacturen controleren

1. Open de sheet **Debiteuren 2025** (moet nog gesplitst worden 2025/2026)
2. Ga door de mutaties van de exploitatie (van nieuw naar oud)
3. Bij een betaling van een rekening (bijv. `202512-270`):
   - Zoek het factuurnummer op in de sheet
   - Controleer of het bedrag klopt
   - Vul de betaaldatum in
4. Stop zodra je een betaling tegenkomt die al als betaald gemarkeerd is

---

## How-to's (nog uit te werken)

- [ ] How-to: Collectebonnen bestellingen verwerken
- [ ] How-to: Mailbox workflow (facturen, declaraties, archiveren)
- [ ] How-to: Transacties controleren
- [ ] How-to: Betalingen accorderen in SKG
	