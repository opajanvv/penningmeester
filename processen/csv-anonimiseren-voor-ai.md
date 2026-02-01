# Proces: CSV anonimiseren voor AI-tools

## Wanneer anonimiseren?

**Altijd anonimiseren** voordat je CSV's met persoonsgegevens uploadt naar externe cloud-tools zoals:
- NotebookLM
- Cursor cloud
- ChatGPT
- Andere externe AI-tools

**Niet nodig** voor lokale tools zoals Ollama (zie `../beleid/privacy-ai-tools.md`).

## Stap-voor-stap proces

### Stap 1: Maak een kopie

**Belangrijk:** Werk altijd met een kopie, nooit met het origineel.

1. Open je originele CSV
2. Sla deze op als nieuwe naam, bijv. `bankafschrift_anoniem.csv` of `ledenlijst_voor_ai.csv`
3. Werk verder met deze kopie

### Stap 2: Verwijder of vervang gevoelige kolommen

Ga door je CSV kolom voor kolom en behandel elk veld:

#### Namen
- **Vervang** door codes: `PERS001`, `PERS002`, `PERS003`, etc.
- Of verwijder de kolom helemaal als namen niet nodig zijn voor je analyse

#### IBAN's / Rekeningnummers
- **Verwijder** de kolom helemaal, of
- **Vervang** door codes: `IBAN_001`, `IBAN_002`, etc. (als je onderscheid tussen rekeningen nodig hebt)

#### Adressen
- **Verwijder** de kolom helemaal (meestal niet nodig voor financiële analyses)

#### E-mailadressen
- **Verwijder** de kolom helemaal

#### Telefoonnummers
- **Verwijder** de kolom helemaal

#### Vrije tekstvelden met persoonsinfo
- **Controleer** of er namen, adressen of andere persoonsgegevens in staan
- **Verwijder** de kolom of **vervang** gevoelige delen door `[VERWIJDERD]` of codes

### Stap 3: Behoud technisch noodzakelijke data

Deze kolommen kun je meestal **behouden** (bevatten geen directe persoonsgegevens):
- Datums
- Bedragen
- Categorieën / codes
- Transactietypes
- Referenties (zonder persoonsinfo)

### Stap 4: Controleer op unieke identifiers

Soms zijn er subtiele manieren om personen te identificeren:
- **Combinaties** van data (bijv. unieke bedrag + datum combinaties)
- **Volgorde** van transacties (als die iets zegt over wie het is)
- **Aantal transacties** per persoon (als je dat kunt tellen)

**Oplossing:** Als je analyse dit niet nodig heeft, randomiseer de volgorde van rijen of groepeer data.

### Stap 5: Finale controle

Voordat je de geanonimiseerde CSV uploadt:
- [ ] Alle namen zijn verwijderd of vervangen door codes
- [ ] Alle IBAN's zijn verwijderd of vervangen
- [ ] Alle adressen/e-mails/telefoons zijn verwijderd
- [ ] Vrije tekstvelden zijn gecontroleerd en schoongemaakt
- [ ] Je werkt met een kopie, niet het origineel
- [ ] De CSV bevat nog wel de data die je nodig hebt voor je analyse

## Voorbeeld: bankafschrift

**Originele CSV kolommen:**
```
Datum, Naam, IBAN, Bedrag, Omschrijving, Categorie
2024-01-15, Jan Jansen, NL91ABNA0417164300, -25.50, Contributie, Inkomsten
2024-01-16, Marie de Vries, NL91ABNA0417164301, -25.50, Contributie, Inkomsten
```

**Geanonimiseerde CSV:**
```
Datum, Persoon, Bedrag, Omschrijving, Categorie
2024-01-15, PERS001, -25.50, Contributie, Inkomsten
2024-01-16, PERS002, -25.50, Contributie, Inkomsten
```

**Wat is gedaan:**
- `Naam` → `Persoon` met codes
- `IBAN` → verwijderd (niet nodig voor analyse)
- `Omschrijving` → behouden (geen persoonsinfo)
- `Datum`, `Bedrag`, `Categorie` → behouden

