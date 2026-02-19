# Google Workspace

De Lichtbron gebruikt Google Workspace op het domein **delichtbron.nl**.

## Account penningmeester

- Eigen account op delichtbron.nl
- **Mailbox**: hier komen rekeningen en declaraties binnen
- **Google Drive**: alle bestanden van de administratie

## Mappenstructuur op Drive

Per boekjaar een map met submappen:

```
Drive/
├── 2024/
│   ├── Brieven/
│   ├── Exploitatie/
│   ├── Wijkkas/
│   └── Jaarrekening/
├── 2025/
│   └── ...
└── 2026/
    ├── Begroting/
    ├── Exploitatie/
    └── Wijkkas/
```

Let op: de lokale sync (via rclone) bevat alleen bijlagen en exports, geen echte Google Sheets/Docs.

## Actieve spreadsheets

De administratie draait in twee Google Sheets per boekjaar:

### Wijkkas 2026

| Tabblad | Functie |
|---------|---------|
| Jaarcijfers | Overzicht jaarcijfers |
| Kolommenbalans | Kolommenbalans |
| Journaal | Alle boekingen |
| SKG | Import bankmutaties van SKG Online |

### Exploitatie 2026

| Tabblad | Functie |
|---------|---------|
| Jaarcijfers | Overzicht jaarcijfers |
| Kolommenbalans | Kolommenbalans |
| Journaal | Alle boekingen |
| Kas | Contante betalingen en Zettle-ontvangsten |
| Verhuur&Buffet | Overzicht verhuurfacturen en buffet |

## Boekingsworkflow

1. **Bankmutaties** (Wijkkas): download van SKG Online → plakken in SKG-tabblad → journaalregels genereren → grootboekcode toekennen
2. **Kas/Zettle** (Exploitatie): koster houdt dit bij in aparte spreadsheet → copy-paste naar Kas-tabblad → journaalregels
3. **Verhuur** (Exploitatie): koster houdt spreadsheet bij → penningmeester factureert via Jortt → copy-paste naar Verhuur&Buffet

## Verbeterkansen

[TODO: Later onderzoeken: koster-spreadsheet combineren met de hoofdsheets voor automatisering]
