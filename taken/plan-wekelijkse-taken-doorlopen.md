# Plan: wekelijkse taken doorlopen

## Doel

De wekelijkse taken stap voor stap doorlopen met Claude als instructeur.
Per taak ontdekken wat er ontbreekt, verouderd of onduidelijk is in de documentatie.
Aanvullingen verzamelen in aparte bestanden voor latere verwerking.

## Aanpak per taak

1. Claude leidt Jan stap voor stap door de taak op basis van de huidige docs
2. Jan voert uit en geeft feedback (klopt/klopt niet/mist info/is veranderd)
3. Waar nuttig: schermafdrukken maken en toevoegen
4. Claude verzamelt alle aanvullingen in `taken/stap-[taaknaam]-aanvullingen.md`
5. Na afloop komt elke aanvulling op de takenlijst

## Sessie starten

Start een nieuwe sessie en zeg:

> Ik wil wekelijkse taak [nummer] doorlopen.
> Lees `taken/plan-wekelijkse-taken-doorlopen.md` voor de aanpak.
> Leid me er stap voor stap doorheen op basis van de bestaande docs.
> Verzamel aanvullingen in `taken/stap-[taaknaam]-aanvullingen.md`.

## De taken

### Taak 1: Afschriften exporteren en importeren
- **Docs**: `docs/checklists/wekelijkse-taken.md` (how-to staat erin)
- **Doel**: Bankafschriften uit SKG exporteren (PDF + CSV), importeren in Google Sheets
- **Aanvullingen**: `taken/stap-afschriften-aanvullingen.md`

### Taak 2: Collectebonnen checken
- **Docs**: `docs/processen/collectebonnen.md`
- **Doel**: Nieuwe bestellingen doorgeven aan Ewout Limburg
- **Aanvullingen**: `taken/stap-collectebonnen-aanvullingen.md`

### Taak 3: Mailbox nalopen
- **Docs**: `docs/processen/betalen-facturen.md`, `docs/processen/declaraties.md`
- **Doel**: Facturen betalen, declaraties verwerken, mail archiveren
- **Aanvullingen**: `taken/stap-mailbox-aanvullingen.md`

### Taak 4: Transacties wijkkas controleren
- **Docs**: `docs/checklists/wekelijkse-taken.md` (alleen korte omschrijving)
- **Doel**: Controleren of alles correct is, niets op verkeerde rekening
- **Aanvullingen**: `taken/stap-controle-wijkkas-aanvullingen.md`

### Taak 5: Transacties exploitatie verwerken
- **Docs**: `docs/checklists/wekelijkse-taken.md` (how-to verhuurfacturen staat erin)
- **Doel**: Betaalde verhuurfacturen verwerken in debiteurenlijst
- **Aanvullingen**: `taken/stap-exploitatie-aanvullingen.md`

### Taak 6: Betalingen accorderen
- **Docs**: `docs/checklists/wekelijkse-taken.md` (alleen korte omschrijving)
- **Doel**: Alle ingevoerde betalingen in SKG accorderen
- **Aanvullingen**: `taken/stap-accorderen-aanvullingen.md`

### Taak 7: Coderen
- **Docs**: `docs/referentie/coderingsschema.md`
- **Doel**: Grootboekcodes toewijzen aan nieuwe boekingen
- **Aanvullingen**: `taken/stap-coderen-aanvullingen.md`
- **Opmerking**: Staat niet in de wekelijkse checklist — uitzoeken of dit erbij hoort

## Status

| Taak | Status |
|------|--------|
| 1. Afschriften exporteren | afgerond 2026-02-18 |
| 2. Collectebonnen | afgerond 2026-02-18 |
| 3. Mailbox | afgerond 2026-02-18 |
| 4. Controle wijkkas | afgerond 2026-02-18 |
| 5. Exploitatie verwerken | afgerond 2026-02-18 |
| 6. Accorderen | afgerond 2026-02-18 |
| 7. Coderen | nog te doen |
