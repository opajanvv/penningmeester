# Takenlijst penningmeester documentatie

## Openstaande taken

### Begroting (b01)
- [✓] **b01 - Begroting voor Wijkkas maken**: Maak een eigen begroting voor de Wijkkas administratie aan de hand van twee bestaande voorstellen:
  - `Begroting 2026 invulsheet begroting voor De Lichtbron deze is gemaakt door Koos.xlsx`
  - `Begroting 2026 wijkkas.xlsx`
  - Beide bestanden staan in `docs/begroting/`

### Excel/Sheets formules (f01)
- [ ] **f01 - Jaarcijfers formules verbeteren**: In de jaarcijfers sheet kunnen de formules voor de codes beter worden gemaakt

### Sheets (s01)
- [✓] **s01 - Coderingssheet maken voor VLOOKUP**: CSV's gegenereerd in `taken/bronnen/codering-wijkkas.csv` en `taken/bronnen/codering-exploitatie.csv`. Importeren als tabblad in Google Sheets.

### Sheets (s02)
- [⚠] **s02 - Onderste rijen Journaal naar boven**: Uitzoeken of de onderste rijen in de tabbladen 'Journaal' van de sheets voor Wijkkas en Exploitatie naar boven gehaald kunnen worden.

### Uitzoeken (u01-u16)
- [✓] **u01 - Collecte afstorten uitzoeken**: Collectegeld gaat rechtstreeks naar PgH-rekening. Geen rol penningmeester. Zie `docs/interview-backlog.md`.
- [x] **u02 - Parkeervergunning uitzoeken**: ~~Vervallen~~ — rekening komt via de koster.
- [ ] **u03 - Brief activiteitenfonds opzoeken**: Lopende zaak uit overdracht Koos. Moet nog opgezocht worden.
- [ ] **u04 - ODIDO abonnement uitzoeken**: Kostertelefoon (0638824616) abonnement staat op naam Koos (€17,67/maand). 1x per jaar wordt dit overgemaakt vanuit exploitatierekening. Uitzoeken: overzetten of zo laten?
- [ ] **u05 - Coderen automatiseren**: Onderzoeken of codering (deels) geautomatiseerd kan worden. Ideeën: coderingsschema als tabblad in sheets, administratie 2025 als trainingsdata.
- [ ] **u06 - Collectebonnen herkennen automatiseren**: LLM gebruiken voor fuzzy matching van collectebonbestellingen in mutatie-omschrijvingen. Idee: bestellingen van vorig jaar als voorbeelden in een skill. Alternatief: code 170 uit het coderingsproces gebruiken als input voor de collectebonnen-check (zodat je niet handmatig hoeft te zoeken).
- [ ] **u07 - Google Sheets koppelen met IMPORTRANGE**: Uitzoeken hoe je sheets aan elkaar koppelt met IMPORTRANGE.
- [✓] **u08 - Gift via declaratie boeken**: Dubbel boeken: kosten op gebruikelijke code + gift op 210. Giftverklaring-PDF sturen. Zie `docs/processen/declaraties.md`.
- [ ] **u09 - Openstaande verhuurfacturen per jaareinde**: Moeten openstaande verhuurfacturen per jaareinde als vordering geboekt worden? (code 140 Debiteuren verhuur)
- [ ] **u10 - Saldocontrole in sheets**: Controle inbouwen van begin- en eindsaldo van de bankafschriften in de sheets.
- [ ] **u12 - Coderingsschema scannen**: Scan maken van het coderingsschema (5 A4's) en in inbox/ zetten.
- [✓] **u13 - Collectebonnen bonsoorten en boeking**: Code 170 = bestelling, code 171 = afdracht naar PgH. Bonsoorten niet relevant voor penningmeester. Zie `docs/processen/collectebonnen.md`.
- [ ] **u14 - Kascommissie**: Uitzoeken hoe de kascommissie-controle werkt. (Jan heeft dit nog niet meegemaakt)
- [ ] **u15 - Overdracht Tjerk**
- [ ] **u16 - Spreadsheets koster/verhuurbeheerder combineren**: Onderzoeken of spreadsheets van koster en verhuurbeheerder gecombineerd kunnen worden met de hoofdsheets voor automatisering.
- [✓] **u17 - Rekeningnummers toevoegen**: Rekeningnummers toevoegen aan `docs/referentie/rekeningen.md`.
- [ ] **u18 - Toegang nieuwe gebruikers bankrekeningen**: Uitzoeken hoe het aanvragen van toegang voor nieuwe gebruikers werkt bij de bankrekeningen.
- [✓] **u19 - Privacy/name masking documenteren**: Beschrijven hoe persoonsnamen worden gemaskeerd in het codeerproces (exportOngecodeerd/exportGecodeerd). Staat in de Apps Scripts maar nog niet in docs.
- [ ] **u20 - Gemini non-profit credits onderzoeken**: De kerk heeft een non-profit Google Workspace. Uitzoeken of Gemini gratis beschikbaar is en of het Claude Code kan vervangen voor codeertaken.
- [ ] **u21 - CSV-download workflow verbeteren**: CSV-export vanuit SKG belandt in Downloads en moet handmatig verplaatst + hernoemd worden. Uitzoeken of dit handiger kan (browser-instelling, script, of andere aanpak).

### How-to's (h01-h06)
- [ ] **h01-h06 - How-to's uitwerken**: 6 how-to's identificeren en uitwerken (zie `docs/drafts/wekelijkse-taken.md`).

---