## Voorbeeld: ledenlijst

**Originele CSV kolommen:**
```
Naam, Adres, E-mail, Telefoon, Contributie_betaald, Datum_inschrijving
Jan Jansen, Hoofdstraat 1, jan@example.com, 0612345678, Ja, 2020-01-15
```

**Geanonimiseerde CSV:**
```
Lidnummer, Contributie_betaald, Datum_inschrijving
LID001, Ja, 2020-01-15
```

**Wat is gedaan:**
- Alle persoonsgegevens (`Naam`, `Adres`, `E-mail`, `Telefoon`) → verwijderd
- Alleen administratieve velden behouden die nodig zijn voor analyse

## Snelchecklist

Voordat je een CSV uploadt naar een externe AI-tool:

- [ ] Ik werk met een kopie, niet het origineel
- [ ] Namen zijn verwijderd of vervangen door codes
- [ ] IBAN's/rekeningnummers zijn verwijderd
- [ ] Adressen/e-mails/telefoons zijn verwijderd
- [ ] Vrije tekstvelden zijn gecontroleerd
- [ ] De CSV bevat nog wel de data die ik nodig heb

## Automatisch anonimiseren met script

Er is een Python-script beschikbaar dat CSV's automatisch anonimiseert en een mapping-bestand bewaart zodat je later kunt terugdraaien.

### Script gebruiken

**Locatie:** `scripts/anonymize_csv.py`

**Anonimiseren:**
```bash
python scripts/anonymize_csv.py anonymize input.csv output.csv \
  --config scripts/config-voorbeelden/bankafschrift.json \
  --mapping mapping.json
```

**Terugdraaien:**
```bash
python scripts/anonymize_csv.py deanonymize anonymized.csv restored.csv \
  --mapping mapping.json
```

### Configuratiebestand

Het script gebruikt een JSON-configuratiebestand om aan te geven:
- Welke kolommen geanonimiseerd moeten worden (en met welke strategie: `code`, `remove`, of `hash`)
- Welke kolommen volledig verwijderd moeten worden

**Voorbeelden:**
- `scripts/config-voorbeelden/bankafschrift.json` - voor bankafschriften
- `scripts/config-voorbeelden/ledenlijst.json` - voor ledenlijsten

**Eigen configuratie maken:**
```json
{
  "comment": "Beschrijving van deze configuratie",
  "columns": {
    "Naam": "code",
    "IBAN": "code",
    "E-mail": "code"
  },
  "remove": [
    "Adres",
    "Telefoon"
  ]
}
```

**Strategieën:**
- `code`: Vervang door codes zoals `NAAM_001`, `IBAN_002`, etc.
- `remove`: Vervang door lege string (of gebruik `remove` in config om kolom helemaal te verwijderen)
- `hash`: Vervang door korte hash (minder leesbaar, maar consistent)

### Mapping-bestand

Het script bewaart een mapping-bestand (standaard `mapping.json`) met:
- Originele waarden → geanonimiseerde waarden
- Per kolom en strategie

**Belangrijk:** Bewaar dit mapping-bestand **veilig en lokaal** - dit is de enige manier om later terug te draaien. Upload dit bestand **nooit** naar externe tools.

### Voordelen van het script

- **Automatisch:** Geen handmatig werk meer
- **Reversibel:** Kunt altijd terugdraaien met mapping-bestand
- **Consistent:** Zelfde originele waarde krijgt altijd dezelfde code
- **Configuratie:** Eenvoudig aan te passen voor verschillende CSV-types

## Tips

- **Gebruik het script** voor grote of regelmatige anonimisering (sneller en consistenter)
- **Gebruik Excel/LibreOffice** voor eenmalige, kleine aanpassingen
- **Bewaar mapping-bestanden veilig** - dit is gevoelige data die je nodig hebt om terug te draaien
- **Test eerst** met een klein voorbeeldbestand voordat je grote CSV's anonimiseert

## Vragen?

Als je twijfelt of iets gevoelig is of niet, verwijder het liever. Beter te voorzichtig dan te laks met persoonsgegevens.
