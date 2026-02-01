# Scripts voor penningmeester-documentatie

Deze map bevat praktische scripts voor het werk van de penningmeester.

## anonymize_csv.py

Script voor reversibele anonimisering van CSV-bestanden met persoonsgegevens.

### Installatie

Geen externe dependencies nodig - gebruikt alleen Python standaardbibliotheek.

### Gebruik

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

### Configuratie

Zie `config-voorbeelden/` voor voorbeelden van configuratiebestanden.

Zie `../docs/processen/csv-anonimiseren-voor-ai.md` voor uitgebreide documentatie.
