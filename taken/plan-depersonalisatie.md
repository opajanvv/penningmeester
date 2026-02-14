# Plan: documentatie depersonaliseren

## Doel

De documentatie transformeren van een persoonlijk werkdagboek naar een tijdloos functiehandboek voor de penningmeester. Alle persoonsnamen, historische overdrachten en rolverdelingen eruit.

## Aanpassingen per bestand

### 1. `referentie/rolverdeling.md` — verwijderen

Dit bestand is puur overdrachtshistorie en rolverdeling. De nuttige inhoud (takenlijst) staat al in de sectie "Taken penningmeester" (regels 13-23). Die takenlijst verhuist naar een betere plek (zie punt 8), waarna dit bestand verwijderd wordt.

### 2. `referentie/sheets-tjerk.md` — hernoemen en herschrijven

- Hernoemen naar `referentie/sheets-exploitatie.md`
- Titel wordt "Sheets exploitatie" (i.p.v. "Sheets van Tjerk")
- Openingszin: "Tjerk beheert twee sheets..." → beschrijving van de sheets zonder persoon
- "Zo weet Tjerk welke facturen nog openstaan" → "Zo is zichtbaar welke facturen nog openstaan"
- "Tjerk's sheets inschuiven..." → "Deze sheets inschuiven..."

### 3. `referentie/rekeningen.md` — namen vervangen

- "Penningmeester: Jan (volledige toegang)" → "Penningmeester (volledige toegang)"
- "Backup: Harry Brons (toegang aangevraagd)" → verwijderen of generiek maken ("Backup-penningmeester"). Vraag aan Jan: heeft Harry inmiddels toegang, en moet er een backup-rol beschreven staan?

### 4. `processen/verhuur-facturatie.md` — TODO neutraliseren

- Regel 70: `[TODO: Jan documenteert dit in een volgende sessie.]` → `[TODO: Stap overnemen naar journaal nog documenteren.]`

### 5. `processen/begroting.md` — eenmalige sectie verwijderen

- Sectie "Voorzetjes (eenmalig, 2026)" met namen Koos en Jan Addink volledig verwijderen. De xlsx-bestanden in `docs/begroting/` blijven als referentiemateriaal.

### 6. `interview-backlog.md` — sectietitel neutraliseren

- "Taken van Tjerk (overgenomen door Jan)" → "Nog te documenteren processen"
- "interview terwijl Jan de taak voor het eerst doet" → "interview terwijl de penningmeester de taak voor het eerst doet"
- "Jan komt hierop terug" → "nog uit te werken"

### 7. `docs/begroting/Begroting 2026 invulsheet...door Koos.xlsx` — hernoemen

- Hernoemen naar `Begroting 2026 invulsheet.xlsx`

### 8. Verwijzingen bijwerken

Na hernoemen en verwijderen:
- Check of `sheets-tjerk.md` ergens gerefereerd wordt (en update naar `sheets-exploitatie.md`)
- Check of `rolverdeling.md` ergens gerefereerd wordt (en verwijder de verwijzing)
- Check of de xlsx-bestandsnaam ergens gerefereerd wordt

## Bestanden die NIET aangepast worden

- `processen/musici-vergoedingen.md` — namen van musici zijn functioneel (tarieven, contracten)
- `processen/declaraties.md` — namen van contactpersonen zijn functioneel
- `processen/collectebonnen.md` — idem
- `referentie/coderingsschema.md` — namen in grootboekcodes zijn functioneel
- Alle andere docs — geen persoonsnamen of historie gevonden

## Open vraag

- **rekeningen.md**: moet er een generieke "backup-penningmeester" rol beschreven staan, of kan die sectie helemaal weg?
