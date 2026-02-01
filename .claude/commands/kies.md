# kies

## Doel

- Help Jan kiezen welke taak hij nu gaat oppakken.
- Analyseer de takenlijst en stel een top-3 voor.

## Instructies

1. Lees `taken/_takenlijst.md`.
2. Analyseer de openstaande taken en bepaal een logische volgorde. Factoren:
   - Taken met `[ ]` (uitgewerkt) hebben voorrang op `[⚠]` (moet verfijnd worden)
   - Korte, afgeronde taken hebben voorrang
   - Logische afhankelijkheden (bijv. begroting bekijken → formules verbeteren)
3. Stel een **top-3 voor** met korte motivatie per taak (waarom nu relevant?).
4. Vraag Jan welke van de drie hij wil oppakken.

## Output-formaat

```
## Top 3 voor vandaag

### 1. [Taaknaam]
[Reden waarom relevant]

### 2. [Taaknaam]
[Reden]

### 3. [Taaknaam]
[Reden]

Welke van deze drie pak je op?
```

## Naar keuze

- Nadat Jan kiest, werk de taak uit (indien `[⚠]`) of start direct met uitvoeren (indien `[ ]`).
