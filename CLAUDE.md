# Penningmeester

Dit project is in het Nederlands. Communiceer in het Nederlands.

## Google Sheets toegang

Gebruik de Sheets API via Python, niet via MCP. Er is geen MCP-server voor Google Sheets.

- Python: `/home/jan/.local/share/uv/tools/gcalcli/bin/python`
- Credentials: `~/.config/calendar-cli/credentials.json`
- Token: `~/.config/calendar-cli/token-sheets.json`
- Scope: `https://www.googleapis.com/auth/spreadsheets` (lezen en schrijven)

### Spreadsheets

| Naam | ID |
|---|---|
| Boekhouding 2026 | `1nWhijSO6PdnNLlP7rMV1PNSn6nBc6SZhpkOnjps7g3s` |
| Wijkkas 2025 | `1L2ClMu1Xeu70aTglM-SthrAxiiWZdn04jmye-7Lyhaw` |
| Exploitatie 2025 | `1G7A2zioY3QWsr6fk2tTF5hZKcEDWX49mImAR6y_jJlg` |

### Voorbeeld

```python
from pathlib import Path
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

CONFIG_DIR = Path.home() / ".config" / "calendar-cli"
TOKEN_FILE = CONFIG_DIR / "token-sheets.json"
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
if not creds.valid:
    creds.refresh(Request())
    TOKEN_FILE.write_text(creds.to_json())

service = build("sheets", "v4", credentials=creds)

# Lezen
result = service.spreadsheets().values().get(
    spreadsheetId="SPREADSHEET_ID",
    range="Blad1!A1:F10",
    valueRenderOption="FORMULA"  # of "FORMATTED_VALUE" voor weergavewaarden
).execute()

# Schrijven
service.spreadsheets().values().update(
    spreadsheetId="SPREADSHEET_ID",
    range="Blad1!A1",
    valueInputOption="USER_ENTERED",
    body={"values": [["waarde1", "waarde2"]]}
).execute()
```
