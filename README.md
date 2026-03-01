# codebeamer-mcp

Read-only MCP (Model Context Protocol) server pro Codebeamer ALM. Umožňuje Claude a dalším MCP klientům číst projekty, trackery a položky z Codebeamer přes přirozený jazyk.

## Nástroje (10)

| Nástroj | Popis |
|---|---|
| `list_projects` | Vypíše všechny projekty |
| `get_project` | Detail projektu |
| `list_trackers` | Trackery v projektu |
| `get_tracker` | Detail trackeru |
| `list_tracker_items` | Položky v trackeru |
| `search_items` | Fulltextové/cbQL hledání |
| `get_item` | Detail položky |
| `get_item_relations` | Vazby položky |
| `get_item_comments` | Komentáře k položce |
| `get_user` | Detail uživatele |

## Instalace

### Požadavky
- Node.js 18+
- Přístup k Codebeamer instanci (URL, uživatelské jméno, heslo)

### 1. Klonování a build

```bash
git clone <repo-url>
cd codebeamer-mcp
npm install
npm run build
```

### 2. Nastavení přihlašovacích údajů

**Varianta A – proměnné prostředí** (doporučeno):
```bash
export CB_URL=https://codebeamer.vasefirma.cz
export CB_USERNAME=vas_login
export CB_PASSWORD=vase_heslo
```

**Varianta B – soubor `.env`** (lokální vývoj):
```
CB_URL=https://codebeamer.vasefirma.cz
CB_USERNAME=vas_login
CB_PASSWORD=vase_heslo
```

### 3. Připojení k Claude Code

Upravte `.mcp.json` v kořeni projektu:

```json
{
  "mcpServers": {
    "codebeamer": {
      "type": "stdio",
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "CB_URL": "https://codebeamer.vasefirma.cz",
        "CB_USERNAME": "vas_login",
        "CB_PASSWORD": "vase_heslo"
      }
    }
  }
}
```

Nebo umístěte `.mcp.json` do jiného projektu, kde chcete Codebeamer používat, a upravte cestu v `args`:
```json
"args": ["/absolutni/cesta/k/codebeamer-mcp/dist/index.js"]
```

## Vývoj a testování

```bash
# Spuštění testů (bez nutnosti reálného serveru)
npm test

# Spuštění mock API serveru (port 3001)
node mock-server.mjs

# Interaktivní testování přes MCP Inspector
CB_URL=http://localhost:3001 CB_USERNAME=mock CB_PASSWORD=mock \
  npx @modelcontextprotocol/inspector node dist/index.js
```

## Konfigurace

| Proměnná | Popis | Výchozí |
|---|---|---|
| `CB_URL` | URL Codebeamer instance | _(povinné)_ |
| `CB_USERNAME` | Přihlašovací jméno | _(povinné)_ |
| `CB_PASSWORD` | Heslo | _(povinné)_ |
| `CB_API_VERSION` | Verze API | `v3` |
| `CB_TIMEOUT_MS` | Timeout požadavků (ms) | `30000` |
| `CB_MAX_ITEMS` | Max. položek na stránku | `100` |
