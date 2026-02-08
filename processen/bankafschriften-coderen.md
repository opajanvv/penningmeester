# Bankafschriften coderen

Stappenplan om nieuwe bankafschriften te coderen met Claude. Persoonsgegevens worden geanonimiseerd voordat de data naar de cloud gaat.

## 1. Exporteer uit Google Sheets

1. Open de Google Sheet (Wijkkas of Exploitatie).
2. Ga naar het tabblad **SKG**.
3. **Bestand > Downloaden > Kommagescheiden waarden (.csv)**.
4. Sla op als bijv. `inbox/wijkkas-skg.csv`.

## 2. Anonimiseer

```bash
python scripts/anonymize_csv.py anonymize inbox/wijkkas-skg.csv inbox/wijkkas-anoniem.csv \
  --config scripts/config-voorbeelden/skg.json \
  --mapping inbox/wijkkas-mapping.json
```

Dit vervangt namen en IBAN's door codes (`NAAM_001`, `REKENINGNUMMER_001`, etc.) en verwijdert overbodige kolommen. Omschrijvingen, datums en bedragen blijven intact.

Controleer de output: kijk of er geen persoonsgegevens meer in staan.

## 3. Codeer met Claude

Open Claude Code in dit project en gebruik de juiste skill:

- **Wijkkas**: `/coderen-wijkkas` en plak de inhoud van `wijkkas-anoniem.csv`
- **Exploitatie**: `/coderen-exploitatie` en plak de inhoud

Claude geeft per regel de grootboekcode terug op basis van de omschrijving en bekende patronen. Bij geanonimiseerde namen (bijv. `NAAM_003`) matcht Claude op de omschrijving.

## 4. Voer codes in de sheet

Neem de codes van Claude over in de Google Sheet, in de kolom voor grootboekcodes.

## 5. Deanonimiseer (optioneel)

Als je de originele namen terug wilt koppelen aan het resultaat:

```bash
python scripts/anonymize_csv.py deanonymize inbox/wijkkas-anoniem.csv inbox/wijkkas-hersteld.csv \
  --mapping inbox/wijkkas-mapping.json
```

## 6. Ruim op

Verwijder de CSV-bestanden en het mapping-bestand uit `inbox/` als je klaar bent. Bewaar ze niet langer dan nodig.

## Belangrijk

- Upload nooit het originele (niet-geanonimiseerde) bestand naar een cloud-tool.
- Bewaar het mapping-bestand **lokaal** -- zonder dit kun je niet terugdraaien.
- Bij twijfel over een code: zie `docs/referentie/coderingsschema.md`.
