# Plan: opbouw documentatie penningmeester De Lichtbron

## 1. Doel van dit systeem

- De penningmeester heeft **één plek** voor alle financiële documentatie en werkinstructies.
- Alles is later makkelijk te gebruiken in **Obsidian**, **Quark** (voor een website) en **NotebookLM** (via Google Drive).

## 2. Bestands- en mappenstructuur (startpunt)

- `docs/`  
  - Bevat alle documentatie en instructies in **Markdown** (`.md`).
- `inbox/`  
  - Hier komen **ruwe notities**, schermafdrukken, exports en tijdelijke aantekeningen terecht.
  - Formaat mag gemengd zijn: Markdown, tekst, PDF, afbeeldingen, etc.
- `taken/`  
  - Hier staan **uitzoektaken en lopende vragen** (bijv. "hoe doen we X?", "wat is hier beleid?").
  - De uitkomst van zo'n taak kan later als ruwe input weer in `inbox/` worden gezet, zodat deze in de documentatie wordt verwerkt.

Dit is bewust **minimaal**. De AI-assistent mag later submappen voorstellen (bijv. `processen/`, `templates/`, `beleid/`) zodra de hoeveelheid informatie daar om vraagt.

## 3. Werkwijze (stap voor stap)

### 3.1 Tijdens het dagelijkse werk

- Jan werkt aan de financiële administratie.
- Alles wat mogelijk later nuttig is (schermen, stappen, beslissingen, lijstjes) gaat **zonder nadenken** in `inbox/`:
  - Korte notities over wat Jan doet of ziet.
  - Schermafdrukken van schermen (bijv. boekhoudpakket, bankomgeving).
  - Exports/rapporten die als voorbeeld kunnen dienen.
- Bestandsnamen hoeven in deze stap **niet netjes** te zijn; snelheid gaat voor.

### 3.2 Skills en workflow

Er zijn vier skills die samen de documentatieworkflow vormen:

| Skill | Input | Output | Doel |
|-------|-------|--------|------|
| `/inbox` | `inbox/` | `taken/` | Ruwe input verwerken tot taken |
| `/interview` | Gesprek met Jan | `docs/drafts/` | Kennis verzamelen over een onderwerp |
| `/refine` | `taken/` | `taken/` (verfijnd) | Vage taken concreet maken |
| `/publish` | `docs/drafts/` | `docs/` | Concepten reviewen en publiceren |

De flow ziet er zo uit:

```
inbox/ ──► /inbox ──► taken/ ──► /refine ──► taken/ (concreet)
                                               │
                                               ▼
                                            uitvoeren
                                               │
                                               ▼
           /interview ──► docs/drafts/ ──► /publish ──► docs/
```

### 3.3 Verwerken van de inbox (`/inbox`)

Regelmatig (bijv. wekelijks of na een grotere taak) verwerkt de AI-assistent de inhoud van `inbox/`:

1. De AI-assistent bekijkt alle nieuwe bestanden.
2. Per bestand bepaalt de AI-assistent:
   - Is dit direct bruikbaar? → Verwerk naar `docs/drafts/`
   - Moet er iets uitgezocht worden? → Maak een taak in `taken/`
3. De AI-assistent stelt vragen als er onduidelijkheid is.

### 3.4 Interviews (`/interview`)

Voor het verzamelen van kennis over een onderwerp:

1. De AI-assistent stelt gerichte vragen aan Jan.
2. De antwoorden worden verwerkt tot een **draft** in `docs/drafts/`.
3. Openstaande vragen of uitzoekwerk gaan naar `taken/`.

### 3.5 Taken verfijnen (`/refine`)

Taken in `taken/_takenlijst.md` met `[⚠]` zijn nog niet concreet genoeg:

1. De AI-assistent stelt vragen totdat de taak duidelijk is.
2. De beschrijving wordt bijgewerkt.
3. De tag wordt omgezet van `[⚠]` naar `[ ]`.

### 3.6 Drafts publiceren (`/publish`)

Conceptdocumenten in `docs/drafts/` worden definitief gemaakt:

1. De AI-assistent toont de beschikbare drafts.
2. Jan kiest welke draft gepubliceerd moet worden.
3. De AI-assistent reviewt de inhoud en stelt vragen indien nodig.
4. Samen bepalen ze de juiste locatie in `docs/`.
5. De draft wordt verplaatst naar de definitieve plek.

## 4. Structuur van de uiteindelijke documentatie

Bij het verwerken van de inbox werken we toe naar:

- **Procesbeschrijvingen**: stap-voor-stap hoe taken gaan (bijv. declaraties verwerken, contributie innen, jaarrekening maken).
- **Checklists**: lijstjes die Jan kan doorlopen om niets te vergeten.
- **Templates/voorbeelden**: standaardmails, Excel-sjablonen, voorbeeldrapporten.
- **Beleid & afspraken**: wat er besloten is (bijv. vergoedingsregels, autorisaties).

De precieze mappenstructuur groeit **organisch**. De AI-assistent mag voorstellen doen zoals:

- `docs/processen/`
- `docs/checklists/`
- `docs/templates/`
- `docs/beleid/`

maar die worden pas aangemaakt zodra er daadwerkelijk inhoud voor is.

## 5. Gebruik met Obsidian, Quark en NotebookLM

- **Obsidian**  
  - Jan kan deze map als vault openen.  
  - Interne links tussen Markdown-bestanden maken de documentatie makkelijk navigeerbaar.

- **Quark (website)**  
  - Omdat alles in Markdown staat, kan Quark hier later direct een site van genereren.  
  - De AI-assistent kan helpen om de structuur van de documenten geschikt te maken voor een publieksvriendelijke site (bijv. volgorde, navigatie, hoofdstukken).

- **NotebookLM**  
  - Dezelfde map wordt gesynchroniseerd met **Google Drive**.  
  - NotebookLM kan dan op basis van deze bestanden vragen beantwoorden en samenvattingen maken.

## 6. Afspraken voor samenwerking met de AI-assistent

- Jan gebruikt `inbox/` als **dumpplek** tijdens het werk, zonder zich druk te maken over nette formulering.
- De AI-assistent:
  - Blijft **Nederlands** gebruiken in alle documenten en antwoorden.
  - Past waar nodig de mappenstructuur aan om dingen beter vindbaar te maken.
  - Probeert altijd aan te sluiten bij de dagelijkse praktijk van de penningmeester (geen theoretische handleiding, maar praktische hulp).

Als deze werkwijze in de praktijk frictie geeft (te veel stappen, te weinig structuur, etc.), passen Jan en de AI-assistent dit plan samen aan.

