# Scripts

## export-ongecodeerd.gs

Google Apps Script voor de Wijkkas/Exploitatie-sheets. Bevat twee functies:

- **exportOngecodeerd()** -- exporteert ongecodeerde SKG-regels uit het Journaal als `rijnummer|omschrijving, naam`.
- **importGecodeerd()** -- importeert gecodeerde regels (`rijnummer|code|opmerking`) terug in het Journaal.

Zie `../processen/bankafschriften-coderen.md` voor het volledige stappenplan.

## anonymize_csv.py

Script voor reversibele anonimisering van CSV-bestanden met persoonsgegevens. Wordt niet gebruikt bij het coderen (het Journaal bevat geen IBAN's), maar is beschikbaar voor wanneer je volledige SKG-exports verwerkt.

```bash
python scripts/anonymize_csv.py anonymize input.csv output.csv \
  --config scripts/config-voorbeelden/skg.json \
  --mapping mapping.json
```

Zie `config-voorbeelden/` voor voorbeeldconfiguraties.
