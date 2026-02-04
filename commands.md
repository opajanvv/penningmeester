# Commands overzicht

## Dagelijkse workflow

Als Jan terugkomt in dit project:

1. **`/inbox`** - Begin hier als er iets in `inbox/` staat. Verwerkt ruwe input naar gestructureerde docs.
2. **`/kies`** - Kies een taak uit de takenlijst (top-3 suggesties).
3. **`/doe [code]`** - Werk samen aan de gekozen taak (bijv. `/doe b01`).

## Alle commands

| Command | Doel | Wanneer gebruiken |
|---------|------|-------------------|
| `/inbox` | Verwerk ruwe input naar docs | Bij nieuwe notities/bestanden in `inbox/` |
| `/kies` | Kies volgende taak | Aan het begin van een werksessie |
| `/doe [code]` | Sparren over een taak | Tijdens het uitvoeren van een taak |
| `/refine` | Verfijn onduidelijke taken | Als taken `[⚠]` status hebben |
| `/interview` | Verzamel info via vragen | Bij het opbouwen van nieuwe documentatie |
| `/publish` | Draft naar definitief doc | Als een draft compleet is |
| `/coderen-wijkkas` | Bepaal grootboekcode wijkkas | Bij nieuwe boekingen wijkkas |
| `/coderen-exploitatie` | Bepaal grootboekcode exploitatie | Bij nieuwe boekingen Bethlehemkerk |
| `/commit-and-push` | Commit en push wijzigingen | Na een werksessie |

## Typische sessie

```
/inbox          # eerst inbox leegmaken
/kies           # taak kiezen
/doe b03        # aan de slag met gekozen taak
...werk...
/commit-and-push
```

## Documentatie opbouwen

```
/interview      # vragen stellen, drafts maken
/publish        # rijpe draft naar docs/ verplaatsen
```

## Boekingen coderen

```
/coderen-wijkkas SKG Collect Batch 1674, SKG COLLECT
/coderen-exploitatie factuur schoonmaak, Care
```
